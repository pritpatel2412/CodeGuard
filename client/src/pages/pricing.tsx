import { useState } from "react";
import { AUDIT_PRICING_TIERS, PricingTier } from "@shared/pricing";
import { CheckCircle2, XCircle, FileText, CreditCard, Lock, ShieldCheck, Loader2, Sparkles, Percent } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

export default function PricingPage() {
  const { toast } = useToast();
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("monthly");
  const [selectedTier, setSelectedTier] = useState<PricingTier | null>(null);
  const [step, setStep] = useState<"checkout" | "processing" | "success">("checkout");

  // Form states for checkout simulation
  const [cardNumber, setCardNumber] = useState("4242 4242 4242 4242");
  const [expiry, setExpiry] = useState("12/28");
  const [cvc, setCvc] = useState("123");
  const [name, setName] = useState("Jane Doe");
  const [promoCode, setPromoCode] = useState("");
  const [promoApplied, setPromoApplied] = useState(false);

  const calculatePrice = (price: number) => {
    if (billingCycle === "annual") {
      // 20% discount on annual plan
      return Math.round(price * 0.8);
    }
    return price;
  };

  const handleApplyPromo = () => {
    if (promoCode.trim().toUpperCase() === "SECURE20") {
      setPromoApplied(true);
      toast({
        title: "Promo Applied",
        description: "Extra 20% discount applied to your order!",
      });
    } else {
      toast({
        title: "Invalid Code",
        description: "The discount code you entered is not valid.",
        variant: "destructive",
      });
    }
  };

  const handlePayment = () => {
    setStep("processing");
    setTimeout(() => {
      setStep("success");
      toast({
        title: "Upgrade Successful",
        description: `Successfully upgraded to the ${selectedTier?.name} plan!`,
      });
    }, 2000);
  };

  const closeCheckout = () => {
    setSelectedTier(null);
    setStep("checkout");
    setPromoApplied(false);
    setPromoCode("");
  };

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      {/* Aligned Typography Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b pb-5">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Pricing Plans</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Choose the ideal level of continuous security reviews, taint analysis, and ASVS/SOC2 readiness reports.
          </p>
        </div>

        {/* Billed Switch Toggle */}
        <div className="flex items-center gap-2 bg-muted/60 p-1 rounded-lg border border-border/40">
          <Button
            variant={billingCycle === "monthly" ? "secondary" : "ghost"}
            size="sm"
            className="h-8 text-xs font-medium rounded-md px-3"
            onClick={() => setBillingCycle("monthly")}
          >
            Monthly
          </Button>
          <Button
            variant={billingCycle === "annual" ? "secondary" : "ghost"}
            size="sm"
            className="h-8 text-xs font-medium rounded-md px-3 relative"
            onClick={() => setBillingCycle("annual")}
          >
            Annual
            <Badge className="absolute -top-3 -right-2 px-1 py-0.5 text-[9px] scale-90 bg-primary text-white border-none">
              -20%
            </Badge>
          </Button>
        </div>
      </div>

      {/* Alternative Cost Banner */}
      <div className="bg-primary/5 border border-primary/20 rounded-xl p-5 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="space-y-1">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <FileText className="w-4 h-4 text-primary" />
            Traditional Compliance Costs
          </h3>
          <p className="text-xs text-muted-foreground">
            A traditional third-party audit readiness engagement typically costs starting from <strong className="text-foreground">$8,000 to $50,000</strong>.
          </p>
        </div>
        <div className="text-left md:text-right border-l md:border-l-0 md:border-r pl-4 md:pr-4 py-1 border-border/60">
          <p className="text-xs text-muted-foreground font-medium">CodeGuard Automated Subscriptions:</p>
          <p className="text-lg font-bold text-primary">Starting at $29/month</p>
        </div>
      </div>

      {/* Pricing Cards Grid */}
      <div className="grid md:grid-cols-3 gap-6">
        {AUDIT_PRICING_TIERS.map((tier) => {
          const finalPrice = calculatePrice(tier.priceUsd);
          const isPro = tier.id === "pro";
          
          return (
            <Card
              key={tier.id}
              className={`relative flex flex-col h-full transition-all duration-300 border bg-card ${
                isPro 
                  ? "border-primary shadow-md scale-105 md:scale-100 lg:scale-105" 
                  : "border-border/60 hover:border-border"
              }`}
            >
              {isPro && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 px-2.5 py-0.5 text-[10px] font-semibold tracking-wide shadow bg-primary text-white border-none flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  Most Popular
                </Badge>
              )}
              
              <CardHeader className="space-y-1.5 pb-4">
                <CardTitle className="text-lg font-semibold">{tier.name}</CardTitle>
                <CardDescription className="text-xs">Capacity: {tier.targetRepoSize}</CardDescription>
                
                <div className="pt-2 flex items-baseline gap-1">
                  <span className="text-3xl font-bold tracking-tight">${finalPrice}</span>
                  <span className="text-xs text-muted-foreground font-normal">
                    /{billingCycle === "annual" ? "mo (billed annually)" : "mo"}
                  </span>
                </div>
              </CardHeader>
              
              <CardContent className="flex-1 space-y-5 pb-6 text-xs">
                <div className="space-y-1">
                  <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Compliance Support</p>
                  <p className="font-semibold text-foreground">{tier.asvsLevelSupported}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Turnaround Estimate</p>
                  <p className="font-semibold text-foreground">{tier.turnaroundEstimate}</p>
                </div>
                
                {/* Features List */}
                <div className="space-y-2 pt-2 border-t border-border/40">
                  <p className="text-[10px] uppercase font-bold text-primary tracking-wider">Included Features</p>
                  <ul className="space-y-2">
                    {tier.included.map((feature, i) => (
                      <li key={i} className="flex gap-2 items-start text-muted-foreground">
                        <CheckCircle2 className="w-3.5 h-3.5 text-green-500 shrink-0 mt-0.5" />
                        <span className="leading-tight">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-2 pt-2 border-t border-border/40">
                  <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Limits & Exclusions</p>
                  <ul className="space-y-2">
                    {tier.notIncluded.map((feature, i) => (
                      <li key={i} className="flex gap-2 items-start text-muted-foreground/60">
                        <XCircle className="w-3.5 h-3.5 text-muted-foreground/40 shrink-0 mt-0.5" />
                        <span className="leading-tight">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
              
              <CardFooter className="pt-0">
                <Button 
                  className="w-full text-xs font-semibold" 
                  variant={isPro ? "default" : "outline"} 
                  onClick={() => setSelectedTier(tier)}
                >
                  {tier.id === "enterprise" ? "Contact Enterprise" : "Subscribe Now"}
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>
      
      {/* Disclaimer Notice */}
      <div className="mt-8 p-4 bg-muted/30 border border-border/40 rounded-xl max-w-3xl mx-auto space-y-1 text-center">
        <h4 className="text-xs font-semibold">Honest Scope Notice</h4>
        <p className="text-[11px] text-muted-foreground leading-relaxed">
          CodeGuard provides automated compliance checks and reports. While we generate highly accurate verification artifacts, we do not replace formal audit assessments by a licensed CPA or auditor.
        </p>
      </div>

      {/* Payment Wall Checkout Dialog */}
      <Dialog open={selectedTier !== null} onOpenChange={(open) => !open && closeCheckout()}>
        <DialogContent className="sm:max-w-[480px] p-0 overflow-hidden border border-border bg-card shadow-lg rounded-xl">
          {selectedTier && (
            <div className="flex flex-col h-full">
              {/* Dialog Header */}
              <div className="p-5 border-b border-border/60 bg-muted/35">
                <DialogTitle className="text-base font-semibold flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-primary" />
                  CodeGuard is Under Development
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground mt-1">
                  We are not currently accepting real payments or card details.
                </DialogDescription>
              </div>

              <div className="p-8 flex flex-col items-center justify-center space-y-5 text-center">
                <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                  <Sparkles className="w-7 h-7" />
                </div>
                <div className="space-y-1.5">
                  <h3 className="text-base font-bold text-foreground">Thank you for your interest!</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed px-4">
                    Please do not pay or add any card details here. If you want to know more about the product or discuss enterprise access, please contact:
                  </p>
                  <p className="font-semibold text-primary mt-2">
                    try.prit24@gmail.com
                  </p>
                </div>
                <Button onClick={closeCheckout} className="w-full text-xs h-9 font-semibold mt-4">
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
