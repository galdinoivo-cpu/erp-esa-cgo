import { useMemo } from "react";
import { Link } from "react-router-dom";
import { Radar, HelpCircle } from "lucide-react";
import { useCgo } from "@/state/CgoContext";
import { CGO_DASHBOARD_CARDS } from "@/domain/cgoDashboardCards";
import { computeCgoDashboardCounts } from "@/domain/cgoDashboardMetrics";
import CgoDashboardCard from "@/components/cgo/CgoDashboardCard";

export default function Dashboard() {
  const { dbView, now } = useCgo();

  const counts = useMemo(() => computeCgoDashboardCounts(dbView, now), [dbView, now]);

  return (
    <div className="space-y-8">
      <header className="rounded-xl border border-cgo-border bg-gradient-to-br from-cgo-panel to-cgo-bg/80 p-6">
        <p className="text-xs uppercase tracking-[0.25em] text-cgo-accent">Radar Operacional CGO</p>
        <h1 className="text-2xl font-semibold text-white mt-2">Dashboard CGO</h1>
        <p className="text-sm text-cgo-muted mt-3 max-w-3xl leading-relaxed">
          A CGO monitora continuamente as operações em andamento, planejadas, em alerta, emergenciais e bloqueadas,
          além de tarefas atrasadas, pendências nos COLRs, manutenção crítica, laudos pendentes e bloqueios financeiros
          que possam impedir o avanço das OSFs, OPs e OCEs.
        </p>
        <div className="flex flex-wrap gap-3 mt-5">
          <Link
            to="/cgo/radar"
            className="inline-flex items-center gap-2 rounded-lg bg-cgo-accent px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-600"
          >
            <Radar className="w-4 h-4" />
            Abrir Radar CGO
          </Link>
          <Link
            to="/cgo/help"
            className="inline-flex items-center gap-2 rounded-lg border border-cgo-border px-4 py-2.5 text-sm text-slate-200 hover:bg-white/5"
          >
            <HelpCircle className="w-4 h-4" />
            Ajuda CGO
          </Link>
          <Link
            to="/cgo/programadas"
            className="inline-flex items-center rounded-lg border border-cgo-border px-4 py-2.5 text-sm text-slate-200 hover:bg-white/5"
          >
            Operações programadas
          </Link>
        </div>
      </header>

      <section>
        <div className="flex items-center justify-between gap-2 mb-4">
          <h2 className="text-lg font-medium text-white">Indicadores do Radar</h2>
          <p className="text-xs text-cgo-muted">Clique em um card para filtrar o Radar operacional</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
          {CGO_DASHBOARD_CARDS.map((card) => (
            <CgoDashboardCard key={card.id} config={card} quantidade={counts[card.id]} />
          ))}
        </div>
      </section>
    </div>
  );
}
