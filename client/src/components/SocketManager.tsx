import { useEffect } from "react";
import { io } from "socket.io-client";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

export function SocketManager() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  useEffect(() => {
    // In development, the socket server is on the same port as the dev server usually
    // but here the server runs on 5000 and vite on another.
    // However, the proxy should handle it if configured.
    // Since we are using a relative path, it should work with the proxy.
    const socket = io({
      path: "/socket.io",
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socket.on("connect", () => {
      console.log("[socket] Connected to server");
    });

    socket.on("review_update", () => {
      console.log("[socket] Review update received, invalidating queries...");
      
      // Invalidate relevant queries to trigger background refetches
      queryClient.invalidateQueries({ queryKey: ["/api/reviews"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/ai/status"] });

      toast({
        title: "Dashboard Updated",
        description: "New PR analysis or update received.",
        duration: 3000,
      });
    });

    socket.on("disconnect", () => {
      console.log("[socket] Disconnected from server");
    });

    return () => {
      socket.disconnect();
    };
  }, [queryClient, toast]);

  return null; // This component doesn't render anything
}
