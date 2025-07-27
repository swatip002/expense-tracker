'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ChartTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AppLayout } from '@/components/layout/AppLayout';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { useAxiosAuth } from '@/hooks/useAxios';

const COLORS = ['#6366F1', '#10B981', '#F59E0B', '#EF4444', '#3B82F6', '#8B5CF6', '#EC4899', '#14B8A6', '#F43F5E', '#8B5CF6'];
const BUDGET_COLORS = { budget: '#6366F1', expense: '#EF4444' };

interface ExpenseCategory {
  category: string;
  total: number;
}

interface MonthlyData {
  month: string;
  total: number;
}

interface BudgetVsExpense {
  category: string;
  budget: number;
  expense: number;
}

interface Transaction {
  category: string;
  merchant: string;
  date: string;
  amount: number;
}

interface TopMerchant {
  merchant: string;
  total: number;
}

interface RecurringTransaction {
  title: string;
  amount: number;
  frequency: string;
  nextRun: string;
}

const DashboardPage = () => {
  const axiosAuth = useAxiosAuth();

  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [totalExpense, setTotalExpense] = useState<number>(0);
  const [expenseData, setExpenseData] = useState<ExpenseCategory[]>([]);
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [budgetData, setBudgetData] = useState<{ totalBudget: number; budgetVsExpense: BudgetVsExpense[] }>({
    totalBudget: 0,
    budgetVsExpense: [],
  });
  const [currentBalance, setCurrentBalance] = useState<number>(0);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [topMerchants, setTopMerchants] = useState<TopMerchant[]>([]);
  const [recurringTransactions, setRecurringTransactions] = useState<RecurringTransaction[]>([]);

  const calculateTotalBudget = useCallback((data: BudgetVsExpense[]) => {
    return data.reduce((sum, item) => sum + Number(item.budget), 0);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [totalRes, categoryRes, monthlyRes, budgetRes, recentRes, topMerchantRes, recurringRes] = await Promise.all([
          axiosAuth.get('/analytics/total'),
          axiosAuth.get('/analytics/category'),
          axiosAuth.get('/analytics/monthly'),
          axiosAuth.get('/analytics/budget-vs-expense'),
          axiosAuth.get('/analytics/recent'),
          axiosAuth.get('/analytics/top-merchants'),
          axiosAuth.get('/recurring'),
        ]);

        const totalBudget = calculateTotalBudget(budgetRes.data);

        if (totalRes.data.total >= totalBudget * 0.9) {
          toast.warning('Your expenses have reached 90% or more of your total budget!');
        }

        setTotalExpense(totalRes.data.total);
        setExpenseData(categoryRes.data);
        setMonthlyData(monthlyRes.data);

        const processedBudget = [
          {
            category: 'Total',
            budget: totalBudget,
            expense: totalRes.data.total,
          },
        ];

        setBudgetData({ totalBudget, budgetVsExpense: processedBudget });
        setRecentTransactions(recentRes.data);
        setTopMerchants(topMerchantRes.data || []);
        setRecurringTransactions(recurringRes.data);
        setCurrentBalance(totalBudget - totalRes.data.total);
      } catch (error) {
        console.error('Dashboard fetch error:', error);
      }
    };

    fetchData();
  }, [axiosAuth, calculateTotalBudget]);

  const processedMonthlyData = useMemo(() => monthlyData, [monthlyData]);
  const processedExpenseData = useMemo(() => expenseData, [expenseData]);
  const processedBudgetData = useMemo(() => budgetData.budgetVsExpense, [budgetData.budgetVsExpense]);

  return (
    <AppLayout>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Current Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-foreground">₹{currentBalance.toFixed(2)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Total Spent</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-foreground">₹{totalExpense}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Category</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg">
              {expenseData.length > 0 ? `${expenseData[0].category} - ₹${expenseData[0].total}` : 'N/A'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Merchant</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg">
              {topMerchants.length > 0 ? `${topMerchants[0].merchant} - ₹${topMerchants[0].total}` : 'N/A'}
            </p>
          </CardContent>
        </Card>

        
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <Card className="h-[300px]">
          <CardHeader>
            <CardTitle>Monthly Trend</CardTitle>
          </CardHeader>
          <CardContent className="h-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={processedMonthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <ChartTooltip formatter={(value: any) => `₹${value}`} />
                <Bar dataKey="total" fill="#6366F1" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="h-[300px]">
          <CardHeader>
            <CardTitle>Expenses by Category</CardTitle>
          </CardHeader>
          <CardContent className="h-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  dataKey="total"
                  data={processedExpenseData}
                  outerRadius={100}
                  nameKey="category"
                  label={false}
                  labelLine={false}
                  onMouseEnter={(_, index) => setActiveIndex(index)}
                  onMouseLeave={() => setActiveIndex(null)}
                >
                  {processedExpenseData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                {activeIndex !== null && (
                  <ChartTooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-white p-2 border rounded shadow">
                            <p className="font-medium">{payload[0].payload.category}</p>
                            <p>₹{payload[0].value}</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                )}
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-6 h-[400px]">
        <CardHeader>
          <CardTitle>Budget vs Expenses</CardTitle>
        </CardHeader>
        <CardContent className="h-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={processedBudgetData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="category" />
              <YAxis />
              <ChartTooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-white p-2 border rounded shadow">
                        <p className="font-medium">{payload[0].payload.category}</p>
                        <p>Budget: ₹{payload[0].payload.budget}</p>
                        <p>Spent: ₹{payload[0].payload.expense}</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend />
              <Bar dataKey="budget" fill={BUDGET_COLORS.budget} name="Budget" />
              <Bar dataKey="expense" fill={BUDGET_COLORS.expense} name="Expense" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="max-h-[300px]">
            <ul className="space-y-3">
              {recentTransactions.map((txn, index) => (
                <li key={index} className="flex flex-col border-b py-2">
                  <div className="flex justify-between">
                    <span className="font-semibold">{txn.category}</span>
                    <span className="text-sm text-muted-foreground">₹{txn.amount}</span>
                  </div>
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>{txn.merchant}</span>
                    <span>{format(new Date(txn.date), 'dd MMM yyyy')}</span>
                  </div>
                </li>
              ))}
            </ul>
          </ScrollArea>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Recurring Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="max-h-[300px]">
            <ul className="space-y-3">
              {recurringTransactions.map((txn, index) => (
                <li key={index} className="flex flex-col border-b py-2">
                  <div className="flex justify-between">
                    <span className="font-semibold">{txn.title}</span>
                    <span className="text-sm text-muted-foreground">₹{txn.amount}</span>
                  </div>
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Next: {format(new Date(txn.nextRun), 'dd MMM yyyy')}</span>
                    <span className="capitalize">{txn.frequency}</span>
                  </div>
                </li>
              ))}
            </ul>
          </ScrollArea>
        </CardContent>
      </Card>
    </AppLayout>
  );
};

export default DashboardPage;
