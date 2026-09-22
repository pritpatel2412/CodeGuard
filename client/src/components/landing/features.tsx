import React from "react";
import {
  Code2,
  ShieldAlert,
  GitBranch,
  Sliders,
  Wrench,
  BarChart3,
} from "lucide-react";
import { motion } from "framer-motion";

export function FeaturesSection() {
  const items = [
    {
      category: "AI CODE REVIEW",
      title: "Automated Pull Request Review",
      description:
        "Analyze changed code and identify security vulnerabilities and code-quality risks in seconds.",
      icon: Code2,
    },
    {
      category: "SECURITY ANALYSIS",
      title: "Vulnerability Pattern Detection",
      description:
        "Detect SQL injection, SSRF, hardcoded credentials, and dangerous execution sinks with high precision.",
      icon: ShieldAlert,
    },
    {
      category: "TAINT ANALYSIS",
      title: "Cross-Function Taint Tracking",
      description:
        "Trace untrusted, user-controlled inputs as they flow across boundaries into sensitive database calls.",
      icon: GitBranch,
    },
    {
      category: "POLICY ENFORCEMENT",
      title: "Custom Security Rules",
      description:
        "Apply repository-specific compliance requirements, restricted dependencies, and branch merge gates.",
      icon: Sliders,
    },
    {
      category: "AI REMEDIATION",
      title: "Assisted Patch Generation",
      description:
        "Understand exactly why each finding is a risk, review generated fixes, and remediate with confidence.",
      icon: Wrench,
    },
    {
      category: "SECURITY ANALYTICS",
      title: "Repository Posture Metrics",
      description:
        "Track aggregate posture scores, open risk counts, and resolution velocity across team reviews.",
      icon: BarChart3,
    },
  ];

  return (
    <section id="features" className="py-20 md:py-28 border-t border-border">
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
              CAPABILITIES
            </div>
            <h2 className="text-2xl sm:text-3xl font-semibold text-foreground tracking-tight leading-[1.25]">
              Engineered for security depth without review latency.
            </h2>
          </div>

          {/* Clean Editorial Grid with Staggered Framer Motion */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-12">
            {items.map((item, idx) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: false, amount: 0.15 }}
                  transition={{ duration: 0.5, delay: idx * 0.08, ease: [0.22, 1, 0.36, 1] }}
                  whileHover={{ y: -4, transition: { duration: 0.2 } }}
                  className="space-y-2.5 p-4 -m-4 rounded-[8px] transition-colors hover:bg-card/50"
                >
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Icon className="w-4 h-4 text-primary stroke-[2]" />
                    <span className="text-[11px] font-mono tracking-wider text-muted-foreground font-medium">
                      {item.category}
                    </span>
                  </div>
                  <h3 className="text-[15px] font-semibold text-foreground tracking-tight">
                    {item.title}
                  </h3>
                  <p className="text-[13.5px] text-muted-foreground leading-relaxed">
                    {item.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
