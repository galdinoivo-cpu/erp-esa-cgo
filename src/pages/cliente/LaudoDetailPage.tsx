import { useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { LAUDO_STATUS_LABELS } from "@/domain/clientePortalLabels";
import { useAuth } from "@/state/AuthContext";
import { usePortalCliente } from "@/state/PortalClienteContext";

export default function LaudoDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [search] = useSearchParams();
  const { currentUser } = useAuth();
  const { getLaudo, signLaudo, appendPortalEvent } = usePortalCliente();
  const laudo = id ? getLaudo(id) : undefined;
  const [obs, setObs] = useState("");
  const [msg, setMsg] = useState("");

  if (!laudo || !currentUser) {
    return (
      <p className="text-cgo-muted text-sm">
        Laudo não encontrado. <Link to="/cliente/engenheiro/laudos" className="text-emerald-400 underline">Voltar</Link>
      </p>
    );
  }

  const podeAssinar = laudo.status_laudo === "DISPONIVEL_PARA_ASSINATURA";
  const abrirAssinatura = search.get("acao") === "assinar" || podeAssinar;

  function registrarEvento(tipo: "LAUDO_VISUALIZADO" | "LAUDO_ASSINADO_PELO_ENGENHEIRO" | "LAUDO_APROVADO_COM_OBSERVACAO" | "LAUDO_DEVOLVIDO_PARA_CORRECAO") {
    appendPortalEvent({
      tipo_evento: tipo,
      usuario_id: currentUser.id,
      perfil_usuario: currentUser.perfil,
      contrato_id: currentUser.contratoId!,
      fazenda_id: laudo.fazenda_id,
      osf_id: laudo.osf_id,
      payload: { laudo_id: laudo.laudo_id },
    });
  }

  function assinar(action: "assinar" | "aprovar_obs" | "correcao") {
    signLaudo(laudo.laudo_id, currentUser, obs, action);
    const tipo =
      action === "assinar"
        ? "LAUDO_ASSINADO_PELO_ENGENHEIRO"
        : action === "aprovar_obs"
          ? "LAUDO_APROVADO_COM_OBSERVACAO"
          : "LAUDO_DEVOLVIDO_PARA_CORRECAO";
    registrarEvento(tipo);
    setMsg(
      action === "correcao"
        ? "Laudo devolvido para correção."
        : action === "aprovar_obs"
          ? "Laudo aprovado com observação."
          : "Laudo assinado com sucesso."
    );
  }

  return (
    <div className="space-y-5">
      <Link to="/cliente/engenheiro/laudos" className="text-xs text-emerald-400 hover:underline">
        ← Laudos
      </Link>

      <header>
        <h2 className="text-lg font-semibold text-white font-mono">{laudo.laudo_id}</h2>
        <p className="text-sm text-cgo-muted">{LAUDO_STATUS_LABELS[laudo.status_laudo]}</p>
      </header>

      <article className="rounded-xl border border-cgo-border bg-cgo-panel p-4 text-sm space-y-2">
        <p>
          <span className="text-cgo-muted">OSF</span> <span className="font-mono text-white">{laudo.osf_id}</span>
        </p>
        <p>
          <span className="text-cgo-muted">Operação</span> <span className="font-mono text-white">{laudo.operacao_id}</span>
        </p>
        <p>
          <span className="text-cgo-muted">Fazenda</span> <span className="text-white">{laudo.fazenda}</span>
        </p>
        <p>
          <span className="text-cgo-muted">Talhões</span> {laudo.talhoes.join(", ")}
        </p>
        <p>
          <span className="text-cgo-muted">Área prevista / executada</span> {laudo.area_prevista_ha} ha /{" "}
          {laudo.area_executada_ha} ha
        </p>
        <p>
          <span className="text-cgo-muted">Data da operação</span> {laudo.data_operacao}
        </p>
      </article>

      <pre className="text-[10px] overflow-x-auto rounded-lg bg-cgo-bg border border-cgo-border p-3 text-cgo-muted">
        {JSON.stringify(laudo, null, 2)}
      </pre>

      {laudo.assinatura_engenheiro && (
        <article className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-4 text-sm">
          <p className="font-medium text-emerald-200">Assinatura registrada</p>
          <p className="text-cgo-muted mt-1">
            {laudo.assinatura_engenheiro.nome} · {laudo.assinatura_engenheiro.crea}
          </p>
          <p className="text-xs text-cgo-muted mt-1">
            {laudo.assinatura_engenheiro.assinado_em &&
              new Date(laudo.assinatura_engenheiro.assinado_em).toLocaleString("pt-BR")}
          </p>
          {laudo.assinatura_engenheiro.observacao && (
            <p className="text-xs mt-2 text-white">Obs: {laudo.assinatura_engenheiro.observacao}</p>
          )}
        </article>
      )}

      {abrirAssinatura && podeAssinar && (
        <section className="space-y-3">
          <label className="block text-sm">
            <span className="text-cgo-muted">Observação (opcional)</span>
            <textarea
              rows={2}
              className="mt-1 w-full rounded-lg bg-cgo-bg border border-cgo-border px-3 py-2 text-white"
              value={obs}
              onChange={(e) => setObs(e.target.value)}
            />
          </label>
          <button
            type="button"
            className="w-full rounded-xl bg-violet-600 py-3 font-semibold text-white"
            onClick={() => assinar("assinar")}
          >
            Assinar laudo
          </button>
          <button
            type="button"
            className="w-full rounded-xl border border-emerald-600/50 py-3 text-sm text-emerald-200"
            onClick={() => assinar("aprovar_obs")}
          >
            Aprovar com observação
          </button>
          <button
            type="button"
            className="w-full rounded-xl border border-amber-600/50 py-3 text-sm text-amber-200"
            onClick={() => assinar("correcao")}
          >
            Solicitar correção
          </button>
        </section>
      )}

      {msg && <p className="text-sm text-emerald-300">{msg}</p>}

      <button
        type="button"
        className="text-xs text-cgo-muted underline"
        onClick={() => registrarEvento("LAUDO_VISUALIZADO")}
      >
        Registrar visualização (evento)
      </button>
    </div>
  );
}
