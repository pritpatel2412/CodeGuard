import { Request, Response, NextFunction } from "express";
import geoip from "geoip-lite";
import UAParser from "ua-parser-js";
import { db } from "../db";
import { requestLogs } from "@shared/schema";

// Helper to mask IP addresses for privacy when visibility is restricted
function maskIp(ip: string): string {
  // If IPv4, mask last octet
  if (ip.includes(".")) {
    const parts = ip.split(".");
    if (parts.length === 4) {
      parts[3] = "0";
      return parts.join(".");
    }
  }
  // If IPv6, mask last 4 segments
  if (ip.includes(":")) {
    const parts = ip.split(":");
    if (parts.length >= 4) {
      return parts.slice(0, 4).join(":") + ":0000:0000:0000:0000";
    }
  }
  return ip;
}

export function requestLogger(req: Request, res: Response, next: NextFunction) {
  const start = Date.now();

  res.on("finish", () => {
    const responseTimeMs = Date.now() - start;

    // Get IP respecting proxy headers
    let ipAddress = req.headers["x-forwarded-for"] as string || req.socket.remoteAddress || "";
    if (ipAddress.includes(",")) {
      ipAddress = ipAddress.split(",")[0].trim(); // Get first IP in chain
    }
    
    // Fallback for localhost testing
    if (ipAddress === "::1" || ipAddress === "127.0.0.1") {
      ipAddress = "127.0.0.1";
    }

    const visibility = process.env.ADMIN_IP_VISIBILITY || "masked";
    const isMasked = visibility === "masked";

    const finalIpAddress = isMasked ? maskIp(ipAddress) : ipAddress;

    // Parse User Agent
    const parser = new UAParser(req.headers["user-agent"] || "");
    const uaResult = parser.getResult();
    const browser = uaResult.browser.name || "";
    const os = uaResult.os.name || "";
    const device = uaResult.device.type || "desktop"; // fallback
    const userAgent = req.headers["user-agent"] || "";

    // Geolocation via offline database
    let geoCountry = "";
    let geoRegion = "";
    let geoCity = "";
    let geoLat = "";
    let geoLng = "";

    const geo = geoip.lookup(ipAddress);
    if (geo) {
      geoCountry = geo.country;
      geoRegion = geo.region;
      geoCity = geo.city;
      // Do not store exact coordinates if masked
      if (!isMasked && geo.ll) {
        geoLat = geo.ll[0].toString();
        geoLng = geo.ll[1].toString();
      }
    }

    // Identify user/session
    // @ts-ignore - Passport adds req.user
    const userId = req.user?.id || null;
    const sessionId = req.sessionID || "";

    // Insert async (don't await to avoid blocking the event loop)
    db.insert(requestLogs).values({
      userId,
      sessionId,
      method: req.method,
      path: req.originalUrl || req.path,
      statusCode: res.statusCode,
      responseTimeMs,
      ipAddress: finalIpAddress,
      userAgent,
      device,
      browser,
      os,
      geoCountry,
      geoRegion,
      geoCity,
      geoLat,
      geoLng,
    }).catch(err => {
      console.error("[RequestLogger] Failed to insert log:", err);
    });
  });

  next();
}
