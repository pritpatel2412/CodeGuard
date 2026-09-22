import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  ShieldAlert,
  ShieldCheck,
  Shield,
  Sparkles,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  TrendingDown,
  ChevronRight
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { apiRequest } from "@/lib/queryClient";
import type { SecuritySummaryResponse } from "@shared/schema";

interface AISecuritySummaryProps {
  reviewId: string;
  initialRiskLevel?: "low" | "medium" | "high" | string;
  initialSummary?: string | null;
  commentsCount: number;
}

export function AISecuritySummary({
  reviewId,
  initialRiskLevel = "low",
  initialSummary,
  commentsCount,
}: AISecuritySummaryProps) {
  const [hasManuallyRequested, setHasManuallyRequested] = useState(false);

  const {
    data: summary,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<SecuritySummaryResponse>({
    queryKey: ["/api/reviews", reviewId, "security-summary"],
    queryFn: async () => {
      const res = await apiRequest("POST", `/api/reviews/${reviewId}/security-summary`);
      return res.json();
    },
    staleTime: 10 * 60 * 1000, // 10 minutes cache
    enabled: hasManuallyRequested || commentsCount > 0,
  });

  const generateMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", `/api/reviews/${reviewId}/security-summary`);
      return res.json();
    },
    onSuccess: () => {
      refetch();
    },
  });

  const handleGenerate = () => {
    setHasManuallyRequested(true);
    generateMutation.mutate();
  };

  // State: Initial empty state when no comments and not yet generated
  if (!summary && !isLoading && !generateMutation.isPending && !hasManuallyRequested && commentsCount === 0) {
    return (
      <Card className="border border-emerald-500/20 bg-emerald-500/5">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-emerald-500" />
              <CardTitle className="text-base font-semibold">AI Security Summary</CardTitle>
            </div>
            <Badge variant="outline" className="border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10">
              Clean Diff
            </Badge>
          </div>
          <CardDescription>
            No high-risk security flaws or comments were detected in this review.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              Want a comprehensive executive risk synthesis from Groq AI?
            </p>
            <Button
              size="sm"
              variant="outline"
              onClick={handleGenerate}
              className="gap-1.5 text-xs h-8"
              data-testid="btn-generate-security-summary"
            >
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              Synthesize AI Summary
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // State: Loading / Mutating skeleton
  if (isLoading || generateMutation.isPending) {
    return (
      <Card className="border border-primary/20">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary animate-pulse" />
              <CardTitle className="text-base font-semibold">Generating AI Security Summary...</CardTitle>
            </div>
            <Skeleton className="h-5 w-24" />
          </div>
          <CardDescription>
            Synthesizing review findings, policy violations, and taint paths with AI...
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </CardContent>
      </Card>
    );
  }

  // State: Error state with retry
  if (isError || generateMutation.isError) {
    return (
      <Card className="border-destructive/30 bg-destructive/5">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              <CardTitle className="text-base font-semibold">AI Security Summary Unavailable</CardTitle>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => refetch()}
              className="gap-1.5 text-xs h-8"
              data-testid="btn-retry-security-summary"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Retry
            </Button>
          </div>
          <CardDescription className="text-destructive/80">
            {(error as any)?.message || (generateMutation.error as any)?.message || "Failed to generate AI security summary."}
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (!summary) return null;

  // Styling based on risk level and score
  const isHigh = summary.riskLevel === "HIGH";
  const isMedium = summary.riskLevel === "MEDIUM";
  const isLow = summary.riskLevel === "LOW";

  const riskBadgeClass = isHigh
    ? "bg-red-500/10 text-red-600 border-red-500/30 dark:text-red-400"
    : isMedium
    ? "bg-amber-500/10 text-amber-600 border-amber-500/30 dark:text-amber-400"
    : "bg-emerald-500/10 text-emerald-600 border-emerald-500/30 dark:text-emerald-400";

  const scoreColor = summary.securityScore >= 80
    ? "text-emerald-500"
    : summary.securityScore >= 50
    ? "text-amber-500"
    : "text-red-500";

  const scoreProgressColor = summary.securityScore >= 80
    ? "bg-emerald-500"
    : summary.securityScore >= 50
    ? "bg-amber-500"
    : "bg-red-500";

  return (
    <Card className="border border-border/80 shadow-xs overflow-hidden" data-testid="ai-security-summary-card">
      <CardHeader className="pb-4 bg-muted/30 border-b border-border/50">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-primary/10 text-primary">
              <Shield className="h-4 w-4" />
            </div>
            <div>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                AI Security Summary
                <Badge variant="secondary" className="text-[10px] font-mono uppercase tracking-wider py-0 px-1.5">
                  Groq / AI Powered
                </Badge>
              </CardTitle>
              <CardDescription className="text-xs">
                Comprehensive security posture synthesis for this Pull Request
              </CardDescription>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => generateMutation.mutate()}
              disabled={generateMutation.isPending}
              className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground gap-1"
              title="Re-run security summary"
              data-testid="btn-refresh-security-summary"
            >
              <RefreshCw className={`h-3 w-3 ${generateMutation.isPending ? "animate-spin" : ""}`} />
              Re-analyze
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6 space-y-6">
        {/* Top Metric Bar: Risk Level & Security Score */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Risk Level */}
          <div className="p-4 rounded-lg border border-border/60 bg-card flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs uppercase font-medium text-muted-foreground tracking-wider">
                Risk Level
              </span>
              <div className="flex items-center gap-2">
                {isHigh && <ShieldAlert className="h-5 w-5 text-red-500" />}
                {isMedium && <AlertTriangle className="h-5 w-5 text-amber-500" />}
                {isLow && <ShieldCheck className="h-5 w-5 text-emerald-500" />}
                <span className="text-xl font-bold tracking-tight">
                  {summary.riskLevel}
                </span>
              </div>
            </div>
            <Badge variant="outline" className={`text-xs px-2.5 py-1 font-semibold ${riskBadgeClass}`}>
              {summary.riskLevel} RISK
            </Badge>
          </div>

          {/* Security Score */}
          <div className="p-4 rounded-lg border border-border/60 bg-card space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase font-medium text-muted-foreground tracking-wider">
                Security Score
              </span>
              <span className={`text-xl font-bold font-mono ${scoreColor}`}>
                {summary.securityScore}<span className="text-xs text-muted-foreground font-normal">/100</span>
              </span>
            </div>
            {/* Progress Bar */}
            <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
              <div
                className={`h-full transition-all duration-500 rounded-full ${scoreProgressColor}`}
                style={{ width: `${Math.max(5, Math.min(100, summary.securityScore))}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-muted-foreground pt-0.5">
              <span>0 (Critical)</span>
              <span>100 (Safe)</span>
            </div>
          </div>
        </div>

        {/* Key Risks */}
        {summary.keyRisks && summary.keyRisks.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
              Key Risks
            </div>
            <div className="rounded-lg border border-border/60 bg-muted/20 p-4">
              <ul className="space-y-2 text-sm">
                {summary.keyRisks.map((risk, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-red-500 mt-2 shrink-0" />
                    <span className="leading-snug text-foreground/90">{risk}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Potential Impact */}
        {summary.potentialImpact && (
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <TrendingDown className="h-3.5 w-3.5 text-red-500" />
              Potential Impact
            </div>
            <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-4 text-sm text-foreground/90 leading-relaxed">
              {summary.potentialImpact}
            </div>
          </div>
        )}

        {/* Recommended Actions */}
        {summary.recommendedActions && summary.recommendedActions.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
              Recommended Actions
            </div>
            <div className="rounded-lg border border-border/60 bg-muted/20 p-4">
              <ul className="space-y-2 text-sm">
                {summary.recommendedActions.map((action, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <ChevronRight className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span className="leading-snug text-foreground/90">{action}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Why this matters */}
        {summary.whyThisMatters && (
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <HelpCircle className="h-3.5 w-3.5 text-primary" />
              Why This Matters
            </div>
            <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 text-sm text-foreground/90 leading-relaxed italic">
              "{summary.whyThisMatters}"
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
