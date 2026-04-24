import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface PremiumAvatarProps {
  src?: string;
  name?: string;
  tier?: "standard" | "premium" | "verified" | "aura";
  isStory?: boolean;
  isSeen?: boolean;
  role?: string;
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  accentColor?: string;
}

const dicebear = (seed: string) =>
  `https://api.dicebear.com/7.x/lorelei/svg?seed=${seed}`;

const sizes = {
  sm: "h-8 w-8 p-[1.5px]",
  md: "h-10 w-10 p-[2px]",
  lg: "h-16 w-16 p-[2.5px]",
  xl: "h-24 w-24 p-[3px]",
};

import { useTheme } from "@/hooks/use-theme";

export function PremiumAvatar({
  src,
  name,
  tier = "standard",
  isStory = false,
  isSeen = false,
  role,
  className,
  size = "md",
  accentColor: manualAccentColor,
}: PremiumAvatarProps) {
  const { theme } = useTheme();

  // Unified CodeGuard Pink accent for all themes
  const accentColor = manualAccentColor || "#ec4899";

  // Use provided src if available, otherwise fallback to dicebear
  const avatarSrc = src || dicebear(name || "User");
  const isPremium = tier === "premium";
  const isVerified = tier === "verified" || tier === "premium" || tier === "aura";
  const isAura = tier === "aura";

  // Premium / Verified / Aura Styles
  const ringBg = isAura
    ? `linear-gradient(45deg, ${accentColor}, #ff00ff, ${accentColor})`
    : isPremium
    ? "linear-gradient(135deg, #f59e0b, #fbbf24, #f97316, #d97706)"
    : isStory && !isSeen
    ? `conic-gradient(from 0deg, #f97316, #ec4899, ${accentColor}, #06b6d4, #f97316)`
    : isVerified
    ? `linear-gradient(135deg, ${accentColor}, ${accentColor}cc, ${accentColor}80)`
    : "transparent";

  const ringGlow = isAura
    ? `0 0 20px 4px ${accentColor}66, 0 0 40px 8px ${accentColor}33`
    : isPremium
    ? "0 0 12px 2px rgba(245,158,11,0.3)"
    : isVerified
    ? `0 0 10px 1px ${accentColor}33`
    : "none";

  return (
    <motion.div 
      className={cn("relative flex flex-col items-center", className)}
      animate={isAura ? {
        scale: [1, 1.02, 1],
        filter: [
          `drop-shadow(0 0 10px ${accentColor}33)`,
          `drop-shadow(0 0 20px ${accentColor}66)`,
          `drop-shadow(0 0 10px ${accentColor}33)`,
        ]
      } : {}}
      transition={isAura ? {
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut"
      } : {}}
    >
      <div
        className={cn("rounded-full flex items-center justify-center transition-all duration-300", sizes[size])}
        style={{
          background: ringBg,
          boxShadow: ringGlow,
        }}
      >
        <div className={cn(
          "h-full w-full overflow-hidden rounded-full border-2 border-background transition-colors duration-300",
          isAura 
            ? (theme === 'light' ? "bg-slate-100" : "bg-black") 
            : "bg-card"
        )}>
          <img
            src={avatarSrc}
            alt={name || "Avatar"}
            className="h-full w-full object-cover transition-transform duration-300 hover:scale-110"
          />
        </div>
      </div>

      {/* Verified Badge */}
      {isVerified && (
        <div
          className={cn(
            "absolute bottom-0 right-0 flex items-center justify-center rounded-full border-2 border-background shadow-lg",
            size === "sm" ? "h-3 w-3" : size === "md" ? "h-4 w-4" : "h-6 w-6",
            isPremium ? "bg-amber-500" : "bg-primary"
          )}
          style={{ background: isPremium ? undefined : accentColor }}
        >
          <svg
            width={size === "sm" ? "6" : "8"}
            height={size === "sm" ? "6" : "8"}
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
      )}

      {/* Role Tag (only for lg/xl) */}
      {role && (size === "lg" || size === "xl") && (
        <span className="mt-2 text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-full border border-border/50">
          {role}
        </span>
      )}
    </motion.div>
  );
}
