import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CalendarClock, CheckCircle2, Shield, Sparkles, Workflow } from "lucide-react";

type ChangelogEntry = {
  version: string;
  date: string;
  title: string;
  summary: string;
  highlights: string[];
  category: "security" | "feature" | "platform";
};

const CHANGELOG: ChangelogEntry[] = [
  {
    version: "v1.4.0",
    date: "2026-04-26",
    title: "Security and Policy Hardening Release",
    summary: "Major production hardening + policy-as-prompt rollout across backend and frontend.",
    category: "security",
    highlights: [
      "Custom policy engine for `.codeguard.yml` with validation and persistent policy violations",
      "CSRF protection for mutating API routes and sanitized `/api/user` responses",
      "Mandatory GitHub webhook signature + repository identity verification",
      "Safe external PR/MR URL handling and masked webhook secrets in UI",
      "Detailed Terms, Privacy, and incident-response docs added",
    ],
  },
  {
    version: "v1.3.0",
    date: "2026-04-25",
    title: "Cross-File Taint Analysis",
    summary: "Added semantic graph and taint propagation pipeline with dashboard visualization.",
    category: "feature",
    highlights: [
      "Taint path detection persisted per review",
      "Semantic graph rendering and vulnerability path timeline",
      "AI enrichment for vulnerability explanation and fix hints",
      "Dedicated taint API routes and review detail tabs",
    ],
  },
  {
    version: "v1.2.0",
    date: "2026-03-23",
    title: "Auto-Fix Workflow Improvements",
    summary: "Improved AI remediation flow with stronger branch/PR orchestration and safety guidance.",
    category: "platform",
    highlights: [
      "One-click apply fix from high/medium severity comments",
      "Automated branch creation + fix commit + PR/MR creation",
      "Safer UX around generated fix progress and outcomes",
    ],
  },
  {
    version: "v1.1.0",
    date: "2026-02-24",
    title: "Dashboard and Review Experience Upgrade",
    summary: "Richer analytics, improved review triage, and premium interface polish.",
    category: "feature",
    highlights: [
      "Advanced review filtering and sorting options",
      "Better risk distribution and activity visualizations",
      "Improved detail page structure and issue discoverability",
    ],
  },
  {
    version: "v1.0.0",
    date: "2025-12-18",
    title: "Initial Public Foundation",
    summary: "Core CodeGuard flow: repository onboarding, webhook ingestion, AI review, and findings UI.",
    category: "platform",
    highlights: [
      "GitHub OAuth and repository management",
      "Webhook-driven PR analysis pipeline",
      "Review summaries, comments, and analytics baseline",
    ],
  },
];

const CATEGORY_STYLE: Record<ChangelogEntry["category"], string> = {
  security: "text-red-500 border-red-500/30 bg-red-500/10",
  feature: "text-blue-500 border-blue-500/30 bg-blue-500/10",
  platform: "text-violet-500 border-violet-500/30 bg-violet-500/10",
};

const CATEGORY_ICON: Record<ChangelogEntry["category"], React.ComponentType<{ className?: string }>> = {
  security: Shield,
  feature: Sparkles,
  platform: Workflow,
};

export default function ChangelogPage() {
  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold">Channel Log</h1>
        <p className="text-sm text-muted-foreground">
          Timeline of major platform updates, security improvements, and shipped features.
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CalendarClock className="h-5 w-5 text-primary" />
            <CardTitle>Release Timeline</CardTitle>
          </div>
          <CardDescription>
            This timeline tracks major releases and breaking product milestones.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-0">
          {CHANGELOG.map((entry, idx) => {
            const Icon = CATEGORY_ICON[entry.category];
            return (
              <div key={entry.version} className="relative pl-8 pb-8 last:pb-0">
                <span className="absolute left-0 top-1.5 h-3 w-3 rounded-full bg-primary" />
                {idx !== CHANGELOG.length - 1 && (
                  <span className="absolute left-[5px] top-5 h-[calc(100%-8px)] w-px bg-border" />
                )}

                <div className="rounded-lg border bg-card text-card-foreground p-4 shadow-sm">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline">{entry.version}</Badge>
                    <Badge variant="outline" className={CATEGORY_STYLE[entry.category]}>
                      <Icon className="h-3.5 w-3.5 mr-1" />
                      {entry.category}
                    </Badge>
                    <span className="text-xs text-muted-foreground">{entry.date}</span>
                  </div>

                  <h3 className="mt-3 text-base font-semibold">{entry.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{entry.summary}</p>

                  <Separator className="my-3" />

                  <ul className="space-y-2">
                    {entry.highlights.map((item) => (
                      <li key={item} className="text-sm flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 mt-0.5 text-primary shrink-0" />
                        <span className="text-muted-foreground">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
