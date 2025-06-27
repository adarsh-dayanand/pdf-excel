"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Check } from "lucide-react";

interface PricingModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

export function PricingModal({ isOpen, onOpenChange }: PricingModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-center text-3xl font-headline">Upgrade to Pro</DialogTitle>
          <DialogDescription className="text-center">
            Choose the plan that's right for you and unlock unlimited conversions.
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-8">
          <PlanCard
            title="Free"
            price="0"
            description="For casual use"
            features={[
              "5 PDF conversions per day",
              "Standard AI extraction",
              "Email support",
            ]}
            isCurrent={true}
          />
          <PlanCard
            title="Pro"
            price="10"
            description="For power users & professionals"
            features={[
              "Unlimited PDF conversions",
              "Advanced AI extraction",
              "Priority email support",
              "Download history",
            ]}
            isCurrent={false}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}

function PlanCard({ title, price, description, features, isCurrent }: {
    title: string;
    price: string;
    description: string;
    features: string[];
    isCurrent: boolean;
}) {
    return (
        <Card className={!isCurrent ? "border-primary shadow-lg" : ""}>
            <CardHeader className="text-center">
                <CardTitle className="text-2xl font-headline">{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
                <p className="text-4xl font-bold mb-4">${price}<span className="text-lg font-normal text-muted-foreground">/month</span></p>
                <ul className="space-y-2 text-sm text-muted-foreground mb-6 w-full">
                    {features.map((feature, index) => (
                        <li key={index} className="flex items-center">
                            <Check className="w-4 h-4 mr-2 text-green-500" />
                            <span>{feature}</span>
                        </li>
                    ))}
                </ul>
                <Button className="w-full" disabled={isCurrent} variant={isCurrent ? 'outline' : 'default'}>
                    {isCurrent ? "Current Plan" : "Subscribe with Razorpay"}
                </Button>
            </CardContent>
        </Card>
    )
}
