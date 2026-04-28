import 'dotenv/config';
import { app, log } from "./app";
import { registerRoutes } from "./routes";
import { setupAuth } from "./auth";
import { serveStatic } from "./static";
import { createServer } from "http";
import type { Request, Response, NextFunction } from "express";
import taintRouter from "./routes/taint";
import aiStatusRouter from "./routes/ai-status.js";

import { setupSocketIO } from "./socket";

(async () => {
  const httpServer = createServer(app);
  setupSocketIO(httpServer);
  setupAuth(app);
  await registerRoutes(httpServer, app);
  
  app.use("/api/taint", taintRouter);
  app.use("/api/ai", aiStatusRouter);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    if (!res.headersSent) {
      res.status(status).json({ message });
    }
    console.error("[express] Unhandled error:", err);
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (process.env.NODE_ENV === "production") {
    serveStatic(app);
  } else {
    // Only import vite related stuff in development
    try {
      const { setupVite } = await import("./vite");
      await setupVite(httpServer, app);
    } catch (e) {
      console.error("Failed to setup Vite:", e);
    }
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || "5000", 10);
  httpServer.listen(
    port,
    "0.0.0.0",
    () => {
      log(`serving on port ${port}`);
    },
  );
})();
