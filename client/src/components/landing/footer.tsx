import React from "react";
import { Link } from "wouter";
import { Shield } from "lucide-react";
import { motion } from "framer-motion";

export function LandingFooter() {
  return (
    <motion.footer
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: false, amount: 0.15 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="border-t border-border bg-background text-muted-foreground text-sm py-12"
    >
      <div className="max-w-[1520px] mx-auto px-6 sm:px-10 lg:px-14 xl:px-16">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-10">
          {/* Brand & Tagline */}
          <div className="space-y-2">
            <Link href="/" className="flex items-center gap-2 text-foreground group">
              <div className="w-6 h-6 rounded-[5px] bg-card border border-border flex items-center justify-center text-primary shadow-xs">
                <Shield className="w-3.5 h-3.5 stroke-[2.2]" />
              </div>
              <span className="font-semibold text-[15px] tracking-tight text-foreground">
                CodeSift AI
              </span>
            </Link>
            <p className="text-[13px] text-muted-foreground">
              AI-powered security for modern software development.
            </p>
          </div>

          {/* Links */}
          <div className="flex flex-wrap items-center gap-6 text-[13.5px]">
            <a href="#product" className="hover:text-foreground transition-colors">
              Product
            </a>
            <a href="#security" className="hover:text-foreground transition-colors">
              Security
            </a>
            <a href="#pricing" className="hover:text-foreground transition-colors">
              Pricing
            </a>
            <Link href="/how-to-use" className="hover:text-foreground transition-colors">
              Documentation
            </Link>
            <a
              href="https://github.com/pritpatel2412/CodeGuard"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground transition-colors"
            >
              GitHub
            </a>
          </div>
        </div>

        {/* Bottom divider & copyright */}
        <div className="pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} CodeSift AI. All rights reserved.</p>
          <div className="flex items-center gap-5">
            <Link href="/privacy" className="hover:text-foreground transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-foreground transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </motion.footer>
  );
}
