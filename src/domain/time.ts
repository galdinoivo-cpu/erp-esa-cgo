import type { Duration, TimeUnit } from "@/types";

const unitMs: Record<TimeUnit, number> = {
  minutes: 60_000,
  hours: 3_600_000,
  days: 86_400_000,
};

export function durationToMs(d: Duration): number {
  return d.value * unitMs[d.unit];
}

export function addMs(iso: string, ms: number): string {
  return new Date(new Date(iso).getTime() + ms).toISOString();
}

export function subtractDuration(iso: string, d: Duration): string {
  return addMs(iso, -durationToMs(d));
}

export function formatRemaining(targetIso: string, now: Date): string {
  const t = new Date(targetIso).getTime() - now.getTime();
  if (t <= 0) return "estourado";
  const h = Math.floor(t / 3_600_000);
  const m = Math.floor((t % 3_600_000) / 60_000);
  if (h >= 48) {
    const d = Math.floor(h / 24);
    return `${d}d ${h % 24}h`;
  }
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

export function formatDateTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  });
}
