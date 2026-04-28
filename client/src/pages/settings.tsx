import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Webhook,
  Key,
  Bell,
  Shield,
  Copy,
  Check,
  Loader2,
  RotateCcw,
  Save,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import AIProviderStatus from "@/components/AIProviderStatus";

type UserSettings = {
  bugDetection: boolean;
  securityAnalysis: boolean;
  performanceIssues: boolean;
  maintainability: boolean;
  skipStyleIssues: boolean;
  postComments: boolean;
  highRiskAlerts: boolean;
  autoFixStrictMode: boolean;
  autoFixSafetyGuards: boolean;
};

const DEFAULT_SETTINGS: UserSettings = {
  bugDetection: true,
  securityAnalysis: true,
  performanceIssues: true,
  maintainability: true,
  skipStyleIssues: true,
  postComments: true,
  highRiskAlerts: true,
  autoFixStrictMode: true,
  autoFixSafetyGuards: true,
};

function normalizeSettings(user: Partial<UserSettings> | null | undefined): UserSettings {
  return {
    bugDetection: user?.bugDetection ?? true,
    securityAnalysis: user?.securityAnalysis ?? true,
    performanceIssues: user?.performanceIssues ?? true,
    maintainability: user?.maintainability ?? true,
    skipStyleIssues: user?.skipStyleIssues ?? true,
    postComments: user?.postComments ?? true,
    highRiskAlerts: user?.highRiskAlerts ?? true,
    autoFixStrictMode: user?.autoFixStrictMode ?? true,
    autoFixSafetyGuards: user?.autoFixSafetyGuards ?? true,
  };
}

export default function Settings() {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const [draft, setDraft] = useState<UserSettings | null>(null);

  const webhookBaseUrl = `${window.location.origin}/api/webhooks`;

  const { data: user, isLoading } = useQuery<Partial<UserSettings>>({
    queryKey: ["/api/user"],
  });

  const initialSettings = useMemo(() => normalizeSettings(user), [user]);
  const activeSettings = draft ?? initialSettings;
  const isDirty = JSON.stringify(activeSettings) !== JSON.stringify(initialSettings);

  const saveMutation = useMutation({
    mutationFn: async (payload: UserSettings) => {
      await apiRequest("PATCH", "/api/user", payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      setDraft(null);
      toast({
        title: "Settings saved",
        description: "Your preferences have been updated successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to save settings",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const update = <K extends keyof UserSettings>(key: K, value: UserSettings[K]) => {
    const base = draft ?? initialSettings;
    setDraft({ ...base, [key]: value });
  };

  const handleSave = () => {
    saveMutation.mutate(activeSettings);
  };

  const handleReset = () => {
    setDraft(initialSettings);
  };

  const copyUrl = async () => {
    await navigator.clipboard.writeText(`${webhookBaseUrl}/github/[repository-id]`);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Settings</h1>
          <p className="text-sm text-muted-foreground">
            Configure review behavior, auto-fix safety controls, and webhook setup.
          </p>
        </div>
        <Badge variant={isDirty ? "default" : "secondary"}>{isDirty ? "Unsaved changes" : "Saved"}</Badge>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Webhook className="h-5 w-5" />
            <CardTitle>Webhook Configuration</CardTitle>
          </div>
          <CardDescription>
            Use per-repository webhook URLs from the Repositories page. Signature verification is enforced.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <code className="flex-1 p-3 text-sm bg-muted rounded-md font-mono">
              {webhookBaseUrl}/github/[repository-id]
            </code>
            <Button size="icon" variant="outline" onClick={copyUrl} data-testid="button-copy-webhook-base">
              {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            GitHub currently supported in production webhook flow. Configure repository-specific webhook secret in the
            provider and keep it private.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            <CardTitle>Review Preferences</CardTitle>
          </div>
          <CardDescription>Choose what CodeGuard should prioritize during analysis.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {[
            ["Bug Detection", "Identify logical errors and implementation bugs.", "bugDetection"],
            ["Security Analysis", "Check for OWASP-style and custom policy risks.", "securityAnalysis"],
            ["Performance Issues", "Detect inefficient patterns and expensive paths.", "performanceIssues"],
            ["Maintainability", "Flag readability and long-term maintenance risks.", "maintainability"],
            ["Skip Style Issues", "Ignore pure formatting/style-only feedback.", "skipStyleIssues"],
          ].map(([title, desc, key], index) => (
            <div key={key as string}>
              {index > 0 && <Separator className="mb-5" />}
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-medium">{title}</p>
                  <p className="text-xs text-muted-foreground">{desc}</p>
                </div>
                <Switch
                  checked={activeSettings[key as keyof UserSettings] as boolean}
                  onCheckedChange={(checked) => update(key as keyof UserSettings, checked)}
                  data-testid={`switch-${key}`}
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-500" />
            <CardTitle>Auto-Fix Safety</CardTitle>
          </div>
          <CardDescription>
            Controls for automated remediation pull/merge request generation.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="font-medium">Strict Security Mode</p>
              <p className="text-xs text-muted-foreground">Apply stricter remediation strategy for risky findings.</p>
            </div>
            <Switch
              checked={activeSettings.autoFixStrictMode}
              onCheckedChange={(checked) => update("autoFixStrictMode", checked)}
              data-testid="switch-auto-fix-strict"
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="font-medium">Safety Guards</p>
              <p className="text-xs text-muted-foreground">Block sensitive file families from automatic edits.</p>
            </div>
            <Switch
              checked={activeSettings.autoFixSafetyGuards}
              onCheckedChange={(checked) => update("autoFixSafetyGuards", checked)}
              data-testid="switch-auto-fix-safety"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            <CardTitle>Notifications</CardTitle>
          </div>
          <CardDescription>Control repository feedback and alert behavior.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="font-medium">Post Comments to PR/MR</p>
              <p className="text-xs text-muted-foreground">Publish review comments to source control automatically.</p>
            </div>
            <Switch
              checked={activeSettings.postComments}
              onCheckedChange={(checked) => update("postComments", checked)}
              data-testid="switch-post-comments"
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="font-medium">High Risk Alerts</p>
              <p className="text-xs text-muted-foreground">Emphasize high-risk pull/merge requests in UI and workflows.</p>
            </div>
            <Switch
              checked={activeSettings.highRiskAlerts}
              onCheckedChange={(checked) => update("highRiskAlerts", checked)}
              data-testid="switch-high-risk-alerts"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            <CardTitle>Integration Status</CardTitle>
          </div>
          <CardDescription>Credentials are configured via secure server environment variables.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-green-600 dark:text-green-400">Server-managed</Badge>
            <span className="text-sm text-muted-foreground">OpenAI key and VCS credentials are not exposed in browser settings.</span>
          </div>
        </CardContent>
      </Card>

      <AIProviderStatus />
      
      <div className="flex items-center justify-end gap-2">
        <Button variant="outline" onClick={handleReset} disabled={isLoading || saveMutation.isPending || !isDirty}>
          <RotateCcw className="h-4 w-4 mr-2" />
          Reset
        </Button>
        <Button
          data-testid="button-save-settings"
          onClick={handleSave}
          disabled={isLoading || saveMutation.isPending || !isDirty}
        >
          {saveMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
          Save Changes
        </Button>
      </div>
    </div>
  );
}
