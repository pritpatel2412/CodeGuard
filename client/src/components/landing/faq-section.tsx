import React from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { motion } from "framer-motion";

export function FAQSection() {
  const faqs = [
    {
      q: "What is CodeSift AI?",
      a: "CodeSift AI is a DevSecOps platform built for developers. It automatically analyzes GitHub pull requests, flags vulnerabilities, identifies risky architectural changes, explains why issues exist, and suggests line-specific remediation.",
    },
    {
      q: "How does CodeSift AI analyze pull requests?",
      a: "When a pull request is opened or updated, CodeSift AI inspects the changed diff using AST parsing, cross-function taint analysis, and semantic AI models. It identifies data flows that reach sensitive sinks and checks repository-specific security policies.",
    },
    {
      q: "Does it work with GitHub?",
      a: "Yes. CodeSift AI is natively integrated with GitHub using standard OAuth and webhooks. It works directly in your pull requests without requiring changes to your git workflow or CI configuration.",
    },
    {
      q: "Can it explain security findings?",
      a: "Yes. Instead of cryptic rule codes, every finding includes an AI explanation detailing 'Why this is a risk' and 'How the fix works', helping developers understand the vulnerability's impact in plain technical terms.",
    },
    {
      q: "Can it help fix vulnerabilities?",
      a: "Yes. CodeSift AI provides assisted remediation. It drafts precise code fixes directly addressing the finding. You can review the changes and apply them with safety guards that prevent editing sensitive system files.",
    },
  ];

  return (
    <section id="faq" className="py-20 md:py-28 border-t border-border">
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
              QUESTIONS
            </div>
            <h2 className="text-2xl sm:text-3xl font-semibold text-foreground tracking-tight leading-[1.25]">
              Frequently asked questions
            </h2>
          </div>

          {/* 2-Column Accordion Layout Utilizing Left & Right Space */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 items-start">
            {/* Left Column */}
            <div className="space-y-4">
              <Accordion type="single" collapsible className="space-y-4">
                {faqs.slice(0, 3).map((faq, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: false, amount: 0.15 }}
                    transition={{ duration: 0.45, delay: idx * 0.08, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <AccordionItem
                      value={`item-left-${idx}`}
                      className="rounded-[8px] border border-border bg-card px-5 py-0.5 border-b shadow-xs transition-colors hover:border-border/80"
                    >
                      <AccordionTrigger className="text-left text-[14.5px] font-medium text-foreground hover:text-primary py-4 transition-colors">
                        {faq.q}
                      </AccordionTrigger>
                      <AccordionContent className="text-[13.5px] text-muted-foreground leading-relaxed pb-4 pt-1">
                        {faq.a}
                      </AccordionContent>
                    </AccordionItem>
                  </motion.div>
                ))}
              </Accordion>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              <Accordion type="single" collapsible className="space-y-4">
                {faqs.slice(3).map((faq, idx) => (
                  <motion.div
                    key={idx + 3}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: false, amount: 0.15 }}
                    transition={{ duration: 0.45, delay: (idx + 3) * 0.08, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <AccordionItem
                      value={`item-right-${idx}`}
                      className="rounded-[8px] border border-border bg-card px-5 py-0.5 border-b shadow-xs transition-colors hover:border-border/80"
                    >
                      <AccordionTrigger className="text-left text-[14.5px] font-medium text-foreground hover:text-primary py-4 transition-colors">
                        {faq.q}
                      </AccordionTrigger>
                      <AccordionContent className="text-[13.5px] text-muted-foreground leading-relaxed pb-4 pt-1">
                        {faq.a}
                      </AccordionContent>
                    </AccordionItem>
                  </motion.div>
                ))}
              </Accordion>

              {/* Help & Contact Card */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false, amount: 0.15 }}
                transition={{ duration: 0.45, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className="rounded-[8px] border border-dashed border-border p-5 bg-muted/20 flex items-center justify-between gap-4"
              >
                <div>
                  <div className="text-xs font-semibold text-foreground">Have a specific security question?</div>
                  <div className="text-xs text-muted-foreground mt-0.5">Our DevSecOps engineering team is here to assist.</div>
                </div>
                <a
                  href="mailto:support@codesift.ai"
                  className="shrink-0 text-xs font-mono font-medium px-3.5 py-1.5 rounded-[4px] border border-border bg-card hover:bg-muted/40 text-foreground transition-colors"
                >
                  Contact team →
                </a>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
