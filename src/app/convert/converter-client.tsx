
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
type PdfState = { file: File; buffer: ArrayBuffer } | null;


export function ConverterClient() {
  const { toast } = useToast();
  const { isLoggedIn } = useAuth();
  const [step, setStep] = useState<Step>("upload");
  const [extractedData, setExtractedData] = useState<any[]>([]);
  const [fileName, setFileName] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isPricingModalOpen, setPricingModalOpen] = useState(false);
  
  const [pdfState, setPdfState] = useState<PdfState>(null);
  const [isPasswordModalOpen, setPasswordModalOpen] = useState(false);
  const [pdfPassword, setPdfPassword] = useState("");
  const [isDecrypting, setIsDecrypting] = useState(false);

  const handleReset = () => {
    setStep("upload");
    setExtractedData([]);
    setFileName("");
    setErrorMessage("");
    setPdfState(null);
    setPdfPassword("");
    setPasswordModalOpen(false);
    setIsDecrypting(false);
  };

  const handleExtractionLogic = async (pdfDataUri: string, originalFileName: string) => {
    setFileName(originalFileName.replace(/\.[^/.]+$/, ""));
    setStep("loading");

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
    } finally {
        setPdfState(null);
    }
  };

  const attemptPdfLoad = async (buffer: ArrayBuffer, file: File, password?: string) => {
      try {
        if (!password) {
            setStep("loading");
        }
        const pdfDoc = await PDFDocument.load(buffer, { password });
        const pdfDataUri = await pdfDoc.saveAsBase64({ dataUri: true });
        
        setPasswordModalOpen(false);
        setPdfPassword('');
        setIsDecrypting(false);
        await handleExtractionLogic(pdfDataUri, file.name);

      } catch (error: any) {
          setIsDecrypting(false);
          if (error.name === 'PDFInvalidPasswordError') {
              if (password) {
                  toast({
                      title: "Invalid Password",
                      description: "The password was incorrect. Please try again.",
                      variant: "destructive",
                  });
                  setPdfPassword("");
              } else {
                  setStep("upload");
                  setPasswordModalOpen(true);
              }
          } else {
              handleReset();
              const message = "Failed to load the PDF. It might be corrupted or in an unsupported format.";
              setErrorMessage(message);
              setStep("error");
              toast({
                  title: "PDF Load Error",
                  description: message,
                  variant: "destructive",
              });
          }
      }
  };

  const handleFileSelect = async (file: File) => {
    try {
        const buffer = await file.arrayBuffer();
        setPdfState({ file, buffer });
        await attemptPdfLoad(buffer, file);
    } catch (e) {
        handleReset();
        const message = "Could not read the selected file.";
        setErrorMessage(message);
        setStep("error");
        toast({ title: "File Read Error", description: message, variant: "destructive" });
    }
  };
  
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pdfState || !pdfPassword || isDecrypting) return;

    setIsDecrypting(true);
    await attemptPdfLoad(pdfState.buffer, pdfState.file, pdfPassword);
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

      <Dialog open={isPasswordModalOpen} onOpenChange={(isOpen) => { if (!isOpen) handleReset(); else setPasswordModalOpen(true); }}>
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
                        <Button type="submit" disabled={isDecrypting}>
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
