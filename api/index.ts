import { app } from "../server/app";
import { registerRoutes } from "../server/routes";
import { setupAuth } from "../server/auth";
import { createServer } from "http";

// Need to setup auth and routes
const httpServer = createServer(app);
setupAuth(app);

// registerRoutes is theoretically async but synchronous in practice for definition
// We await it to be safe, but Vercel top-level await is supported
await registerRoutes(httpServer, app);

app.use((err: any, _req: any, res: any, _next: any) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
});

export default app;
