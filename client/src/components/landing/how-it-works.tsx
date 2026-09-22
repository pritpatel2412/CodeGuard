import React from "react";
import { motion } from "framer-motion";

export function HowItWorksSection() {
  const steps = [
    {
      number: "01",
      title: "Connect GitHub",
      description: "Grant repository access via GitHub OAuth with zero custom configuration files.",
    },
    {
      number: "02",
      title: "Open a pull request",
      description: "Push branches and open pull requests normally inside your current workflow.",
    },
    {
      number: "03",
      title: "CodeSift AI analyzes the changes",
      description: "Automated engine maps taint flows, checks policy rules, and evaluates risk.",
    },
    {
      number: "04",
      title: "Review findings",
      description: "Read contextual explanations, line-level diff annotations, and security scores.",
    },
    {
      number: "05",
      title: "Fix and merge",
      description: "Review the proposed fix, apply remediation, and merge clean code with confidence.",
    },
  ];

  return (
    <section id="how-it-works" className="py-20 md:py-28 border-t border-border">
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
              PROCESS
            </div>
            <h2 className="text-2xl sm:text-3xl font-semibold text-foreground tracking-tight leading-[1.25]">
              How it works
            </h2>
          </div>

          {/* Numbered Timeline Grid with Staggered Framer Motion */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-8 relative">
            {steps.map((step, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false, amount: 0.15 }}
                transition={{ duration: 0.5, delay: idx * 0.1, ease: [0.22, 1, 0.36, 1] }}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="relative space-y-3 pt-4 border-t border-border rounded-[6px] transition-colors hover:bg-card/40 p-2 -m-2"
              >
                <div className="text-sm font-mono text-primary font-bold">
                  {step.number}
                </div>
                <h3 className="text-[15px] font-medium text-foreground tracking-tight">
                  {step.title}
                </h3>
                <p className="text-[13px] text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
