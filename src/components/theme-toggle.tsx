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
        aria-label="Basculer le mode sombre/clair"
        className={cn(
          "relative inline-flex items-center justify-center h-9 w-9 rounded-full border border-border bg-card/60 text-muted-foreground transition-colors",
          showLabel && "w-auto px-3 gap-2",
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
      aria-label={isDark ? "Activer le mode clair" : "Activer le mode sombre"}
      title={isDark ? "Passer en mode lumière" : "Passer en mode sombre"}
      className={cn(
        "group relative inline-flex items-center justify-center h-9 w-9 rounded-full border border-border bg-card/80 hover:bg-secondary hover:border-primary/50 text-foreground transition-all duration-300 hover:scale-105 active:scale-95 shadow-sm hover:shadow-primary/10",
        showLabel && "w-auto px-3.5 gap-2.5",
        className
      )}
    >
      <div className="relative h-4 w-4 flex items-center justify-center">
        <AnimatePresence mode="wait" initial={false}>
          {isDark ? (
            <motion.div
              key="dark"
              initial={{ rotate: -90, scale: 0, opacity: 0 }}
              animate={{ rotate: 0, scale: 1, opacity: 1 }}
              exit={{ rotate: 90, scale: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="text-amber-400"
            >
              <Sun className="h-4 w-4" />
            </motion.div>
          ) : (
            <motion.div
              key="light"
              initial={{ rotate: 90, scale: 0, opacity: 0 }}
              animate={{ rotate: 0, scale: 1, opacity: 1 }}
              exit={{ rotate: -90, scale: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="text-amber-600"
            >
              <Moon className="h-4 w-4" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {showLabel && (
        <span className="text-xs font-medium text-foreground/80 group-hover:text-foreground">
          {isDark ? "Mode clair" : "Mode sombre"}
        </span>
      )}
    </button>
  );
}
