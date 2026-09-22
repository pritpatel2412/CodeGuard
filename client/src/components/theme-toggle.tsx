import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/hooks/use-theme";
import { motion, AnimatePresence } from "framer-motion";

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, cycleTheme } = useTheme();

  return (
    <Button
      size="icon"
      variant="ghost"
      onClick={(e) => cycleTheme(e)}
      className={`relative h-9 w-9 rounded-md border border-border/60 bg-card/60 hover:bg-accent/60 text-foreground transition-colors overflow-hidden ${className || ""}`}
      title={`Switch to ${theme === "dark" ? "Light" : "Dark"} mode`}
      data-testid="button-theme-toggle"
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={theme}
          initial={{ y: 10, opacity: 0, rotate: -30 }}
          animate={{ y: 0, opacity: 1, rotate: 0 }}
          exit={{ y: -10, opacity: 0, rotate: 30 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
          className="flex items-center justify-center"
        >
          {theme === "dark" ? (
            <Sun className="h-4 w-4 text-[#D4FF3F]" />
          ) : (
            <Moon className="h-4 w-4 text-foreground" />
          )}
        </motion.div>
      </AnimatePresence>
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
