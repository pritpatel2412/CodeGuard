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

export default function Reviews() {
  const [searchQuery, setSearchQuery] = useState("");
  const [riskFilter, setRiskFilter] = useState<string>("all");
  const [repoFilter, setRepoFilter] = useState<string>("all");

  const { data: reviews, isLoading: reviewsLoading } = useQuery<Review[]>({
    queryKey: ["/api/reviews"],
  });

  const { data: repositories } = useQuery<Repository[]>({
    queryKey: ["/api/repositories"],
  });

  const repoMap = new Map(repositories?.map((r) => [r.id, r]) || []);

  const filteredReviews = useMemo(() => {
    if (!reviews) return [];
    
    return reviews.filter((review) => {
      const matchesSearch = searchQuery === "" || 
        review.prTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        review.author.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesRisk = riskFilter === "all" || review.riskLevel === riskFilter;
      
      const matchesRepo = repoFilter === "all" || review.repositoryId === repoFilter;
      
      return matchesSearch && matchesRisk && matchesRepo;
    });
  }, [reviews, searchQuery, riskFilter, repoFilter]);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-semibold">Reviews</h1>
        <p className="text-sm text-muted-foreground">
          Browse and search all AI-generated code reviews
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by PR title or author..."
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
          <SelectTrigger className="w-full sm:w-48" data-testid="select-repo-filter">
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
              ? "Reviews will appear here when pull requests are analyzed."
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
