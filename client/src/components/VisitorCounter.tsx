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

    // Poll for active visitors every 5 seconds
    const { data: count = 1 } = useQuery({
        queryKey: ["visitors", sessionId],
        queryFn: async () => {
            try {
                const res = await apiRequest("POST", "/api/visitors/heartbeat", { sessionId });
                const data = await res.json();
                return data.count;
            } catch (err) {
                console.error("Failed to sync visitor count:", err);
                return 1;
            }
        },
        refetchInterval: 5000,
        refetchOnWindowFocus: true,
    });

    // Hide if count is 0 (shouldn't happen with default 1)
    if (count === 0) return null;

    return (
        <div className="fixed bottom-5 right-5 z-50">
            <AnimatePresence>
                {isVisible && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: 20 }}
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    >
                        <Card className="flex items-center gap-3 px-4 py-2 bg-black/80 backdrop-blur-md border border-green-500/30 shadow-[0_0_15px_rgba(34,197,94,0.2)] text-green-400 rounded-full">
                            <div className="relative flex items-center justify-center">
                                <Users className="w-4 h-4 text-green-400" />
                                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-20"></span>
                            </div>

                            <div className="flex items-center gap-2 font-mono text-sm font-bold">
                                <span className="relative">
                                    <AnimatePresence mode="wait">
                                        <motion.span
                                            key={count}
                                            initial={{ y: -10, opacity: 0 }}
                                            animate={{ y: 0, opacity: 1 }}
                                            exit={{ y: 10, opacity: 0 }}
                                            className="inline-block text-green-300"
                                        >
                                            {count}
                                        </motion.span>
                                    </AnimatePresence>
                                </span>
                                <span className="text-xs uppercase tracking-wider text-green-500/80 font-semibold">
                                    Live
                                </span>
                            </div>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
