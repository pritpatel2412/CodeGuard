import { Server as SocketIOServer } from "socket.io";
import type { Server as HTTPServer } from "http";

let io: SocketIOServer | null = null;

export function setupSocketIO(httpServer: HTTPServer) {
  io = new SocketIOServer(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    },
    path: "/socket.io"
  });

  io.on("connection", (socket) => {
    console.log(`[socket] Client connected: ${socket.id}`);

    socket.on("disconnect", () => {
      console.log(`[socket] Client disconnected: ${socket.id}`);
    });
  });

  return io;
}

export function getIO() {
  if (!io) {
    // We don't throw here to avoid crashing during initialization if something calls it too early
    // but we log a warning.
    console.warn("[socket] Attempted to get IO before initialization");
    return null;
  }
  return io;
}

export function emitReviewUpdate() {
  const ioInstance = getIO();
  if (ioInstance) {
    console.log("[socket] Emitting review_update event");
    ioInstance.emit("review_update");
  }
}
