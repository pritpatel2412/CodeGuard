import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, CheckCircle2, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";

const requestSchema = z.object({
  repoUrl: z.string().min(1, "Repository URL is required").url("Must be a valid URL"),
  contactName: z.string().min(1, "Name is required"),
  contactEmail: z.string().email("Invalid email address"),
  motivationText: z.string().min(10, "Please provide a bit more detail (min 10 chars)"),
  confirmAccess: z.literal(true, {
    errorMap: () => ({ message: "You must confirm you have the right to grant access" }),
  }),
  website: z.string().optional(),
});

type PromoOfferData = {
  active: boolean;
  pendingCount?: number;
  offer?: {
    id: string;
    name: string;
    description: string;
    startsAt: string;
    endsAt: string;
  };
};

export default function FreeAuditRequest() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [submitted, setSubmitted] = useState(false);

  const { data: offerData, isLoading } = useQuery<PromoOfferData>({
    queryKey: ["/api/public/promo-offer"],
  });

  const form = useForm<z.infer<typeof requestSchema>>({
    resolver: zodResolver(requestSchema),
    defaultValues: {
      repoUrl: "",
      contactName: "",
      contactEmail: "",
      motivationText: "",
      website: "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (values: z.infer<typeof requestSchema>) => {
      const res = await fetch("/api/public/free-audit-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to submit request");
      }
      return res.json();
    },
    onSuccess: () => {
      setSubmitted(true);
    },
    onError: (error) => {
      toast({
        title: "Submission failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  function onSubmit(values: z.infer<typeof requestSchema>) {
    mutation.mutate(values);
  }

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!offerData?.active) {
    return (
      <div className="p-6 space-y-6 max-w-md mx-auto text-center py-16">
        <ShieldAlert className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
        <h1 className="text-xl font-semibold tracking-tight">
          This week's free audit offer has ended
        </h1>
        <p className="text-sm text-muted-foreground leading-relaxed mt-2">
          Thank you for your interest! We're currently processing the batch of requests we received.
        </p>
        <Button size="sm" onClick={() => setLocation("/pricing")} className="mt-4">
          View our Pricing Page instead
        </Button>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="p-6 space-y-6 max-w-md mx-auto text-center py-16">
        <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-3" />
        <h1 className="text-xl font-semibold tracking-tight">
          Request Received
        </h1>
        <p className="text-sm text-muted-foreground leading-relaxed mt-2">
          Thanks — I'm reviewing these personally this week and will email you directly.
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-3xl mx-auto">
      {/* Aligned Typography Header */}
      <div className="flex flex-col gap-1 border-b pb-5">
        <h1 className="text-2xl font-semibold tracking-tight">
          {offerData?.offer?.name === "linkedin-launch-week" 
            ? "Free CodeGuard Audit" 
            : "Free CodeGuard Audit"}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {offerData?.offer?.description || "Submit your repository, and we'll run a complete compliance report on it."}
        </p>
      </div>

      {(offerData?.pendingCount ?? 0) > 50 && (
        <div className="bg-amber-500/10 border border-amber-500/30 text-amber-500 rounded-lg p-4 mb-2 flex items-start gap-3 text-left">
          <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <p className="text-xs font-bold">High Request Volume</p>
            <p className="text-[11px] opacity-95">Due to the number of pending requests, new submissions may not be reviewed before the offer ends.</p>
          </div>
        </div>
      )}

      <Card className="border border-border bg-card shadow-sm rounded-xl">
        <CardHeader className="space-y-1.5">
          <CardTitle className="text-base font-semibold">Submit your repository</CardTitle>
          <CardDescription className="text-xs">
            No credit card required. We review every submission manually to verify access.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="repoUrl"
                render={({ field }) => (
                  <FormItem className="space-y-1.5">
                    <FormLabel className="text-xs">Repository URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://github.com/owner/repo" {...field} className="h-8 text-xs" />
                    </FormControl>
                    <FormDescription className="text-[10px]">
                      Must be a public repository. If private, please include instructions to grant read access in the motivation field below.
                    </FormDescription>
                    <FormMessage className="text-[10px]" />
                  </FormItem>
                )}
              />

              <div className="grid md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="contactName"
                  render={({ field }) => (
                    <FormItem className="space-y-1.5">
                      <FormLabel className="text-xs">Your Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Jane Doe" {...field} className="h-8 text-xs" />
                      </FormControl>
                      <FormMessage className="text-[10px]" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="contactEmail"
                  render={({ field }) => (
                    <FormItem className="space-y-1.5">
                      <FormLabel className="text-xs">Email Address</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="jane@example.com" {...field} className="h-8 text-xs" />
                      </FormControl>
                      <FormMessage className="text-[10px]" />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="motivationText"
                render={({ field }) => (
                  <FormItem className="space-y-1.5">
                    <FormLabel className="text-xs">What are you hoping to learn from the report?</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="e.g. Preparing for SOC2 compliance, looking for critical security blind spots..." 
                        className="min-h-[80px] text-xs"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage className="text-[10px]" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="confirmAccess"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-lg border border-border p-3.5 bg-muted/20">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="text-xs font-normal">
                        I confirm I have the right to grant access to this repository for security auditing purposes.
                      </FormLabel>
                    </div>
                  </FormItem>
                )}
              />

              {/* Honeypot field for bot resistance */}
              <div className="hidden" aria-hidden="true">
                <FormField
                  control={form.control}
                  name="website"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input type="text" tabIndex={-1} autoComplete="off" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              <Button type="submit" className="w-full text-xs h-9 font-semibold" disabled={mutation.isPending}>
                {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Submit Request
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
