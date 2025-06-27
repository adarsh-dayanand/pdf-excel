import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/components/auth-provider";
import { Header } from "@/components/header";
import { Toaster } from "@/components/ui/toaster";

const siteUrl = "https://excel-convert.ai";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "ExcelConvert | Convert PDF Tables to Excel with AI",
    template: `%s | ExcelConvert`,
  },
  description: "Instantly and securely convert PDF files with accounting tables into editable Excel spreadsheets using our advanced AI. Your data is processed securely and is never stored.",
  keywords: ["PDF to Excel", "Convert PDF", "Accounting", "Data Extraction", "AI Converter", "Excel Spreadsheet", "PDF table extractor"],
  openGraph: {
    title: "ExcelConvert | AI-Powered PDF to Excel Converter",
    description: "Effortlessly extract tables from your PDF documents and convert them to Excel. Secure, private, and powered by AI.",
    url: siteUrl,
    siteName: "ExcelConvert",
    images: [
      {
        url: 'https://placehold.co/1200x630.png',
        width: 1200,
        height: 630,
        alt: "ExcelConvert - PDF to Excel with AI",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ExcelConvert | AI-Powered PDF to Excel Converter",
    description: "Instantly convert your PDF tables to Excel. Secure, fast, and accurate, powered by AI.",
    images: ['https://placehold.co/1200x630.png'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1688837718282158"
          crossOrigin="anonymous"></script>
      </head>
      <body className="font-body antialiased" suppressHydrationWarning>
        <AuthProvider>
          <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-1 flex flex-col">{children}</main>
          </div>
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
