import React from "react";
import { Wrench } from "lucide-react";
import { motion } from "framer-motion";

export function ProductShowcaseSection() {
  return (
    <section id="product" className="py-20 md:py-28 border-t border-border">
      <div className="max-w-[1520px] mx-auto px-6 sm:px-10 lg:px-14 xl:px-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.15 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          {/* Section Header */}
          <div className="max-w-[700px] mb-14">
            <div className="text-[11px] font-mono tracking-[0.16em] uppercase text-muted-foreground mb-3">
              PRODUCT INTERFACE
            </div>
            <h2 className="text-2xl sm:text-3xl font-semibold text-foreground tracking-tight leading-[1.25]">
              Built with the fidelity of a production developer tool.
            </h2>
            <p className="text-[14.5px] text-muted-foreground mt-2 leading-relaxed">
              Real pull request data, deterministic policy status, and verifiable AI patch generation.
            </p>
          </div>

          {/* Real Product UI Container with Framer Motion Lift */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.15 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            whileHover={{ y: -4, transition: { duration: 0.25 } }}
            className="rounded-[8px] border border-border bg-card overflow-hidden shadow-xs"
          >
            {/* Top Metadata Header */}
            <div className="px-5 py-4 border-b border-border bg-muted/30 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="text-xs font-mono text-foreground font-medium">
                  <span className="text-muted-foreground">repo:</span> org/backend-api
                </div>
                <span className="text-border">|</span>
                <div className="text-xs font-mono text-muted-foreground">
                  <span className="text-muted-foreground">pr:</span> #128 Fix session revocation
                </div>
              </div>

              <div className="flex items-center gap-3 text-xs font-mono">
                <span className="px-2 py-0.5 rounded-[4px] border border-orange-500/30 bg-orange-500/10 text-orange-500 dark:text-orange-400 font-medium">
                  Risk Level: HIGH
                </span>
                <span className="px-2 py-0.5 rounded-[4px] border border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-medium">
                  Policy: Protected
                </span>
              </div>
            </div>

            {/* Stats Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-y sm:divide-y-0 divide-border border-b border-border bg-card">
              <div className="p-4 sm:p-5">
                <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-mono mb-1">
                  Security Posture
                </div>
                <div className="text-2xl font-bold font-mono text-foreground">
                  78<span className="text-xs font-normal text-muted-foreground">/100</span>
                </div>
              </div>

              <div className="p-4 sm:p-5">
                <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-mono mb-1">
                  Critical Risks
                </div>
                <div className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400">0</div>
              </div>

              <div className="p-4 sm:p-5">
                <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-mono mb-1">
                  High / Medium
                </div>
                <div className="text-2xl font-bold font-mono text-orange-500 dark:text-orange-400">
                  1 <span className="text-sm font-normal text-amber-500">/ 2</span>
                </div>
              </div>

              <div className="p-4 sm:p-5">
                <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-mono mb-1">
                  Policy Checks
                </div>
                <div className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
                  4 Passed
                </div>
              </div>
            </div>

            {/* Main Showcase Layout: 2 Columns */}
            <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-border">
              {/* Left Column: AI Security Summary & Policy Status */}
              <div className="lg:col-span-6 p-5 sm:p-6 space-y-6">
                <div>
                  <div className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-3">
                    AI Security Summary
                  </div>
                  <div className="rounded-[6px] border border-border bg-muted/20 p-4 space-y-3.5">
                    <div>
                      <span className="text-[11px] font-mono uppercase text-muted-foreground block mb-1">
                        Key Risks
                      </span>
                      <ul className="space-y-1.5 text-[13px] text-muted-foreground">
                        <li className="flex items-start gap-2">
                          <span className="text-orange-500 font-mono mt-0.5">•</span>
                          <span>Hardcoded authentication secret committed in source.</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-amber-500 font-mono mt-0.5">•</span>
                          <span>Unvalidated redirect destination in OAuth callback handler.</span>
                        </li>
                      </ul>
                    </div>

                    <div className="pt-2 border-t border-border">
                      <span className="text-[11px] font-mono uppercase text-muted-foreground block mb-1">
                        Potential Impact
                      </span>
                      <p className="text-[13px] text-muted-foreground leading-relaxed">
                        Compromised token signatures allow session spoofing across
                        production microservices without needing valid credentials.
                      </p>
                    </div>

                    <div className="pt-2 border-t border-border">
                      <span className="text-[11px] font-mono uppercase text-muted-foreground block mb-1">
                        Recommended Actions
                      </span>
                      <p className="text-[13px] text-muted-foreground leading-relaxed">
                        Migrate secret reference to environment variable and add
                        automated pre-commit entropy verification.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Policy Status Box */}
                <div>
                  <div className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-3">
                    Policy Status
                  </div>
                  <div className="space-y-2 text-xs font-mono">
                    <div className="flex items-center justify-between p-2.5 rounded-[4px] border border-border bg-muted/20">
                      <span className="text-muted-foreground">OWASP Secret Detection</span>
                      <span className="text-orange-500 dark:text-orange-400 font-medium">Failed (1 Finding)</span>
                    </div>
                    <div className="flex items-center justify-between p-2.5 rounded-[4px] border border-border bg-muted/20">
                      <span className="text-muted-foreground">Sensitive File Guard (Safety Guard)</span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-medium">Enforced (Protected)</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Findings & AI Fix Assistant UI */}
              <div className="lg:col-span-6 p-5 sm:p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                    AI Fix Interface
                  </div>
                  <div className="flex items-center gap-2 text-xs font-mono">
                    <span className="text-muted-foreground">server/auth.ts:18</span>
                  </div>
                </div>

                {/* Interactive Card Showing AI Explanation Before Fix */}
                <div className="rounded-[6px] border border-border bg-muted/15 p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono font-medium uppercase px-2 py-0.5 rounded-[3px] border border-orange-500/30 bg-orange-500/10 text-orange-500 dark:text-orange-400">
                      HIGH — Hardcoded Secret
                    </span>
                    <span className="text-[11px] font-mono text-muted-foreground">
                      Line 18
                    </span>
                  </div>

                  {/* Why this is a risk */}
                  <div className="space-y-1">
                    <span className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground block">
                      Why this is a risk
                    </span>
                    <p className="text-[13px] text-foreground leading-relaxed">
                      Hardcoded authentication tokens in source files are exposed to anyone
                      with repository access and cannot be rotated without code deployments.
                    </p>
                  </div>

                  {/* How the fix works */}
                  <div className="space-y-1">
                    <span className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground block">
                      How the fix works
                    </span>
                    <p className="text-[13px] text-muted-foreground leading-relaxed">
                      Replaces static token string with <code className="text-foreground font-mono bg-muted/40 px-1 py-0.5 rounded text-xs">process.env.SESSION_SECRET</code> and adds an explicit check during application bootstrap.
                    </p>
                  </div>

                  {/* Patch Diff */}
                  <div className="rounded-[4px] bg-background border border-border p-3 font-mono text-xs overflow-x-auto space-y-1">
                    <div className="text-red-500 dark:text-red-400">{"- const SECRET = \"EXAMPLE_HARDCODED_TOKEN_12345\";"}</div>
                    <div className="text-emerald-600 dark:text-emerald-400">{"+ const SECRET = process.env.SESSION_SECRET;"}</div>
                  </div>

                  {/* Action button */}
                  <div className="pt-2 flex items-center justify-between">
                    <button
                      type="button"
                      className="h-9 px-4 rounded-[6px] bg-primary text-primary-foreground text-xs font-semibold inline-flex items-center gap-2 hover:opacity-90 transition-opacity"
                    >
                      <Wrench className="w-3.5 h-3.5" />
                      Apply AI Fix
                    </button>
                    <span className="text-[11px] font-mono text-muted-foreground">
                      Verified by safety-guard.ts
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
