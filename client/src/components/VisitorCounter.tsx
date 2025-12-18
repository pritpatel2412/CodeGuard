import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { Users } from "lucide-react";

export function VisitorCounter() {
    const [count, setCount] = useState<number>(0);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        // Connect to the same host that served the page
        const socket: Socket = io(window.location.origin);

        socket.on("visitor-count", (newCount: number) => {
            setCount(newCount);
        });

        return () => {
            socket.disconnect();
        };
    }, []);

    if (!mounted) return null;

    return (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-full bg-black/80 px-4 py-2 text-sm font-medium text-green-400 backdrop-blur-sm shadow-lg border border-green-500/30 transition-all hover:scale-105">
            <div className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
            </div>
            <Users className="h-4 w-4" />
            <span>Live Visitors: {count}</span>
        </div>
    );
}
