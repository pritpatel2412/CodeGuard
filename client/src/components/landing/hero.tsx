import React from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";

export function HeroSection() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.05,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 22 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.55,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  };

  return (
    <section className="pt-24 pb-16 md:pt-32 md:pb-24 overflow-hidden">
      <div className="max-w-[1520px] mx-auto px-6 sm:px-10 lg:px-14 xl:px-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 xl:gap-14 items-center">
          {/* Left Column: Copy + CTAs + Trust Metrics (Uses Left Space) */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, amount: 0.15 }}
            className="lg:col-span-5 xl:col-span-5 flex flex-col justify-center space-y-6"
          >
            {/* Eyebrow */}
            <motion.div
              variants={itemVariants}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-card text-[11px] font-mono tracking-[0.16em] uppercase text-muted-foreground w-fit shadow-xs"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-primary" />
              AI-POWERED CODE SECURITY
            </motion.div>

            {/* Main Heading */}
            <motion.h1
              variants={itemVariants}
              className="text-4xl sm:text-5xl xl:text-[54px] font-bold tracking-tight text-foreground leading-[1.12]"
            >
              Ship secure code with less friction.
            </motion.h1>

            {/* Supporting Text */}
            <motion.p
              variants={itemVariants}
              className="text-[16px] sm:text-[17px] text-muted-foreground leading-[1.65]"
            >
              CodeSift AI reviews your pull requests for security vulnerabilities,
              risky changes, and code-quality issues — then helps your team
              understand and fix them directly in GitHub.
            </motion.p>

            {/* Action Buttons */}
            <motion.div variants={itemVariants} className="flex flex-wrap items-center gap-3.5 pt-1">
              <Link
                href="/auth"
                className="h-11 px-6 rounded-[6px] bg-primary text-primary-foreground font-semibold text-[14px] inline-flex items-center justify-center hover:opacity-90 transition-opacity duration-150 shadow-xs"
              >
                Get started
              </Link>
              <a
                href="#demo"
                className="h-11 px-6 rounded-[6px] border border-border text-foreground hover:bg-card/70 font-normal text-[14px] inline-flex items-center justify-center transition-colors duration-150"
              >
                View demo
              </a>
            </motion.div>

            {/* Live Security Metrics (Fills and Balances Left Column) */}
            <motion.div
              variants={itemVariants}
              className="pt-6 border-t border-border grid grid-cols-3 gap-4 text-left"
            >
              <div>
                <div className="text-xl sm:text-2xl font-bold font-mono text-foreground">&lt; 3s</div>
                <div className="text-[11px] text-muted-foreground mt-0.5">Scan latency</div>
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-bold font-mono text-foreground">OWASP</div>
                <div className="text-[11px] text-muted-foreground mt-0.5">A01-A10 coverage</div>
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-bold font-mono text-foreground">0%</div>
                <div className="text-[11px] text-muted-foreground mt-0.5">Code retention</div>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Column: Live Interactive PR Preview Window (Uses Right Space) */}
          <motion.div
            initial={{ opacity: 0, x: 30, scale: 0.98 }}
            whileInView={{ opacity: 1, x: 0, scale: 1 }}
            viewport={{ once: false, amount: 0.15 }}
            transition={{ duration: 0.65, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            whileHover={{ y: -4, transition: { duration: 0.25 } }}
            className="lg:col-span-7 xl:col-span-7"
            id="demo"
          >
            <div className="rounded-[8px] border border-border bg-card overflow-hidden shadow-xs">
              {/* Window Header */}
              <div className="px-4 py-3 border-b border-border flex items-center justify-between bg-muted/40">
                <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground">
                  <span className="inline-block w-2.5 h-2.5 rounded-full bg-border" />
                  <span>CodeSift AI</span>
                  <span className="text-muted-foreground/60">/</span>
                  <span>my-project</span>
                  <span className="text-muted-foreground/60">/</span>
                  <span className="text-foreground font-medium">Pull Request #42</span>
                </div>
                <div className="flex items-center gap-3 text-[12px] font-mono text-muted-foreground">
                  <span>branch: feature/auth-v2</span>
                  <span className="hidden sm:inline text-emerald-500 font-medium">
                    ● live
                  </span>
                </div>
              </div>

              {/* Score & Metric Bar */}
              <div className="p-4 sm:p-5 border-b border-border bg-card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="text-xs uppercase tracking-wider text-muted-foreground font-mono mb-1">
                    Security score
                  </div>
                  <div className="text-2xl sm:text-3xl font-bold font-mono text-foreground flex items-baseline gap-1">
                    82<span className="text-sm font-normal text-muted-foreground">/100</span>
                  </div>
                </div>

                {/* Severity Breakdown Badges */}
                <div className="flex flex-wrap items-center gap-2.5 text-xs font-mono">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[4px] border border-red-500/30 bg-red-500/10 text-red-500 dark:text-red-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                    2 Critical
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[4px] border border-orange-500/30 bg-orange-500/10 text-orange-500 dark:text-orange-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                    4 High
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[4px] border border-amber-500/30 bg-amber-500/10 text-amber-500 dark:text-amber-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                    7 Medium
                  </span>
                </div>
              </div>

              {/* Two-Column Tool Content: Findings & AI Summary */}
              <div className="grid grid-cols-1 md:grid-cols-12 divide-y md:divide-y-0 md:divide-x divide-border">
                {/* Findings Column */}
                <div className="md:col-span-7 p-4 sm:p-5 space-y-3.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                      Findings
                    </span>
                    <span className="text-xs text-muted-foreground font-mono">1 of 13 showing</span>
                  </div>

                  <div className="rounded-[6px] border border-border bg-muted/20 p-3.5 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-mono font-medium uppercase px-2 py-0.5 rounded-[3px] border border-orange-500/30 bg-orange-500/10 text-orange-500 dark:text-orange-400">
                        HIGH
                      </span>
                      <span className="text-xs font-mono text-muted-foreground">
                        src/database/users.ts:42
                      </span>
                    </div>

                    <div>
                      <h4 className="text-[14px] font-semibold text-foreground mb-0.5">
                        SQL Injection
                      </h4>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        User-controlled input reaches a database query without parameterization.
                      </p>
                    </div>

                    {/* Diff Snippet */}
                    <div className="rounded-[4px] bg-background border border-border p-2.5 font-mono text-[11.5px] overflow-x-auto space-y-1">
                      <div className="text-red-500 dark:text-red-400">{"- const query = `SELECT * FROM users WHERE id = ${userId}`;"}</div>
                      <div className="text-emerald-600 dark:text-emerald-400">{"+ const query = 'SELECT * FROM users WHERE id = $1'; [userId]"}</div>
                    </div>

                    <div className="pt-1 flex items-center justify-between">
                      <a
                        href="/auth"
                        className="text-xs font-mono text-primary hover:underline inline-flex items-center gap-1 font-semibold"
                      >
                        [View finding]
                      </a>
                      <span className="text-[11px] text-muted-foreground">CWE-89 • OWASP A03</span>
                    </div>
                  </div>
                </div>

                {/* AI Summary Column */}
                <div className="md:col-span-5 p-4 sm:p-5 space-y-3.5 bg-muted/10">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                      AI Summary
                    </span>
                    <span className="text-xs text-emerald-600 dark:text-emerald-400 font-mono font-medium">Ready</span>
                  </div>

                  <div className="space-y-2 text-xs text-muted-foreground leading-relaxed">
                    <p>
                      This pull request introduces several security risks that should be addressed before merging.
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      Primary concerns include raw string interpolation in query builders.
                    </p>
                  </div>

                  <div className="pt-1">
                    <a
                      href="/auth"
                      className="text-xs font-mono text-primary hover:underline inline-flex items-center gap-1 font-semibold"
                    >
                      [View full analysis]
                    </a>
                  </div>

                  {/* Policy Status Box */}
                  <div className="mt-3 pt-3 border-t border-border space-y-1.5 text-xs font-mono">
                    <div className="text-[10.5px] uppercase tracking-wider text-muted-foreground">
                      Policy Check
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground text-[11px]">OWASP Top 10</span>
                      <span className="text-orange-500 dark:text-orange-400 font-medium text-[11px]">High Risk</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground text-[11px]">Sensitive Files</span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-medium text-[11px]">Protected</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
