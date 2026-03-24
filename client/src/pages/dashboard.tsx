import { useQuery } from "@tanstack/react-query";
import { GitPullRequest, MessageSquare, FolderGit2, AlertTriangle } from "lucide-react";
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
