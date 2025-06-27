import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/components/auth-provider";
import { Header } from "@/components/header";
import { Toaster } from "@/components/ui/toaster";
import CONSTANTS from "@/constants";

const siteUrl = "https://pdf-excel.netlify.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${CONSTANTS.APP_NAME} | Convert PDF Tables to Excel with AI`,
    template: `%s | ${CONSTANTS.APP_NAME}`,
  },
  description: "Instantly and securely convert PDF files with accounting tables into editable Excel spreadsheets using our advanced AI. Your data is processed securely and is never stored.",
  keywords: ["PDF to Excel", "Convert PDF", "Accounting", "Data Extraction", "AI Converter", "Excel Spreadsheet", "PDF table extractor"],
  openGraph: {
    title: `${CONSTANTS.APP_NAME} | AI-Powered PDF to Excel Converter`,
    description: "Effortlessly extract tables from your PDF documents and convert them to Excel. Secure, private, and powered by AI.",
    url: siteUrl,
    siteName: CONSTANTS.APP_NAME,
    images: [
      {
        url: 'https://pdf-excel.netlify.app/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fimage.6552c00d.png&w=640&q=75',
        width: 1200,
        height: 630,
        alt: `${CONSTANTS.APP_NAME} - PDF to Excel with AI`,
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: `${CONSTANTS.APP_NAME} | AI-Powered PDF to Excel Converter`,
    description: "Instantly convert your PDF tables to Excel. Secure, fast, and accurate, powered by AI.",
    images: ['https://pdf-excel.netlify.app/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fimage.6552c00d.png&w=640&q=75', 'https://pdf-excel.netlify.app/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fimage2.2b0ea90d.png&w=640&q=75'],
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
