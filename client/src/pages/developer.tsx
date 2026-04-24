import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Github, Instagram, Linkedin, Mail, Globe, Code2, Heart } from "lucide-react";
import PixelCard from "@/components/ui/pixel-card";
import { PremiumAvatar } from "@/components/ui/premium-avatar";

export default function Developer() {
    return (
        <div className="p-6 space-y-8 max-w-4xl mx-auto">
            <div>
                <h1 className="text-2xl font-semibold">About the Developer</h1>
                <p className="text-sm text-muted-foreground">
                    Meet the creator behind CodeGuard
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Profile Card with Pixel Animation */}
                <PixelCard 
                    variant="midnight" 
                    className="md:col-span-1 rounded-[25px] overflow-hidden"
                >
                    <div className="p-8 flex flex-col items-center text-center space-y-6 h-full min-h-[420px]">
                        <div className="relative group">
                            <PremiumAvatar 
                                src="https://github.com/pritpatel2412.png"
                                name="Prit Patel"
                                tier="aura"
                                size="xl"
                                className="z-10"
                            />
                            {/* Static Glow underneath */}
                            <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full -z-10 group-hover:bg-primary/30 transition-colors" />
                        </div>

                        <div className="space-y-2">
                            <h2 className="text-2xl font-bold tracking-tight">Prit Patel</h2>
                            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Full Stack Developer</p>
                        </div>

                        <div className="flex gap-4 pt-4">
                            <a href="https://github.com/pritpatel2412" target="_blank" rel="noopener noreferrer" title="GitHub">
                                <Button size="icon" variant="ghost" className="rounded-full h-10 w-10 text-muted-foreground hover:text-foreground hover:bg-muted/50">
                                    <Github className="h-5 w-5" />
                                </Button>
                            </a>
                            <a href="https://instagram.com/prit__2412" target="_blank" rel="noopener noreferrer" title="Instagram">
                                <Button size="icon" variant="ghost" className="rounded-full h-10 w-10 text-muted-foreground hover:text-foreground hover:bg-muted/50">
                                    <Instagram className="h-5 w-5" />
                                </Button>
                            </a>
                            <a href="https://linkedin.com/in/prit-patel-904272307" target="_blank" rel="noopener noreferrer" title="LinkedIn">
                                <Button size="icon" variant="ghost" className="rounded-full h-10 w-10 text-muted-foreground hover:text-foreground hover:bg-muted/50">
                                    <Linkedin className="h-5 w-5" />
                                </Button>
                            </a>
                            <a href="https://pritfolio.vercel.app" target="_blank" rel="noopener noreferrer" title="Portfolio">
                                <Button size="icon" variant="ghost" className="rounded-full h-10 w-10 text-muted-foreground hover:text-foreground hover:bg-muted/50">
                                    <Globe className="h-5 w-5" />
                                </Button>
                            </a>
                        </div>
                    </div>
                </PixelCard>

                {/* Bio and Details */}
                <div className="md:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <Code2 className="h-5 w-5 text-primary" />
                                <CardTitle>The Mission</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground leading-relaxed">
                                I created CodeGuard to solve a common problem in software development:
                                <span className="text-foreground font-medium"> signal vs. noise in code reviews</span>.
                                Traditional linting tools catch syntax errors, but they miss the subtle logic bugs,
                                security vulnerabilities, and architectural issues that truly matter.
                            </p>
                            <p className="mt-4 text-muted-foreground leading-relaxed">
                                By leveraging advanced AI models, CodeGuard acts as an tireless senior engineer,
                                providing deep, contextual code analysis instantly on every pull request.
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <Heart className="h-5 w-5 text-red-500" />
                                <CardTitle>Contact & Support</CardTitle>
                            </div>
                            <CardDescription>
                                Have questions or feedback? Reach out directly.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-4">
                                <div className="flex items-center gap-3 p-3 rounded-md bg-muted/50">
                                    <Mail className="h-5 w-5 text-primary" />
                                    <div className="flex-1">
                                        <p className="text-sm font-medium">Email Support</p>
                                        <p className="text-xs text-muted-foreground">support@codeguard.dev</p>
                                    </div>
                                    <Button variant="outline" size="sm" asChild>
                                        <a href="mailto:support@codeguard.dev">Send Email</a>
                                    </Button>
                                </div>

                                <div className="relative">
  <div className="flex items-center gap-3 p-3 rounded-md bg-muted/50 blur-sm select-none">
    <Github className="h-5 w-5 text-primary" />
    <div className="flex-1">
      <p className="text-sm font-medium">Open Source</p>
      <p className="text-xs text-muted-foreground">
        Contribute on GitHub
      </p>
    </div>

    {/* NO href, NO link */}
    <Button variant="outline" size="sm" disabled>
      Coming Soon
    </Button>
  </div>
</div>

                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
