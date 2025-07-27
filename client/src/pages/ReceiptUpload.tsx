import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Receipt, Camera, Upload } from "lucide-react";
import { useAxiosAuth } from "@/hooks/useAxios";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

interface ExtractedData {
  title: string;
  amount: number;
  category: string;
  date: string;
}

export default function ReceiptUpload() {
  const api = useAxiosAuth();
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [extracted, setExtracted] = useState<ExtractedData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      
      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
      if (!validTypes.includes(file.type)) {
        toast.error('Please upload a valid image file (JPEG, JPG, or PNG)');
        return;
      }

      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size too large. Maximum size is 5MB');
        return;
      }

      setSelectedImage(file);
      setPreviewUrl(URL.createObjectURL(file));
      setExtracted(null); // reset previous extracted data
    }
  };

  const handleUpload = async () => {
    if (!selectedImage) {
      toast.error("Please select an image first");
      return;
    }
    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append("receipt", selectedImage);

      const { data } = await api.post("/receipt/receipt", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        timeout: 30000, // 30 seconds timeout
      });

      if (!data.extracted) {
        throw new Error("No data extracted from receipt");
      }

      setExtracted({
        title: data.extracted.merchant,
        amount: data.extracted.amount,
        category: data.extracted.category,
        date: data.extracted.date,
      });

      toast.success("Receipt processed successfully!");
    } catch (err: any) {
      console.error('Receipt processing error:', err);
      if (err.response?.status === 413) {
        toast.error("File size too large. Please upload a smaller image.");
      } else if (err.code === 'ECONNABORTED') {
        toast.error("Request timed out. Please try again with a smaller image.");
      } else if (err.response?.data?.error) {
        toast.error(err.response.data.error);
      } else {
        toast.error("Failed to process receipt. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Scan Receipt</h1>
          <p className="text-muted-foreground">
            Upload or scan receipt images for AI-powered expense extraction
          </p>
        </div>

        <Card className="border-0 shadow-sm bg-background text-foreground">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5 text-primary" />
              Receipt OCR Processing
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-6">
            <div>
              <div>
                <input
                  id="receipt-upload"
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={handleImageChange}
                />
                <Button
                  className="inline-flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-white text-sm font-medium rounded-lg"
                  onClick={() => document.getElementById('receipt-upload')?.click()}
                >
                  <Upload className="h-4 w-4" />
                  Upload Receipt Image
                </Button>
              </div>
            </div>

            {previewUrl ? (
              <div className="max-w-xs mx-auto">
                <img
                  src={previewUrl}
                  alt="Receipt Preview"
                  className="rounded-lg border border-border shadow-sm"
                />
              </div>
            ) : (
              <div className="flex justify-center gap-4">
                <Camera className="h-8 w-8 text-muted-foreground" />
                <Upload className="h-8 w-8 text-muted-foreground" />
                <Receipt className="h-8 w-8 text-muted-foreground" />
              </div>
            )}

            {previewUrl && (
              <div>
                <Button
                  onClick={handleUpload}
                  className="mt-4 bg-primary hover:bg-primary/90"
                  disabled={isLoading}
                >
                  {isLoading ? "Processing..." : "Process Receipt"}
                </Button>
              </div>
            )}

            {extracted && (
              <div className="mt-8 space-y-4 text-left max-w-sm mx-auto">
                <h3 className="text-lg font-semibold text-foreground">
                  Extracted Data
                </h3>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div><span className="font-medium text-foreground">Title:</span> {extracted.title}</div>
                  <div><span className="font-medium text-foreground">Amount:</span> ₹{extracted.amount.toFixed(2)}</div>
                  <div><span className="font-medium text-foreground">Category:</span> {extracted.category}</div>
                  <div><span className="font-medium text-foreground">Date:</span> {new Date(extracted.date).toLocaleDateString()}</div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
