import { AUDIT_PRICING_TIERS } from "@shared/pricing";
import { CheckCircle2, XCircle, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLocation } from "wouter";

export default function PricingPage() {
  const [, setLocation] = useLocation();

  return (
    <div className="container mx-auto px-4 py-16 max-w-6xl">
      <div className="text-center space-y-4 mb-16">
        <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">
          Transparent Pricing for Audit Readiness
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Pay per report. No subscriptions. Get cryptographically verifiable ASVS/SOC2 readiness artifacts in hours, not months.
        </p>
      </div>

      <div className="bg-primary/5 border border-primary/20 rounded-xl p-6 mb-16 flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            The Alternative Cost
          </h3>
          <p className="text-muted-foreground mt-1">
            Independent SOC2/ASVS audit engagement: typically <strong className="text-foreground">$8,000-$50,000</strong>.
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-muted-foreground">CodeGuard Automated Readiness Report:</p>
          <p className="text-2xl font-bold text-primary mt-1">Starting at $1,500</p>
          <p className="text-sm font-medium mt-1">Delivered in 24-48 hours.</p>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {AUDIT_PRICING_TIERS.map((tier) => (
          <Card key={tier.id} className="relative flex flex-col h-full shadow-lg hover:shadow-xl transition-shadow border-primary/10">
            {tier.id === "medium" && (
              <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 font-semibold">
                Most Popular
              </Badge>
            )}
            <CardHeader>
              <CardTitle className="text-2xl">{tier.name}</CardTitle>
              <CardDescription>Target Repo: {tier.targetRepoSize}</CardDescription>
              <div className="mt-4 flex items-baseline text-4xl font-extrabold">
                ${tier.priceUsd.toLocaleString()}
                <span className="ml-1 text-xl font-medium text-muted-foreground">/report</span>
              </div>
            </CardHeader>
            <CardContent className="flex-1 space-y-6">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">ASVS Level Supported:</p>
                <p className="font-semibold">{tier.asvsLevelSupported}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Turnaround Estimate:</p>
                <p className="font-semibold">{tier.turnaroundEstimate}</p>
              </div>
              
              <div className="space-y-3">
                <h4 className="text-sm font-semibold tracking-wide uppercase text-primary">Included</h4>
                <ul className="space-y-3">
                  {tier.included.map((feature, i) => (
                    <li key={i} className="flex gap-3 text-sm">
                      <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-3 pt-4 border-t">
                <h4 className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">Not Included</h4>
                <ul className="space-y-3">
                  {tier.notIncluded.map((feature, i) => (
                    <li key={i} className="flex gap-3 text-sm text-muted-foreground">
                      <XCircle className="w-5 h-5 text-destructive shrink-0 opacity-70" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full" 
                variant={tier.id === "medium" ? "default" : "outline"} 
                size="lg"
                onClick={() => setLocation("/audit")}
              >
                Run Audit Now
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
      
      <div className="mt-16 text-center max-w-3xl mx-auto space-y-4 p-6 bg-secondary/20 rounded-xl">
        <h3 className="text-xl font-semibold">Honest Scope Notice</h3>
        <p className="text-muted-foreground leading-relaxed">
          CodeGuard provides an <strong>Automated Readiness Report</strong>. It is designed to find gaps, identify vulnerabilities, and provide cryptographic proof of controls before you engage a formal auditor. It does <strong>not</strong> carry the same legal weight as a licensed CPA's signed opinion or a formal SOC2 certification.
        </p>
      </div>
    </div>
  );
}
