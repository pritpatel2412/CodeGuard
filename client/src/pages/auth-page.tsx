import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SiGithub } from "react-icons/si";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Dither from "@/components/ui/dither";

const TESTIMONIALS = [
    {
        text: "Your codebase's 24/7 guardian. CodeSift AI autonomously scans every Pull Request for OWASP Top 10 vulnerabilities, logic flaws, and secret exposure — then fixes them before they ship.",
        author: "Aarav Patel, Lead Engineer"
    },
    {
        text: "Stop reviewing security bugs manually. CodeSift AI acts as your Senior AppSec Engineer — detecting vulnerabilities, generating battle-tested fixes, and opening PRs automatically. Ship fast. Ship safe.",
        author: "Neha Sharma, DevOps Architect"
    },
    {
        text: "Where elite security meets premium developer experience. CodeSift AI combines AI intelligence with real-time GitHub integration to turn every code review into a fortress — automatically.",
        author: "Vikram Singh, Security Researcher"
    },
    {
        text: "Code ships. Vulnerabilities don't. CodeSift AI monitors every PR in real-time, catches what humans miss, and auto-remediates critical issues before they ever touch production.",
        author: "Ananya Gupta, VP of Engineering"
    },
    {
        text: "Built for teams who refuse to compromise. CodeSift AI brings autonomous, AI-powered security analysis directly into your workflow.",
        author: "Rohan Desai, Senior Backend Developer"
    },
    {
        text: "Most vulnerabilities don't announce themselves. CodeSift AI does — catching SQLi, XSS, secret leaks, and logic flaws across every PR before your users ever see them. Autonomous. Relentless. Always on.",
        author: "Priya Kumar, AppSec Manager"
    },
    {
        text: "Every merged PR is a decision. CodeSift AI makes sure none of them are the wrong one. Powered by state-of-the-art AI, it reads your codebase context, generates architecturally sound fixes, and ships them as a PR.",
        author: "Arjun Reddy, Staff Software Engineer"
    },
    {
        text: "Security isn't a feature. It's a standard. CodeSift AI enforces that standard on every commit — scanning, scoring, and self-healing your codebase with precision and speed.",
        author: "Neha Joshi, Director of Cloud Security"
    },
    {
        text: "Your team is shipping fast. Your security review isn't keeping up. CodeSift AI closes that gap — autonomously analyzing every Pull Request, flagging what matters, and deploying fixes before vulnerabilities reach main.",
        author: "Karan Mehta, Principal Engineer"
    },
    {
        text: "Vulnerabilities are patient. Your reviewers aren't. CodeSift AI never blinks — an AI security agent that lives inside your GitHub repositories.",
        author: "Sneha Iyer, Tech Lead"
    }
];

export default function AuthPage() {
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % TESTIMONIALS.length);
        }, 5000);
        return () => clearInterval(timer);
    }, []);

    const handleLogin = () => {
        window.location.href = "/auth/github";
    };

    return (
        <div className="min-h-screen w-full flex bg-background">
            {/* Left side - Branding & Background Effect */}
            <div className="hidden lg:flex flex-col justify-between w-1/2 p-12 relative overflow-hidden bg-zinc-950 text-white border-r border-border/10">
                <div className="absolute inset-0 z-0 mix-blend-screen opacity-90">
                    <Dither
                        enableMouseInteraction
                        mouseRadius={0.5}
                        colorNum={4}
                        waveAmplitude={0.3}
                        waveFrequency={3}
                        waveSpeed={0.07}
                    />
                </div>
                <div className="relative z-10 flex items-center gap-3">
                    <img src="/logo.png" alt="CodeSift AI Logo" className="w-10 h-10 object-contain rounded-xl shadow-lg" />
                    <span className="text-2xl font-bold tracking-tight text-white">CodeSift AI</span>
                </div>
                <div className="relative z-10 max-w-lg min-h-[240px]">
                    <AnimatePresence mode="wait">
                        <motion.blockquote
                            key={currentIndex}
                            initial={{ opacity: 0, filter: "blur(8px)", y: 15, scale: 0.98 }}
                            animate={{ opacity: 1, filter: "blur(0px)", y: 0, scale: 1 }}
                            exit={{ opacity: 0, filter: "blur(8px)", y: -15, scale: 0.98 }}
                            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                            className="space-y-6 absolute w-full"
                        >
                            <p className="text-2xl font-medium leading-relaxed text-zinc-100">
                                "{TESTIMONIALS[currentIndex].text}"
                            </p>
                            <footer className="text-sm font-medium text-zinc-400">
                                {TESTIMONIALS[currentIndex].author}
                            </footer>
                        </motion.blockquote>
                    </AnimatePresence>
                </div>
            </div>

            {/* Right side - Login Form */}
            <div className="flex-1 flex flex-col justify-center items-center p-8 bg-card">
                <div className="w-full max-w-[380px] space-y-8">
                    {/* Back to Home Link */}
                    <div>
                        <a
                            href="/"
                            className="inline-flex items-center gap-1.5 text-xs font-mono text-muted-foreground hover:text-foreground transition-colors"
                        >
                            <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
                        </a>
                    </div>

                    {/* Mobile Header (Hidden on Desktop) */}
                    <div className="flex lg:hidden items-center justify-center gap-3 mb-12">
                        <img src="/logo.png" alt="CodeSift AI Logo" className="w-10 h-10 object-contain rounded-xl shadow-lg" />
                        <span className="text-2xl font-bold tracking-tight text-foreground">CodeSift AI</span>
                    </div>

                    <div className="space-y-2 text-center lg:text-left">
                        <h1 className="text-3xl font-semibold tracking-tight text-foreground">Welcome back</h1>
                        <p className="text-sm text-muted-foreground">
                            Sign in to your account to continue
                        </p>
                    </div>

                    <div className="space-y-5">
                        <Button
                            className="w-full h-12 flex items-center justify-center gap-3 text-base font-medium transition-all shadow-sm"
                            onClick={handleLogin}
                        >
                            <SiGithub className="w-5 h-5" />
                            Continue with GitHub
                        </Button>
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t border-border/60" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-card px-3 text-muted-foreground font-medium">
                                    Enterprise
                                </span>
                            </div>
                        </div>
                        <Button
                            variant="ghost"
                            className="w-full h-12 flex items-center justify-center text-muted-foreground hover:text-foreground"
                            onClick={() => window.location.href = "mailto:try.prit24@gmail.com"}
                        >
                            Contact Sales
                        </Button>
                    </div>

                    <p className="px-8 text-center text-sm text-muted-foreground">
                        By clicking continue, you agree to our{" "}
                        <a href="/terms" target="_blank" rel="noopener noreferrer" className="underline underline-offset-4 hover:text-primary">Terms of Service</a>{" "}
                        and{" "}
                        <a href="/privacy" target="_blank" rel="noopener noreferrer" className="underline underline-offset-4 hover:text-primary">Privacy Policy</a>.
                    </p>
                </div>
            </div>
        </div>
    );
}
