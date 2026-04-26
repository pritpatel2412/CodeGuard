import { useMutation } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface PolicyRecord {
  repositoryId: string;
  policyName: string;
  policyVersion: string;
  complianceFrameworks: string[] | null;
  rules: Array<{ id: string; name: string; severity: string; description: string }> | null;
  isActive: boolean;
  lastSyncedAt: string | null;
}

const complianceColors: Record<string, string> = {
  SOC2: "bg-blue-600 text-white",
  HIPAA: "bg-violet-600 text-white",
  "OWASP-ASVS": "bg-red-600 text-white",
  PCI_DSS: "bg-orange-600 text-white",
  GDPR: "bg-emerald-600 text-white",
};

export function PolicyViewer({
  policy,
  repositoryId,
}: {
  policy: PolicyRecord;
  repositoryId: string;
}) {
  const toggleMutation = useMutation({
    mutationFn: async (isActive: boolean) => {
      return apiRequest("PUT", `/api/policy/${repositoryId}/toggle`, { isActive });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/policy", repositoryId] });
    },
  });

  const rules = policy.rules ?? [];
  const frameworks = policy.complianceFrameworks ?? [];

  return (
    <Card className="mt-3">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="text-base">{policy.policyName}</CardTitle>
            <p className="text-xs text-muted-foreground mt-1">
              Last synced from `.codeguard.yml`:{" "}
              {policy.lastSyncedAt ? new Date(policy.lastSyncedAt).toLocaleString() : "Unknown"}
            </p>
          </div>
          <Button
            variant={policy.isActive ? "default" : "secondary"}
            size="sm"
            onClick={() => toggleMutation.mutate(!policy.isActive)}
            disabled={toggleMutation.isPending}
          >
            {policy.isActive ? "Enabled" : "Disabled"}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {frameworks.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {frameworks.map((framework) => (
              <Badge
                key={framework}
                className={complianceColors[framework] ?? "bg-muted text-foreground"}
              >
                {framework}
              </Badge>
            ))}
          </div>
        )}

        {rules.length === 0 ? (
          <p className="text-sm text-muted-foreground">No custom policy rules defined.</p>
        ) : (
          <div className="space-y-2">
            {rules.map((rule) => (
              <div key={rule.id} className="rounded-md border border-border p-3 bg-muted/40">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-mono text-xs text-muted-foreground">{rule.id}</p>
                  <Badge variant="outline">{rule.severity}</Badge>
                </div>
                <p className="text-sm font-medium mt-1">{rule.name}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {rule.description.length > 180
                    ? `${rule.description.slice(0, 180)}...`
                    : rule.description}
                </p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
