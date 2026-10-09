"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="w-10 h-10 rounded-full border border-border" />;
  }

  const handleToggle = async () => {
    const isDark = theme === "dark";
    const nextTheme = isDark ? "light" : "dark";

    if (!document.startViewTransition) {
      setTheme(nextTheme);
      return;
    }

    document.startViewTransition(() => {
      // Synchronously update the DOM so the View Transition captures it
      if (nextTheme === "dark") {
        document.documentElement.classList.add("dark");
        document.documentElement.style.colorScheme = "dark";
      } else {
        document.documentElement.classList.remove("dark");
        document.documentElement.style.colorScheme = "light";
      }
      setTheme(nextTheme);
    });
  };

  return (
    <Button
      variant="outline"
      className="group relative flex items-center justify-start overflow-hidden rounded-full border-border bg-transparent text-foreground hover:bg-secondary/50 transition-all duration-500 ease-out h-10 w-10 hover:w-[110px] px-0 hover:px-3 shadow-sm hover:shadow"
      onClick={handleToggle}
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center transition-transform duration-500 group-hover:rotate-[360deg]">
        <Sun className="absolute h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
        <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      </div>
      
      <span className="whitespace-nowrap font-medium text-sm tracking-wide opacity-0 -translate-x-4 transition-all duration-500 ease-out group-hover:opacity-100 group-hover:translate-x-1 pl-1">
        {theme === "dark" ? "Light" : "Dark"}
      </span>
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
