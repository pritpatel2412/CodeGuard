import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  GitPullRequest,
  MessageSquare,
  Clock,
  ExternalLink,
  FileCode,
  Plus,
  Minus,
  ShieldCheck,
} from "lucide-react";
import { Link } from "wouter";
import { formatDistanceToNow } from "date-fns";
import type { Review, Repository } from "@shared/schema";
import { isSecurityFixTitle, stripEmoji } from "@/lib/text";
import { safePrUrl } from "@/lib/safe-url";

interface ReviewCardProps {
  review: Review;
  repository?: Repository;
  showActions?: boolean;
}

const riskColors = {
  low: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  medium: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  high: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
};

const riskDots = {
  low: "bg-green-500",
  medium: "bg-yellow-500",
  high: "bg-red-500",
};

export function ReviewCard({ review, repository, showActions = true }: ReviewCardProps) {
  const riskLevel = review.riskLevel as "low" | "medium" | "high";
  const isGitLab = repository?.platform === "gitlab";
  const prLabel = isGitLab ? "MR" : "PR";
  const safeTitle = stripEmoji(review.prTitle);
  const safeSummary = review.summary ? stripEmoji(review.summary) : review.summary;
  const isSecurityFix = isSecurityFixTitle(review.prTitle);
  const prHref = safePrUrl(review.prUrl);

  return (
    <Card className="hover-elevate" data-testid={`review-card-${review.id}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 min-w-0 flex-1">
            <Avatar className="h-8 w-8 flex-shrink-0">
              <AvatarImage src={review.authorAvatar || undefined} alt={review.author} />
              <AvatarFallback className="text-xs">
                {review.author.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-medium text-base truncate max-w-[300px]">
                  {safeTitle}
                </h3>
                <Badge variant="outline" className="text-xs flex-shrink-0">
                  {prLabel} #{review.prNumber}
                </Badge>
                {isSecurityFix && (
                  <Badge variant="secondary" className="text-xs flex-shrink-0">
                    <ShieldCheck className="h-3 w-3 mr-1 text-emerald-500" />
                    Security Fix
                  </Badge>
                )}
              </div>
              {repository && (
                <p className="text-xs text-muted-foreground mt-0.5 truncate">
                  {repository.fullName}
                </p>
              )}
            </div>
          </div>
          <Badge
            className={`${riskColors[riskLevel]} flex items-center gap-1.5 flex-shrink-0`}
            variant="secondary"
          >
            <span className={`h-1.5 w-1.5 rounded-full ${riskDots[riskLevel]}`} />
            {riskLevel}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {review.summary && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {safeSummary}
          </p>
        )}
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <MessageSquare className="h-3.5 w-3.5" />
            {review.commentCount} comments
          </span>
          <span className="flex items-center gap-1">
            <FileCode className="h-3.5 w-3.5" />
            {review.filesChanged} files
          </span>
          <span className="flex items-center gap-1 text-green-600 dark:text-green-400">
            <Plus className="h-3.5 w-3.5" />
            {review.additions}
          </span>
          <span className="flex items-center gap-1 text-red-600 dark:text-red-400">
            <Minus className="h-3.5 w-3.5" />
            {review.deletions}
          </span>
        </div>
        <div className="flex items-center justify-between pt-2 border-t">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3.5 w-3.5" />
            {formatDistanceToNow(new Date(review.createdAt), { addSuffix: true })}
          </div>
          {showActions && (
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" asChild disabled={!prHref}>
                <a
                  href={prHref ?? "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-testid={`link-pr-external-${review.id}`}
                  onClick={(e) => {
                    if (!prHref) e.preventDefault();
                  }}
                >
                  <ExternalLink className="h-3.5 w-3.5 mr-1" />
                  View {prLabel}
                </a>
              </Button>
              <Button size="sm" asChild>
                <Link href={`/reviews/${review.id}`} data-testid={`link-review-details-${review.id}`}>
                  <GitPullRequest className="h-3.5 w-3.5 mr-1" />
                  Details
                </Link>
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
