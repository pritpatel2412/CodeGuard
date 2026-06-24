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
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
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
});

export default function FreeAuditRequest() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [submitted, setSubmitted] = useState(false);

  const { data: offerData, isLoading } = useQuery({
    queryKey: ["/api/public/promo-offer"],
  });

  const form = useForm<z.infer<typeof requestSchema>>({
    resolver: zodResolver(requestSchema),
    defaultValues: {
      repoUrl: "",
      contactName: "",
      contactEmail: "",
      motivationText: "",
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
      <div className="container mx-auto px-4 py-16 max-w-2xl text-center space-y-8">
        <ShieldAlert className="w-16 h-16 text-muted-foreground mx-auto" />
        <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">
          This week's free audit offer has ended
        </h1>
        <p className="text-xl text-muted-foreground">
          Thank you for your interest! We're currently processing the batch of requests we received.
        </p>
        <Button size="lg" onClick={() => setLocation("/pricing")}>
          View our Pricing Page instead
        </Button>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-2xl text-center space-y-8">
        <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto" />
        <h1 className="text-4xl font-extrabold tracking-tight lg:text-4xl">
          Request Received
        </h1>
        <p className="text-xl text-muted-foreground">
          Thanks — I'm reviewing these personally this week and will email you directly.
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-16 max-w-2xl">
      <div className="text-center space-y-4 mb-10">
        <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">
          {offerData.offer.name === "linkedin-launch-week" 
            ? "Free CodeGuard Audit" 
            : "Free CodeGuard Audit"}
        </h1>
        <p className="text-lg text-muted-foreground">
          {offerData.offer.description || "Drop your repo, and I'll run an Audit Mode pass on it personally."}
        </p>
      </div>

      {offerData?.pendingCount > 50 && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-md p-4 mb-6 flex items-start gap-3 text-left">
          <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5 text-amber-600" />
          <p className="text-sm">
            <strong>High volume:</strong> Due to the number of requests, new submissions may not be reviewed before the offer ends.
          </p>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Submit your repository</CardTitle>
          <CardDescription>
            No credit card required. I review every submission personally to ensure we can provide value.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="repoUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Repository URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://github.com/owner/repo" {...field} />
                    </FormControl>
                    <FormDescription>
                      Must be a public repository. If private, please include instructions to grant read access in the motivation field below.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="contactName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Your Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Jane Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="contactEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="jane@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="motivationText"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>What are you hoping to learn from the report?</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="e.g. Preparing for SOC2 compliance, looking for critical security blind spots..." 
                        className="min-h-[100px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="confirmAccess"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        I confirm I have the right to grant access to this repository for security auditing purposes.
                      </FormLabel>
                    </div>
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full" disabled={mutation.isPending}>
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
