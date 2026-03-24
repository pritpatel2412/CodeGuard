import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Shield,
    Check,
    Lock,
    Github,
    Gitlab,
    AlertTriangle,
    FileCode,
    Terminal,
    ArrowRight,
    Loader2,
} from "lucide-react";
import { useErrorStore } from "@/lib/error-store";

// Animation Steps
enum Step {
    IDLE = 0,
    LOADING = 1,
    AGENT_ACTIVE = 2,
    CONNECTING_GITHUB = 3,
    SCANNING_CODE = 4,
    FIXING_CODE = 5,
    CREATING_PR = 6,
    SUCCESS = 7,
}

interface AiFixFlowProps {
    onComplete?: () => void;
    autoStart?: boolean;
    compact?: boolean; // Deprecated but kept for compatibility if needed
    className?: string;
    filename?: string;
    prUrl?: string;
    platform?: "github" | "gitlab";
}

export function AiFixFlow({
    onComplete,
    autoStart = false,
    className,
    filename = "config.ts", // Default for demo
    prUrl,
    platform = "github"
}: AiFixFlowProps) {
    const [step, setStep] = useState<Step>(autoStart ? Step.LOADING : Step.IDLE);
    const { isOpen: isErrorOpen } = useErrorStore();

    // Reset to IDLE if an error occurs
    useEffect(() => {
        if (isErrorOpen) {
            setStep(Step.IDLE);
        }
    }, [isErrorOpen]);

    // Auto-progress through steps once started
    useEffect(() => {
        if (step === Step.IDLE) return;

        // Auto-close after Success
        if (step === Step.SUCCESS) {
            if (onComplete) {
                // Wait 6 seconds before calling onComplete (Auto-close)
                const timer = setTimeout(onComplete, 6000);
                return () => clearTimeout(timer);
            }
            return;
        }

        // Step Durations
        const stepDurations: Record<number, number> = {
            [Step.LOADING]: 2000,
            [Step.AGENT_ACTIVE]: 1500,
            [Step.CONNECTING_GITHUB]: 2000,
            [Step.SCANNING_CODE]: 3000,
            [Step.FIXING_CODE]: 3000,
            // CREATING_PR is handled specially below
        };

        // Special handling for PR Creation Step
        if (step === Step.CREATING_PR) {
            // Only advance if we have the real PR URL
            if (prUrl) {
                // Wait a minimum specific time to ensure the "Creating..." state is visible
                const timer = setTimeout(() => {
                    setStep(Step.SUCCESS);
                }, 2000);
                return () => clearTimeout(timer);
            }
            // If no PR URL yet, we stay in this step INDEFINITELY
            return;
        }

        // Standard progression for other steps
        const timer = setTimeout(() => {
            setStep((prev) => prev + 1);
        }, stepDurations[step] || 1000);

        return () => clearTimeout(timer);
    }, [step, onComplete, prUrl]); // Dependencies updated to react to prUrl changes

    const handleStart = () => {
        setStep(Step.LOADING);
    };

    const handleReset = () => {
        setStep(Step.IDLE);
    };

    return (
        <div className={`w-full h-full min-h-[500px] flex flex-col items-center justify-center p-6 bg-background/50 rounded-xl overflow-hidden relative font-sans text-foreground ${className}`}>
            {/* Dynamic Background Elements */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/10 rounded-full blur-3xl opacity-20" />
                <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-primary/5 rounded-full blur-3xl opacity-20" />
            </div>

            <AnimatePresence mode="wait">
                {step === Step.IDLE && (
                    <InitialState key="initial" onStart={handleStart} />
                )}

                {step !== Step.IDLE && step !== Step.SUCCESS && (
                    <ActiveFlow key="active" step={step} filename={filename} platform={platform} />
                )}

                {step === Step.SUCCESS && (
                    <SuccessState key="success" onReset={handleReset} prUrl={prUrl} platform={platform} />
                )}
            </AnimatePresence>

            {/* Status Text Area - Always visible during active flow */}
            <AnimatePresence>
                {step !== Step.IDLE && step !== Step.SUCCESS && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="absolute bottom-12 text-center"
                    >
                        <StatusText step={step} platform={platform} />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

// 1. Initial State Component
function InitialState({ onStart }: { onStart: () => void }) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex flex-col items-center gap-6 text-center z-10"
        >
            <div className="p-4 rounded-full bg-destructive/10 border border-destructive/20 mb-2">
                <Shield className="w-12 h-12 text-destructive" />
            </div>
            <div>
                <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-br from-foreground to-muted-foreground">
                    High-Risk Pull Request Detected
                </h2>
                <p className="text-muted-foreground mt-2">
                    Secrets and insecure code patterns found in current diff.
                </p>
            </div>

            <motion.button
                onClick={onStart}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="group relative px-8 py-3 rounded-lg bg-primary text-primary-foreground font-semibold shadow-[0_0_20px_rgba(var(--primary),0.4)] overflow-hidden"
            >
                <span className="relative z-10 flex items-center gap-2">
                    Apply AI Fix <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </span>
            </motion.button>
        </motion.div>
    );
}

// 2. Main Active Flow Container
function ActiveFlow({ step, filename, platform }: { step: Step; filename: string; platform: "github" | "gitlab" }) {
    return (
        <div className="relative w-full h-[300px] flex items-center justify-center">
            {/* Central Agent */}
            <AgentVisual step={step} />

            {/* GitHub Destination */}
            <GitHubDestination step={step} platform={platform} />

            {/* Connection Beam */}
            <ConnectionBeam step={step} />

            {/* Code Window / Scanner */}
            <CodeScanner step={step} filename={filename} />

            {/* New PR Card */}
            <NewPRCard step={step} platform={platform} />
        </div>
    );
}

// Sub-components for Active Flow

function AgentVisual({ step }: { step: Step }) {
    const isMoving = step === Step.CONNECTING_GITHUB;
    const isScanning = step === Step.SCANNING_CODE || step === Step.FIXING_CODE;

    return (
        <motion.div
            layoutId="agent"
            animate={{
                scale: step === Step.LOADING ? 0.8 : 1,
                x: isMoving ? -150 : isScanning ? -180 : 0, // Move left when scanning
                opacity: step >= Step.CREATING_PR ? 0 : 1, // Fade out for PR card
            }}
            transition={{ type: "spring", bounce: 0.2, duration: 0.8 }}
            className="absolute z-20 flex flex-col items-center"
        >
            <div className="relative">
                <div className="w-16 h-16 rounded-2xl bg-card border border-primary/20 shadow-[0_0_30px_rgba(var(--primary),0.2)] flex items-center justify-center relative overflow-hidden group">
                    {step === Step.LOADING ? (
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                        >
                            <Loader2 className="w-10 h-10 text-primary" />
                        </motion.div>
                    ) : (
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{
                                scale: [1, 1.05, 1],
                                opacity: 1
                            }}
                            transition={{
                                scale: { repeat: Infinity, duration: 3, ease: "easeInOut" },
                                opacity: { duration: 0.5 }
                            }}
                            className="relative z-10 w-full h-full p-0"
                        >
                            <img
                                src="/logo.png"
                                alt="AI Agent"
                                className="w-full h-full object-cover"
                            />
                        </motion.div>
                    )}

                    {/* Scanning Beam */}
                    {isScanning && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="absolute right-[-100px] top-1/2 -translate-y-1/2 w-[100px] h-[40px] bg-gradient-to-r from-primary/30 to-transparent blur-md pointer-events-none"
                        />
                    )}

                    {/* Grid background inside agent - removed for full logo clarity as per request for 'full logo' */}
                </div>

                {/* Agent Label */}
                {step >= Step.AGENT_ACTIVE && (
                    <motion.div
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] font-mono text-primary font-bold tracking-wider uppercase"
                    >
                        AI Agent
                    </motion.div>
                )}
            </div>
        </motion.div>
    );
}

