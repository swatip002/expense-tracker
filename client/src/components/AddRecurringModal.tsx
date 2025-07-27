import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAxiosAuth } from "@/hooks/useAxios";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { RecurringTransaction } from "@/pages/Recurring";
import { toast } from "sonner";

interface AddRecurringModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  onAdd: (newTransaction: RecurringTransaction) => void;
}


export const AddRecurringModal: React.FC<AddRecurringModalProps> = ({
  open,
  setOpen,
  onAdd,
}) => {
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState<number>(0);
  const [frequency, setFrequency] = useState("");
  const [category, setCategory] = useState("");
  const axiosAuth = useAxiosAuth();

  const handleAdd = async () => {
    if (!title || !amount || !frequency) {
      toast.error("Please fill all fields");
      return;
    }
    try {
      const res = await axiosAuth.post("/recurring", {
        title,
        amount,
        frequency,
        category,
      });
      onAdd(res.data);
      toast.success("Recurring transaction added");
      setOpen(false);
      setTitle("");
      setAmount(0);
      setFrequency("");
      setCategory("");
    } catch (error) {
      toast.error("Failed to add transaction");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Recurring Transaction</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" />
          <Input
            value={amount}
            onChange={(e) => setAmount(parseFloat(e.target.value))}
            type="number"
            placeholder="Amount"
          />
          <Select value={frequency} onValueChange={setFrequency}>
            <SelectTrigger>
              <SelectValue placeholder="Select frequency" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Daily</SelectItem>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="yearly">Yearly</SelectItem>
            </SelectContent>
          </Select>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Food">Food</SelectItem>
              <SelectItem value="Transportation">Transportation</SelectItem>
              <SelectItem value="Entertainment">Entertainment</SelectItem>
              <SelectItem value="Shopping">Shopping</SelectItem>
              <SelectItem value="Utilities">Utilities</SelectItem>
              <SelectItem value="Rent">Rent</SelectItem>
              <SelectItem value="Others">Others</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleAdd} className="w-full">
            Add
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
