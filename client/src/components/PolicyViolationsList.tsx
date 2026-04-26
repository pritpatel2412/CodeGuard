import { useState } from "react";
import { AlertTriangle, ChevronDown, ChevronUp, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export interface PolicyViolationRecord {
  id: number;
  ruleId: string;
  ruleName: string;
  severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | string;
  filePath: string;
  lineNumber: number | null;
  violatingCode: string | null;
  explanation: string | null;
  suggestedFix: string | null;
}

const severityClass: Record<string, string> = {
  CRITICAL: "bg-red-600 text-white",
  HIGH: "bg-orange-600 text-white",
  MEDIUM: "bg-amber-600 text-white",
  LOW: "bg-green-600 text-white",
};

export function PolicyViolationsList({ violations }: { violations: PolicyViolationRecord[] }) {
  const [expanded, setExpanded] = useState<number | null>(null);

  if (violations.length === 0) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-sm text-muted-foreground">
          <div className="flex items-center justify-center gap-2">
            <ShieldCheck className="h-4 w-4 text-green-500" />
            All company policy rules passed.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground">
        {violations.length} violation{violations.length !== 1 ? "s" : ""} found against your `.codeguard.yml` policy.
      </p>
      {violations.map((violation) => {
        const open = expanded === violation.id;
        return (
          <Card key={violation.id}>
            <CardHeader
              className="py-3 cursor-pointer"
              onClick={() => setExpanded(open ? null : violation.id)}
            >
              <div className="flex items-center gap-2">
                <Badge className={severityClass[violation.severity] ?? severityClass.LOW}>
                  {violation.severity}
                </Badge>
                <Badge variant="outline" className="font-mono">{violation.ruleId}</Badge>
                <span className="text-sm font-medium flex-1">{violation.ruleName}</span>
                {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </div>
            </CardHeader>

            {open && (
              <CardContent className="space-y-3 pt-0">
                <p className="text-xs text-muted-foreground">
                  <span className="font-mono text-foreground">{violation.filePath}</span>
                  {violation.lineNumber ? ` - Line ${violation.lineNumber}` : ""}
                </p>

                {violation.violatingCode && (
                  <pre className="rounded-md bg-muted p-3 text-xs overflow-auto whitespace-pre-wrap border border-border text-red-400">
                    {violation.violatingCode}
                  </pre>
                )}

                {violation.explanation && (
                  <div className="text-sm leading-relaxed">
                    <div className="font-medium mb-1 inline-flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-amber-500" />
                      Policy Violation
                    </div>
                    <p className="text-muted-foreground">{violation.explanation}</p>
                  </div>
                )}

                {violation.suggestedFix && (
                  <div>
                    <p className="text-sm font-medium mb-1">Compliant Implementation</p>
                    <pre className="rounded-md bg-muted p-3 text-xs overflow-auto whitespace-pre-wrap border border-border text-green-400">
                      {violation.suggestedFix}
                    </pre>
                  </div>
                )}
              </CardContent>
            )}
          </Card>
        );
      })}
    </div>
  );
}
