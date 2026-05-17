import { Link } from "react-router-dom";
import { LAUDO_STATUS_LABELS } from "@/domain/clientePortalLabels";
import { useAuth } from "@/state/AuthContext";
import { usePortalCliente } from "@/state/PortalClienteContext";

export default function LaudosPage() {
  const { currentUser } = useAuth();
  const { getLaudosForUser } = usePortalCliente();
  const laudos = currentUser ? getLaudosForUser(currentUser) : [];

  return (
    <div className="space-y-4">
      <header>
        <h2 className="text-lg font-semibold text-white">Laudos de finalização</h2>
        <p className="text-xs text-cgo-muted mt-1">Visualize, assine ou solicite correção nos laudos das suas operações.</p>
      </header>

      {!laudos.length && (
        <p className="text-sm text-cgo-muted">Nenhum laudo disponível no momento.</p>
      )}

      {laudos.map((l) => (
        <article key={l.laudo_id} className="rounded-xl border border-cgo-border bg-cgo-panel p-4 space-y-3">
          <div className="flex justify-between items-start gap-2">
            <p className="font-mono text-violet-300 text-sm">{l.laudo_id}</p>
            <span className="text-[10px] uppercase text-cgo-muted">{LAUDO_STATUS_LABELS[l.status_laudo]}</span>
          </div>
          <p className="text-sm text-white">{l.fazenda}</p>
          <p className="text-xs text-cgo-muted">
            OSF {l.osf_id} · Talhões {l.talhoes.join(", ")} · {l.area_executada_ha} ha executados
          </p>
          <p className="text-xs text-cgo-muted">Operação em {l.data_operacao}</p>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Link
              to={`/cliente/engenheiro/laudos/${l.laudo_id}`}
              className="flex-1 text-center rounded-lg border border-cgo-border py-2.5 text-sm hover:bg-white/5"
            >
              Visualizar laudo
            </Link>
            {l.status_laudo === "DISPONIVEL_PARA_ASSINATURA" && (
              <Link
                to={`/cliente/engenheiro/laudos/${l.laudo_id}?acao=assinar`}
                className="flex-1 text-center rounded-lg bg-violet-600 py-2.5 text-sm font-semibold text-white hover:bg-violet-500"
              >
                Assinar laudo
              </Link>
            )}
          </div>
        </article>
      ))}
    </div>
  );
}
