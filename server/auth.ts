import passport from "passport";
import { Strategy as GitHubStrategy } from "passport-github2";
import { Express } from "express";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import { pool } from "./db.js";
import { storage } from "./storage.js";
import { toPublicUser, type PublicUser } from "./user-public.js";
import { csrfProtectionMiddleware, ensureSessionCsrfToken } from "./csrf.js";

const MIN_SESSION_SECRET_LEN = 32;

function resolveSessionSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (process.env.NODE_ENV === "production") {
    if (!secret || secret.length < MIN_SESSION_SECRET_LEN) {
      console.error(
        "[FATAL] SESSION_SECRET must be set in production and be at least 32 characters.",
      );
      process.exit(1);
    }
    return secret;
  }
  if (!secret || secret.length < MIN_SESSION_SECRET_LEN) {
    console.warn(
      "[SECURITY] Using development SESSION_SECRET fallback. Set SESSION_SECRET in .env for realistic testing.",
    );
    return "codeguard-dev-secret-key-12345";
  }
  return secret;
}

export function setupAuth(app: Express) {
  const PgSession = connectPgSimple(session);
  const store = new PgSession({
    pool,
    createTableIfMissing: true,
  });
  // @ts-ignore
  store.on("error", (err: Error) => {
    console.error("Session Store Error:", err);
  });

  const sessionSettings: session.SessionOptions = {
    name: "codeguard.sid",
    secret: resolveSessionSecret(),
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 30 * 24 * 60 * 60 * 1000,
      httpOnly: true,
      sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
      secure: app.get("env") === "production",
    },
    store,
  };

  if (app.get("env") === "production") {
    app.set("trust proxy", 1);
  }

  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(csrfProtectionMiddleware);

  passport.use(
    new GitHubStrategy(
      {
        clientID: process.env.GITHUB_CLIENT_ID || "",
        clientSecret: process.env.GITHUB_CLIENT_SECRET || "",
        callbackURL:
          process.env.GITHUB_CALLBACK_URL || "http://localhost:5000/auth/github/callback",
      },
      async (accessToken: string, _refreshToken: string, profile: any, done: any) => {
        try {
          const githubId = profile.id;
          const username = profile.username;
          const avatarUrl = profile.photos?.[0]?.value;

          let user = await storage.getUserByGitHubId(githubId);

          if (!user) {
            user = await storage.getUserByUsername(username);

            if (user) {
              user = await storage.updateUser(user.id, {
                githubId,
                avatarUrl,
                accessToken,
              });
            } else {
              user = await storage.createUser({
                username,
                githubId,
                avatarUrl,
                accessToken,
                password: "",
              });
            }
          } else {
            user = await storage.updateUser(user.id, {
              accessToken,
              avatarUrl,
            });
          }

          return done(null, toPublicUser(user));
        } catch (err) {
          return done(err);
        }
      },
    ),
  );

  passport.serializeUser((user: Express.User, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: string, done) => {
    try {
      const row = await storage.getUser(id);
      if (!row) {
        done(null, false);
        return;
      }
      done(null, toPublicUser(row));
    } catch (err) {
      done(err);
    }
  });

  app.get("/auth/github", passport.authenticate("github", { scope: ["user:email", "repo"] }));

  app.get(
    "/auth/github/callback",
    passport.authenticate("github", { failureRedirect: "/" }),
    (req, res) => {
      res.redirect("/");
    },
  );

  app.get("/api/csrf", (req, res) => {
    try {
      const token = ensureSessionCsrfToken(req);
      res.json({ csrfToken: token });
    } catch {
      res.status(500).json({ error: "Could not issue CSRF token" });
    }
  });

  app.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) {
        return next(err);
      }
      req.session.destroy((destroyErr) => {
        if (destroyErr) {
          return next(destroyErr);
        }
        res.clearCookie("codeguard.sid", { path: "/" });
        return res.status(204).send();
      });
    });
  });

  app.get("/api/user", (req, res) => {
    if (req.isAuthenticated()) {
      res.json(req.user as PublicUser);
    } else {
      res.status(401).json({ message: "Not authenticated" });
    }
  });
}
