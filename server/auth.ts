import passport from "passport";
import { Strategy as GitHubStrategy } from "passport-github2";
import { Express } from "express";
import session from "express-session";
import createMemoryStore from "memorystore";
import { storage } from "./storage.js";
import { User } from "../shared/schema.js";

export function setupAuth(app: Express) {
    const MemoryStore = createMemoryStore(session);
    const sessionSettings: session.SessionOptions = {
        secret: process.env.SESSION_SECRET || "r8q,+&1LM3)CD*zAGpx1xm{NeQhc;#",
        resave: false,
        saveUninitialized: false,
        cookie: {},
        store: new MemoryStore({
            checkPeriod: 86400000, // prune expired entries every 24h
        }),
    };

    if (app.get("env") === "production") {
        app.set("trust proxy", 1); // trust first proxy
        sessionSettings.cookie = {
            secure: true,
        };
    }

    app.use(session(sessionSettings));
    app.use(passport.initialize());
    app.use(passport.session());

    passport.use(
        new GitHubStrategy(
            {
                clientID: process.env.GITHUB_CLIENT_ID || "",
                clientSecret: process.env.GITHUB_CLIENT_SECRET || "",
                callbackURL: process.env.GITHUB_CALLBACK_URL || "http://localhost:5000/auth/github/callback",
            },
            async (accessToken: string, refreshToken: string, profile: any, done: any) => {
                try {
                    const githubId = profile.id;
                    const username = profile.username;
                    const avatarUrl = profile.photos?.[0]?.value;

                    let user = await storage.getUserByGitHubId(githubId);

                    if (!user) {
                        // Check if user exists by username (fallback/legacy)
                        user = await storage.getUserByUsername(username);

                        if (user) {
                            // Link existing user
                            user = await storage.updateUser(user.id, {
                                githubId,
                                avatarUrl,
                                accessToken,
                            });
                        } else {
                            // Create new user
                            user = await storage.createUser({
                                username,
                                githubId,
                                avatarUrl,
                                accessToken,
                                password: "", // No password for OAuth users
                            });
                        }
                    } else {
                        // Update access token and avatar
                        user = await storage.updateUser(user.id, {
                            accessToken,
                            avatarUrl,
                        });
                    }

                    return done(null, user);
                } catch (err) {
                    return done(err);
                }
            }
        )
    );

    passport.serializeUser((user: any, done) => {
        done(null, user.id);
    });

    passport.deserializeUser(async (id: string, done) => {
        try {
            const user = await storage.getUser(id);
            done(null, user);
        } catch (err) {
            done(err);
        }
    });

    // Auth Routes
    app.get("/auth/github", passport.authenticate("github", { scope: ["user:email", "repo"] }));

    app.get(
        "/auth/github/callback",
        passport.authenticate("github", { failureRedirect: "/" }),
        (req, res) => {
            res.redirect("/");
        }
    );

    app.get("/api/logout", (req, res, next) => {
        req.logout((err) => {
            if (err) {
                return next(err);
            }
            res.redirect("/");
        });
    });

    app.get("/api/user", (req, res) => {
        if (req.isAuthenticated()) {
            res.json(req.user);
        } else {
            res.status(401).json({ message: "Not authenticated" });
        }
    });
}
