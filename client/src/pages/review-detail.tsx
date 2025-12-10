import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { 
  ArrowLeft, 
  ExternalLink, 
  GitPullRequest,
  FileCode,
  Plus,
  Minus,
  Clock,
  User,
  MessageSquare
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { ReviewCommentCard } from "@/components/review-comment";
import { CommentCardSkeleton } from "@/components/loading-skeleton";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow, format } from "date-fns";
import type { ReviewWithComments } from "@shared/schema";

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

export default function ReviewDetail() {
  const params = useParams<{ id: string }>();
  
  const { data, isLoading } = useQuery<ReviewWithComments>({
    queryKey: ["/api/reviews", params.id],
  });

  if (isLoading) {
    return (
      <div className="p-6 space-y-6 max-w-5xl mx-auto">
        <div className="flex items-center gap-4">
          <Skeleton className="h-9 w-20" />
          <Skeleton className="h-8 w-64" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </CardContent>
        </Card>
        <div className="space-y-4">
          <CommentCardSkeleton />
          <CommentCardSkeleton />
          <CommentCardSkeleton />
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-6 max-w-5xl mx-auto">
        <div className="text-center py-16">
          <h2 className="text-xl font-semibold mb-2">Review not found</h2>
          <p className="text-muted-foreground mb-4">
            The review you're looking for doesn't exist or has been deleted.
          </p>
          <Button asChild>
            <Link href="/reviews">Back to Reviews</Link>
          </Button>
        </div>
      </div>
    );
  }

  const { review, comments, repository } = data;
  const riskLevel = review.riskLevel as "low" | "medium" | "high";

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/reviews" data-testid="button-back-reviews">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-semibold">{review.prTitle}</h1>
              <Badge variant="outline">#{review.prNumber}</Badge>
              <Badge 
                className={`${riskColors[riskLevel]} flex items-center gap-1.5`}
                variant="secondary"
              >
                <span className={`h-1.5 w-1.5 rounded-full ${riskDots[riskLevel]}`} />
                {riskLevel} risk
              </Badge>
            </div>
            {repository && (
              <p className="text-sm text-muted-foreground mt-1">
                {repository.fullName}
              </p>
            )}
          </div>
        </div>
        <Button asChild>
          <a 
            href={review.prUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            data-testid="link-view-pr-github"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            View on GitHub
          </a>
        </Button>
      </div>

      {/* PR Info Card */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={review.authorAvatar || undefined} alt={review.author} />
                <AvatarFallback>
                  {review.author.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-xs text-muted-foreground">Author</p>
                <p className="font-medium">{review.author}</p>
              </div>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Files Changed</p>
              <p className="font-medium flex items-center gap-1">
                <FileCode className="h-4 w-4" />
                {review.filesChanged}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Changes</p>
              <p className="font-medium flex items-center gap-2">
                <span className="flex items-center text-green-600 dark:text-green-400">
                  <Plus className="h-3.5 w-3.5" />
                  {review.additions}
                </span>
                <span className="flex items-center text-red-600 dark:text-red-400">
                  <Minus className="h-3.5 w-3.5" />
                  {review.deletions}
                </span>
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Reviewed</p>
              <p className="font-medium flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {formatDistanceToNow(new Date(review.createdAt), { addSuffix: true })}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary */}
      {review.summary && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">AI Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed">{review.summary}</p>
          </CardContent>
        </Card>
      )}

      {/* Comments */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Review Comments
            <Badge variant="secondary">{comments.length}</Badge>
          </h2>
        </div>
        
        {comments.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-muted-foreground">
                No issues found in this pull request. Great job!
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {comments.map((comment) => (
              <ReviewCommentCard key={comment.id} comment={comment} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
