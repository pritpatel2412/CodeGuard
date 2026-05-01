import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  PlusCircle, 
  Webhook, 
  Search, 
  Zap, 
  ArrowRight, 
  CheckCircle2, 
  ShieldCheck, 
  Code2,
  Settings,
  Github
} from "lucide-react";
import { Separator } from "@/components/ui/separator";

const STEPS = [
  {
    title: "1. Add Your Repository",
    description: "Connect your GitHub or GitLab account and import the projects you want CodeGuard to monitor.",
    icon: PlusCircle,
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
    details: [
      "Navigate to the 'Repositories' page",
      "Click on 'Add Repository' button",
      "Authorize CodeGuard access if prompted",
      "Select repositories from your list"
    ]
  },
  {
    title: "2. Configure Webhooks",
    description: "Set up the communication bridge between your Git provider and CodeGuard.",
    icon: Webhook,
    color: "text-violet-500",
    bgColor: "bg-violet-500/10",
    details: [
      "Find your unique Webhook URL and Secret on the Repository card",
      "Go to GitHub/GitLab Repository Settings > Webhooks",
      "Paste the Payload URL and Secret into the respective fields",
      "Set Content type to application/json",
      "Select 'Pull requests' as the trigger event"
    ]
  },
  {
    title: "3. Define Security Policies",
    description: "Customize what CodeGuard looks for by adding a configuration file to your repo.",
    icon: ShieldCheck,
    color: "text-green-500",
    bgColor: "bg-green-500/10",
    details: [
      "Create a .codeguard.yml in your root directory",
      "Define custom lint rules and security thresholds",
      "Set up 'Policy-as-Prompt' for natural language rules",
      "Specify paths to ignore or prioritize"
    ]
  },
  {
    title: "4. Review AI Analysis",
    description: "Get real-time feedback on every Pull Request with deep semantic analysis.",
    icon: Search,
    color: "text-amber-500",
    bgColor: "bg-amber-500/10",
    details: [
      "View automated comments directly on your PR",
      "Explore Taint Graphs to see data flow vulnerabilities",
      "Check against your team's custom security policies",
      "Understand the risk score of every code change"
    ]
  },
  {
    title: "5. One-Click Remediation",
    description: "Fix vulnerabilities instantly with AI-powered code suggestions.",
    icon: Zap,
    color: "text-red-500",
    bgColor: "bg-red-500/10",
    details: [
      "Click 'Apply AI Fix' on any detected issue",
      "Review the proposed code change in the sidebar",
      "Automatically create a fix-branch and commit",
      "Merge with confidence knowing the fix is verified"
    ]
  }
];

export default function HowToUsePage() {
  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto pb-12">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">Quick Start Guide</h1>
        <p className="text-sm text-muted-foreground max-w-3xl">
          Follow these steps to set up automated security reviews and AI-powered remediation for your development workflow.
        </p>
      </div>

      <div className="grid gap-6">
        {STEPS.map((step, idx) => (
          <Card key={idx} className="relative overflow-hidden group hover:border-primary/50 transition-colors border-border/50 bg-card/40 backdrop-blur-md shadow-sm">
            <div className={`absolute top-0 left-0 w-1.5 h-full z-10 ${step.color.replace('text-', 'bg-')} shadow-[2px_0_10px_rgba(0,0,0,0.1)]`} />
            <CardHeader className="flex flex-row items-start gap-4 pt-6">
              <div className={`p-2 rounded-lg ${step.bgColor} ${step.color} shrink-0`}>
                <step.icon className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <CardTitle className="text-lg font-medium">{step.title}</CardTitle>
                <CardDescription className="text-sm text-muted-foreground leading-relaxed">
                  {step.description}
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <div className="ml-0 sm:ml-12 grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
                {step.details.map((detail, dIdx) => (
                  <div key={dIdx} className="flex items-start gap-2 text-[13px] text-muted-foreground bg-muted/30 p-2.5 rounded-lg border border-border/40 h-full">
                    <CheckCircle2 className={`h-3.5 w-3.5 mt-0.5 shrink-0 ${step.color}`} />
                    <span className="leading-tight">{detail}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Separator className="my-6 opacity-50" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-gradient-to-br from-primary/10 to-transparent border-primary/20 shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2 text-primary font-medium">
              <Github className="h-4 w-4" />
              <CardTitle className="text-base">GitHub Integration</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-4">
            <p className="leading-relaxed">
              CodeGuard integrates deeply with GitHub Actions and PR reviews. We recommend installing the CodeGuard App for the best experience.
            </p>
            <div className="p-4 bg-muted/50 rounded-lg border border-border/50 font-mono text-[11px] overflow-x-auto text-muted-foreground/90">
              # Example .codeguard.yml<br/>
              version: 1<br/>
              policies:<br/>
              &nbsp;&nbsp;- "no hardcoded secrets"<br/>
              &nbsp;&nbsp;- "sql injection prevention"<br/>
              &nbsp;&nbsp;- "all inputs must be sanitized"
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500/10 to-transparent border-blue-500/20 shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2 text-blue-500 font-medium">
              <Settings className="h-4 w-4" />
              <CardTitle className="text-base">Support & Help</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-4">
            <p className="leading-relaxed">
              Our support team is available 24/7 to help you with your setup or custom policy requirements.
            </p>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20 text-[11px] h-5 px-1.5 font-medium">Docs</Badge>
                <span className="text-[12px]">Comprehensive guides for all features.</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-purple-500/10 text-purple-500 border-purple-500/20 text-[11px] h-5 px-1.5 font-medium">Slack</Badge>
                <span className="text-[12px]">Join 5,000+ developers sharing best practices.</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
