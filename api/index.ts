import { app } from "../server/app.js";
import { registerRoutes } from "../server/routes.js";
import { setupAuth } from "../server/auth.js";
import { createServer } from "http";
import taintRouter from "../server/routes/taint.js";

// Need to setup auth and routes
const httpServer = createServer(app);
setupAuth(app);

// registerRoutes is theoretically async but synchronous in practice for definition
// We await it to be safe, but Vercel top-level await is supported
await registerRoutes(httpServer, app);
app.use("/api/taint", taintRouter);

app.use((err: any, _req: any, res: any, _next: any) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    if (!res.headersSent) {
        res.status(status).json({ message });
    }
    console.error("[vercel] Unhandled error:", err);
});

export default app;
