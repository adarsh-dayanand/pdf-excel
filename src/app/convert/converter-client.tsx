"use client";

import { useState } from "react";
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

// Keep track of the file and its raw data buffer
type PdfFileState = {
  file: File;
  buffer: ArrayBuffer;
} | null;


export function ConverterClient() {
  const { toast } = useToast();
  const { isLoggedIn } = useAuth();
  const [step, setStep] = useState<Step>("upload");
  const [extractedData, setExtractedData] = useState<any[]>([]);
  const [fileName, setFileName] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isPricingModalOpen, setPricingModalOpen] = useState(false);
  
  // State for the PDF file being processed
  const [pdfFileState, setPdfFileState] = useState<PdfFileState>(null);
  
  // State for the password modal
  const [isPasswordModalOpen, setPasswordModalOpen] = useState(false);
  const [pdfPassword, setPdfPassword] = useState("");
  const [isDecrypting, setIsDecrypting] = useState(false);

  const handleReset = () => {
    setStep("upload");
    setExtractedData([]);
    setFileName("");
    setErrorMessage("");
    setPdfFileState(null);
    setPasswordModalOpen(false);
    setPdfPassword("");
    setIsDecrypting(false);
  };

  const convertBufferToDataUri = (buffer: ArrayBuffer, type: string): string => {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    const base64 = window.btoa(binary);
    return `data:${type};base64,${base64}`;
  };
  
  const processAndExtract = async (pdfDataUri: string, originalFileName: string) => {
    setStep("loading");
    setFileName(originalFileName.replace(/\.[^/.]+$/, ""));

    try {
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
    } finally {
      setIsDecrypting(false);
      setPasswordModalOpen(false);
    }
  };

  const handleFileSelect = async (file: File) => {
    handleReset();
    
    try {
      const buffer = await file.arrayBuffer();
      // Keep a reference to the uploaded file's data
      setPdfFileState({ file, buffer });

      // Attempt to load the PDF. This will throw an error if it's encrypted.
      await PDFDocument.load(buffer);
      
      // If no error, it's not encrypted. Proceed.
      const pdfDataUri = convertBufferToDataUri(buffer, file.type);
      await processAndExtract(pdfDataUri, file.name);

    } catch (e: any) {
      if (e.name === 'PDFEncryptedPDFError') {
        // PDF is password-protected, open the modal.
        setPasswordModalOpen(true);
      } else {
        // Another error occurred (e.g., corrupted file)
        const message = "Failed to load the PDF. It might be corrupted or in an unsupported format.";
        setErrorMessage(message);
        setStep("error");
        toast({ title: "PDF Load Error", description: message, variant: "destructive" });
      }
    }
  };
  
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pdfFileState || !pdfPassword) return;

    setIsDecrypting(true);

    try {
      // Attempt to decrypt with the provided password
      const pdfDoc = await PDFDocument.load(pdfFileState.buffer, {
        password: pdfPassword,
      });

      // Decryption successful. Save the unencrypted document.
      const unencryptedBytes = await pdfDoc.save();
      const pdfDataUri = convertBufferToDataUri(unencryptedBytes.buffer, pdfFileState.file.type);
      
      // Close the modal and start processing
      setPasswordModalOpen(false); 
      await processAndExtract(pdfDataUri, pdfFileState.file.name);

    } catch (e: any) {
      if (e.name === 'PDFInvalidPasswordError') {
        toast({
          title: "Invalid Password",
          description: "The password was incorrect. Please try again.",
          variant: "destructive",
        });
        setPdfPassword(""); // Clear password for re-entry
      } else {
        // Another error occurred during decryption
        setPasswordModalOpen(false);
        const message = "An unexpected error occurred while processing the PDF.";
        setErrorMessage(message);
        setStep("error");
        toast({ title: "Processing Error", description: message, variant: "destructive" });
      }
    } finally {
        setIsDecrypting(false);
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
                <h3 className="text-xl font-semibold">
                  Extracting Data...
                </h3>
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

      <Dialog open={isPasswordModalOpen} onOpenChange={(isOpen) => {
        // Only reset if the user is explicitly closing the dialog (e.g. with ESC or close button)
        // rather than it being closed programmatically on success.
        if (!isOpen) {
          handleReset();
        }
      }}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Password Required</DialogTitle>
                <DialogDescription>
                    This PDF file is password protected. Please enter the password to continue.
                </DialogDescription>
            </DialogHeader>
            <form onSubmit={handlePasswordSubmit}>
                <fieldset disabled={isDecrypting} className="space-y-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="password-input" className="text-right">Password</Label>
                        <Input id="password-input" type="password" value={pdfPassword} onChange={(e) => setPdfPassword(e.target.value)} className="col-span-3" autoFocus />
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="ghost" onClick={handleReset}>Cancel</Button>
                        <Button type="submit" disabled={!pdfPassword || isDecrypting}>
                            {isDecrypting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Submit
                        </Button>
                    </DialogFooter>
                </fieldset>
            </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
