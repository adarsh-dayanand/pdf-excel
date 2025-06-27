import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileDown, ShieldCheck, Sparkles } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none font-headline">
                    Convert PDF Tables to Excel with AI. Securely.
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    Upload your PDF with accounting tables, and let our AI
                    instantly extract the data into a clean, editable Excel
                    spreadsheet. Your data is processed securely and is never
                    stored.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Button asChild size="lg">
                    <Link href="/convert">Get Started for Free</Link>
                  </Button>
                </div>
              </div>
              <Image
                src="https://placehold.co/600x400.png"
                width="550"
                height="310"
                alt="Hero"
                data-ai-hint="spreadsheet analytics"
                className="mx-auto aspect-video overflow-hidden rounded-xl object-cover object-center sm:w-full lg:order-last"
              />
            </div>
          </div>
        </section>

        <section className="w-full py-12 md:py-24 lg:py-32 bg-secondary">
          <div className="container mx-auto px-4 md:px-6">
            <div className="mx-auto grid max-w-5xl items-start gap-8 sm:grid-cols-2 md:gap-12 lg:grid-cols-3">
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
    <Card className="shadow-lg border-transparent hover:border-primary transition-colors h-full">
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
