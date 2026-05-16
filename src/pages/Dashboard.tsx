import { useMemo } from "react";
import { useCgo } from "@/state/CgoContext";
import { isOnAgenda, isOperationTerminal, isVisibleOnRadar } from "@/domain/radarRules";
import { Link } from "react-router-dom";

export default function Dashboard() {
  const { dbView, now } = useCgo();

  const stats = useMemo(() => {
    const ops = dbView.operationInstances.filter((o) => !isOperationTerminal(o));
    const onRadar = ops.filter((o) => isVisibleOnRadar(o, now));
    const g = onRadar.filter((o) => o.traffic === "verde").length;
    const y = onRadar.filter((o) => o.traffic === "amarelo").length;
    const r = onRadar.filter((o) => o.traffic === "vermelho").length;
    const crit = onRadar.filter((o) => o.priority === "critica").length;
    const t24 = now.getTime() + 24 * 3600000;
    const enteringSoon = dbView.operationInstances.filter((o) => {
      if (isOperationTerminal(o)) return false;
      const re = new Date(o.radarEntryAt).getTime();
      return re > now.getTime() && re <= t24;
    }).length;
    return { total: onRadar.length, g, y, r, crit, enteringSoon, agenda: ops.filter((o) => isOnAgenda(o, now)).length };
  }, [dbView, now]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-white">Dashboard CGO</h1>
        <p className="text-cgo-muted text-sm mt-1">
          Visão rápida do Radar simulado e da agenda. Use +6h / +24h no menu para testar entrada automática no Radar.
        </p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        <Stat label="Em Radar" value={stats.total} />
        <Stat label="Verde" value={stats.g} tone="good" />
        <Stat label="Amarelo" value={stats.y} tone="warn" />
        <Stat label="Vermelho" value={stats.r} tone="bad" />
        <Stat label="Críticas" value={stats.crit} tone="bad" />
        <Stat label="Entram 24h" value={stats.enteringSoon} />
        <Stat label="Agenda" value={stats.agenda} />
      </div>
      <div className="flex gap-3">
        <Link
          to="/radar"
          className="inline-flex items-center rounded-md bg-cgo-accent px-4 py-2 text-sm font-medium text-white hover:bg-blue-600"
        >
          Abrir Radar CGO
        </Link>
        <Link
          to="/programadas"
          className="inline-flex items-center rounded-md border border-cgo-border px-4 py-2 text-sm text-slate-200 hover:bg-white/5"
        >
          Operações programadas
        </Link>
      </div>
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: number; tone?: "good" | "warn" | "bad" }) {
  const c =
    tone === "good"
      ? "text-cgo-good"
      : tone === "warn"
        ? "text-cgo-warn"
        : tone === "bad"
          ? "text-cgo-bad"
          : "text-white";
  return (
    <div className="rounded-lg border border-cgo-border bg-cgo-panel p-3">
      <div className="text-xs text-cgo-muted">{label}</div>
      <div className={`text-2xl font-semibold ${c}`}>{value}</div>
    </div>
  );
}
