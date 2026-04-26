import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function Privacy() {
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
            <h1 className="text-2xl font-semibold tracking-tight">Privacy Policy</h1>
            <p className="text-sm text-muted-foreground">Last updated: {lastUpdated}</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>CodeGuard Privacy Policy</CardTitle>
            <CardDescription>
              This policy describes what we process, why we process it, and how we secure it.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <section className="space-y-2">
              <h3 className="text-lg font-medium">1. Information We Process</h3>
              <ul className="list-disc pl-5 mt-2 space-y-1 text-sm text-muted-foreground">
                <li><strong>Account data:</strong> username, avatar, provider identifiers.</li>
                <li><strong>Repository metadata:</strong> repository name, owner, platform, webhook configuration.</li>
                <li><strong>Review data:</strong> pull/merge request metadata, findings, summaries, and comments.</li>
                <li><strong>Policy data:</strong> parsed `.codeguard.yml` rules and policy violation records.</li>
                <li><strong>Operational data:</strong> session identifiers, security logs, and rate-limit events.</li>
              </ul>
            </section>

            <section className="space-y-2">
              <h3 className="text-lg font-medium">2. Why We Process Data</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                We process data to authenticate users, analyze pull requests, enforce custom security
                policies, generate findings, and provide optional AI-assisted remediation workflows.
              </p>
            </section>

            <section className="space-y-2">
              <h3 className="text-lg font-medium">3. Security Controls</h3>
              <ul className="list-disc pl-5 mt-2 space-y-1 text-sm text-muted-foreground">
                <li>Session cookies are `HttpOnly` and stricter in production.</li>
                <li>CSRF protection is applied to state-changing API routes.</li>
                <li>Webhook signature verification is required for GitHub webhook processing.</li>
                <li>Sensitive API values are redacted from operational logs.</li>
                <li>Policy and review access is restricted by repository ownership checks.</li>
              </ul>
            </section>

            <section className="space-y-2">
              <h3 className="text-lg font-medium">4. AI Processing and Third Parties</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Code snippets and diff content may be sent to AI services for analysis and policy
                enforcement. External providers (such as GitHub/GitLab and AI vendors) process data
                according to their own terms and privacy policies.
              </p>
            </section>

            <section className="space-y-2">
              <h3 className="text-lg font-medium">5. Retention</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                We retain account and review data only as long as necessary to provide product
                functionality, support auditing, and meet legal obligations. You are responsible for
                rotating exposed credentials and removing stale repository access.
              </p>
            </section>

            <section className="space-y-2">
              <h3 className="text-lg font-medium">6. Your Responsibilities</h3>
              <ul className="list-disc pl-5 mt-2 space-y-1 text-sm text-muted-foreground">
                <li>Use appropriately scoped source-control tokens.</li>
                <li>Keep webhook secrets confidential and rotate them after suspected exposure.</li>
                <li>Review AI-generated output before merge or production deployment.</li>
              </ul>
            </section>

            <section className="space-y-2">
              <h3 className="text-lg font-medium">7. Policy Updates</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                We may update this policy periodically. Continued use after publication of an updated
                policy constitutes acceptance of the revised policy.
              </p>
            </section>

            <p className="pt-4 mt-2 border-t text-sm text-muted-foreground">
              For security inquiries, incident reporting, or privacy requests, contact your CodeGuard
              workspace administrator.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
