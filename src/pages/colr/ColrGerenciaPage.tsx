import ShellHeader from "@/components/ShellHeader";
import { useAuth } from "@/state/AuthContext";
import { useCgo } from "@/state/CgoContext";
import { isVisibleOnRadar, isOnAgenda } from "@/domain/radarRules";
import OceStatusBadge from "@/components/oce/OceStatusBadge";

export default function ColrGerenciaPage() {
  const { currentUser, getOcesForColr } = useAuth();
  const { dbView, now } = useCgo();
  const colrId = currentUser?.colrId ?? "";

  const oces = getOcesForColr(colrId);
  const ops = dbView.operationInstances.filter(
    (o) => o.col === "COL Bahia" || o.col === "COL MS" || o.region.includes("Bahia")
  );

  const radar = ops.filter((o) => isVisibleOnRadar(o, now));
  const agenda = ops.filter((o) => isOnAgenda(o, now));

  return (
    <>
      <ShellHeader title="Gerência COLR" subtitle={colrId} />
      <main className="max-w-4xl mx-auto p-4 space-y-6">
        <section>
          <h2 className="text-sm font-semibold text-cgo-muted uppercase mb-2">OCEs da regional</h2>
          <ul className="space-y-2">
            {oces.map((o) => (
              <li key={o.oce_id} className="rounded-lg border border-cgo-border bg-cgo-panel p-3 text-sm flex justify-between">
                <span className="text-white font-mono">{o.oce_id}</span>
                <OceStatusBadge status={o.status} />
              </li>
            ))}
          </ul>
        </section>
        <section className="grid md:grid-cols-2 gap-4">
          <article className="rounded-xl border border-cgo-border bg-cgo-panel p-4">
            <h3 className="font-medium text-white">Radar regional</h3>
            <p className="text-2xl font-bold mt-2">{radar.length}</p>
            <p className="text-xs text-cgo-muted">operações na janela</p>
          </article>
          <article className="rounded-xl border border-cgo-border bg-cgo-panel p-4">
            <h3 className="font-medium text-white">Programadas</h3>
            <p className="text-2xl font-bold mt-2">{agenda.length}</p>
          </article>
        </section>
        <p className="text-xs text-cgo-muted">
          Visão restrita ao COLR {colrId}. Dados de outros COLRs não são exibidos.
        </p>
      </main>
    </>
  );
}