function GitHubDestination({ step, platform }: { step: Step; platform: "github" | "gitlab" }) {
    const show = step >= Step.CONNECTING_GITHUB && step < Step.CREATING_PR;
    const Icon = platform === "gitlab" ? Gitlab : Github;

    return (
        <AnimatePresence>
            {show && (
                <motion.div
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 150 }} // Stays to the right
                    exit={{ opacity: 0, x: 50, scale: 0.8 }}
                    className="absolute z-10"
                >
                    <div className="w-16 h-16 bg-card rounded-full flex items-center justify-center border border-border shadow-xl">
                        <Icon className="w-8 h-8 text-foreground" />
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

function ConnectionBeam({ step }: { step: Step }) {
    const show = step === Step.CONNECTING_GITHUB;

    return (
        <AnimatePresence>
            {show && (
                <svg className="absolute w-[300px] h-[2px] overflow-visible z-0">
                    <defs>
                        <linearGradient id="beamGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="transparent" />
                            <stop offset="50%" stopColor="currentColor" className="text-primary" />
                            <stop offset="100%" stopColor="transparent" />
                        </linearGradient>
                    </defs>
                    <motion.path
                        d="M 120 1 H 180" // Short path in center
                        stroke="url(#beamGrad)"
                        strokeWidth="2"
                        strokeDasharray="5 5"
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={{ pathLength: 1, opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="drop-shadow-[0_0_5px_rgba(var(--primary),0.6)]"
                    />
                </svg>
            )}
        </AnimatePresence>
    );
}

function CodeScanner({ step, filename }: { step: Step; filename: string }) {
    const show = step === Step.SCANNING_CODE || step === Step.FIXING_CODE;
    const isFixing = step === Step.FIXING_CODE;

    // Mock code lines
    const lines = [
        { width: "60%", risk: false },
        { width: "80%", risk: true }, // The risky line
        { width: "40%", risk: false },
        { width: "70%", risk: true }, // Another risky line
        { width: "50%", risk: false },
    ];

    return (
        <AnimatePresence>
            {show && (
                <motion.div
                    initial={{ opacity: 0, x: 50, scale: 0.9 }}
                    animate={{ opacity: 1, x: 80, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="absolute z-10 w-64 bg-card rounded-lg border border-border shadow-2xl p-4 font-mono text-xs overflow-hidden"
                >
                    {/* Header */}
                    <div className="flex items-center gap-2 mb-3 border-b border-border pb-2">
                        <Terminal className="w-3 h-3 text-muted-foreground" />
                        <span className="text-muted-foreground truncate">{filename}</span>
                    </div>

                    {/* Code Lines */}
                    <div className="space-y-2 relative">
                        {lines.map((line, i) => (
                            <div key={i} className="flex items-center gap-2 h-3">
                                {/* Status Icon */}
                                <div className="w-4 flex justify-center">
                                    {line.risk ? (
                                        isFixing ? (
                                            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                                                <Lock className="w-3 h-3 text-green-400" />
                                            </motion.div>
                                        ) : (
                                            <motion.div animate={{ opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity }}>
                                                <AlertTriangle className="w-3 h-3 text-red-400" />
                                            </motion.div>
                                        )
                                    ) : null}
                                </div>

                                {/* Line Content */}
                                <motion.div
                                    layout
                                    className={`h-2 rounded-full ${line.risk
                                        ? isFixing ? "bg-green-500/50" : "bg-destructive/50"
                                        : "bg-muted"
                                        }`}
                                    style={{ width: line.width }}
                                />
                            </div>
                        ))}

                        {/* Scanning Line overlaid */}
                        {!isFixing && (
                            <motion.div
                                initial={{ top: 0 }}
                                animate={{ top: "100%" }}
                                transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                                className="absolute left-0 right-0 h-[2px] bg-primary shadow-[0_0_10px_rgba(var(--primary),0.5)]"
                            />
                        )}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

function NewPRCard({ step, platform }: { step: Step, platform: "github" | "gitlab" }) {
    const show = step === Step.CREATING_PR;
    const isGitLab = platform === "gitlab";
    const Icon = isGitLab ? Gitlab : Github;

    return (
        <AnimatePresence>
            {show && (
                <motion.div
                    initial={{ opacity: 0, y: 20, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.1 }} // Expands out when success happens
                    className="absolute z-30 w-72 bg-card rounded-lg border border-green-500/30 shadow-[0_0_30px_rgba(34,197,94,0.1)] p-4"
                >
                    <div className="flex items-start gap-3">
                        <div className="mt-1">
                            <Icon className="w-5 h-5 text-card-foreground" />
                        </div>
                        <div>
                            <div className="text-sm font-semibold text-card-foreground">Security Fix: Reduce High-Risk Issues</div>
                            <div className="text-xs text-muted-foreground mt-1">codeguard/security-fix-{isGitLab ? "mr" : "pr"}-generated</div>
                            <div className="flex items-center gap-2 mt-3">
                                <span className="px-2 py-0.5 rounded-full bg-green-500/10 text-[10px] text-green-500 border border-green-500/20">
                                    Creating...
                                </span>
                                <span className="text-[10px] text-muted-foreground">Just now</span>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}

// 3. Success State
function SuccessState({ onReset, prUrl, platform }: { onReset: () => void; prUrl?: string; platform: "github" | "gitlab" }) {
    const label = platform === "gitlab" ? "Merge Request" : "Pull Request";
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center gap-6 text-center z-10"
        >
            <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
                className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center border border-green-500/50 shadow-[0_0_40px_rgba(34,197,94,0.3)]"
            >
                <Check className="w-10 h-10 text-green-500" />
            </motion.div>

            <div>
                <h2 className="text-2xl font-bold text-foreground">Security Risk Reduced</h2>
                <p className="text-muted-foreground mt-2">
                    Vulnerabilities fixed and secure {label} created.
                </p>
            </div>

            <div className="flex gap-3 mt-2">
                {prUrl ? (
                    <a href={prUrl} target="_blank" rel="noopener noreferrer">
                        <button className="px-6 py-2 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground font-medium transition-colors shadow-lg shadow-primary/20">
                            View {label}
                        </button>
                    </a>
                ) : (
                    // Fallback should typically not be reachable in Success state due to logic above, but good for safety
                    <button disabled className="px-6 py-2 rounded-lg bg-muted text-muted-foreground font-medium cursor-not-allowed">
                        {label} URL Loading...
                    </button>
                )}
                {/* Close button removed as requested */}
            </div>
        </motion.div>
    );
}

// Helper: Status Text
function StatusText({ step, platform }: { step: Step; platform: "github" | "gitlab" }) {
    const label = platform === "gitlab" ? "Merge Request" : "Pull Request";
    const platformName = platform === "gitlab" ? "GitLab" : "GitHub";

    const textMap: Record<number, string> = {
        [Step.LOADING]: "Deploying CodeGuard Agent...",
        [Step.AGENT_ACTIVE]: "Agent Online",
        [Step.CONNECTING_GITHUB]: `Connecting securely to ${platformName} repository...`,
        [Step.SCANNING_CODE]: "Analyzing file content and dependencies...",
        [Step.FIXING_CODE]: "Applying secure fixes to identified issues...",
        [Step.CREATING_PR]: `Pushing changes and facilitating ${label}...`,
    };

    return (
        <span className="text-sm font-medium text-primary animate-pulse">
            {textMap[step] || ""}
        </span>
    );
}


