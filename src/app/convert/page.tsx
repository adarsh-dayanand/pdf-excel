import { ConverterClient } from "./converter-client";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Convert PDF to Excel",
  description: "Upload your PDF file with tables and convert it into an editable Excel spreadsheet. Securely process your accounting documents.",
};

export default function ConvertPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl font-headline">
          PDF to Excel Converter
        </h1>
        <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
          Upload your PDF, and our AI will extract the tables into a downloadable Excel file.
        </p>
      </div>
      <ConverterClient />
    </div>
  );
}
