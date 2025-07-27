import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useState } from "react";
import { useAxiosAuth } from "@/hooks/useAxios";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import type { RecurringTransaction } from "@/pages/Recurring";

interface EditRecurringModalProps {
  open: boolean;
  setOpen: (val: boolean) => void;
  transaction: RecurringTransaction;
  onUpdate: (updated: RecurringTransaction) => void;
}

export const EditRecurringModal: React.FC<EditRecurringModalProps> = ({
  open,
  setOpen,
  transaction,
  onUpdate,
}) => {
  const axios = useAxiosAuth();
  const [title, setTitle] = useState(transaction.title);
  const [amount, setAmount] = useState(transaction.amount);
  const [frequency, setFrequency] = useState(transaction.frequency);

  const handleSave = async () => {
    try {
      const res = await axios.put(`/recurring/${transaction._id}`, {
        title,
        amount,
        frequency,
      });
      onUpdate(res.data);
      toast.success("Transaction updated");
      setOpen(false);
    } catch (err) {
      toast.error("Failed to update transaction");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <h3 className="text-lg font-bold">Edit Recurring Transaction</h3>
        <Input
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <Input
          type="number"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(parseFloat(e.target.value))}
        />
        <Input
          placeholder="Frequency"
          value={frequency}
          onChange={(e) => setFrequency(e.target.value)}
        />
        <Button onClick={handleSave}>Save</Button>
      </DialogContent>
    </Dialog>
  );
};
