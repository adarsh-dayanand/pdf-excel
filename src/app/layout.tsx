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
  description:
    "Convert PDF tables to Excel spreadsheets instantly using AI. Secure, fast, and private PDF to Excel converter built for accounting, finance, and data extraction needs.",
  keywords: [
    "PDF to Excel",
    "Convert PDF",
    "AI Converter",
    "Accounting Tables",
    "Data Extraction",
    "PDF Table Extractor",
    "Spreadsheet from PDF",
    "OCR PDF to Excel",
  ],
  openGraph: {
    title: `${CONSTANTS.APP_NAME} | AI-Powered PDF to Excel Converter`,
    description:
      "Extract accounting tables from PDF files and convert them to Excel using AI. Fast, secure, and no data stored.",
    url: siteUrl,
    siteName: CONSTANTS.APP_NAME,
    images: [
      {
        url: `${siteUrl}/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fimage.6552c00d.png&w=1200&q=90`,
        width: 1200,
        height: 630,
        alt: `${CONSTANTS.APP_NAME} - Convert PDF to Excel`,
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: `${CONSTANTS.APP_NAME} | Convert PDF to Excel`,
    description:
      "Convert your PDF tables to Excel in seconds using our secure and AI-powered tool.",
    images: [
      `${siteUrl}/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fimage.6552c00d.png&w=1200&q=90`,
      `${siteUrl}/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fimage2.2b0ea90d.png&w=1200&q=90`,
    ],
  },
  alternates: {
    canonical: siteUrl,
  },
  themeColor: "#ffffff",
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
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

        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "WebApplication",
                name: CONSTANTS.APP_NAME,
                url: siteUrl,
                description:
                  "Convert PDF files with tables into Excel spreadsheets using advanced AI. Secure, fast, and accurate.",
                applicationCategory: "BusinessApplication",
                operatingSystem: "All",
              }),
            }}
          ></script>

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