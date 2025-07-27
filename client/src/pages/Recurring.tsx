import { useEffect, useState } from "react";
import { useAxiosAuth } from "@/hooks/useAxios";
import { Button } from "@/components/ui/button";
import { AddRecurringModal } from "@/components/AddRecurringModal";
import { EditRecurringModal } from "@/components/EditModal";
import { toast } from "sonner";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export interface RecurringTransaction {
  _id: string;
  title: string;
  amount: number;
  frequency: string;
  category: string;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
  nextRun?: string;
}

export default function RecurringPage ()  {
  const axios = useAxiosAuth();
  const [recurrings, setRecurrings] = useState<RecurringTransaction[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<RecurringTransaction | null>(null);

  const fetchRecurrings = async () => {
    try {
      const res = await axios.get("/recurring");
      setRecurrings(res.data);
    } catch {
      toast.error("Failed to fetch recurrings");
    }
  };

  const toggleRecurring = async (id: string) => {
    try {
      await axios.patch(`/recurring/${id}/toggle`);
      setRecurrings((prev) =>
        prev.map((r) => (r._id === id ? { ...r, active: !r.active } : r))
      );
      toast.success("Status updated");
    } catch {
      toast.error("Failed to toggle recurring");
    }
  };

  const handleUpdate = (updatedTx: RecurringTransaction) => {
    setRecurrings((prev) =>
      prev.map((tx) => (tx._id === updatedTx._id ? updatedTx : tx))
    );
  };

  useEffect(() => {
    fetchRecurrings();
  }, []);

  return (
    <AppLayout>
      <div className="p-4 space-y-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xl font-bold">Recurring Transactions</CardTitle>
            <Button onClick={() => setOpen(true)}>Add New</Button>
          </CardHeader>
          <CardContent className="space-y-4">
          {recurrings.length === 0 ? (
            <p>No recurring transactions found.</p>
          ) : (
            recurrings.map((r) => (
              <Card key={r._id} className="hover:bg-accent/50 transition-colors">
                <CardContent className="flex justify-between items-center py-4">
                  <div className="space-y-1">
                  <p className="font-semibold">{r.title}</p>
                  <p className="text-sm text-muted-foreground">₹{r.amount.toFixed(2)}</p>
                  <div className="flex gap-2 text-sm text-muted-foreground">
                    <span className="capitalize">{r.frequency}</span>
                    {r.category && <span>• {r.category}</span>}
                  </div>
                  {r.nextRun && (
                    <p className="text-sm text-muted-foreground">
                      Next: {new Date(r.nextRun).toLocaleDateString()}
                    </p>
                  )}
                  </div>
                  <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setEditing(r)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant={r.active ? "secondary" : "outline"}
                    onClick={() => toggleRecurring(r._id)}
                  >
                    {r.active ? "Disable" : "Enable"}
                  </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
          </CardContent>
        </Card>


        <AddRecurringModal
          open={open}
          setOpen={setOpen}
          onAdd={(newRecurring) =>
            setRecurrings((prev) => [newRecurring, ...prev])
          }
        />

        {editing && (
          <EditRecurringModal
            open={!!editing}
            setOpen={() => setEditing(null)}
            transaction={editing}
            onUpdate={(updated) => {
              handleUpdate(updated);
              setEditing(null);
            }}
          />
        )}
      </div>
    </AppLayout>
  );
};
