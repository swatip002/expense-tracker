import { useEffect, useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout"; // adjust if your path differs
import { useAxiosAuth } from "@/hooks/useAxios"; // your authenticated axios instance
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const Settings = () => {
  const axiosAuth = useAxiosAuth();

  // User profile
  const [profile, setProfile] = useState({ name: "", email: "" });
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");

  // Budget management
  const [budgets, setBudgets] = useState([]);
  const [category, setCategory] = useState("");
  const [amount, setAmount] = useState("");
  const [period, setPeriod] = useState("monthly");

  const fetchProfile = async () => {
    try {
      const res = await axiosAuth.get("/user/profile");
      setProfile(res.data);
      setName(res.data.name);
    } catch {
      toast.error("Failed to fetch profile");
    }
  };

  const fetchBudgets = async () => {
    try {
      const res = await axiosAuth.get("/budget");
      setBudgets(res.data);
    } catch {
      toast.error("Failed to fetch budgets");
    }
  };

  const handleProfileUpdate = async () => {
    try {
      const payload: any = { name };
      if (password.trim() !== "") payload.password = password;
      await axiosAuth.put("/user/profile", payload);
      toast.success("Profile updated");
    } catch {
      toast.error("Failed to update profile");
    }
  };

  const handleBudgetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !period) return toast.error("Please fill required fields");
    try {
      await axiosAuth.post("/budget", { category, amount, period });
      toast.success("Budget saved");
      fetchBudgets();
      setCategory("");
      setAmount("");
    } catch {
      toast.error("Failed to save budget");
    }
  };

  const handleBudgetDelete = async (cat: string) => {
    try {
      await axiosAuth.delete(`/budget/${cat}`);
      toast.success("Budget deleted");
      fetchBudgets();
    } catch {
      toast.error("Failed to delete budget");
    }
  };

  useEffect(() => {
    fetchProfile();
    fetchBudgets();
  }, []);

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto p-6 space-y-10">
        {/* Profile Section */}
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">User Profile</h2>
          <Input
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Input
            placeholder="Email"
            value={profile.email}
            disabled
          />
          <Input
            placeholder="New Password (optional)"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button onClick={handleProfileUpdate}>Update Profile</Button>
        </div>

        {/* Budget Section */}
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Budgets</h2>
          <form onSubmit={handleBudgetSubmit} className="space-y-3">
            <Input
              placeholder="Category (e.g., food, travel)"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            />
            <Input
              placeholder="Amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="w-full border rounded px-2 py-2"
            >
              <option value="monthly">Monthly</option>
              <option value="weekly">Weekly</option>
              <option value="yearly">Yearly</option>
            </select>
            <Button type="submit">Save Budget</Button>
          </form>

          {/* Budget List */}
          {budgets.length > 0 && (
            <div className="space-y-2">
              {budgets.map((b: any) => (
                <div key={b._id} className="flex justify-between border p-2 rounded">
                  <div>
                    <p className="font-medium">{b.category || "General"}</p>
                    <p className="text-sm text-gray-500">₹{b.amount} / {b.period}</p>
                  </div>
                  <Button variant="destructive" onClick={() => handleBudgetDelete(b.category)}>
                    Delete
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default Settings;
