import { Link } from "react-router-dom";
import { modeloBadgeClass, OSF_STATUS_LABELS } from "@/domain/clientePortalLabels";
import { useAuth } from "@/state/AuthContext";
import { usePortalCliente } from "@/state/PortalClienteContext";

export default function MinhasOsfPage() {
  const { currentUser } = useAuth();
  const { getOsfsForUser } = usePortalCliente();
  const osfs = currentUser ? getOsfsForUser(currentUser) : [];

  return (
    <div className="space-y-4">
      <header className="flex justify-between items-center gap-2">
        <div>
          <h2 className="text-lg font-semibold text-white">Histórico de ordens</h2>
          <p className="text-xs text-cgo-muted mt-1">Suas OSF vinculadas ao contrato.</p>
        </div>
        <Link
          to="/cliente/engenheiro/nova-osf"
          className="text-xs rounded-lg bg-emerald-600 px-3 py-2 text-white font-medium"
        >
          Nova OSF
        </Link>
      </header>

      {!osfs.length && <p className="text-sm text-cgo-muted">Nenhuma ordem registrada.</p>}

      {osfs.map((o) => (
        <article key={o.osf_id} className="rounded-xl border border-cgo-border bg-cgo-panel p-4">
          <div className="flex justify-between gap-2">
            <p className="font-mono text-emerald-300 text-sm">{o.osf_id}</p>
            <span
              className={`text-[10px] px-2 py-0.5 rounded border ${modeloBadgeClass(
                o.dados_operacionais.modelo_pulverizacao
              )}`}
            >
              {o.dados_operacionais.modelo_pulverizacao}
            </span>
          </div>
          <p className="text-sm text-white mt-2">{OSF_STATUS_LABELS[o.status]}</p>
          <p className="text-xs text-cgo-muted mt-1">
            {o.dados_operacionais.cultura} · Talhões {o.dados_operacionais.talhoes.join(", ")} ·{" "}
            {o.dados_operacionais.area_hectares} ha
          </p>
          <p className="text-xs text-cgo-muted">
            Solicitada: {o.dados_operacionais.data_solicitada} · Criada em{" "}
            {new Date(o.criado_em).toLocaleDateString("pt-BR")}
          </p>
          <Link
            to="/cliente/engenheiro/mapa-preparacao"
            className="inline-block mt-3 text-xs text-emerald-400 underline"
          >
            Ver preparação
          </Link>
        </article>
      ))}
    </div>
  );
}
