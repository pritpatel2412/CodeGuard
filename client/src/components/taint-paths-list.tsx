import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ShieldAlert, ArrowRight, CheckCircle, FileCode, ChevronDown, ChevronUp, AlertTriangle } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { useState } from "react";

// Matches the actual DB columns from taintPaths table
interface TaintPath {
  id: string;
  reviewId: string;
  vulnerabilityType: string;
  severity: string;
  title: string;
  sourceFile: string;
  sourceFunction: string;
  sourceLine: number;
  sourceExpression: string;
  sinkFile: string;
  sinkFunction: string;
  sinkLine: number;
  sinkExpression: string;
  propagationChain: Array<{ nodeId: string; line: number; expression: string }>;
  sanitizerBypassed: boolean;
  aiExplanation?: string | null;
  aiFixSuggestion?: string | null;
  createdAt: string;
}

const SEVERITY_CONFIG: Record<string, { badge: string; border: string; bg: string; text: string }> = {
  CRITICAL: {
    badge: "bg-red-600 text-white",
    border: "border-red-300 dark:border-red-800",
    bg: "bg-red-50 dark:bg-red-900/20",
    text: "text-red-700 dark:text-red-400",
  },
  HIGH: {
    badge: "bg-orange-500 text-white",
    border: "border-orange-300 dark:border-orange-800",
    bg: "bg-orange-50 dark:bg-orange-900/20",
    text: "text-orange-700 dark:text-orange-400",
  },
  MEDIUM: {
    badge: "bg-yellow-500 text-white",
    border: "border-yellow-300 dark:border-yellow-800",
    bg: "bg-yellow-50 dark:bg-yellow-900/20",
    text: "text-yellow-700 dark:text-yellow-400",
  },
  LOW: {
    badge: "bg-blue-500 text-white",
    border: "border-blue-300 dark:border-blue-800",
    bg: "bg-blue-50 dark:bg-blue-900/20",
    text: "text-blue-700 dark:text-blue-400",
  },
};

function PathCard({ path }: { path: TaintPath }) {
  const [expanded, setExpanded] = useState(false);
  const sev = path.severity?.toUpperCase() ?? "LOW";
  const cfg = SEVERITY_CONFIG[sev] ?? SEVERITY_CONFIG.LOW;

  const sourceLabel = path.sourceFile?.split("/").pop() ?? path.sourceFile;
  const sinkLabel = path.sinkFile?.split("/").pop() ?? path.sinkFile;

  return (
    <Card className={`overflow-hidden ${cfg.border}`}>
      {/* Header */}
      <div className={`${cfg.bg} px-6 py-3 border-b ${cfg.border} flex justify-between items-center`}>
        <div className={`flex items-center gap-2 ${cfg.text} font-semibold text-sm`}>
          <ShieldAlert className="h-4 w-4" />
          {path.title ?? "Tainted Data Flow Detected"}
        </div>
        <Badge className={`text-xs ${cfg.badge}`}>{sev} Risk</Badge>
      </div>

      <CardContent className="p-6 space-y-5">
        {/* Source → Sink flow */}
        <div className="flex flex-col md:flex-row items-stretch gap-3">
          {/* Source */}
          <div className="flex-1 rounded-lg border bg-muted/40 p-4 space-y-2">
            <Badge variant="outline" className="text-xs bg-yellow-100 dark:bg-yellow-900/30 border-yellow-300 dark:border-yellow-700">
              Source
            </Badge>
            <div className="font-mono text-xs bg-background px-2 py-1 rounded border break-all">
              {path.sourceExpression}
            </div>
            <div className="flex items-center gap-1 text-muted-foreground text-xs">
              <FileCode className="h-3 w-3 flex-shrink-0" />
              <span className="truncate">{sourceLabel}:{path.sourceLine}</span>
              {path.sourceFunction && (
                <span className="ml-1 opacity-60">in {path.sourceFunction}()</span>
              )}
            </div>
          </div>

          {/* Arrow */}
          <div className="flex items-center justify-center px-2">
            <ArrowRight className="h-5 w-5 text-muted-foreground hidden md:block" />
            <ArrowRight className="h-5 w-5 text-muted-foreground rotate-90 md:hidden" />
          </div>

          {/* Sink */}
          <div className="flex-1 rounded-lg border bg-muted/40 p-4 space-y-2">
            <Badge variant="outline" className="text-xs bg-red-100 dark:bg-red-900/30 border-red-300 dark:border-red-700">
              Sink
            </Badge>
            <div className="font-mono text-xs bg-background px-2 py-1 rounded border break-all">
              {path.sinkExpression}
            </div>
            <div className="flex items-center gap-1 text-muted-foreground text-xs">
              <FileCode className="h-3 w-3 flex-shrink-0" />
              <span className="truncate">{sinkLabel}:{path.sinkLine}</span>
              {path.sinkFunction && (
                <span className="ml-1 opacity-60">in {path.sinkFunction}()</span>
              )}
            </div>
          </div>
        </div>

        {/* Propagation chain */}
        {path.propagationChain?.length > 0 && (
          <div>
            <button
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => setExpanded(!expanded)}
            >
              {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
              {path.propagationChain.length}-hop propagation chain
            </button>
            {expanded && (
              <ol className="mt-2 space-y-1 pl-4 border-l-2 border-muted text-xs text-muted-foreground">
                {path.propagationChain.map((step, i) => (
                  <li key={i} className="relative pl-2">
                    <span className="font-mono">{step.expression}</span>
                    <span className="opacity-50 ml-1">line {step.line}</span>
                  </li>
                ))}
              </ol>
            )}
          </div>
        )}

        {/* Sanitizer bypass warning */}
        {path.sanitizerBypassed && (
          <div className="flex items-center gap-2 text-xs text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded px-3 py-2">
            <AlertTriangle className="h-3.5 w-3.5 flex-shrink-0" />
            A sanitizer was detected but appears bypassable in this flow.
          </div>
        )}

        {/* AI Analysis */}
        {path.aiExplanation && (
          <div className="space-y-3">
            <div>
              <h4 className="text-sm font-semibold mb-2">AI Analysis</h4>
              <div className="text-sm text-muted-foreground prose dark:prose-invert prose-sm max-w-none">
                <ReactMarkdown>{path.aiExplanation}</ReactMarkdown>
              </div>
            </div>
            {path.aiFixSuggestion && (
              <div>
                <h4 className="text-sm font-semibold mb-2">Recommended Fix</h4>
                <div className="text-sm text-muted-foreground prose dark:prose-invert prose-sm max-w-none">
                  <ReactMarkdown>{path.aiFixSuggestion}</ReactMarkdown>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function TaintPathsList({ reviewId }: { reviewId: string }) {
  const { data: paths, isLoading, error } = useQuery<TaintPath[]>({
    queryKey: [`/api/taint/${reviewId}/paths`],
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-sm text-destructive">
          Failed to load taint paths. Please refresh.
        </CardContent>
      </Card>
    );
  }

  if (!paths || paths.length === 0) {
    return (
      <Card>
        <CardContent className="py-10 text-center">
          <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Vulnerability Paths Found</h3>
          <p className="text-muted-foreground text-sm">
            The cross-file semantic engine didn't detect any tainted data flowing to dangerous sinks in this PR.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-5">
      <p className="text-sm text-muted-foreground">
        Detected <span className="font-semibold text-foreground">{paths.length}</span> cross-file vulnerability path{paths.length !== 1 ? "s" : ""} in this PR.
      </p>
      {paths.map((path) => (
        <PathCard key={path.id} path={path} />
      ))}
    </div>
  );
}
