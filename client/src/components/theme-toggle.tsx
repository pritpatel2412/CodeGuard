import { Moon, Sun, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/hooks/use-theme";
import { motion, AnimatePresence } from "framer-motion";

export function ThemeToggle() {
  const { theme, cycleTheme } = useTheme();

  return (
    <Button
      size="icon"
      variant="ghost"
      onClick={(e) => cycleTheme(e)}
      className="relative h-10 w-10 rounded-full border border-border/40 bg-background/50 hover:bg-accent/50 transition-all duration-300 overflow-hidden"
      data-testid="button-theme-toggle"
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={theme}
          initial={{ y: 20, rotate: -90, opacity: 0 }}
          animate={{ y: 0, rotate: 0, opacity: 1 }}
          exit={{ y: -20, rotate: 90, opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="flex items-center justify-center"
        >
          {theme === "light" && <Sun className="h-5 w-5" />}
          {theme === "dark" && <Moon className="h-5 w-5" />}
          {theme === "midnight" && <Sparkles className="h-5 w-5" />}
        </motion.div>
      </AnimatePresence>
      <span className="sr-only">Cycle Theme</span>
    </Button>
  );
}
