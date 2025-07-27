import { useEffect, useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarDays } from "lucide-react";
import { useAxiosAuth } from "@/hooks/useAxios";
import { toast } from "sonner";
import { format } from "date-fns";

interface Report {
  _id: string;
  period: "weekly" | "monthly" | "yearly";
  startDate: string;
  endDate: string;
  summary: string;
  tips: string;
  createdAt: string;
}


export default function Reports() {
  const axios = useAxiosAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [filter, setFilter] = useState<"all" | "weekly" | "monthly" | "yearly">("all");
  
  const filteredReports = reports.filter((r) =>
  filter === "all" ? true : r.period === filter
);

  const fetchReports = async () => {
    try {
      const res = await axios.get("/reports");
      setReports(res.data);
    } catch (err) {
      toast.error("Failed to fetch reports");
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);
  return (
  <AppLayout>
    <div className="flex flex-col gap-4 p-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">AI Financial Reports</h1>
          <p className="text-sm text-muted-foreground">
            Automatically generated insights powered by AI
          </p>
        </div>
      </div>

      {/* Filter Buttons */}
      <div className="flex gap-2">
        <Button
          variant={filter === "all" ? "default" : "outline"}
          onClick={() => setFilter("all")}
        >
          All
        </Button>
        <Button
          variant={filter === "weekly" ? "default" : "outline"}
          onClick={() => setFilter("weekly")}
        >
          Weekly
        </Button>
        <Button
          variant={filter === "monthly" ? "default" : "outline"}
          onClick={() => setFilter("monthly")}
        >
          Monthly
        </Button>
        <Button
          variant={filter === "yearly" ? "default" : "outline"}
          onClick={() => setFilter("yearly")}
        >
          Yearly
        </Button>
      </div>

      {/* Report Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredReports.length === 0 ? (
          <p className="text-muted-foreground text-sm col-span-3">
            No reports available for the selected filter.
          </p>
        ) : (
          filteredReports.map((report) => (
            <Card
              key={report._id}
              className="border-0 shadow-sm bg-background text-foreground"
            >
              <CardHeader className="flex justify-between items-start space-y-0">
                <div>
                  <CardTitle className="text-sm capitalize font-medium">
                    {report.period} report
                  </CardTitle>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(report.startDate), "dd MMM")} -{" "}
                    {format(new Date(report.endDate), "dd MMM yyyy")}
                  </p>
                </div>
                <CalendarDays className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm">{report.summary}</p>
                <p className="text-xs text-muted-foreground italic">
                  💡 {report.tips}
                </p>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  </AppLayout>
);
}
