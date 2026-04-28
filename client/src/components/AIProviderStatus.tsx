import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Activity, 
  Zap, 
  AlertTriangle, 
  CheckCircle2, 
  Timer, 
  RefreshCw,
  Cpu
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ProviderStats {
  configured: boolean;
  reachable: boolean;
  latencyMs: number;
  calls: number;
  successes: number;
  failures: number;
  successRate: number;
  model: string;
}

interface AIStatus {
  nim: ProviderStats;
  openai: {
    configured: boolean;
    model: string;
    calls: number;
    successes: number;
    failures: number;
  };
  activeProvider: "nim" | "openai" | "none";
  lastFailureReason: string | null;
  forceFallback: boolean;
}

export default function AIProviderStatus() {
  const [status, setStatus] = useState<AIStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [testing, setTesting] = useState(false);
  const { toast } = useToast();

  const fetchStatus = async () => {
    try {
      const res = await fetch("/api/ai/status");
      if (res.ok) {
        const data = await res.json();
        setStatus(data);
      }
    } catch (err) {
      console.error("Failed to fetch AI status", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 30000); // Update every 30s
    return () => clearInterval(interval);
  }, []);

  const runTest = async () => {
    setTesting(true);
    try {
      const res = await fetch("/api/ai/test", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        toast({
          title: "AI Test Successful",
          description: `Provider: ${data.provider} (${data.model})`,
        });
        fetchStatus();
      } else {
        toast({
          title: "AI Test Failed",
          description: data.error,
          variant: "destructive",
        });
      }
    } catch (err) {
      toast({
        title: "Connection Error",
        description: "Could not reach the test endpoint.",
        variant: "destructive",
      });
    } finally {
      setTesting(false);
    }
  };

  if (loading) return (
    <Card className="border-border/40 bg-card/50 backdrop-blur-sm">
      <CardContent className="p-6 flex items-center justify-center h-48">
        <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" />
      </CardContent>
    </Card>
  );

  if (!status) return null;

  return (
    <Card className="border-border/40 bg-card/50 backdrop-blur-sm overflow-hidden group">
      <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Activity className="w-4 h-4 text-primary" />
          AI Provider Health
        </CardTitle>
        <div className="flex items-center gap-2">
          {status.forceFallback ? (
            <Badge variant="outline" className="bg-orange-500/10 text-orange-500 border-orange-500/20">
              Fallback Forced
            </Badge>
          ) : (
            <Badge 
              variant="outline" 
              className={status.activeProvider === 'nim' 
                ? "bg-green-500/10 text-green-500 border-green-500/20" 
                : "bg-blue-500/10 text-blue-500 border-blue-500/20"}
            >
              {status.activeProvider === 'nim' ? 'NVIDIA NIM Active' : status.activeProvider === 'openai' ? 'OpenAI Fallback' : 'Idle'}
            </Badge>
          )}
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-7 w-7 rounded-full hover:bg-primary/10" 
            onClick={fetchStatus}
            disabled={loading}
          >
            <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-2">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* NVIDIA NIM Panel */}
          <div className={`p-3 rounded-lg border transition-colors ${status.nim.reachable ? 'bg-green-500/5 border-green-500/10' : 'bg-red-500/5 border-red-500/10'}`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                <Cpu className="w-3 h-3" /> NVIDIA NIM
              </span>
              {status.nim.reachable ? (
                <span className="flex items-center gap-1 text-[10px] text-green-500 font-medium">
                  <CheckCircle2 className="w-3 h-3" /> ONLINE
                </span>
              ) : (
                <span className="flex items-center gap-1 text-[10px] text-red-500 font-medium">
                  <AlertTriangle className="w-3 h-3" /> OFFLINE
                </span>
              )}
            </div>
            
            <div className="space-y-1.5">
              <div className="flex justify-between items-end">
                <span className="text-xs text-muted-foreground">Latency</span>
                <span className="text-sm font-mono flex items-center gap-1">
                  <Timer className="w-3 h-3 opacity-50" />
                  {status.nim.latencyMs}ms
                </span>
              </div>
              <div className="flex justify-between items-end">
                <span className="text-xs text-muted-foreground">Success Rate</span>
                <span className="text-sm font-mono">{status.nim.successRate}%</span>
              </div>
              <div className="text-[10px] text-muted-foreground mt-2 truncate opacity-70">
                Model: {status.nim.model}
              </div>
            </div>
          </div>

          {/* OpenAI Panel */}
          <div className="p-3 rounded-lg border bg-blue-500/5 border-blue-500/10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                <Zap className="w-3 h-3" /> OpenAI
              </span>
              <span className="flex items-center gap-1 text-[10px] text-blue-500 font-medium">
                STANDBY
              </span>
            </div>
            
            <div className="space-y-1.5">
              <div className="flex justify-between items-end">
                <span className="text-xs text-muted-foreground">Total Calls</span>
                <span className="text-sm font-mono">{status.openai.calls}</span>
              </div>
              <div className="flex justify-between items-end">
                <span className="text-xs text-muted-foreground">Successes</span>
                <span className="text-sm font-mono text-green-500">{status.openai.successes}</span>
              </div>
              <div className="text-[10px] text-muted-foreground mt-2 truncate opacity-70">
                Model: {status.openai.model}
              </div>
            </div>
          </div>
        </div>

        {status.lastFailureReason && (
          <div className="mt-3 p-2 bg-red-500/10 rounded border border-red-500/20 text-[10px] text-red-400 flex items-start gap-2 animate-in fade-in slide-in-from-top-1">
            <AlertTriangle className="w-3 h-3 shrink-0 mt-0.5" />
            <span className="line-clamp-2">Last Error: {status.lastFailureReason}</span>
          </div>
        )}

        <Button 
          variant="outline" 
          size="sm" 
          className="w-full mt-4 h-8 text-xs gap-2 border-primary/20 hover:bg-primary/10 hover:text-primary transition-all active:scale-[0.98]"
          onClick={runTest}
          disabled={testing}
        >
          {testing ? (
            <RefreshCw className="w-3 h-3 animate-spin" />
          ) : (
            <Zap className="w-3 h-3" />
          )}
          Run Provider Test
        </Button>
      </CardContent>
    </Card>
  );
}
