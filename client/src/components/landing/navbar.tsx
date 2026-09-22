import React, { useState, useEffect } from "react";
import { Link } from "wouter";
import { Menu, X, Shield } from "lucide-react";
import { motion } from "framer-motion";
import { ThemeToggle } from "@/components/theme-toggle";

export function LandingNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.header
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-200 ${
        scrolled
          ? "bg-background/95 backdrop-blur-md border-b border-border shadow-xs"
          : "bg-background/80 backdrop-blur-xs border-b border-border/50"
      }`}
    >
      <div className="max-w-[1520px] mx-auto px-6 sm:px-10 lg:px-14 xl:px-16 h-16 flex items-center justify-between">
        {/* Left: Simple text / logo mark */}
        <Link href="/" className="flex items-center gap-2.5 text-foreground hover:opacity-90 cursor-pointer group">
          <div className="w-7 h-7 rounded-[6px] bg-card border border-border flex items-center justify-center text-primary shadow-xs">
            <Shield className="w-4 h-4 stroke-[2.2]" />
          </div>
          <span className="font-semibold text-[16px] tracking-tight text-foreground">
            CodeSift AI
          </span>
        </Link>

        {/* Center: Minimal Navigation */}
        <nav className="hidden md:flex items-center gap-8 text-[14px] font-normal text-muted-foreground">
          <a href="#product" className="hover:text-foreground transition-colors duration-150">
            Product
          </a>
          <a href="#how-it-works" className="hover:text-foreground transition-colors duration-150">
            How it works
          </a>
          <a href="#security" className="hover:text-foreground transition-colors duration-150">
            Security
          </a>
          <a href="#pricing" className="hover:text-foreground transition-colors duration-150">
            Pricing
          </a>
        </nav>

        {/* Right: Theme Toggle, Sign in & Get started */}
        <div className="hidden md:flex items-center gap-3">
          <ThemeToggle />
          <Link
            href="/auth"
            className="text-[13.5px] text-muted-foreground hover:text-foreground transition-colors duration-150 px-2"
          >
            Sign in
          </Link>
          <Link
            href="/auth"
            className="h-[36px] px-4 rounded-[6px] bg-primary text-primary-foreground text-[13px] font-semibold inline-flex items-center justify-center hover:opacity-90 transition-opacity duration-150 shadow-xs"
          >
            Get started
          </Link>
        </div>

        {/* Mobile menu toggle */}
        <div className="flex md:hidden items-center gap-2">
          <ThemeToggle />
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 text-muted-foreground hover:text-foreground focus:outline-none"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-background border-b border-border px-6 py-4 space-y-3">
          <nav className="flex flex-col space-y-2.5 text-[14px] text-muted-foreground">
            <a
              href="#product"
              onClick={() => setMobileMenuOpen(false)}
              className="hover:text-foreground py-1 transition-colors"
            >
              Product
            </a>
            <a
              href="#how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="hover:text-foreground py-1 transition-colors"
            >
              How it works
            </a>
            <a
              href="#security"
              onClick={() => setMobileMenuOpen(false)}
              className="hover:text-foreground py-1 transition-colors"
            >
              Security
            </a>
            <a
              href="#pricing"
              onClick={() => setMobileMenuOpen(false)}
              className="hover:text-foreground py-1 transition-colors"
            >
              Pricing
            </a>
          </nav>
          <div className="pt-3 border-t border-border flex flex-col gap-2">
            <Link
              href="/auth"
              className="w-full h-10 flex items-center justify-center text-[13.5px] text-muted-foreground hover:text-foreground rounded-[6px] border border-border bg-card"
            >
              Sign in
            </Link>
            <Link
              href="/auth"
              className="w-full h-10 flex items-center justify-center text-[13.5px] font-semibold bg-primary text-primary-foreground rounded-[6px]"
            >
              Get started
            </Link>
          </div>
        </div>
      )}
    </motion.header>
  );
}
