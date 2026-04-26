import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function Terms() {
  const lastUpdated = "April 26, 2026";

  return (
    <div className="min-h-screen bg-background text-foreground p-6 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="icon" className="h-9 w-9">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Terms of Service</h1>
            <p className="text-sm text-muted-foreground">Last updated: {lastUpdated}</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>CodeGuard Terms of Service</CardTitle>
            <CardDescription>
              These Terms govern use of CodeGuard, including webhook processing, AI analysis,
              custom security policies, and optional AI-generated fixes.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <section className="space-y-2">
              <h3 className="text-lg font-medium">1. Acceptance of Terms</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                By accessing or using CodeGuard, you agree to these Terms. If you do not agree,
                you may not use the Service.
              </p>
            </section>

            <section className="space-y-2">
              <h3 className="text-lg font-medium">2. Accounts and Access</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                You are responsible for all activity performed through your account and linked
                source-control credentials. You must have authority to connect repositories and
                configure webhooks.
              </p>
            </section>

            <section className="space-y-2">
              <h3 className="text-lg font-medium">3. Acceptable Use</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                You may not use CodeGuard to submit forged webhook traffic, bypass access controls,
                perform unauthorized scanning, or disrupt availability. Attempts to extract secrets
                or abuse automation features are prohibited.
              </p>
            </section>

            <section className="space-y-2">
              <h3 className="text-lg font-medium">4. AI Review and Policy Enforcement</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                CodeGuard provides automated findings and recommendations, including custom policy
                checks from <code>.codeguard.yml</code>. AI output is advisory and must be reviewed
                by your team. You remain fully responsible for code decisions and merge approvals.
              </p>
            </section>

            <section className="space-y-2">
              <h3 className="text-lg font-medium">5. AI Fixes and Risk Controls</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Auto-fix workflows may create branches, commits, and pull/merge requests in your
                repository. Safety guards reduce risk but do not guarantee perfect changes. You must
                review and test any AI-generated fix before deployment.
              </p>
            </section>

            <section className="space-y-2">
              <h3 className="text-lg font-medium">6. Security Responsibilities</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                You are responsible for secure environment configuration, including
                <code> SESSION_SECRET</code>, repository webhook secrets, and token lifecycle
                management. Exposed secrets should be rotated immediately.
              </p>
            </section>

            <section className="space-y-2">
              <h3 className="text-lg font-medium">7. Service Availability</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                CodeGuard is provided on an "as is" basis. We may modify, suspend, or discontinue
                features at any time. We do not guarantee uninterrupted operation or error-free
                results.
              </p>
            </section>

            <section className="space-y-2">
              <h3 className="text-lg font-medium">8. Limitation of Liability</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                To the maximum extent permitted by law, CodeGuard and its contributors are not
                liable for indirect, incidental, special, consequential, or punitive damages,
                including loss of data, business interruption, or security incident impact caused
                by third-party systems.
              </p>
            </section>

            <section className="space-y-2">
              <h3 className="text-lg font-medium">9. Changes to Terms</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                We may revise these Terms from time to time. Updated terms are effective when
                posted. Continued use after updates constitutes acceptance of the revised Terms.
              </p>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
