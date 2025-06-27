"use client";

import { useState, useCallback, FormEvent } from "react";
import * as XLSX from "xlsx";
import { PDFDocument } from "pdf-lib";
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

type Step = "upload" | "loading" | "preview" | "error";

type FileState = {
  name: string;
  type: string;
  buffer: ArrayBuffer;
} | null;

export function ConverterClient() {
  const { toast } = useToast();
  const { isLoggedIn } = useAuth();
  const [step, setStep] = useState<Step>("upload");
  const [extractedData, setExtractedData] = useState<any[]>([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [isPricingModalOpen, setPricingModalOpen] = useState(false);
  const [fileState, setFileState] = useState<FileState>(null);
  
  const [isPasswordModalOpen, setPasswordModalOpen] = useState(false);
  const [pdfPassword, setPdfPassword] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const handleReset = useCallback(() => {
    setStep("upload");
    setExtractedData([]);
    setErrorMessage("");
    setFileState(null);
    setPasswordModalOpen(false);
    setPdfPassword("");
    setIsProcessing(false);
  }, []);

  const convertBufferToDataUri = (buffer: ArrayBuffer, type: string): string => {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    const base64 = window.btoa(binary);
    return `data:${type};base64,${base64}`;
  };

  const startExtraction = async (pdfBuffer: ArrayBuffer, fileType: string) => {
    try {
      const pdfDataUri = convertBufferToDataUri(pdfBuffer, fileType);
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
        description: "Your data has been extracted.",
      });
    } catch (error: any) {
      const message = error.message || "An unexpected error occurred during extraction.";
      if (message.includes("exceeded the limit")) {
        setPricingModalOpen(true);
        handleReset();
      } else {
        setErrorMessage(message);
        setStep("error");
      }
      toast({
        title: "Extraction Failed",
        description: message,
        variant: "destructive",
      });
    }
  };

  const processPdf = useCallback(async (buffer: ArrayBuffer, password?: string) => {
    if (!fileState) return;
    
    setIsProcessing(true);
    setStep("loading");

    try {
      const pdfDoc = await PDFDocument.load(buffer, { password });
      const unencryptedBytes = await pdfDoc.save();
      
      setPasswordModalOpen(false);
      await startExtraction(unencryptedBytes.buffer, fileState.type);

    } catch (e: any) {
      if (e.name === 'PDFEncryptedPDFError') {
        setStep("upload"); 
        setPasswordModalOpen(true);
      } else if (e.name === 'PDFInvalidPasswordError') {
        toast({
          title: "Invalid Password",
          description: "The password was incorrect. Please try again.",
          variant: "destructive",
        });
        setPdfPassword("");
        setStep("upload"); 
        setPasswordModalOpen(true); 
      } else {
        const message = "Failed to load the PDF. It might be corrupted or in an unsupported format.";
        setErrorMessage(message);
        setStep("error");
        toast({ title: "PDF Load Error", description: message, variant: "destructive" });
      }
    } finally {
        setIsProcessing(false);
    }
  }, [fileState, isLoggedIn, toast]);

  const handleFileSelect = async (file: File) => {
    handleReset();
    
    const buffer = await file.arrayBuffer();
    setFileState({ name: file.name, type: file.type, buffer });
    
    await processPdf(buffer);
  };
  
  const handlePasswordSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!fileState || !pdfPassword) return;
    await processPdf(fileState.buffer, pdfPassword);
  };
  
  const handleDownload = () => {
    try {
      const worksheet = XLSX.utils.json_to_sheet(extractedData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
      const fileName = fileState?.name.replace(/\.[^/.]+$/, "") || "converted_data";
      XLSX.writeFile(workbook, `${fileName}.xlsx`);
      toast({ title: "Download Started", description: `Your file ${fileName}.xlsx is being downloaded.` });
    } catch(e) {
       toast({ title: "Download Failed", description: "Could not generate the Excel file.", variant: "destructive" });
    }
  };
  
  const uploadDescription = isLoggedIn
    ? "Select or drag and drop a PDF file containing accounting tables."
    : "Select or drag and drop a PDF file. Guest users are limited to 2 conversions every 6 hours.";
  
  const isLoading = step === "loading" || isProcessing;

  return (
    <>
      <div className="space-y-8">
        {step === "upload" && !isLoading && (
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
        
        {isLoading && (
            <div className="flex flex-col items-center justify-center gap-4 p-10 border-2 border-dashed rounded-lg">
                <Loader2 className="w-12 h-12 animate-spin text-primary" />
                <h3 className="text-xl font-semibold">
                  {step === 'loading' ? 'Extracting Data...' : 'Processing...'}
                </h3>
                <p className="text-muted-foreground">This may take a moment.</p>
            </div>
        )}

        {step === "preview" && !isLoading && (
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

        {step === "error" && !isLoading && (
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
            <form onSubmit={handlePasswordSubmit}>
                <DialogHeader>
                    <DialogTitle>Password Required</DialogTitle>
                    <DialogDescription>
                        This PDF file is password protected. Please enter the password to continue.
                    </DialogDescription>
                </DialogHeader>
                <fieldset disabled={isProcessing} className="space-y-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="password-input" className="text-right">Password</Label>
                        <Input id="password-input" type="password" value={pdfPassword} onChange={(e) => setPdfPassword(e.target.value)} className="col-span-3" autoFocus />
                    </div>
                </fieldset>
                <DialogFooter>
                    <Button type="button" variant="ghost" onClick={handleReset}>Cancel</Button>
                    <Button type="submit" disabled={!pdfPassword || isProcessing}>
                        {isProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Submit
                    </Button>
                </DialogFooter>
            </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
