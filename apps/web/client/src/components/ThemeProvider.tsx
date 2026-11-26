import { useEffect, type ReactNode } from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { apiClient } from "@/lib/api";
import { getContrastForeground } from "@/lib/format";
import { useAppStore } from "@/store/useAppStore";

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const branding = useAppStore((s) => s.branding);
  const theme = useAppStore((s) => s.theme);
  const setBranding = useAppStore((s) => s.setBranding);

  useEffect(() => {
    let cancelled = false;
    apiClient
      .getBranding()
      .then((cfg) => {
        if (!cancelled) {
          setBranding(cfg);
        }
      })
      .catch(() => {
        // Keep default UNSA branding if backend branding endpoint is temporarily unreachable
      });
    return () => {
      cancelled = true;
    };
  }, [setBranding]);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [theme]);

  useEffect(() => {
    const root = document.documentElement;
    const primary = branding.primaryColor;
    const primaryFg = getContrastForeground(primary);
    const accent = branding.accentColor;
    const accentFg = getContrastForeground(accent);

    root.style.setProperty("--brand-primary", primary);
    root.style.setProperty("--brand-primary-foreground", primaryFg);
    root.style.setProperty("--brand-accent", accent);
    root.style.setProperty("--brand-accent-foreground", accentFg);
    root.style.setProperty("--primary", primary);
    root.style.setProperty("--primary-foreground", primaryFg);
    root.style.setProperty("--sidebar-primary", primary);
    root.style.setProperty("--sidebar-primary-foreground", primaryFg);
    root.style.setProperty("--ring", theme === "dark" ? accent : primary);

    document.title = branding.appName;
  }, [branding, theme]);

  return <TooltipProvider delayDuration={250}>{children}</TooltipProvider>;
}
