import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileDown, ShieldCheck, Sparkles } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1">
        <section className="w-full py-20 md:py-32 lg:py-40 xl:py-48">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none font-headline">
                  Convert PDF Tables to Excel with AI. Securely.
                </h1>
                <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                  Upload your PDF with accounting tables, and let our AI
                  instantly extract the data into a clean, editable Excel
                  spreadsheet. Your data is processed securely and is never
                  stored.
                </p>
              </div>
              <div className="space-x-4">
                <Button asChild size="lg">
                  <Link href="/convert">Get Started for Free</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        <section className="w-full py-12 md:py-24 lg:py-32 bg-secondary">
          <div className="container px-4 md:px-6">
            <div className="grid items-center gap-6 lg:grid-cols-3 lg:gap-12">
              <FeatureCard
                icon={<ShieldCheck className="w-10 h-10 text-primary" />}
                title="Secure & Private"
                description="We prioritize your privacy. All uploaded files are processed in memory and never saved on our servers. Your data remains yours, always."
              />
              <FeatureCard
                icon={<Sparkles className="w-10 h-10 text-primary" />}
                title="AI-Powered Extraction"
                description="Our advanced AI understands complex table structures, ensuring accurate data extraction from your PDFs, saving you hours of manual work."
              />
              <FeatureCard
                icon={<FileDown className="w-10 h-10 text-primary" />}
                title="Instant Excel Download"
                description="Review the extracted data, make any necessary edits, and download your file in .xlsx format with a single click. It's that simple."
              />
            </div>
          </div>
        </section>
      </main>

      <footer className="flex items-center justify-center w-full h-16 border-t">
        <p className="text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} ExcelConvert. All rights reserved.
        </p>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <Card className="shadow-lg border-transparent hover:border-primary transition-colors">
      <CardHeader className="flex flex-col items-center text-center pb-4">
        {icon}
        <CardTitle className="mt-4 font-headline">{title}</CardTitle>
      </CardHeader>
      <CardContent className="text-center text-muted-foreground">
        <p>{description}</p>
      </CardContent>
    </Card>
  );
}
