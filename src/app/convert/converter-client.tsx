"use client";

import { useState } from "react";
import * as XLSX from "xlsx";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { extractTabularData } from "@/ai/flows/extract-tabular-data";
import { FileUploader } from "@/components/file-uploader";
import { DataTable } from "@/components/data-table";
import { AlertCircle, FileUp, Loader2, Repeat, Sheet } from "lucide-react";
import { PricingModal } from "@/components/pricing-modal";

type Step = "upload" | "loading" | "preview" | "error";

export function ConverterClient() {
  const { toast } = useToast();
  const [step, setStep] = useState<Step>("upload");
  const [extractedData, setExtractedData] = useState<any[]>([]);
  const [fileName, setFileName] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [conversionCount, setConversionCount] = useState(0);
  const [isPricingModalOpen, setPricingModalOpen] = useState(false);
  const FREE_TIER_LIMIT = 5;

  const handleFileSelect = async (file: File) => {
    if (conversionCount >= FREE_TIER_LIMIT) {
      setPricingModalOpen(true);
      toast({
        title: "Free Limit Reached",
        description: "Please upgrade to Pro for unlimited conversions.",
        variant: "destructive",
      });
      return;
    }

    setStep("loading");
    setFileName(file.name.replace(/\.[^/.]+$/, ""));

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      try {
        const pdfDataUri = reader.result as string;
        const result = await extractTabularData({ pdfDataUri });
        
        if (!result.tabularData || result.tabularData.trim() === '[]' || result.tabularData.trim() === '{}') {
           throw new Error("No tabular data found in the PDF. Please try another file.");
        }
        
        const parsedData = JSON.parse(result.tabularData);
        if (!Array.isArray(parsedData) || parsedData.length === 0) {
           throw new Error("Extracted data is not in a valid table format. Please check the PDF.");
        }

        setExtractedData(parsedData);
        setStep("preview");
        setConversionCount(prev => prev + 1);
        toast({
          title: "Extraction Successful!",
          description: "Your data has been extracted. You can now preview and edit it.",
        });
      } catch (error: any) {
        const message = error.message || "An unexpected error occurred during extraction.";
        setErrorMessage(message);
        setStep("error");
        toast({
          title: "Extraction Failed",
          description: message,
          variant: "destructive",
        });
      }
    };
    reader.onerror = () => {
      const message = "Failed to read the file.";
      setErrorMessage(message);
      setStep("error");
       toast({
        title: "File Read Error",
        description: message,
        variant: "destructive",
      });
    };
  };
  
  const handleDownload = () => {
    try {
      const worksheet = XLSX.utils.json_to_sheet(extractedData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
      XLSX.writeFile(workbook, `${fileName}.xlsx`);
      toast({ title: "Download Started", description: `Your file ${fileName}.xlsx is being downloaded.` });
    } catch(e) {
       toast({ title: "Download Failed", description: "Could not generate the Excel file.", variant: "destructive" });
    }
  };

  const handleReset = () => {
    setStep("upload");
    setExtractedData([]);
    setFileName("");
    setErrorMessage("");
  };

  return (
    <>
      <div className="space-y-8">
        {step === "upload" && (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><FileUp /> Step 1: Upload your PDF</CardTitle>
                    <CardDescription>Select or drag and drop a PDF file containing accounting tables. You have {FREE_TIER_LIMIT - conversionCount} free conversions left today.</CardDescription>
                </CardHeader>
                <CardContent>
                    <FileUploader onFileSelect={handleFileSelect} />
                </CardContent>
            </Card>
        )}
        
        {step === "loading" && (
            <div className="flex flex-col items-center justify-center gap-4 p-10 border-2 border-dashed rounded-lg">
                <Loader2 className="w-12 h-12 animate-spin text-primary" />
                <h3 className="text-xl font-semibold">Extracting Data...</h3>
                <p className="text-muted-foreground">The AI is working its magic. This may take a moment.</p>
            </div>
        )}

        {step === "preview" && (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Sheet /> Step 2: Preview, Edit & Download</CardTitle>
                    <CardDescription>Review the extracted data. You can edit any cell directly. When ready, download as an Excel file.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <DataTable data={extractedData} onDataChange={setExtractedData} />
                    <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={handleReset}><Repeat className="mr-2 h-4 w-4" /> Start Over</Button>
                        <Button onClick={handleDownload}>Download Excel</Button>
                    </div>
                </CardContent>
            </Card>
        )}

        {step === "error" && (
            <Card className="border-destructive">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-destructive"><AlertCircle /> Extraction Failed</CardTitle>
                    <CardDescription className="text-destructive">{errorMessage}</CardDescription>
                </CardHeader>
                <CardContent>
                    <Button onClick={handleReset}><Repeat className="mr-2 h-4 w-4" /> Try Again</Button>
                </CardContent>
            </Card>
        )}
      </div>
      <PricingModal isOpen={isPricingModalOpen} onOpenChange={setPricingModalOpen} />
    </>
  );
}
