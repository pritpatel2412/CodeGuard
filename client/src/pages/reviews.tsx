import { useQuery } from "@tanstack/react-query";
import { GitPullRequest, Search, Filter } from "lucide-react";
import { ReviewCard } from "@/components/review-card";
import { EmptyState } from "@/components/empty-state";
import { ReviewCardSkeleton } from "@/components/loading-skeleton";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState, useMemo } from "react";
import type { Review, Repository } from "@shared/schema";
import { isSecurityFixTitle, stripEmoji } from "@/lib/text";

export default function Reviews() {
  const [searchQuery, setSearchQuery] = useState("");
  const [riskFilter, setRiskFilter] = useState<string>("all");
  const [repoFilter, setRepoFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [platformFilter, setPlatformFilter] = useState<string>("all");
  const [reviewTypeFilter, setReviewTypeFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("recent");

  const { data: reviews, isLoading: reviewsLoading } = useQuery<Review[]>({
    queryKey: ["/api/reviews"],
  });

  const { data: repositories } = useQuery<Repository[]>({
    queryKey: ["/api/repositories"],
  });

  const repoMap = new Map(repositories?.map((r) => [r.id, r]) || []);

  const filteredReviews = useMemo(() => {
    if (!reviews) return [];

    const baseFiltered = reviews.filter((review) => {
      const safeTitle = stripEmoji(review.prTitle).toLowerCase();
      const repo = repoMap.get(review.repositoryId);
      const repoName = repo?.name?.toLowerCase() || "";
      const author = review.author.toLowerCase();
      const query = searchQuery.toLowerCase();

      const matchesSearch =
        searchQuery === "" ||
        safeTitle.includes(query) ||
        author.includes(query) ||
        repoName.includes(query);

      const matchesRisk = riskFilter === "all" || review.riskLevel === riskFilter;
      const matchesRepo = repoFilter === "all" || review.repositoryId === repoFilter;
      const matchesStatus = statusFilter === "all" || review.status === statusFilter;
      const matchesPlatform = platformFilter === "all" || repo?.platform === platformFilter;

      const isSecurityFix = isSecurityFixTitle(review.prTitle);
      const matchesType =
        reviewTypeFilter === "all" ||
        (reviewTypeFilter === "security-fix" && isSecurityFix) ||
        (reviewTypeFilter === "regular" && !isSecurityFix);

      return (
        matchesSearch &&
        matchesRisk &&
        matchesRepo &&
        matchesStatus &&
        matchesPlatform &&
        matchesType
      );
    });

    const sorted = [...baseFiltered];
    sorted.sort((a, b) => {
      if (sortBy === "oldest") {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }
      if (sortBy === "risk-high") {
        const riskRank = { high: 3, medium: 2, low: 1 } as const;
        const riskDiff =
          riskRank[b.riskLevel as keyof typeof riskRank] - riskRank[a.riskLevel as keyof typeof riskRank];
        if (riskDiff !== 0) return riskDiff;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      if (sortBy === "comments") {
        const commentsDiff = b.commentCount - a.commentCount;
        if (commentsDiff !== 0) return commentsDiff;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return sorted;
  }, [
    reviews,
    searchQuery,
    riskFilter,
    repoFilter,
    statusFilter,
    platformFilter,
    reviewTypeFilter,
    sortBy,
    repoMap,
  ]);

  const resetFilters = () => {
    setSearchQuery("");
    setRiskFilter("all");
    setRepoFilter("all");
    setStatusFilter("all");
    setPlatformFilter("all");
    setReviewTypeFilter("all");
    setSortBy("recent");
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-semibold">Reviews</h1>
        <p className="text-sm text-muted-foreground">
          Browse and search all AI-generated code reviews
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by title, author, or repository..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
              data-testid="input-search-reviews"
            />
          </div>
          <Select value={riskFilter} onValueChange={setRiskFilter}>
            <SelectTrigger className="w-full sm:w-40" data-testid="select-risk-filter">
              <SelectValue placeholder="Risk Level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Risks</SelectItem>
              <SelectItem value="low">Low Risk</SelectItem>
              <SelectItem value="medium">Medium Risk</SelectItem>
              <SelectItem value="high">High Risk</SelectItem>
            </SelectContent>
          </Select>
          <Select value={repoFilter} onValueChange={setRepoFilter}>
            <SelectTrigger className="w-full sm:w-52" data-testid="select-repo-filter">
              <SelectValue placeholder="Repository" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Repositories</SelectItem>
              {repositories?.map((repo) => (
                <SelectItem key={repo.id} value={repo.id}>
                  {repo.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-40" data-testid="select-status-filter">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
            </SelectContent>
          </Select>

          <Select value={platformFilter} onValueChange={setPlatformFilter}>
            <SelectTrigger className="w-full sm:w-40" data-testid="select-platform-filter">
              <SelectValue placeholder="Platform" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Platforms</SelectItem>
              <SelectItem value="github">GitHub</SelectItem>
              <SelectItem value="gitlab">GitLab</SelectItem>
            </SelectContent>
          </Select>

          <Select value={reviewTypeFilter} onValueChange={setReviewTypeFilter}>
            <SelectTrigger className="w-full sm:w-44" data-testid="select-review-type-filter">
              <SelectValue placeholder="Review Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="security-fix">Security Fix</SelectItem>
              <SelectItem value="regular">Regular Review</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full sm:w-48" data-testid="select-sort-filter">
              <SelectValue placeholder="Sort By" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Newest First</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
              <SelectItem value="risk-high">Highest Risk First</SelectItem>
              <SelectItem value="comments">Most Comments</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" onClick={resetFilters} data-testid="button-reset-filters">
            Reset Filters
          </Button>
        </div>
      </div>

      {/* Results count */}
      {!reviewsLoading && reviews && (
        <p className="text-sm text-muted-foreground">
          Showing {filteredReviews.length} of {reviews.length} reviews
        </p>
      )}

      {/* Review List */}
      {reviewsLoading ? (
        <div className="space-y-4">
          <ReviewCardSkeleton />
          <ReviewCardSkeleton />
          <ReviewCardSkeleton />
          <ReviewCardSkeleton />
          <ReviewCardSkeleton />
        </div>
      ) : filteredReviews.length === 0 ? (
        <EmptyState
          icon={GitPullRequest}
          title={reviews?.length === 0 ? "No reviews yet" : "No matching reviews"}
          description={
            reviews?.length === 0
              ? "Reviews will appear here when pull/merge requests are analyzed."
              : "Try adjusting your search or filters to find what you're looking for."
          }
        />
      ) : (
        <div className="grid gap-4">
          {filteredReviews.map((review) => (
            <ReviewCard
              key={review.id}
              review={review}
              repository={repoMap.get(review.repositoryId)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
