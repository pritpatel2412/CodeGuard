import { Request, Response, NextFunction } from "express";

const IDLE_TIMEOUT_MINUTES = parseInt(process.env.SESSION_IDLE_TIMEOUT_MINUTES || "20", 10);
const ABSOLUTE_TIMEOUT_HOURS = parseInt(process.env.SESSION_ABSOLUTE_TIMEOUT_HOURS || "12", 10);

const ADMIN_IDLE_TIMEOUT_MINUTES = parseInt(process.env.ADMIN_SESSION_IDLE_TIMEOUT_MINUTES || "10", 10);
const ADMIN_ABSOLUTE_TIMEOUT_HOURS = parseInt(process.env.ADMIN_SESSION_ABSOLUTE_TIMEOUT_HOURS || "4", 10);

export const sessionTimeout = async (req: Request, res: Response, next: NextFunction) => {
  if (!req.isAuthenticated() || !req.session) {
    return next();
  }

  const now = Date.now();
  
  // Initialize session creation time if missing
  if (!req.session.createdAt) {
    req.session.createdAt = now;
  }
  
  if (!req.session.lastActivityAt) {
    req.session.lastActivityAt = now;
  }

  const user = req.user as any;
  const isAdmin = user && user.isAdmin === true;

  const idleTimeout = isAdmin ? ADMIN_IDLE_TIMEOUT_MINUTES * 60 * 1000 : IDLE_TIMEOUT_MINUTES * 60 * 1000;
  const absoluteTimeout = isAdmin ? ADMIN_ABSOLUTE_TIMEOUT_HOURS * 60 * 60 * 1000 : ABSOLUTE_TIMEOUT_HOURS * 60 * 60 * 1000;

  const timeSinceLastActivity = now - req.session.lastActivityAt;
  const timeSinceCreated = now - req.session.createdAt;

  if (timeSinceLastActivity > idleTimeout || timeSinceCreated > absoluteTimeout) {
    console.log(`[SessionTimeout] User ${user.id} session expired. Idle: ${timeSinceLastActivity > idleTimeout}, Absolute: ${timeSinceCreated > absoluteTimeout}`);
    req.logout((err) => {
      if (err) return next(err);
      req.session.destroy((destroyErr) => {
        if (destroyErr) return next(destroyErr);
        res.clearCookie("codeguard.sid", { path: "/" });
        // Instead of 401 JSON directly, if it's a browser navigation it's better to redirect, but since this is API heavy, 401 is appropriate.
        // Actually, returning a JSON 401 is safest, the frontend will redirect to login.
        return res.status(401).json({ error: "Session expired due to inactivity or absolute timeout." });
      });
    });
    return;
  }

  // Update last activity
  req.session.lastActivityAt = now;
  next();
};

declare module 'express-session' {
  interface SessionData {
    createdAt?: number;
    lastActivityAt?: number;
  }
}
