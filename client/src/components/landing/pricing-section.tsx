import React from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";

export function PricingSection() {
  const plans = [
    {
      name: "FREE",
      tagline: "For students and individual developers.",
      price: "$0",
      period: "forever",
      features: [
        "Public & personal repositories",
        "Automated pull request analysis",
        "Security vulnerability detection",
        "Basic taint analysis",
        "Community support",
      ],
      cta: "Get started",
      isHighlighted: false,
    },
    {
      name: "PRO",
      tagline: "For development teams.",
      price: "$29",
      period: "per user / month",
      features: [
        "Private repositories",
        "High-depth semantic AI review",
        "AI remediation with 1-click fixes",
        "Custom policy enforcement",
        "Cross-file taint tracking",
        "Priority queue processing",
      ],
      cta: "Get started",
      isHighlighted: true,
    },
    {
      name: "ENTERPRISE",
      tagline: "For organizations.",
      price: "Custom",
      period: "annual billing",
      features: [
        "Self-hosted / VPC deployment",
        "Custom compliance policies (SOC2, ASVS)",
        "Dedicated rate limits & SLA",
        "Single sign-on (SAML / SSO)",
        "Audit logging & enterprise support",
      ],
      cta: "Contact us",
      isHighlighted: false,
    },
  ];

  return (
    <section id="pricing" className="py-20 md:py-28 border-t border-border">
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
              PRICING
            </div>
            <h2 className="text-2xl sm:text-3xl font-semibold text-foreground tracking-tight leading-[1.25]">
              Simple, predictable pricing.
            </h2>
            <p className="text-[14.5px] text-muted-foreground mt-2 leading-relaxed">
              Transparent plans for developers and engineering teams.
            </p>
          </div>

          {/* 3 Columns with Staggered Framer Motion */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((plan, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false, amount: 0.15 }}
                transition={{ duration: 0.55, delay: idx * 0.12, ease: [0.22, 1, 0.36, 1] }}
                whileHover={{ y: -6, transition: { duration: 0.2 } }}
                className={`rounded-[8px] border bg-card p-6 sm:p-7 flex flex-col justify-between transition-shadow duration-150 shadow-xs ${
                  plan.isHighlighted
                    ? "border-primary/80 ring-1 ring-primary/40"
                    : "border-border"
                }`}
              >
                <div className="space-y-6">
                  <div>
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-mono uppercase tracking-wider text-foreground font-semibold">
                        {plan.name}
                      </h3>
                      {plan.isHighlighted && (
                        <span className="text-[11px] font-mono text-primary font-bold">
                          POPULAR
                        </span>
                      )}
                    </div>
                    <p className="text-[13px] text-muted-foreground mt-2">
                      {plan.tagline}
                    </p>
                  </div>

                  <div className="flex items-baseline gap-1.5 pt-2">
                    <span className="text-3xl sm:text-4xl font-semibold font-mono text-foreground">
                      {plan.price}
                    </span>
                    <span className="text-xs font-mono text-muted-foreground">
                      /{plan.period}
                    </span>
                  </div>

                  <div className="pt-4 border-t border-border space-y-2.5">
                    <span className="text-[11px] font-mono uppercase text-muted-foreground block mb-1">
                      Included
                    </span>
                    {plan.features.map((feat, fIdx) => (
                      <div
                        key={fIdx}
                        className="flex items-start gap-2.5 text-[13px] text-muted-foreground"
                      >
                        <span className="text-muted-foreground/60 font-mono select-none">—</span>
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-8">
                  {plan.name === "ENTERPRISE" ? (
                    <a
                      href="mailto:team@codesift.ai"
                      className="w-full h-10 rounded-[6px] border border-border text-foreground hover:bg-muted/40 text-[13.5px] font-medium flex items-center justify-center transition-colors"
                    >
                      {plan.cta}
                    </a>
                  ) : plan.isHighlighted ? (
                    <Link
                      href="/auth"
                      className="w-full h-10 rounded-[6px] bg-primary text-primary-foreground hover:opacity-90 text-[13.5px] font-semibold flex items-center justify-center transition-opacity shadow-xs"
                    >
                      {plan.cta}
                    </Link>
                  ) : (
                    <Link
                      href="/auth"
                      className="w-full h-10 rounded-[6px] border border-border text-foreground hover:bg-muted/40 text-[13.5px] font-medium flex items-center justify-center transition-colors"
                    >
                      {plan.cta}
                    </Link>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
