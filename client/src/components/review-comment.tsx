import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Bug, 
  Shield, 
  Zap, 
  BookOpen, 
  Wrench,
  FileCode,
  Hash
} from "lucide-react";
import type { ReviewComment as ReviewCommentType } from "@shared/schema";

interface ReviewCommentProps {
  comment: ReviewCommentType;
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

export function ReviewCommentCard({ comment }: ReviewCommentProps) {
  const type = comment.type as keyof typeof typeConfig;
  const config = typeConfig[type] || typeConfig.bug;
  const Icon = config.icon;
  const severity = comment.severity as "low" | "medium" | "high";

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
        <p className="text-sm leading-relaxed">{comment.comment}</p>
      </CardContent>
    </Card>
  );
}
