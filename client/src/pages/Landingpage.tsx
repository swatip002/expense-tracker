import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom"; // ✅ Import Link from Next.js

export default function LandingPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 text-center space-y-8">
      {/* Hero */}
      <div className="space-y-4">
        <h1 className="text-4xl sm:text-5xl font-bold text-foreground">
          Take Control of Your Finances
        </h1>
        <p className="max-w-md mx-auto text-muted-foreground text-lg">
          Track expenses, manage budgets, and get AI-powered financial insights — all in one place.
        </p>
      </div>

      {/* CTA */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Link to="/login">
          <Button className="bg-primary hover:bg-primary/90 px-6 py-3 text-muted-foreground text-base rounded-xl shadow transition-transform hover:scale-105">
            Get Started <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </Link>
      </div>

      {/* Features */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-12 w-full max-w-5xl">
        <FeatureCard
          title="Track Expenses"
          description="Automatically categorize and monitor your spending."
        />
        <FeatureCard
          title="Manage Budgets"
          description="Set monthly budgets and get alerts when you're close."
        />
        <FeatureCard
          title="AI Insights"
          description="Get smart financial reports with personalized tips."
        />
      </div>
    </div>
  );
}

function FeatureCard({ title, description }: { title: string; description: string }) {
  return (
    <div className="bg-background border border-border rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
      <h3 className="text-xl font-semibold text-foreground mb-2">{title}</h3>
      <p className="text-muted-foreground text-sm">{description}</p>
    </div>
  );
}
