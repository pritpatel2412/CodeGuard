import React from "react";
import { motion } from "framer-motion";

export function SecurityWorkflowSection() {
  const flow = [
    { name: "GitHub PR", meta: "PR open / commit hook" },
    { name: "CodeSift AI", meta: "Automated gate check" },
    { name: "Code Analysis", meta: "AST & taint tracking" },
    { name: "Security Findings", meta: "Severity classification" },
    { name: "AI Explanation", meta: "Root cause rationale" },
    { name: "Suggested Fix", meta: "Verified code patch" },
    { name: "Developer Review", meta: "Engineer approval" },
    { name: "Merge", meta: "Protected trunk update" },
  ];

  return (
    <section id="security" className="py-20 md:py-28 border-t border-border">
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
              DEVSECOPS PIPELINE
            </div>
            <h2 className="text-2xl sm:text-3xl font-semibold text-foreground tracking-tight leading-[1.25]">
              Security workflow
            </h2>
            <p className="text-[14.5px] text-muted-foreground mt-2 leading-relaxed">
              A deterministic developer lifecycle from pull request creation to secure merge.
            </p>
          </div>

          {/* Visual Developer Workflow */}
          <motion.div
            whileHover={{ y: -3, transition: { duration: 0.25 } }}
            className="rounded-[8px] border border-border bg-card p-6 sm:p-8 shadow-xs"
          >
            {/* Desktop Flow (horizontal wrapped or 8-col grid) */}
            <div className="hidden lg:grid grid-cols-8 gap-2.5 items-center">
              {flow.map((step, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: false, amount: 0.15 }}
                  transition={{ duration: 0.45, delay: idx * 0.07, ease: [0.22, 1, 0.36, 1] }}
                  whileHover={{ y: -3, transition: { duration: 0.15 } }}
                  className="flex flex-col items-center text-center p-3 rounded-[6px] border border-border bg-muted/20 relative"
                >
                  <span className="text-[10px] font-mono text-muted-foreground mb-1">
                    0{idx + 1}
                  </span>
                  <span className={`text-[13px] font-medium tracking-tight ${idx === 1 || idx === 7 ? "text-primary font-semibold" : "text-foreground"}`}>
                    {step.name}
                  </span>
                  <span className="text-[10.5px] text-muted-foreground mt-1 font-mono leading-tight">
                    {step.meta}
                  </span>
                </motion.div>
              ))}
            </div>

            {/* Connected arrow row for Desktop */}
            <div className="hidden lg:flex items-center justify-between px-6 pt-3 text-muted-foreground">
              {flow.map((_, idx) => (
                <React.Fragment key={idx}>
                  <div className="flex-1 text-center font-mono text-xs">
                    {idx < flow.length - 1 ? "↓" : "✓"}
                  </div>
                </React.Fragment>
              ))}
            </div>

            {/* Mobile & Tablet Flow */}
            <div className="lg:hidden space-y-3">
              {flow.map((step, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 14 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: false, amount: 0.15 }}
                  transition={{ duration: 0.45, delay: idx * 0.06, ease: [0.22, 1, 0.36, 1] }}
                  className="flex flex-col items-center"
                >
                  <div className="w-full flex items-center justify-between p-3 rounded-[6px] border border-border bg-muted/20">
                    <div className="flex items-center gap-3">
                      <span className="text-[11px] font-mono text-muted-foreground">
                        0{idx + 1}
                      </span>
                      <span className={`text-[14px] font-medium ${idx === 1 || idx === 7 ? "text-primary font-semibold" : "text-foreground"}`}>
                        {step.name}
                      </span>
                    </div>
                    <span className="text-[11px] text-muted-foreground font-mono">
                      {step.meta}
                    </span>
                  </div>
                  {idx < flow.length - 1 && (
                    <div className="h-4 flex items-center text-muted-foreground font-mono text-xs">
                      ↓
                    </div>
                  )}
                </motion.div>
              ))}
            </div>

            {/* Workflow Summary Footer */}
            <div className="mt-8 pt-5 border-t border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-muted-foreground">
              <div className="flex items-center gap-2 font-mono">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>Full execution completes in &lt; 3 seconds per pull request</span>
              </div>
              <span className="font-mono text-muted-foreground">
                Zero persistent source-code storage • Ephemeral diff scanning
              </span>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

export const PipelineVisualizationSection = SecurityWorkflowSection;
