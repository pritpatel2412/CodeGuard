import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Bug,
  Shield,
  Zap,
  BookOpen,
  Wrench,
  FileCode,
  Hash,
  Loader2,
  ExternalLink,
  ShieldAlert,
  Sparkles
} from "lucide-react";

// Remove static import to prevent cycles
import { AiFixFlow } from "@/components/ai-fix-flow";
import { type ReviewComment as ReviewCommentType } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { safePrUrl } from "@/lib/safe-url";
import { stripEmoji } from "@/lib/text";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";

interface ReviewCommentProps {
  comment: ReviewCommentType;
  platform?: "github" | "gitlab";
}

const typeConfig = {
  bug: {
    icon: Bug,
    label: "Bug",
    color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  },
  security: {
    icon: Shield,
    label: "Security",
    color: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
  },
  performance: {
    icon: Zap,
    label: "Performance",
    color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  },
  readability: {
    icon: BookOpen,
    label: "Readability",
    color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  },
  maintainability: {
    icon: Wrench,
    label: "Maintainability",
    color: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
  },
};

const severityColors = {
  low: "text-green-600 dark:text-green-400",
  medium: "text-yellow-600 dark:text-yellow-400",
  high: "text-red-600 dark:text-red-400",
};

export function ReviewCommentCard({ comment, platform = "github" }: ReviewCommentProps) {
  const type = comment.type as keyof typeof typeConfig;
  const config = typeConfig[type] || typeConfig.bug;
  const Icon = config.icon;
  const severity = comment.severity as "low" | "medium" | "high";
  const safeCommentText = stripEmoji(comment.comment);

  const [isFixing, setIsFixing] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [createdPrUrl, setCreatedPrUrl] = useState<string>();
  const { toast } = useToast();

  const handleApplyFix = async () => {
    setIsFixing(true);
    try {
      const res = await apiRequest(
        "POST",
        `/api/reviews/${comment.reviewId}/comments/${comment.id}/fix`
      );
      const data = await res.json();
      const safeFixUrl = data.prUrl ? safePrUrl(data.prUrl) : null;

      // Store the PR URL for the animation
      if (safeFixUrl) {
        setCreatedPrUrl(safeFixUrl);
      }

      toast({
        title: "Fix PR Created",
        description: "A new PR with the fix has been created.",
        action: safeFixUrl ? (
          <a href={safeFixUrl} target="_blank" rel="noreferrer">
            <Button variant="outline" size="sm" className="gap-2">
              View PR <ExternalLink className="h-3 w-3" />
            </Button>
          </a>
        ) : undefined,
      });
    } catch (error: any) {
      if (error.message.includes("sensitive files") || error.message.includes("Safety")) {
        toast({
          title: "Safety Guard Active",
          description: "Action skipped to protect sensitive files. Manual review recommended.",
          variant: "default",
          className: "bg-blue-600 text-white border-blue-700", // Styling for reassurance
        });
      } else {
        toast({
          title: "Failed to apply fix",
          description: error.message,
          variant: "destructive",
        });
      }
    } finally {
      setIsFixing(false);
    }
  };

  const showFixButton = (severity === "high" || severity === "medium");

  return (
    <Card className="border-l-2" style={{ borderLeftColor: `hsl(var(--${type === 'bug' ? 'destructive' : type === 'security' ? 'chart-3' : 'primary'}))` }} data-testid={`comment-card-${comment.id}`}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Badge className={config.color} variant="secondary">
              <Icon className="h-3 w-3 mr-1" />
              {config.label}
            </Badge>
            <Badge variant="outline" className={severityColors[severity]}>
              {severity} severity
            </Badge>
          </div>
          {comment.isPosted && (
            <Badge variant="outline" className="text-green-600 dark:text-green-400">
              Posted
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-4 text-xs text-muted-foreground font-mono">
          <span className="flex items-center gap-1">
            <FileCode className="h-3.5 w-3.5" />
            {comment.path}
          </span>
          <span className="flex items-center gap-1">
            <Hash className="h-3.5 w-3.5" />
            Line {comment.line}
          </span>
        </div>
        <p className="text-sm leading-relaxed">{safeCommentText}</p>

        {showFixButton && (
          <div className="pt-2 space-y-3">
            {/* AI Fix Explanation Section */}
            <div className="rounded-lg border border-border/70 bg-muted/30 p-3.5 space-y-2.5 text-xs">
              <div>
                <div className="flex items-center gap-1.5 font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider text-[11px] mb-1">
                  <ShieldAlert className="h-3.5 w-3.5" />
                  Why This Is A Risk
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  {type === "security"
                    ? `This pattern at line ${comment.line} in ${comment.path} presents a security vulnerability. Untrusted input or exposed credentials can lead to unauthorized access or system exploitation.`
                    : type === "bug"
                    ? `This code flaw at line ${comment.line} in ${comment.path} can cause unexpected runtime exceptions, state corruption, or silent failures in production.`
                    : `This issue at line ${comment.line} introduces technical debt and reliability risks that impact operational stability.`}
                </p>
              </div>

              <div className="pt-1 border-t border-border/40">
                <div className="flex items-center gap-1.5 font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider text-[11px] mb-1">
                  <Sparkles className="h-3.5 w-3.5" />
                  How The Fix Works
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  CodeSift AI's engine analyzes the file AST, removes the unsafe pattern, and injects validated secure constructs without altering existing business logic.
                </p>
              </div>
            </div>

            {/* Existing Apply AI Fix Button and Flow */}
            <Dialog open={isDialogOpen} onOpenChange={(open) => {
              setIsDialogOpen(open);
              if (!open) {
                // Reset/Cleanup if needed when dialog closes
                // setCreatedPrUrl(undefined);
              }
            }}>
              <DialogTrigger asChild>
                <Button
                  size="sm"
                  className="gap-2 w-full sm:w-auto shadow-sm"
                  variant="default"
                  onClick={() => {
                    setCreatedPrUrl(undefined); // Reset previous PR url
                    handleApplyFix(); // Start the background fix process
                  }}
                  disabled={isFixing && !isDialogOpen}
                  data-testid={`btn-apply-fix-${comment.id}`}
                >
                  <Wrench className="h-4 w-4" />
                  Apply AI Fix
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[800px] border-border bg-background/95 backdrop-blur-xl p-0 overflow-hidden shadow-2xl">
                <AiFixFlow
                  autoStart
                  filename={comment.path}
                  prUrl={createdPrUrl}
                  platform={platform}
                  onComplete={() => {
                    // Auto-close after animation (AiFixFlow waits 2s before calling this)
                    setIsDialogOpen(false);
                    setCreatedPrUrl(undefined);
                  }}
                  className="border-0 shadow-none bg-transparent"
                />
              </DialogContent>
            </Dialog>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
