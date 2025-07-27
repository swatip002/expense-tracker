import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, FileSpreadsheet, Download } from "lucide-react";
import { useAxiosAuth } from "@/hooks/useAxios";
import { toast } from "sonner";

import { useSocket } from "@/hooks/useSocket";

export default function ImportCSV() {
  const api = useAxiosAuth();
  const navigate = useNavigate();
  const socket = useSocket();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!socket) return;

    const handleTransactionUpdate = (data: any) => {
      console.log("Transaction update received:", data);
      // Optionally, show a toast or update UI here
      toast.success("Transaction data updated");
    };

    socket.on("transaction_update", handleTransactionUpdate);

    return () => {
      socket.off("transaction_update", handleTransactionUpdate);
    };
  }, [socket]);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error("File size too large. Maximum size is 5MB.");
        return;
      }
      const validTypes = [
        'text/csv',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      ];
      if (!validTypes.includes(file.type)) {
        toast.error("Invalid file type. Please upload CSV or Excel file.");
        return;
      }
      setSelectedFile(file);

      // Automatically trigger import after file selection
      setIsLoading(true);
      try {
        const formData = new FormData();
        formData.append("file", file);

        const { data } = await api.post("/import/upload", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        if (data.failed > 0) {
          toast.warning(
            `Import completed with issues: ${data.success} successful, ${data.failed} failed`
          );
          console.log('Failed rows:', data.failedDetails);
        } else {
          toast.success(`Successfully imported ${data.success} transactions`);
        }

        navigate("/expenses");
      } catch (err) {
        console.error(err);
        toast.error("Failed to import transactions.");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleImport = async () => {
    if (!selectedFile) return;
    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const { data } = await api.post("/import/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (data.failed > 0) {
        toast.warning(
          `Import completed with issues: ${data.success} successful, ${data.failed} failed`
        );
        // Show failed rows in console for debugging
        console.log('Failed rows:', data.failedDetails);
      } else {
        toast.success(`Successfully imported ${data.success} transactions`);
      }
      navigate("/expenses");
    } catch (err) {
      console.error(err);
      toast.error("Failed to import transactions.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Import Transactions
          </h1>
          <p className="text-muted-foreground">
            Bulk import transactions from CSV or Excel files
          </p>
        </div>

        <Card className="border-0 shadow-sm bg-background text-foreground">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5 text-primary" />
              CSV / Excel Import
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 py-8">
            <div className="text-center space-y-4">
              <div className="flex justify-center gap-4 mb-6">
                <FileSpreadsheet className="h-8 w-8 text-muted-foreground" />
                <Upload className="h-8 w-8 text-muted-foreground" />
                <Download className="h-8 w-8 text-muted-foreground" />
              </div>

              <div className="flex justify-center">
                <div>
                  <input
                    id="file-upload"
                    type="file"
                    accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                  />
                  <Button 
                    className="bg-primary hover:bg-primary/90"
                    onClick={() => document.getElementById('file-upload')?.click()}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Choose File
                  </Button>
                </div>
              </div>

              {selectedFile && (
                <div className="mt-4 flex flex-col items-center space-y-2">
                  <span className="text-sm text-muted-foreground">
                    Selected: <span className="font-medium text-foreground">{selectedFile.name}</span>
                  </span>
                  <Button
                    onClick={handleImport}
                    disabled={isLoading}
                    className="bg-primary hover:bg-primary/90"
                  >
                    {isLoading ? "Importing..." : "Import Transactions"}
                  </Button>
                </div>
              )}

              {!selectedFile && (
                <p className="text-muted-foreground text-sm">
                  No file selected yet.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
