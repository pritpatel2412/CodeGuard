import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  ExternalLink
} from "lucide-react";
import { useState, useEffect } from "react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

export default function Settings() {
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  const webhookBaseUrl = `${window.location.origin}/api/webhooks`;

  const [settings, setSettings] = useState({
    bugDetection: true,
    securityAnalysis: true,
    performanceIssues: true,
    maintainability: true,
    skipStyleIssues: true,
    postComments: true,
    highRiskAlerts: true,
    autoFixStrictMode: true,
    autoFixSafetyGuards: true,
  });

  useEffect(() => {
    fetch("/api/user")
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error("Failed to load settings");
      })
      .then((user) => {
        setSettings({
          bugDetection: user.bugDetection ?? true,
          securityAnalysis: user.securityAnalysis ?? true,
          performanceIssues: user.performanceIssues ?? true,
          maintainability: user.maintainability ?? true,
          skipStyleIssues: user.skipStyleIssues ?? true,
          postComments: user.postComments ?? true,
          highRiskAlerts: user.highRiskAlerts ?? true,
          autoFixStrictMode: user.autoFixStrictMode ?? true,
          autoFixSafetyGuards: user.autoFixSafetyGuards ?? true,
        });
      })
      .catch(() => {
        toast({
          title: "Error",
          description: "Failed to load user settings",
          variant: "destructive",
        });
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await apiRequest("PATCH", "/api/user", settings);

      // Invalidate queries to ensure fresh data elsewhere
      queryClient.invalidateQueries({ queryKey: ["user"] });

      toast({
        title: "Settings saved",
        description: "Your preferences have been updated.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save settings",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const copyUrl = async () => {
    await navigator.clipboard.writeText(webhookBaseUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-semibold">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Configure your AI PR reviewer preferences
        </p>
      </div>

      {/* Webhook Configuration */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Webhook className="h-5 w-5" />
            <CardTitle>Webhook Configuration</CardTitle>
          </div>
          <CardDescription>
            Configure webhooks to receive pull request events from GitHub or GitLab
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Webhook Base URL</Label>
            <div className="flex items-center gap-2">
              <code className="flex-1 p-3 text-sm bg-muted rounded-md font-mono">
                {webhookBaseUrl}/github/[repository-id]
              </code>
              <Button
                size="icon"
                variant="outline"
                onClick={copyUrl}
                data-testid="button-copy-webhook-base"
              >
                {copied ? (
                  <Check className="h-4 w-4 text-green-600" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Replace [repository-id] with your specific repository ID from the Repositories page.
              <br />
              For GitLab, use <code>/api/webhooks/gitlab/[repository-id]</code>
            </p>
          </div>

          <Separator />

          <div className="space-y-3">
            <h4 className="font-medium">Supported Events</h4>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline">pull_request.opened</Badge>
              <Badge variant="outline">pull_request.synchronize</Badge>
              <Badge variant="outline">pull_request.reopened</Badge>
            </div>
          </div>

          <div className="p-4 bg-muted/50 rounded-md space-y-2">
            <h4 className="font-medium text-sm">Setup Instructions</h4>
            <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
              <li>Go to your repository settings on GitHub/GitLab</li>
              <li>Navigate to Webhooks section</li>
              <li>Add a new webhook with the URL above</li>
              <li>Select "Pull request" events</li>
              <li>Set content type to "application/json"</li>
            </ol>
          </div>
        </CardContent>
      </Card>

      {/* Review Preferences */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            <CardTitle>Review Preferences</CardTitle>
          </div>
          <CardDescription>
            Customize how the AI analyzes your code
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Bug Detection</Label>
              <p className="text-xs text-muted-foreground">
                Identify logical errors and potential bugs
              </p>
            </div>
            <Switch
              checked={settings.bugDetection}
              onCheckedChange={(checked) => setSettings(s => ({ ...s, bugDetection: checked }))}
              data-testid="switch-bug-detection"
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Security Analysis</Label>
              <p className="text-xs text-muted-foreground">
                Check for security vulnerabilities
              </p>
            </div>
            <Switch
              checked={settings.securityAnalysis}
              onCheckedChange={(checked) => setSettings(s => ({ ...s, securityAnalysis: checked }))}
              data-testid="switch-security-analysis"
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Performance Issues</Label>
              <p className="text-xs text-muted-foreground">
                Detect N+1 queries, heavy loops, etc.
              </p>
            </div>
            <Switch
              checked={settings.performanceIssues}
              onCheckedChange={(checked) => setSettings(s => ({ ...s, performanceIssues: checked }))}
              data-testid="switch-performance-issues"
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Maintainability</Label>
              <p className="text-xs text-muted-foreground">
                Review code complexity and structure
              </p>
            </div>
            <Switch
              checked={settings.maintainability}
              onCheckedChange={(checked) => setSettings(s => ({ ...s, maintainability: checked }))}
              data-testid="switch-maintainability"
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Skip Style Issues</Label>
              <p className="text-xs text-muted-foreground">
                Ignore formatting and style preferences
              </p>
            </div>
            <Switch
              checked={settings.skipStyleIssues}
              onCheckedChange={(checked) => setSettings(s => ({ ...s, skipStyleIssues: checked }))}
              data-testid="switch-skip-style"
            />
          </div>
        </CardContent>
      </Card>

      {/* Auto-Fix Configuration */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-500" />
            <CardTitle>Auto-Fix Feature</CardTitle>
          </div>
          <CardDescription>
            Configure and understand the AI security fix capabilities
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Strict Security Mode</Label>
              <p className="text-xs text-muted-foreground">
                Enforces "Senior Security Engineer" persona for all fixes
              </p>
            </div>
            <Switch
              checked={settings.autoFixStrictMode}
              onCheckedChange={(checked) => setSettings(s => ({ ...s, autoFixStrictMode: checked }))}
              data-testid="switch-strict-mode"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Safety Guards</Label>
              <p className="text-xs text-muted-foreground">
                Blocks fixes on sensitive files (Auth, Payment, Config)
              </p>
            </div>
            <Switch
              checked={settings.autoFixSafetyGuards}
              onCheckedChange={(checked) => setSettings(s => ({ ...s, autoFixSafetyGuards: checked }))}
              data-testid="switch-safety-guards"
            />
          </div>

          <Separator />

          <div className="p-4 bg-muted/50 rounded-md space-y-2">
            <h4 className="font-medium text-sm">Setup Instructions</h4>
            <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
              <li>Ensure your GitHub login includes the <strong>repo</strong> scope (or GITLAB_TOKEN is set)</li>
              <li>Navigate to a Review with High or Medium severity issues</li>
              <li>Click the <strong className="text-primary">Apply AI Fix</strong> button</li>
              <li>The system will create a new branch and PR safely</li>
              <li>Files like <code>.env</code> or <code>auth.ts</code> are protected and cannot be auto-fixed</li>
            </ol>
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            <CardTitle>Notifications</CardTitle>
          </div>
          <CardDescription>
            Control how you receive review updates
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Post Comments to PR</Label>
              <p className="text-xs text-muted-foreground">
                Automatically post review comments on GitHub/GitLab
              </p>
            </div>
            <Switch
              checked={settings.postComments}
              onCheckedChange={(checked) => setSettings(s => ({ ...s, postComments: checked }))}
              data-testid="switch-post-comments"
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>High Risk Alerts</Label>
              <p className="text-xs text-muted-foreground">
                Highlight PRs with critical issues
              </p>
            </div>
            <Switch
              checked={settings.highRiskAlerts}
              onCheckedChange={(checked) => setSettings(s => ({ ...s, highRiskAlerts: checked }))}
              data-testid="switch-high-risk-alerts"
            />
          </div>
        </CardContent>
      </Card>

      {/* API Keys */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            <CardTitle>API Configuration</CardTitle>
          </div>
          <CardDescription>
            Manage API keys and integrations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>OpenAI API Key</Label>
            <div className="flex items-center gap-2">
              <Input
                type="password"
                value="sk-••••••••••••••••••••••••"
                disabled
                className="font-mono"
              />
              <Badge variant="outline" className="text-green-600 dark:text-green-400">
                Configured
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              API key is configured via environment variables
            </p>
          </div>

          <Separator />

          <div className="space-y-2">
            <Label>VCS Integration</Label>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-green-600 dark:text-green-400">
                Connected
              </Badge>

            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button
          data-testid="button-save-settings"
          onClick={handleSave}
          disabled={loading || saving}
        >
          {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save Changes
        </Button>
      </div>
    </div>
  );
}
