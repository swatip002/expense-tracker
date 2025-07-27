import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useAxiosAuth } from "@/hooks/useAxios";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

// ✅ Expense input type
interface ExpenseInput {
  title: string;
  amount: number;
  category: string;
  date: string;
}

export default function AddExpense() {
  const api = useAxiosAuth();
  const navigate = useNavigate();
  const [expense, setExpense] = useState<ExpenseInput>({
    title: "",
    amount: 0,
    category: "",
    date: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!expense.title || !expense.amount || !expense.category || !expense.date) {
      toast.error("Please fill all fields.");
      return;
    }
    setIsLoading(true);
    try {
      await api.post("/expense", expense);
      toast.success("Expense added successfully");
      navigate("/expenses");
    } catch (err) {
      toast.error("Failed to add expense");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Add New Expense</h1>
          <p className="text-muted-foreground">
            Manually add a new expense transaction
          </p>
        </div>

        <Card className="border-0 shadow-md bg-background text-foreground">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-[hsl(var(--chart-2))]">
              <Plus className="h-5 w-5" />
              Manual Expense Entry
            </CardTitle>
          </CardHeader>
          <CardContent className="py-8">
            <form onSubmit={handleSubmit} className="space-y-6 max-w-xl mx-auto">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  type="text"
                  placeholder="Enter title"
                  value={expense.title}
                  onChange={(e) =>
                    setExpense({ ...expense, title: e.target.value })
                  }
                  className="bg-background border-border"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">Amount (₹)</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="Enter amount"
                  value={expense.amount}
                  onChange={(e) =>
                    setExpense({ ...expense, amount: Number(e.target.value) })
                  }
                  className="bg-background border-border"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={expense.date}
                  onChange={(e) =>
                    setExpense({ ...expense, date: e.target.value })
                  }
                  className="bg-background border-border"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={expense.category}
                  onValueChange={(val) => setExpense({ ...expense, category: val })}
                >
                  <SelectTrigger className="bg-background border-border">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Food & Beverages">Food & Beverages</SelectItem>
                    <SelectItem value="Groceries">Groceries</SelectItem>
                    <SelectItem value="Travel">Travel</SelectItem>
                    <SelectItem value="Clothes & Accessories">Clothes & Accessories</SelectItem>
                    <SelectItem value="Education">Education</SelectItem>
                    <SelectItem value="Bills & Utilities">Bills & Utilities</SelectItem>
                    <SelectItem value="Entertainment">Entertainment</SelectItem>
                    <SelectItem value="Health">Health</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                type="submit"
                className="bg-brand-600 hover:bg-brand-700 w-full"
                disabled={isLoading}
              >
                <Plus className="mr-2 h-4 w-4" />
                {isLoading ? "Adding..." : "Add Expense"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
