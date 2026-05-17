import { useEffect } from "react";
import { etapaColor, modeloBadgeClass, OSF_STATUS_LABELS } from "@/domain/clientePortalLabels";
import { useAuth } from "@/state/AuthContext";
import { usePortalCliente } from "@/state/PortalClienteContext";

export default function MapaPreparacaoPage() {
  const { currentUser } = useAuth();
  const { getOsfsForUser, getPreparacao, appendPortalEvent } = usePortalCliente();
  const osfs = currentUser ? getOsfsForUser(currentUser) : [];

  useEffect(() => {
    if (!currentUser || osfs.length === 0) return;
    appendPortalEvent({
      tipo_evento: "MAPA_PREPARACAO_VISUALIZADO",
      usuario_id: currentUser.id,
      perfil_usuario: currentUser.perfil,
      contrato_id: currentUser.contratoId!,
      fazenda_id: currentUser.fazendaIds?.[0] ?? "",
      osf_id: osfs[0]?.osf_id ?? null,
      payload: {},
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!osfs.length) {
    return (
      <p className="text-sm text-cgo-muted">
        Nenhuma OSF vinculada ao seu contrato. Abra uma nova ordem na aba &quot;Abrir OSF&quot;.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-lg font-semibold text-white">Mapa de preparação / acompanhamento</h2>
        <p className="text-xs text-cgo-muted mt-1">
          Transparência do andamento — sem dados internos de custo, margem ou terceirizados.
        </p>
      </header>

      {osfs.map((o) => {
        const etapas = getPreparacao(o.osf_id);
        const pct = o.percentual_preparacao;
        return (
          <article key={o.osf_id} className="rounded-2xl border border-cgo-border bg-cgo-panel overflow-hidden">
            <div className="p-4 border-b border-cgo-border space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-mono text-emerald-300">{o.osf_id}</p>
                <span
                  className={`text-[10px] uppercase px-2 py-0.5 rounded border ${modeloBadgeClass(
                    o.dados_operacionais.modelo_pulverizacao
                  )}`}
                >
                  {o.dados_operacionais.modelo_pulverizacao}
                </span>
              </div>
              <p className="text-white font-medium">{o.fazenda.nome}</p>
              <p className="text-xs text-cgo-muted">
                Talhões {o.dados_operacionais.talhoes.join(", ")} · {o.dados_operacionais.area_hectares} ha
              </p>
              <p className="text-xs text-cgo-muted">
                Data solicitada: {o.dados_operacionais.data_solicitada}
                {o.data_programada && (
                  <>
                    {" "}
                    · Programada: <span className="text-white">{o.data_programada}</span>
                  </>
                )}
              </p>
              <p className="text-xs">
                Status: <span className="text-white">{OSF_STATUS_LABELS[o.status]}</span>
              </p>
            </div>

            <div className="p-4">
              <div className="flex justify-between text-xs text-cgo-muted mb-1">
                <span>Preparação</span>
                <span className="text-white font-semibold">{pct}%</span>
              </div>
              <div className="h-3 rounded-full bg-cgo-bg overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 transition-all"
                  style={{ width: `${pct}%` }}
                />
              </div>
              {(o.previsao_inicio || o.previsao_termino) && (
                <p className="text-[11px] text-cgo-muted mt-2">
                  Previsão início: {o.previsao_inicio ?? "—"} · Término: {o.previsao_termino ?? "—"}
                </p>
              )}
              <p className="text-[10px] text-cgo-muted mt-1">
                Atualizado: {new Date(o.atualizado_em).toLocaleString("pt-BR")}
              </p>
            </div>

            <ol className="px-4 pb-4 space-y-1.5 max-h-64 overflow-y-auto">
              {etapas.map((e) => (
                <li
                  key={e.id}
                  className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-xs ${etapaColor(e.status)}`}
                >
                  <span className="font-mono opacity-60 w-5">{e.ordem}</span>
                  <span className="flex-1">{e.titulo}</span>
                  <span className="capitalize opacity-80">{e.status.replace("_", " ")}</span>
                </li>
              ))}
            </ol>
          </article>
        );
      })}
    </div>
  );
}
