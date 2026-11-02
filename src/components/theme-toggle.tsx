'use client'

import * as React from "react";
import { useTheme } from "next-themes";
import { motion, AnimatePresence } from "framer-motion";
import { Sun, Moon } from "lucide-react";
import { cn } from "@/lib/utils";

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
}

const emptySubscribe = () => () => {};

export function ThemeToggle({ className, showLabel = false }: ThemeToggleProps) {
  const { resolvedTheme, setTheme } = useTheme();
  const mounted = React.useSyncExternalStore(emptySubscribe, () => true, () => false);

  const isDark = resolvedTheme === "dark";

  const toggleTheme = () => {
    setTheme(isDark ? "light" : "dark");
  };

  if (!mounted) {
    return (
      <button
        type="button"
        aria-label="Basculer le mode lumière / sombre"
        className={cn(
          "relative inline-flex items-center justify-center h-9 w-9 rounded-full border border-border bg-card/60 text-muted-foreground transition-colors",
          showLabel && "w-auto px-3.5 gap-2.5",
          className
        )}
      >
        <span className="h-4 w-4 rounded-full bg-muted animate-pulse" />
        {showLabel && <span className="text-xs font-medium">Thème</span>}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? "Activer le mode lumière" : "Activer le mode sombre"}
      title={isDark ? "Passer en mode lumière (clair)" : "Passer en mode sombre (nuit)"}
      className={cn(
        "group relative inline-flex items-center justify-center h-9 w-9 rounded-full border border-border bg-card/90 hover:bg-secondary/80 hover:border-primary/50 text-foreground transition-all duration-200 hover:scale-[1.03] active:scale-95 shadow-xs hover:shadow-primary/10 cursor-pointer",
        showLabel && "w-auto px-3.5 gap-2.5",
        className
      )}
    >
      <div className="relative h-4 w-4 flex items-center justify-center shrink-0">
        <AnimatePresence mode="wait" initial={false}>
          {isDark ? (
            <motion.div
              key="dark-sun"
              initial={{ rotate: -90, scale: 0, opacity: 0 }}
              animate={{ rotate: 0, scale: 1, opacity: 1 }}
              exit={{ rotate: 90, scale: 0, opacity: 0 }}
              transition={{ type: "spring", stiffness: 320, damping: 20 }}
              className="text-amber-400"
            >
              <Sun className="h-4 w-4" />
            </motion.div>
          ) : (
            <motion.div
              key="light-moon"
              initial={{ rotate: 90, scale: 0, opacity: 0 }}
              animate={{ rotate: 0, scale: 1, opacity: 1 }}
              exit={{ rotate: -90, scale: 0, opacity: 0 }}
              transition={{ type: "spring", stiffness: 320, damping: 20 }}
              className="text-amber-600"
            >
              <Moon className="h-4 w-4" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {showLabel && (
        <span className="text-xs font-medium text-foreground/85 group-hover:text-foreground">
          {isDark ? "Mode lumière" : "Mode sombre"}
        </span>
      )}
    </button>
  );
}
