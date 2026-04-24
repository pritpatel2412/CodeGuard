import "dotenv/config";
import express from "express";
import helmet from "helmet";
import { rateLimit } from "express-rate-limit";
import hpp from "hpp";
import cors from "cors";

const app = express();

// 1. Secure HTTP Headers
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            ...helmet.contentSecurityPolicy.getDefaultDirectives(),
            "img-src": ["'self'", "data:", "https://github.com", "https://avatars.githubusercontent.com", "https://*.dicebear.com"],
            "script-src": ["'self'", "'unsafe-inline'", "'unsafe-eval'"], // Needed for Vite/HMR in dev
            "connect-src": ["'self'", "https://*.dicebear.com", "ws:", "wss:"],
        },
    },
}));

// 2. Prevent HTTP Parameter Pollution
app.use(hpp());

// 3. CORS Configuration
app.use(cors({
    origin: process.env.NODE_ENV === 'production' ? false : true, // Strict in production
    credentials: true,
}));

// 4. Rate Limiting (DDoS Protection)
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 100, // Limit each IP to 100 requests per window
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: { error: "Too many requests, please try again later." },
});

// Apply limiter only to /api routes
app.use("/api", limiter);

declare module "http" {
    interface IncomingMessage {
        rawBody: unknown;
    }
}

declare global {
    namespace Express {
        interface User {
            id: string;
            username: string;
            githubId?: string;
            avatarUrl?: string;
        }
    }
}

app.use(
    express.json({
        verify: (req, _res, buf) => {
            req.rawBody = buf;
        },
    }),
);

app.use(express.urlencoded({ extended: false }));

export function log(message: string, source = "express") {
    const formattedTime = new Date().toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
        day: "numeric",
        month: "numeric",
        year: "numeric"
    });

    console.log(`${formattedTime} [${source}] ${message}`);
}

app.use((req, res, next) => {
    const start = Date.now();
    const path = req.path;
    let capturedJsonResponse: Record<string, any> | undefined = undefined;

    const originalResJson = res.json;
    res.json = function (bodyJson, ...args) {
        capturedJsonResponse = bodyJson;
        return originalResJson.apply(res, [bodyJson, ...args]);
    };

    res.on("finish", () => {
        const duration = Date.now() - start;
        if (path.startsWith("/api")) {
            let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
            if (capturedJsonResponse) {
                logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
            }

            if (logLine.length > 80) {
                logLine = logLine.slice(0, 79) + "…";
            }

            log(logLine);
        }
    });

    next();
});

export { app };
