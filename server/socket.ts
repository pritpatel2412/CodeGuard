import { Server } from "socket.io";
import { Server as HttpServer } from "http";

export function setupSocket(httpServer: HttpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  // Track active sessions: sessionId -> Set of socket IDs
  // This allows a user to have multiple tabs open but only count as 1 visitor
  const activeSessions = new Map<string, Set<string>>();

  io.on("connection", (socket) => {
    const sessionId = socket.handshake.query.sessionId as string;
    
    if (sessionId) {
      if (!activeSessions.has(sessionId)) {
        activeSessions.set(sessionId, new Set());
      }
      activeSessions.get(sessionId)!.add(socket.id);
      
      console.log(`New connection: ${socket.id} (Session: ${sessionId})`);
    } else {
      console.log(`New connection without session ID: ${socket.id}`);
    }

    // Broadcast accurate visitor count (number of unique sessions)
    io.emit("visitor-count", activeSessions.size);

    socket.on("disconnect", () => {
      if (sessionId && activeSessions.has(sessionId)) {
        const userSockets = activeSessions.get(sessionId)!;
        userSockets.delete(socket.id);

        // If the user has no more open sockets (tabs), remove them from the count
        if (userSockets.size === 0) {
          activeSessions.delete(sessionId);
          console.log(`Session ended: ${sessionId}`);
        }
      }

      // Broadcast new count
      io.emit("visitor-count", activeSessions.size);
    });
  });

  return io;
}
