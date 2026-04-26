import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { 
  FolderGit2, 
  ExternalLink,
  Trash2,
  Copy,
  Check
} from "lucide-react";
import { SiGithub, SiGitlab } from "react-icons/si";
import { formatDistanceToNow } from "date-fns";
import { useState } from "react";
import type { Repository } from "@shared/schema";

interface RepositoryCardProps {
  repository: Repository;
  webhookUrl: string;
  onToggleActive?: (id: string, active: boolean) => void;
  onDelete?: (id: string) => void;
}

export function RepositoryCard({ 
  repository, 
  webhookUrl,
  onToggleActive,
  onDelete 
}: RepositoryCardProps) {
  const [copied, setCopied] = useState(false);
  const [copiedSecret, setCopiedSecret] = useState(false);
  const [secretRevealed, setSecretRevealed] = useState(false);

  const copyWebhookUrl = async () => {
    await navigator.clipboard.writeText(webhookUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const copyWebhookSecret = async () => {
    if (repository.webhookSecret && secretRevealed) {
      await navigator.clipboard.writeText(repository.webhookSecret);
      setCopiedSecret(true);
      setTimeout(() => setCopiedSecret(false), 2000);
    }
  };

  const PlatformIcon = repository.platform === "gitlab" ? SiGitlab : SiGithub;

  return (
    <Card data-testid={`repo-card-${repository.id}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-muted">
              <PlatformIcon className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-medium">{repository.name}</h3>
                <Badge variant={repository.isActive ? "default" : "secondary"}>
                  {repository.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                {repository.fullName}
              </p>
            </div>
          </div>
          <Switch
            checked={repository.isActive}
            onCheckedChange={(checked) => onToggleActive?.(repository.id, checked)}
            data-testid={`switch-repo-active-${repository.id}`}
          />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">
              Webhook URL
            </label>
            <div className="flex items-center gap-2">
              <code className="flex-1 p-2 text-xs bg-muted rounded-md font-mono truncate">
                {webhookUrl}
              </code>
              <Button
                size="icon"
                variant="outline"
                onClick={copyWebhookUrl}
                data-testid={`button-copy-webhook-${repository.id}`}
              >
                {copied ? (
                  <Check className="h-4 w-4 text-green-600" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
          {repository.webhookSecret && (
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">
                Webhook Secret
                <span className="ml-1 text-xs text-muted-foreground">
                  (Configure this in GitHub webhook settings)
                </span>
              </label>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <code className="flex-1 p-2 text-xs bg-muted rounded-md font-mono truncate">
                  {secretRevealed ? repository.webhookSecret : "••••••••••••••••"}
                </code>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    onClick={() => setSecretRevealed((v) => !v)}
                    data-testid={`button-toggle-secret-${repository.id}`}
                  >
                    {secretRevealed ? "Hide" : "Reveal"}
                  </Button>
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={copyWebhookSecret}
                    disabled={!secretRevealed}
                    title={secretRevealed ? "Copy secret" : "Reveal secret to copy"}
                    data-testid={`button-copy-secret-${repository.id}`}
                  >
                    {copiedSecret ? (
                      <Check className="h-4 w-4 text-green-600" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="flex items-center justify-between pt-2 border-t">
          <span className="text-xs text-muted-foreground">
            Added {formatDistanceToNow(new Date(repository.createdAt), { addSuffix: true })}
          </span>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild>
              <a 
                href={`https://${repository.platform}.com/${repository.fullName}`}
                target="_blank"
                rel="noopener noreferrer"
                data-testid={`link-repo-external-${repository.id}`}
              >
                <ExternalLink className="h-3.5 w-3.5 mr-1" />
                View
              </a>
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              className="text-destructive"
              onClick={() => onDelete?.(repository.id)}
              data-testid={`button-delete-repo-${repository.id}`}
            >
              <Trash2 className="h-3.5 w-3.5 mr-1" />
              Remove
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
