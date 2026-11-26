/**
 * Formatting helpers for sizes, relative timestamps, durations, and contrast colors.
 */

export function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes < 0) return "0 B";
  if (bytes < 1024) return `${bytes} B`;
  const units = ["KB", "MB", "GB"] as const;
  let value = bytes / 1024;
  let unitIdx = 0;
  while (value >= 1024 && unitIdx < units.length - 1) {
    value /= 1024;
    unitIdx += 1;
  }
  return `${value.toFixed(value >= 10 ? 1 : 2)} ${units[unitIdx]}`;
}

export function formatDurationMs(ms?: number | null): string {
  if (ms === undefined || ms === null || !Number.isFinite(ms) || ms < 0) {
    return "";
  }
  if (ms < 1000) return `${Math.round(ms)} ms`;
  const seconds = ms / 1000;
  if (seconds < 60) return `${seconds.toFixed(1)} s`;
  const mins = Math.floor(seconds / 60);
  const remSec = Math.round(seconds % 60);
  return `${mins}m ${remSec}s`;
}

export function formatRelativeTimeEs(isoOrMs: string | number): string {
  const ts = typeof isoOrMs === "number" ? isoOrMs : Date.parse(isoOrMs);
  if (!Number.isFinite(ts)) return "";
  const diffSec = Math.max(0, Math.floor((Date.now() - ts) / 1000));
  if (diffSec < 45) return "hace un momento";
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `hace ${diffMin} min`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `hace ${diffHr} h`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay === 1) return "ayer";
  if (diffDay < 7) return `hace ${diffDay} días`;
  return new Date(ts).toLocaleDateString("es-PE", {
    day: "2-digit",
    month: "short",
  });
}

export function formatCountdownSeconds(expiresAtIso: string, nowMs: number): number {
  const exp = Date.parse(expiresAtIso);
  if (!Number.isFinite(exp)) return 0;
  return Math.max(0, Math.floor((exp - nowMs) / 1000));
}

export function formatMmSs(totalSeconds: number): string {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const mins = Math.floor(safe / 60);
  const secs = safe % 60;
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

/**
 * Computes readable foreground (#ffffff or #111827) for any hex background color.
 */
export function getContrastForeground(hexColor: string): string {
  const clean = hexColor.replace("#", "").trim();
  if (!/^[0-9a-fA-F]{6}$/.test(clean)) {
    return "#ffffff";
  }
  const r = parseInt(clean.slice(0, 2), 16) / 255;
  const g = parseInt(clean.slice(2, 4), 16) / 255;
  const b = parseInt(clean.slice(4, 6), 16) / 255;

  const toLinear = (c: number) =>
    c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);

  const lum = 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
  return lum > 0.38 ? "#111827" : "#ffffff";
}

export function formatToolArgsPreview(toolName: string, args: Record<string, unknown>): string {
  if (toolName === "bash" && typeof args.command === "string") {
    return args.command.trim();
  }
  if ((toolName === "read" || toolName === "write" || toolName === "edit") && typeof args.path === "string") {
    return args.path;
  }
  if (toolName === "grep" && typeof args.pattern === "string") {
    const scope = typeof args.path === "string" ? ` en ${args.path}` : "";
    return `/${args.pattern}/${scope}`;
  }
  if (toolName === "find" && typeof args.pattern === "string") {
    return args.pattern;
  }
  const keys = Object.keys(args);
  if (keys.length === 0) return "";
  try {
    const compact = JSON.stringify(args);
    return compact.length > 140 ? `${compact.slice(0, 137)}...` : compact;
  } catch {
    return keys.join(", ");
  }
}
