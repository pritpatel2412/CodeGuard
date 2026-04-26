import crypto from "crypto";
import type { NextFunction, Request, Response } from "express";

declare module "express-session" {
  interface SessionData {
    csrfToken?: string;
  }
}

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

function isCsrfExemptPath(path: string): boolean {
  if (path.startsWith("/api/webhooks/")) return true;
  if (path === "/api/csrf") return true;
  if (path === "/api/visitors/heartbeat") return true;
  return false;
}

/**
 * Issue or rotate CSRF token for the current session (call from GET /api/csrf).
 */
export function ensureSessionCsrfToken(req: Request): string {
  if (!req.session) {
    throw new Error("Session middleware required before CSRF");
  }
  if (!req.session.csrfToken) {
    req.session.csrfToken = crypto.randomBytes(32).toString("hex");
  }
  return req.session.csrfToken;
}

/**
 * Verify double-submit token for state-changing API requests.
 */
export function csrfProtectionMiddleware(req: Request, res: Response, next: NextFunction) {
  if (!req.path.startsWith("/api")) {
    return next();
  }
  if (isCsrfExemptPath(req.path)) {
    return next();
  }
  if (SAFE_METHODS.has(req.method)) {
    return next();
  }

  const header = req.get("x-csrf-token");
  const sessionToken = req.session?.csrfToken;
  if (!header || !sessionToken || header !== sessionToken) {
    return res.status(403).json({ error: "Invalid or missing CSRF token" });
  }
  return next();
}
