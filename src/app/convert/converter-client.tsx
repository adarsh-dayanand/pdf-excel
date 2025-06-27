
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
import { useAuth } from "@/components/auth-provider";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PDFDocument } from 'pdf-lib';


type Step = "upload" | "loading" | "preview" | "error";

export function ConverterClient() {
  const { toast } = useToast();
  const { isLoggedIn } = useAuth();
  const [step, setStep] = useState<Step>("upload");
  const [extractedData, setExtractedData] = useState<any[]>([]);
  const [fileName, setFileName] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isPricingModalOpen, setPricingModalOpen] = useState(false);
  
  const [isPasswordModalOpen, setPasswordModalOpen] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [pdfPassword, setPdfPassword] = useState("");

  const extractData = async (file: File) => {
    setStep("loading");
    setFileName(file.name.replace(/\.[^/.]+$/, ""));

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      try {
        const pdfDataUri = reader.result as string;
        const result = await extractTabularData({ pdfDataUri, isLoggedIn });
        
        if (!result.tabularData || result.tabularData.trim() === '[]' || result.tabularData.trim() === '{}') {
           throw new Error("No tabular data found in the PDF. Please try another file.");
        }
        
        const parsedData = JSON.parse(result.tabularData);
        if (!Array.isArray(parsedData) || parsedData.length === 0) {
           throw new Error("Extracted data is not in a valid table format. Please check the PDF.");
        }

        setExtractedData(parsedData);
        setStep("preview");
        toast({
          title: "Extraction Successful!",
          description: "Your data has been extracted. You can now preview and edit it.",
        });
      } catch (error: any) {
        const message = error.message || "An unexpected error occurred during extraction.";
        if (message.includes("exceeded the limit")) {
          setPricingModalOpen(true);
        }
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

  const handleFileSelect = async (file: File) => {
    setStep("loading");
    const reader = new FileReader();
    reader.readAsArrayBuffer(file);
    reader.onload = async () => {
        try {
            const arrayBuffer = reader.result as ArrayBuffer;
            await PDFDocument.load(arrayBuffer);
            // Not password protected, proceed normally
            await extractData(file);
        } catch (error: any) {
            if (error.name === 'PDFInvalidPasswordError') {
                // Password protected
                setPendingFile(file);
                setPasswordModalOpen(true);
                setStep("upload"); // Go back to upload view, dialog will overlay
            } else {
                // Other error during PDF loading
                const message = "Failed to load the PDF file. It might be corrupted.";
                setErrorMessage(message);
                setStep("error");
                toast({
                    title: "PDF Load Error",
                    description: message,
                    variant: "destructive",
                });
            }
        }
    }
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
  
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pendingFile || !pdfPassword) return;

    setPasswordModalOpen(false);
    setStep("loading");

    const reader = new FileReader();
    reader.readAsArrayBuffer(pendingFile);
    reader.onload = async () => {
        try {
            const arrayBuffer = reader.result as ArrayBuffer;
            const pdfDoc = await PDFDocument.load(arrayBuffer, { password: pdfPassword });
            const pdfBytes = await pdfDoc.save();
            const decryptedFile = new File([pdfBytes], pendingFile.name, { type: "application/pdf" });
            
            setPdfPassword("");
            setPendingFile(null);
            
            await extractData(decryptedFile);
        } catch (error: any) {
            const message = "Invalid password or corrupted PDF. Please try again.";
            setErrorMessage(message);
            setStep("error");
            toast({
                title: "Decryption Failed",
                description: message,
                variant: "destructive",
            });
            setPdfPassword("");
            setPendingFile(null);
        }
    };
    reader.onerror = () => {
        const message = "Failed to read the file during decryption.";
        setErrorMessage(message);
        setStep("error");
        toast({
            title: "File Read Error",
            description: message,
            variant: "destructive",
        });
    }
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
    setPendingFile(null);
    setPdfPassword("");
    setPasswordModalOpen(false);
  };
  
  const uploadDescription = isLoggedIn
    ? "Select or drag and drop a PDF file containing accounting tables."
    : "Select or drag and drop a PDF file. Guest users are limited to 2 conversions every 6 hours.";

  return (
    <>
      <div className="space-y-8">
        {step === "upload" && (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-xl md:text-2xl"><FileUp /> Step 1: Upload your PDF</CardTitle>
                    <CardDescription>{uploadDescription}</CardDescription>
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
                    <CardTitle className="flex items-center gap-2 text-xl md:text-2xl"><Sheet /> Step 2: Preview & Download</CardTitle>
                    <CardDescription>Review the extracted data. You can edit any cell directly. When ready, download as an Excel file.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <DataTable data={extractedData} onDataChange={setExtractedData} />
                    <div className="flex flex-col gap-2 md:flex-row md:justify-end">
                        <Button variant="outline" onClick={handleReset}><Repeat className="mr-2 h-4 w-4" /> Start Over</Button>
                        <Button onClick={handleDownload}>Download Excel</Button>
                    </div>
                </CardContent>
            </Card>
        )}

        {step === "error" && (
            <Card className="border-destructive">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-destructive text-xl md:text-2xl"><AlertCircle /> Extraction Failed</CardTitle>
                    <CardDescription className="text-destructive">{errorMessage}</CardDescription>
                </CardHeader>
                <CardContent>
                    <Button onClick={handleReset}><Repeat className="mr-2 h-4 w-4" /> Try Again</Button>
                </CardContent>
            </Card>
        )}
      </div>
      <PricingModal isOpen={isPricingModalOpen} onOpenChange={setPricingModalOpen} />

      <Dialog open={isPasswordModalOpen} onOpenChange={setPasswordModalOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Password Required</DialogTitle>
                <DialogDescription>
                    This PDF file is password protected. Please enter the password to continue.
                </DialogDescription>
            </DialogHeader>
            <form onSubmit={handlePasswordSubmit}>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="password-input" className="text-right">Password</Label>
                        <Input id="password-input" type="password" value={pdfPassword} onChange={(e) => setPdfPassword(e.target.value)} className="col-span-3" />
                    </div>
                </div>
                <DialogFooter>
                    <Button type="submit">Submit</Button>
                </DialogFooter>
            </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
