import rateLimit from "express-rate-limit";
import { Request, Response } from "express";

const handler = (req: Request, res: Response, next: any, options: any) => {
  console.warn(`[RateLimit] ${req.ip} exceeded rate limit for ${req.originalUrl}`);
  res.status(options.statusCode).json(options.message);
};

export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per IP
  message: { error: "Too many authentication attempts, please try again later." },
  handler,
});

export const publicIntakeLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 hours
  max: 3, // 3 requests
  keyGenerator: (req) => {
    // Limit by IP AND email
    const email = req.body?.contactEmail || "no-email";
    return `${req.ip}_${email}`;
  },
  message: { error: "You have reached the maximum number of free audit requests (3 per 24 hours)." },
  handler,
});

export const auditIngestionLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 hours
  max: 5, // 5 requests per user
  keyGenerator: (req) => {
    // @ts-ignore
    if (req.user && req.user.id) {
      // @ts-ignore
      return req.user.id.toString();
    }
    return req.ip || "unknown";
  },
  message: { error: "You have reached your daily limit of 5 audits." },
  handler,
});

export const apiRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // 100 requests per minute per IP
  message: { error: "Too many requests, please slow down." },
  handler,
});
