import "dotenv/config";
import express from "express";
import helmet from "helmet";
import { rateLimit } from "express-rate-limit";
import hpp from "hpp";
import cors from "cors";
import type { PublicUser } from "./user-public.js";

const app = express();

const isProd = process.env.NODE_ENV === "production";

// 1. Secure HTTP Headers — strict CSP in production; relaxed for Vite HMR in dev
const devCspDirectives = {
    ...helmet.contentSecurityPolicy.getDefaultDirectives(),
    "img-src": ["'self'", "data:", "https://github.com", "https://avatars.githubusercontent.com", "https://*.dicebear.com"],
    "script-src": ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
    "connect-src": ["'self'", "https://*.dicebear.com", "ws:", "wss:"],
} as const;

const prodCspDirectives = {
    ...helmet.contentSecurityPolicy.getDefaultDirectives(),
    "img-src": ["'self'", "data:", "https://github.com", "https://avatars.githubusercontent.com", "https://*.dicebear.com"],
    // SPA may include small inline scripts from the build; no eval
    "script-src": ["'self'", "'unsafe-inline'"],
    "connect-src": ["'self'", "https://*.dicebear.com"],
} as const;

app.use(helmet({
    contentSecurityPolicy: {
        directives: isProd ? prodCspDirectives : devCspDirectives,
    },
}));

// 2. Prevent HTTP Parameter Pollution
app.use(hpp());

// 3. CORS — explicit allowlist in production (comma-separated APP_ORIGIN)
function getProductionAllowedOrigins(): string[] {
    const raw = process.env.APP_ORIGIN?.trim();
    if (!raw) {
        console.warn("[SECURITY] APP_ORIGIN not set in production; cross-origin API calls will be denied.");
        return [];
    }
    return raw.split(",").map((o) => o.trim()).filter(Boolean);
}

app.use(cors({
    origin: isProd
        ? (requestOrigin, callback) => {
            const allowed = getProductionAllowedOrigins();
            if (allowed.length === 0) {
                return callback(null, false);
            }
            if (!requestOrigin) {
                return callback(null, true);
            }
            if (allowed.includes(requestOrigin)) {
                return callback(null, true);
            }
            return callback(new Error("Not allowed by CORS"));
        }
        : true,
    credentials: true,
    methods: ["GET", "HEAD", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "X-CSRF-Token"],
}));

// 4. Rate Limiting (DDoS Protection) — skip verified GitHub webhooks (signature-checked)
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 100, // Limit each IP to 100 requests per window
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: { error: "Too many requests, please try again later." },
    skip: (req) => req.path.includes("/webhooks/"),
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
        // eslint-disable-next-line @typescript-eslint/no-empty-object-type
        interface User extends PublicUser {}
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

const SENSITIVE_LOG_KEYS = /token|secret|password|authorization|access_token|accessToken|cookie|set-cookie|webhookSecret|sess\b/i;

function redactForLog(value: unknown, maxLen = 500): string {
    const walk = (v: unknown): unknown => {
        if (v === null || v === undefined) return v;
        if (typeof v !== "object") return v;
        if (Array.isArray(v)) return v.map(walk);
        const out: Record<string, unknown> = {};
        for (const [k, val] of Object.entries(v as Record<string, unknown>)) {
            if (SENSITIVE_LOG_KEYS.test(k)) {
                out[k] = "[REDACTED]";
            } else if (val !== null && typeof val === "object") {
                out[k] = walk(val);
            } else {
                out[k] = val;
            }
        }
        return out;
    };
    try {
        const s = JSON.stringify(walk(value));
        return s.length > maxLen ? `${s.slice(0, maxLen)}…` : s;
    } catch {
        return "[unserializable]";
    }
}

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
                logLine += ` :: ${redactForLog(capturedJsonResponse)}`;
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
