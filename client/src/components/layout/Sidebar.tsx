import {
  LayoutDashboard,
  CreditCard,
  Plus,
  Receipt,
  Upload,
  Repeat,
  FileText,
  Settings,
  
  Wallet,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Transactions", href: "/expenses", icon: CreditCard },
];

const expenseActions = [
  { name: "Add Expense", href: "/expenses/add", icon: Plus },
  { name: "Scan Receipt", href: "/expenses/receipt", icon: Receipt },
  { name: "Import CSV", href: "/expenses/import", icon: Upload },
];

const features = [
  { name: "Recurring", href: "/recurring", icon: Repeat },
  { name: "Reports", href: "/reports", icon: FileText },
];

const account = [
  { name: "Settings", href: "/settings", icon: Settings },
];

import { useState, useEffect } from "react";
import { useAxiosAuth } from "@/hooks/useAxios";

export function Sidebar() {
  const location = useLocation();
  const axiosAuth = useAxiosAuth();
  const [currentBalance, setCurrentBalance] = useState<number | null>(null);

  useEffect(() => {
    const fetchCurrentBalance = async () => {
      try {
        const [totalRes, budgetRes] = await Promise.all([
          axiosAuth.get('/analytics/total'),
          axiosAuth.get('/analytics/budget-vs-expense')
        ]);
        const totalBudget = budgetRes.data.reduce((sum: number, item: any) => sum + Number(item.budget), 0);
        const totalExpense = totalRes.data.total;
        setCurrentBalance(totalBudget - totalExpense);
      } catch (error) {
        console.error('Failed to fetch current balance:', error);
      }
    };

    fetchCurrentBalance();
  }, [axiosAuth]);

  return (
    <aside className="fixed left-0 top-16 z-40 h-[calc(100vh-4rem)] w-64 border-r border-border bg-background">
      <div className="flex h-full flex-col gap-4 p-4">
        
        <div className="flex items-center gap-2 rounded-xl bg-brand-50 p-4 dark:bg-brand-950/40">
          <Wallet className="h-5 w-5 text-brand-600" />
          <div className="flex flex-col">
            <span className="text-sm font-medium text-muted-foreground">
              Current Balance
            </span>
            <span className="text-lg font-bold text-brand-700 dark:text-brand-300">
              {currentBalance !== null ? `₹${currentBalance.toFixed(2)}` : 'Loading...'}
            </span>
          </div>
        </div>

        <Separator className="my-2" />

        <nav className="flex flex-col gap-2">
          <SidebarSection title="Overview" items={navigation} pathname={location.pathname} />
          <SidebarSection title="Quick Actions" items={expenseActions} pathname={location.pathname} />
          <SidebarSection title="Features" items={features} pathname={location.pathname} />

          <Separator className="my-2" />

          <SidebarSection items={account} pathname={location.pathname} />
        </nav>
      </div>
    </aside>
  );
}

function SidebarSection({
  title,
  items,
  pathname,
}: {
  title?: string;
  items: { name: string; href: string; icon: any }[];
  pathname: string;
}) {
  return (
    <div>
      {title && (
        <h3 className="mb-2 px-3 text-sm font-semibold text-muted-foreground">
          {title}
        </h3>
      )}
      {items.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link key={item.name} to={item.href}>
            <Button
              variant={isActive ? "secondary" : "ghost"}
              className={cn(
                "w-full justify-start rounded-lg",
                isActive &&
                  "bg-brand-100 text-brand-700 dark:bg-brand-950/50"
              )}
            >
              <item.icon className="mr-3 h-4 w-4" />
              {item.name}
            </Button>
          </Link>
        );
      })}
    </div>
  );
}
