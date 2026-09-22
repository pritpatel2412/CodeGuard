import React from "react";
import { motion } from "framer-motion";

export function ProblemSolutionSection() {
  return (
    <section className="py-20 md:py-28 border-t border-border">
      <div className="max-w-[1520px] mx-auto px-6 sm:px-10 lg:px-14 xl:px-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          {/* LEFT: Problem (Slide from Left) */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: false, amount: 0.2 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-5 space-y-4"
          >
            <div className="text-[11px] font-mono tracking-[0.16em] uppercase text-muted-foreground">
              THE PROBLEM
            </div>
            <h2 className="text-2xl sm:text-3xl font-semibold text-foreground tracking-tight leading-[1.25]">
              Code review doesn’t always catch security risk.
            </h2>
            <p className="text-[15px] text-muted-foreground leading-[1.65]">
              Manual pull request reviews prioritize business logic, code style,
              and fast turnaround. Subtler security flaws—like indirect taint flows,
              unparameterized queries, and leaky dependencies—frequently pass review unnoticed.
            </p>
          </motion.div>

          {/* RIGHT: Solution (Slide from Right) */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: false, amount: 0.2 }}
            transition={{ duration: 0.6, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-7 space-y-6 lg:pl-8 border-t lg:border-t-0 lg:border-l border-border pt-8 lg:pt-0"
          >
            <div className="text-[11px] font-mono tracking-[0.16em] uppercase text-muted-foreground">
              THE SOLUTION
            </div>
            <p className="text-xl sm:text-2xl font-medium text-foreground tracking-tight leading-[1.3]">
              CodeSift AI adds an automated security layer to your existing pull request workflow.
            </p>
            <div className="space-y-4 pt-2 text-[14px] text-muted-foreground">
              <div className="flex items-start gap-3">
                <span className="text-primary font-mono text-sm leading-none pt-0.5 font-bold">—</span>
                <p className="leading-relaxed">
                  <strong className="text-foreground font-medium">Continuous deep analysis:</strong>{" "}
                  Inspects every changed line and dependency before pull requests merge into main branches.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-primary font-mono text-sm leading-none pt-0.5 font-bold">—</span>
                <p className="leading-relaxed">
                  <strong className="text-foreground font-medium">Deterministic rules + semantic intelligence:</strong>{" "}
                  Combines syntax taint analysis with contextual AI explanations to eliminate noisy alerts.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-primary font-mono text-sm leading-none pt-0.5 font-bold">—</span>
                <p className="leading-relaxed">
                  <strong className="text-foreground font-medium">Remediation in context:</strong>{" "}
                  Provides line-specific fixes directly in GitHub comments with full architectural explanation.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
