import React from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";

export function FinalCTASection() {
  return (
    <section className="py-20 md:py-28 border-t border-border">
      <div className="max-w-[1520px] mx-auto px-6 sm:px-10 lg:px-14 xl:px-16">
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.98 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: false, amount: 0.15 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          whileHover={{ y: -3, transition: { duration: 0.25 } }}
          className="rounded-[12px] border border-border bg-card p-10 sm:p-14 text-center max-w-4xl mx-auto flex flex-col items-center space-y-5 shadow-xs"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-muted/40 text-[11px] font-mono tracking-[0.16em] uppercase text-muted-foreground">
            READY TO DEPLOY
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-[42px] font-bold text-foreground tracking-tight leading-[1.15] max-w-2xl">
            Make every pull request easier to trust.
          </h2>
          <p className="text-[15px] sm:text-[17px] text-muted-foreground leading-relaxed max-w-xl">
            Add an autonomous AI-powered security layer to your development workflow. No configs required.
          </p>
          <div className="pt-2">
            <Link
              href="/auth"
              className="h-11 px-7 rounded-[6px] bg-primary text-primary-foreground font-semibold text-[14px] inline-flex items-center justify-center hover:opacity-90 transition-opacity duration-150 shadow-xs"
            >
              Get started now
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
