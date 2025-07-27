import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Receipt, Plus, Filter, Search, Trash2, Pencil } from "lucide-react";
import { useAxiosAuth } from "@/hooks/useAxios";
import { toast } from "sonner";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";

interface Transaction {
  _id: string;
  title: string;
  amount: number;
  category: string;
  date: string;
}
import { useSocket } from "@/hooks/useSocket";


export default function Expenses() {
  const api = useAxiosAuth();
  const navigate = useNavigate();
  const socket = useSocket();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [showFilter, setShowFilter] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  // Update search when URL changes
  useEffect(() => {
    const searchQuery = searchParams.get("search");
    if (searchQuery !== search) {
      setSearch(searchQuery || "");
    }
  }, [searchParams]);

  const categories = ["All", "Food & Beverages", "Groceries", "Travel", "Clothes & Accessories", "Education", "Bills & Utilities", "Entertainment", "Health", "Other"];

  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        const res = await api.get("/expenses");
        setTransactions(res.data);
      } catch (err) {
        toast.error("Failed to load expenses");
      } finally {
        setLoading(false);
      }
    };
    fetchExpenses();
  }, [api]);

  useEffect(() => {
    if (!socket) return;

    const handleTransactionUpdate = () => {
      // Refetch expenses on transaction update
      setLoading(true);
      api.get("/expenses")
        .then(res => {
          setTransactions(res.data);
        })
        .catch(() => {
          toast.error("Failed to load expenses");
        })
        .finally(() => {
          setLoading(false);
        });
    };

    socket.on("transaction_update", handleTransactionUpdate);

    return () => {
      socket.off("transaction_update", handleTransactionUpdate);
    };
  }, [socket, api]);

  const filteredTransactions = transactions.filter(tx =>
    (selectedCategory === "All" || tx.category === selectedCategory) &&
    (tx.title.toLowerCase().includes(search.toLowerCase()))
  );

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/expenses/${id}`);
      setTransactions(prev => prev.filter(tx => tx._id !== id));
      toast.success("Expense deleted!");
    } catch (err) {
      toast.error("Failed to delete expense");
    }
  };

  const handleEdit = (tx: Transaction) => {
    toast("Edit modal not implemented yet, would edit: " + tx.title);
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Expenses</h1>
            <p className="text-muted-foreground">Manage and track your expenses</p>
          </div>
          <Button className="bg-brand-600 hover:bg-brand-700" onClick={() => navigate("/expenses/add")}>
            <Plus className="h-4 w-4 mr-2" />
            Add Expense
          </Button>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative flex items-center">
            <Search className="h-4 w-4 absolute left-3 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                const value = e.target.value;
                setSearch(value);
                if (value) {
                  setSearchParams({ search: value });
                } else {
                  setSearchParams({});
                }
              }}
              placeholder="Search by title"
              className="pl-10 pr-4 py-2 rounded-md border border-border bg-background text-foreground"
            />
          </div>
          <Button variant="outline" onClick={() => setShowFilter(!showFilter)}>
            <Filter className="h-4 w-4 mr-2" /> Filter
          </Button>
        </div>

        {showFilter && (
          <div className="flex flex-wrap gap-2 mt-2">
            {categories.map(cat => (
              <Button
                key={cat}
                variant={selectedCategory === cat ? "default" : "outline"}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </Button>
            ))}
          </div>
        )}

        <Card className="border-0 shadow-sm bg-background text-foreground">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Receipt className="h-5 w-5 mr-2 text-primary" />
              Expense Management
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-48 flex items-center justify-center text-muted-foreground">
                Loading expenses...
              </div>
            ) : filteredTransactions.length === 0 ? (
              <div className="h-48 flex items-center justify-center text-muted-foreground">
                No transactions found.
              </div>
            ) : (
              <div className="space-y-4">
                {filteredTransactions.map(tx => (
                  <div key={tx._id} className="flex justify-between items-center p-4 rounded-md border border-border hover:bg-muted transition">
                    <div>
                      <div className="font-semibold">{tx.title}</div>
                      <div className="text-sm text-muted-foreground">
                        {tx.category} • {new Date(tx.date).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="font-semibold text-red-600">
                        -₹{tx.amount.toFixed(2)}
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(tx)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(tx._id)}>
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
