import { useQuery } from "@tanstack/react-query";
import { GitPullRequest, MessageSquare, FolderGit2, AlertTriangle, Shield, ShieldAlert, ShieldCheck } from "lucide-react";
import { StatsCard } from "@/components/stats-card";
import { ReviewCard } from "@/components/review-card";
import { EmptyState } from "@/components/empty-state";
import { StatsCardSkeleton, ReviewCardSkeleton } from "@/components/loading-skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import type { Review, Repository, Stats } from "@shared/schema";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const RISK_COLORS = {
  low: "hsl(var(--chart-2))",
  medium: "hsl(var(--chart-3))",
  high: "hsl(var(--chart-5))",
};

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useQuery<Stats>({
    queryKey: ["/api/stats"],
  });

  const { data: reviews, isLoading: reviewsLoading } = useQuery<Review[]>({
    queryKey: ["/api/reviews"],
  });

  const { data: repositories } = useQuery<Repository[]>({
    queryKey: ["/api/repositories"],
  });

  const recentReviews = reviews?.slice(0, 5) || [];
  const repoMap = new Map(repositories?.map((r) => [r.id, r]) || []);

  const riskData = stats
    ? [
      { name: "Low", value: stats.riskDistribution.low, fill: RISK_COLORS.low },
      { name: "Medium", value: stats.riskDistribution.medium, fill: RISK_COLORS.medium },
      { name: "High", value: stats.riskDistribution.high, fill: RISK_COLORS.high },
    ]
    : [];

  const activityData = stats?.recentActivity || [];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Overview of your AI-powered code reviews
          </p>
        </div>
        <Button asChild>
          <Link href="/repositories" data-testid="button-add-repository">
            <FolderGit2 className="h-4 w-4 mr-2" />
            Add Repository
          </Link>
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsLoading ? (
          <>
            <StatsCardSkeleton />
            <StatsCardSkeleton />
            <StatsCardSkeleton />
            <StatsCardSkeleton />
          </>
        ) : (
          <>
            <StatsCard
              title="Total Reviews"
              value={stats?.totalReviews || 0}
              icon={<GitPullRequest className="h-4 w-4" />}
              description="All time"
            />
            <StatsCard
              title="Comments Generated"
              value={stats?.totalComments || 0}
              icon={<MessageSquare className="h-4 w-4" />}
              description="Actionable feedback"
            />
            <StatsCard
              title="Avg Comments/Review"
              value={stats?.avgCommentsPerReview?.toFixed(1) || "0"}
              description="Per review"
            />
            <StatsCard
              title="High Risk PRs/MRs"
              value={stats?.riskDistribution.high || 0}
              icon={<AlertTriangle className="h-4 w-4" />}
              description="Needs attention"
            />
          </>
        )}
      </div>

      {/* Security Posture Card */}
      {(() => {
        const taintCrit = stats?.taintVulnerabilities?.critical || 0;
        const taintHigh = stats?.taintVulnerabilities?.high || 0;
        const taintMed = stats?.taintVulnerabilities?.medium || 0;
        const taintLow = stats?.taintVulnerabilities?.low || 0;

        const prHigh = stats?.riskDistribution?.high || 0;
        const prMed = stats?.riskDistribution?.medium || 0;
        const prLow = stats?.riskDistribution?.low || 0;

        const criticalFindings = taintCrit;
        const highFindings = taintHigh + prHigh;
        const mediumFindings = taintMed + prMed;
        const lowFindings = taintLow + prLow;
        const totalOpenIssues = (stats?.totalComments || 0) + (stats?.totalPolicyViolations || 0) + (stats?.totalTaintPaths || 0);

        // Deterministic Score Calculation:
        // Starts at 100, penalized by findings weight: Critical (-20), High (-10), Medium (-4), Low (-1), capped at 0.
        // If there are no reviews or findings recorded, default clean baseline is 100.
        const deductions = (criticalFindings * 20) + (highFindings * 10) + (mediumFindings * 4) + (lowFindings * 1);
        const postureScore = stats?.totalReviews === 0 ? 100 : Math.max(0, Math.min(100, 100 - deductions));

        const scoreColor = postureScore >= 80 
          ? "text-emerald-500" 
          : postureScore >= 50 
          ? "text-amber-500" 
          : "text-red-500";

        const scoreBg = postureScore >= 80 
          ? "bg-emerald-500" 
          : postureScore >= 50 
          ? "bg-amber-500" 
          : "bg-red-500";

        const ratingLabel = postureScore >= 80 ? "STRONG" : postureScore >= 50 ? "MODERATE" : "CRITICAL RISK";
        const ratingBadge = postureScore >= 80 
          ? "border-emerald-500/30 text-emerald-600 bg-emerald-500/10 dark:text-emerald-400" 
          : postureScore >= 50 
          ? "border-amber-500/30 text-amber-600 bg-amber-500/10 dark:text-amber-400" 
          : "border-red-500/30 text-red-600 bg-red-500/10 dark:text-red-400";

        return (
          <Card className="border border-border/80 shadow-xs overflow-hidden" data-testid="card-security-posture">
            <CardHeader className="pb-3 bg-muted/20 border-b border-border/40">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary">
                    <Shield className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-base font-semibold flex items-center gap-2">
                      Security Posture
                      <Badge variant="outline" className={`text-xs uppercase font-semibold ${ratingBadge}`}>
                        {ratingLabel}
                      </Badge>
                    </CardTitle>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Deterministic posture rating derived from all verified reviews, taint paths, and policy violations
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-xs text-muted-foreground block">Posture Score</span>
                    <span className={`text-2xl font-bold font-mono tracking-tight ${scoreColor}`}>
                      {statsLoading ? "--" : postureScore}<span className="text-xs text-muted-foreground font-normal">/100</span>
                    </span>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                {/* Score Summary Block */}
                <div className="p-3 rounded-lg border border-border/50 bg-card/60 flex flex-col justify-between">
                  <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                    Posture
                  </span>
                  <div className="my-1.5">
                    <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${scoreBg}`}
                        style={{ width: `${Math.max(5, Math.min(100, postureScore))}%` }}
                      />
                    </div>
                  </div>
                  <span className={`text-sm font-semibold ${scoreColor}`}>
                    {postureScore >= 80 ? "Healthy" : postureScore >= 50 ? "Needs Review" : "Action Required"}
                  </span>
                </div>

                {/* Critical Findings */}
                <div className="p-3 rounded-lg border border-red-500/20 bg-red-500/5 flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-medium uppercase tracking-wider text-red-600 dark:text-red-400">
                      Critical
                    </span>
                    <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                  </div>
                  <p className="text-2xl font-bold font-mono text-red-600 dark:text-red-400 my-1">
                    {statsLoading ? "--" : criticalFindings}
                  </p>
                  <span className="text-[10px] text-muted-foreground">Taint sinks & exploits</span>
                </div>

                {/* High Findings */}
                <div className="p-3 rounded-lg border border-orange-500/20 bg-orange-500/5 flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-medium uppercase tracking-wider text-orange-600 dark:text-orange-400">
                      High
                    </span>
                    <span className="h-2 w-2 rounded-full bg-orange-500" />
                  </div>
                  <p className="text-2xl font-bold font-mono text-orange-600 dark:text-orange-400 my-1">
                    {statsLoading ? "--" : highFindings}
                  </p>
                  <span className="text-[10px] text-muted-foreground">Severe security flaws</span>
                </div>

                {/* Medium Findings */}
                <div className="p-3 rounded-lg border border-amber-500/20 bg-amber-500/5 flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-medium uppercase tracking-wider text-amber-600 dark:text-amber-400">
                      Medium
                    </span>
                    <span className="h-2 w-2 rounded-full bg-amber-500" />
                  </div>
                  <p className="text-2xl font-bold font-mono text-amber-600 dark:text-amber-400 my-1">
                    {statsLoading ? "--" : mediumFindings}
                  </p>
                  <span className="text-[10px] text-muted-foreground">Moderate exposure</span>
                </div>

                {/* Low Findings */}
                <div className="p-3 rounded-lg border border-emerald-500/20 bg-emerald-500/5 flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-medium uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                      Low
                    </span>
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  </div>
                  <p className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400 my-1">
                    {statsLoading ? "--" : lowFindings}
                  </p>
                  <span className="text-[10px] text-muted-foreground">Best-practice notes</span>
                </div>

                {/* Open Issues */}
                <div className="p-3 rounded-lg border border-border/50 bg-card/60 flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                      Open Issues
                    </span>
                    <AlertTriangle className="h-3 w-3 text-muted-foreground" />
                  </div>
                  <p className="text-2xl font-bold font-mono text-foreground my-1">
                    {statsLoading ? "--" : totalOpenIssues}
                  </p>
                  <span className="text-[10px] text-muted-foreground">Total logged findings</span>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })()}

      {/* Operational Metrics */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Operational Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-lg border bg-card p-4">
              <p className="text-xs text-muted-foreground">MTTR</p>
              <p className="text-2xl font-semibold">
                {(stats?.operationalMetrics?.mttrHours ?? 0).toFixed(2)}h
              </p>
            </div>
            <div className="rounded-lg border bg-card p-4">
              <p className="text-xs text-muted-foreground">Reopen Rate</p>
              <p className="text-2xl font-semibold">
                {(stats?.operationalMetrics?.reopenRate ?? 0).toFixed(1)}%
              </p>
            </div>
            <div className="rounded-lg border bg-card p-4">
              <p className="text-xs text-muted-foreground">Fix Adoption</p>
              <p className="text-2xl font-semibold">
                {(stats?.operationalMetrics?.fixAdoptionRate ?? 0).toFixed(1)}%
              </p>
            </div>
            <div className="rounded-lg border bg-card p-4">
              <p className="text-xs text-muted-foreground">Risk Burn-down</p>
              <p className="text-2xl font-semibold">
                {(stats?.operationalMetrics?.riskBurndownPercent ?? 0).toFixed(1)}%
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Charts and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Reviews */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Recent Reviews</h2>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/reviews" data-testid="link-view-all-reviews">
                View All
              </Link>
            </Button>
          </div>
          {reviewsLoading ? (
            <div className="space-y-4">
              <ReviewCardSkeleton />
              <ReviewCardSkeleton />
              <ReviewCardSkeleton />
            </div>
          ) : recentReviews.length === 0 ? (
            <EmptyState
              icon={GitPullRequest}
              title="No reviews yet"
              description="Connect a repository and open a pull/merge request to get started with AI-powered code reviews."
              action={{
                label: "Add Repository",
                onClick: () => window.location.href = "/repositories",
              }}
            />
          ) : (
            <div className="space-y-4">
              {recentReviews.map((review) => (
                <ReviewCard
                  key={review.id}
                  review={review}
                  repository={repoMap.get(review.repositoryId)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Sidebar Charts */}
        <div className="space-y-4">
          {/* Risk Distribution */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Risk Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              {stats && (stats.riskDistribution.low + stats.riskDistribution.medium + stats.riskDistribution.high) > 0 ? (
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={riskData}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={70}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {riskData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-48 flex items-center justify-center text-sm text-muted-foreground">
                  No data yet
                </div>
              )}
              <div className="flex justify-center gap-4 mt-2">
                <div className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-green-500" />
                  <span className="text-xs">Low</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-yellow-500" />
                  <span className="text-xs">Medium</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
                  <span className="text-xs">High</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Weekly Activity */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Weekly Activity</CardTitle>
            </CardHeader>
            <CardContent>
              {activityData.length > 0 ? (
                <div className="h-40">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={activityData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis
                        dataKey="date"
                        tick={{ fontSize: 10 }}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis
                        tick={{ fontSize: 10 }}
                        tickLine={false}
                        axisLine={false}
                        allowDecimals={false}
                      />
                      <Tooltip />
                      <Bar
                        dataKey="count"
                        fill="hsl(var(--primary))"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-40 flex items-center justify-center text-sm text-muted-foreground">
                  No activity yet
                </div>
              )}
            </CardContent>
          </Card>

          {/* Comment Types */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Issue Types</CardTitle>
            </CardHeader>
            <CardContent>
              {stats?.commentTypeDistribution && Object.keys(stats.commentTypeDistribution).length > 0 ? (
                <div className="space-y-2">
                  {Object.entries(stats.commentTypeDistribution).map(([type, count]) => (
                    <div key={type} className="flex items-center justify-between">
                      <span className="text-sm capitalize">{type}</span>
                      <Badge variant="secondary">{count as number}</Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-4 text-center text-sm text-muted-foreground">
                  No comments yet
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
