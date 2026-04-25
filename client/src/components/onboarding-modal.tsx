import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Carousel } from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import { FolderGit2, GitPullRequest, Cpu, CheckCircle, Rocket } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const STEPS = [
  {
    id: 1,
    title: "Welcome to CodeGuard",
    description: "Your AI-powered guardian for code quality and security. Let's get you set up in seconds.",
    icon: <Rocket className="h-8 w-8" />
  },
  {
    id: 2,
    title: "Connect Your Repos",
    description: "Import your projects from GitHub or GitLab. We'll monitor them for every new pull request.",
    icon: <FolderGit2 className="h-8 w-8" />
  },
  {
    id: 3,
    title: "AI Code Analysis",
    description: "CodeGuard scans your code for bugs, vulnerabilities, and smells as soon as you open a PR.",
    icon: <Cpu className="h-8 w-8" />
  },
  {
    id: 4,
    title: "Fix with One Click",
    description: "Receive actionable comments and AI-generated fixes that you can apply directly to your code.",
    icon: <CheckCircle className="h-8 w-8" />
  }
];

export function OnboardingModal() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem("has_seen_onboarding");
    if (!hasSeenOnboarding) {
      // Delay slightly for better UX
      const timer = setTimeout(() => setOpen(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    localStorage.setItem("has_seen_onboarding", "true");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[440px] p-0 overflow-hidden border-none bg-transparent shadow-none">
        <DialogTitle className="sr-only">Getting Started with CodeGuard</DialogTitle>
        <DialogDescription className="sr-only">
          A short tutorial on how to use CodeGuard effectively.
        </DialogDescription>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative bg-background border border-border rounded-[2rem] p-6 shadow-2xl overflow-hidden"
        >
          {/* Animated Background Mesh */}
          <div className="absolute top-0 left-0 w-full h-full -z-10 opacity-30 pointer-events-none">
            <div className="absolute -top-24 -left-24 w-64 h-64 bg-primary/20 rounded-full blur-3xl animate-pulse" />
            <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-primary/10 rounded-full blur-3xl animate-pulse delay-700" />
          </div>

          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold tracking-tight bg-gradient-to-br from-foreground to-foreground/60 bg-clip-text text-transparent">
              Master CodeGuard
            </h2>
            <p className="text-sm text-muted-foreground mt-1 font-medium">
              Start your journey in 4 simple steps
            </p>
          </div>

          <div className="relative flex justify-center w-full">
            <Carousel 
              items={STEPS} 
              baseWidth={360} 
              autoplay={true}
              autoplayDelay={6000}
              loop={true}
            />
          </div>

          <div className="mt-8 flex flex-col items-center gap-3">
            <Button 
              onClick={handleClose} 
              className="w-full sm:w-auto px-10 rounded-xl h-12 text-base font-bold shadow-xl shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300"
            >
              Let's Start
            </Button>
            <button 
              onClick={handleClose}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors font-medium"
            >
              Skip for now
            </button>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
