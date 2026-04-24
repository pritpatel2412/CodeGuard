import { useEffect, useState } from "react";
import { nanoid } from "nanoid";
import { Card } from "@/components/ui/card";
import { Users } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export function VisitorCounter() {
    const [isVisible, setIsVisible] = useState(true);

    // Get or create a session ID
    const [sessionId] = useState(() => {
        let sid = sessionStorage.getItem("visitor_session_id");
        if (!sid) {
            sid = nanoid();
            sessionStorage.setItem("visitor_session_id", sid);
        }
        return sid;
    });

    // Poll for active visitors every 10 seconds (more efficient than 5s)
    // Only polls when tab is active (refetchOnWindowFocus + refetchInterval)
    const { data: count = 1 } = useQuery({
        queryKey: ["visitors", sessionId],
        queryFn: async () => {
            // Efficiency check: Don't fetch if tab is hidden
            if (document.hidden) return count;

            try {
                const res = await apiRequest("POST", "/api/visitors/heartbeat", { sessionId });
                const data = await res.json();
                return data.count;
            } catch (err) {
                console.error("Failed to sync visitor count:", err);
                return count;
            }
        },
        refetchInterval: 10000,
        refetchOnWindowFocus: true,
        staleTime: 5000,
    });

    useEffect(() => {
        // Force an update when tab becomes visible again
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                setIsVisible(true);
            }
        };
        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
    }, []);

    // Hide if count is 0 (shouldn't happen with default 1)
    if (count === 0) return null;

    return (
        <div className="fixed bottom-6 right-6 z-50">
            <AnimatePresence>
                {isVisible && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        whileHover={{ scale: 1.05 }}
                        className="relative group"
                    >
                        {/* Glow effect */}
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/50 to-green-500/50 rounded-full blur opacity-30 group-hover:opacity-60 transition duration-500"></div>

                        <div className="relative flex items-center gap-3 px-5 py-2.5 bg-background/80 backdrop-blur-xl border border-border/50 shadow-xl rounded-full">
                            <div className="flex items-center justify-center">
                                <div className="relative">
                                    <Users className="w-4 h-4 text-primary" />
                                    <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-center gap-2.5 font-sans">
                                <span className="text-sm font-bold tabular-nums">
                                    <AnimatePresence mode="wait">
                                        <motion.span
                                            key={count}
                                            initial={{ y: -10, opacity: 0 }}
                                            animate={{ y: 0, opacity: 1 }}
                                            exit={{ y: 10, opacity: 0 }}
                                            className="inline-block text-foreground"
                                        >
                                            {count}
                                        </motion.span>
                                    </AnimatePresence>
                                </span>
                                <div className="h-4 w-[1px] bg-border/50" />
                                <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-black flex items-center gap-1.5">
                                    <span className="relative flex h-1.5 w-1.5">
                                        <span className="absolute inline-flex h-full w-full animate-pulse rounded-full bg-green-500/50"></span>
                                        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500"></span>
                                    </span>
                                    Live
                                </span>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
