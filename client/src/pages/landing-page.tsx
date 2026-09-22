import React from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { LandingNavbar } from "@/components/landing/navbar";
import { HeroSection } from "@/components/landing/hero";
import { ProblemSolutionSection } from "@/components/landing/problem-solution";
import { FeaturesSection } from "@/components/landing/features";
import { HowItWorksSection } from "@/components/landing/how-it-works";
import { SecurityWorkflowSection } from "@/components/landing/pipeline-visualization";
import { ProductShowcaseSection } from "@/components/landing/product-showcase";
import { PricingSection } from "@/components/landing/pricing-section";
import { FAQSection } from "@/components/landing/faq-section";
import { FinalCTASection } from "@/components/landing/final-cta";
import { LandingFooter } from "@/components/landing/footer";

export default function LandingPage() {
  const [location] = useLocation();

  return (
    <motion.div
      key={`landing-page-${location}`}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="min-h-screen bg-background text-foreground font-['Inter',sans-serif] selection:bg-primary/20 selection:text-primary overflow-x-hidden transition-colors duration-200"
    >
      <LandingNavbar />
      <main>
        {/* 1 & 2: Hero and Product Preview */}
        <HeroSection />

        {/* 4: Problem / Solution */}
        <ProblemSolutionSection />

        {/* 5: Features */}
        <FeaturesSection />

        {/* 6: How It Works */}
        <HowItWorksSection />

        {/* 7: Security Workflow */}
        <SecurityWorkflowSection />

        {/* 8: Product Interface Showcase */}
        <ProductShowcaseSection />

        {/* 9: Pricing */}
        <PricingSection />

        {/* 10: FAQ */}
        <FAQSection />

        {/* 11: Final CTA */}
        <FinalCTASection />
      </main>
      {/* 12: Footer */}
      <LandingFooter />
    </motion.div>
  );
}
