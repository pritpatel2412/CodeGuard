import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { nanoid } from "nanoid";
import { Card } from "@/components/ui/card";
import { Users } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

export function VisitorCounter() {
    const [count, setCount] = useState<number>(1);
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        // Get or create a session ID
        // Use sessionStorage so each tab is a unique "visitor" session
        let sessionId = sessionStorage.getItem("visitor_session_id");
        if (!sessionId) {
            sessionId = nanoid();
            sessionStorage.setItem("visitor_session_id", sessionId);
        }

        // Connect to the socket server
        // For local development, we want to connect to the same host/port 
        // but in production it might be different. 
        // Since we are serving client from the same express app in simple setup, 
        // or proxying in vite, undefined (window.location) often works or explicit URL.
        // In this repo setup, client and server are on same port in prod, 
        // but in dev (vite) they are different ports. 
        // Usually socket.io client auto-detects.

        // Explicitly using the default behavior (window.location.host)
        const socket = io({
            query: { sessionId },
            transports: ["websocket", "polling"],
        });

        socket.on("visitor-count", (newCount: number) => {
            setCount(newCount);
        });

        socket.on("connect_error", (err) => {
            console.log("Socket connection error (expected on serverless):", err.message);
            // Fallback: Keep count at 1 (current user) or simulate activity if needed
        });

        return () => {
            socket.disconnect();
        };
    }, []);

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
