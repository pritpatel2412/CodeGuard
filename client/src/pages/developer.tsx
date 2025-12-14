import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Github, Instagram, Linkedin, Mail, Globe, Code2, Heart } from "lucide-react";

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
                {/* Profile Card */}
                <Card className="md:col-span-1 border-primary/20 bg-primary/5 dark:bg-primary/10">
                    <CardContent className="pt-6 flex flex-col items-center text-center space-y-4">
                        <div className="relative">
                            <Avatar className="h-32 w-32 border-4 border-background shadow-xl">
                                <AvatarImage src="https://github.com/pritpatel2412.png" />
                                <AvatarFallback className="text-4xl">PP</AvatarFallback>
                            </Avatar>
                            <div className="absolute bottom-0 right-0 bg-green-500 h-6 w-6 rounded-full border-4 border-background" />
                        </div>

                        <div className="space-y-1">
                            <h2 className="text-xl font-bold">Prit Patel</h2>
                            <p className="text-sm text-muted-foreground">Full Stack Developer</p>
                        </div>

                        <div className="flex gap-2 pt-2">
                            <a href="https://github.com/pritpatel2412" target="_blank" rel="noopener noreferrer">
                                <Button size="icon" variant="ghost" className="rounded-full h-8 w-8 text-muted-foreground hover:text-foreground">
                                    <Github className="h-4 w-4" />
                                </Button>
                            </a>
                            <a href="https://instagram.com/prit__2412" target="_blank" rel="noopener noreferrer">
                                <Button size="icon" variant="ghost" className="rounded-full h-8 w-8 text-muted-foreground hover:text-foreground">
                                    <Instagram className="h-4 w-4" />
                                </Button>
                            </a>
                            <a href="https://linkedin.com/in/prit-patel-904272307" target="_blank" rel="noopener noreferrer">
                                <Button size="icon" variant="ghost" className="rounded-full h-8 w-8 text-muted-foreground hover:text-foreground">
                                    <Linkedin className="h-4 w-4" />
                                </Button>
                            </a>
                            <a href="https://pritfolio.vercel.app" target="_blank" rel="noopener noreferrer">
                                <Button size="icon" variant="ghost" className="rounded-full h-8 w-8 text-muted-foreground hover:text-foreground">
                                    <Globe className="h-4 w-4" />
                                </Button>
                            </a>
                        </div>
                    </CardContent>
                </Card>

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
