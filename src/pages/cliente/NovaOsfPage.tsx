import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import type { ModeloPulverizacao, OsfRecord } from "@/types/clientePortal";
import { MODELO_LABELS } from "@/domain/clientePortalLabels";
import { useAuth } from "@/state/AuthContext";
import { usePortalCliente } from "@/state/PortalClienteContext";

export default function NovaOsfPage() {
  const { currentUser } = useAuth();
  const { portalDb, getFazendaForUser, saveOsfRascunho, submitOsf, appendPortalEvent } = usePortalCliente();
  const navigate = useNavigate();
  const fazenda = currentUser ? getFazendaForUser(currentUser) : undefined;

  const [cultura, setCultura] = useState("Soja");
  const [talhoes, setTalhoes] = useState<string[]>([]);
  const [area, setArea] = useState("");
  const [data, setData] = useState(portalDb.datas_disponiveis[0] ?? "");
  const [janela, setJanela] = useState("Manhã");
  const [modelo, setModelo] = useState<ModeloPulverizacao>("NORMAL");
  const [opCaldaNome, setOpCaldaNome] = useState("");
  const [opCaldaZap, setOpCaldaZap] = useState("");
  const [obsTec, setObsTec] = useState("");
  const [obsAcesso, setObsAcesso] = useState("");
  const [pontoEntrada, setPontoEntrada] = useState(fazenda?.ponto_entrada ?? "");
  const [anexo, setAnexo] = useState<string | null>(null);
  const [confirmacao, setConfirmacao] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [osfId, setOsfId] = useState<string | null>(null);

  if (!currentUser || !fazenda) {
    return <p className="text-cgo-muted text-sm">Vínculo de fazenda não configurado para este usuário.</p>;
  }

  function toggleTalhao(t: string) {
    setTalhoes((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t].sort()));
  }

  function buildPartial(status: OsfRecord["status"]): Omit<OsfRecord, "osf_id" | "criado_em" | "atualizado_em" | "historico_eventos"> & { osf_id?: string } {
    return {
      osf_id: osfId ?? undefined,
      contrato_id: currentUser.contratoId!,
      cliente_id: currentUser.clienteId!,
      fazenda_id: fazenda.id,
      engenheiro: {
        usuario_id: currentUser.id,
        nome: currentUser.nomeCompleto,
        documento: currentUser.documento,
        crea: currentUser.crea ?? "",
        whatsapp: currentUser.telefone,
      },
      fazenda: {
        nome: fazenda.nome,
        endereco: fazenda.endereco,
        google_maps_url: fazenda.google_maps_url,
        ponto_entrada: pontoEntrada,
      },
      operador_calda: { nome: opCaldaNome, whatsapp: opCaldaZap },
      dados_operacionais: {
        cultura,
        talhoes,
        area_hectares: Number(area) || 0,
        modelo_pulverizacao: modelo,
        data_solicitada: data,
        janela_operacional: janela,
        observacoes_tecnicas: obsTec,
        observacoes_acesso: obsAcesso,
        confirmacao_responsabilidade: confirmacao,
        anexo_mapa_nome: anexo,
      },
      status,
      percentual_preparacao: 5,
      data_programada: null,
      previsao_inicio: null,
      previsao_termino: null,
    };
  }

  function salvarRascunho() {
    const rec = saveOsfRascunho(buildPartial("OSF_RASCUNHO"));
    setOsfId(rec.osf_id);
    appendPortalEvent({
      tipo_evento: osfId ? "OSF_EDITADA" : "OSF_RASCUNHO_CRIADO",
      usuario_id: currentUser.id,
      perfil_usuario: currentUser.perfil,
      contrato_id: currentUser.contratoId!,
      fazenda_id: fazenda.id,
      osf_id: rec.osf_id,
      payload: { osf_id: rec.osf_id },
    });
    alert("Rascunho salvo.");
  }

  function enviar(e: FormEvent) {
    e.preventDefault();
    if (!talhoes.length || !confirmacao || !opCaldaNome) {
      alert("Preencha talhões, operador de calda e confirme a responsabilidade técnica.");
      return;
    }
    const rec = saveOsfRascunho(buildPartial("OSF_RASCUNHO"));
    submitOsf(rec.osf_id);
    appendPortalEvent({
      tipo_evento: "OSF_ENVIADA",
      usuario_id: currentUser.id,
      perfil_usuario: currentUser.perfil,
      contrato_id: currentUser.contratoId!,
      fazenda_id: fazenda.id,
      osf_id: rec.osf_id,
      payload: { modelo, data_solicitada: data },
    });
    setOsfId(rec.osf_id);
    setEnviado(true);
  }

  if (enviado) {
    return (
      <article className="rounded-2xl border border-emerald-500/40 bg-emerald-950/30 p-6 text-center">
        <p className="text-lg font-semibold text-emerald-100">Ordem de Serviço enviada para análise da ESA.</p>
        <p className="text-sm text-cgo-muted mt-2 font-mono">{osfId}</p>
        <p className="text-xs text-cgo-muted mt-4">Status: OSF_ENVIADA</p>
        <button
          type="button"
          className="mt-6 w-full rounded-xl bg-emerald-600 py-3 font-semibold text-white"
          onClick={() => navigate("/cliente/engenheiro/mapa-preparacao")}
        >
          Acompanhar preparação
        </button>
      </article>
    );
  }

  return (
    <form onSubmit={enviar} className="space-y-5">
      <header>
        <h2 className="text-lg font-semibold text-white">Nova OSF — Ordem de Serviço da Fazenda</h2>
        <p className="text-xs text-cgo-muted mt-1">
          Pedido formal de pulverização. Ainda não é operação autorizada até validação ESA/CGO.
        </p>
      </header>

      <section className="rounded-xl border border-cgo-border bg-cgo-panel p-4 space-y-3 text-sm">
        <p>
          <span className="text-cgo-muted">Contrato</span>
          <br />
          <span className="font-mono text-white">{currentUser.contratoId}</span>
        </p>
        <p>
          <span className="text-cgo-muted">Fazenda</span>
          <br />
          <span className="text-white">{fazenda.nome}</span>
        </p>
      </section>

      <label className="block text-sm">
        <span className="text-cgo-muted">Cultura / planta</span>
        <input
          className="mt-1 w-full rounded-lg bg-cgo-bg border border-cgo-border px-3 py-2.5 text-white"
          value={cultura}
          onChange={(e) => setCultura(e.target.value)}
          required
        />
      </label>

      <fieldset>
        <legend className="text-sm text-cgo-muted mb-2">Talhões (múltipla seleção)</legend>
        <div className="flex flex-wrap gap-2">
          {fazenda.talhoes_disponiveis.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => toggleTalhao(t)}
              className={`rounded-lg px-4 py-2 text-sm font-mono border ${
                talhoes.includes(t)
                  ? "bg-emerald-600/30 border-emerald-500 text-white"
                  : "bg-cgo-bg border-cgo-border text-cgo-muted"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
        {talhoes.length > 0 && (
          <p className="text-xs text-emerald-300 mt-2">Selecionados: {talhoes.join(", ")}</p>
        )}
      </fieldset>

      <label className="block text-sm">
        <span className="text-cgo-muted">Área estimada (ha)</span>
        <input
          type="number"
          min={0}
          step={0.1}
          className="mt-1 w-full rounded-lg bg-cgo-bg border border-cgo-border px-3 py-2.5 text-white"
          value={area}
          onChange={(e) => setArea(e.target.value)}
          required
        />
      </label>

      <label className="block text-sm">
        <span className="text-cgo-muted">Data solicitada (preferencial)</span>
        <select
          className="mt-1 w-full rounded-lg bg-cgo-bg border border-cgo-border px-3 py-2.5 text-white"
          value={data}
          onChange={(e) => setData(e.target.value)}
        >
          {portalDb.datas_disponiveis.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
        <p className="text-[11px] text-amber-200/90 mt-2 leading-relaxed">
          A data selecionada será analisada conforme disponibilidade operacional, contrato, COLR, enxame e condições
          de execução.
        </p>
      </label>

      <label className="block text-sm">
        <span className="text-cgo-muted">Janela operacional</span>
        <select
          className="mt-1 w-full rounded-lg bg-cgo-bg border border-cgo-border px-3 py-2.5 text-white"
          value={janela}
          onChange={(e) => setJanela(e.target.value)}
        >
          <option>Manhã</option>
          <option>Tarde</option>
          <option>Noite</option>
          <option>Integral</option>
        </select>
      </label>

      <fieldset>
        <legend className="text-sm text-cgo-muted mb-2">Modelo de pulverização</legend>
        <div className="space-y-2">
          {(["NORMAL", "EMERGENCIAL", "PONTUAL"] as ModeloPulverizacao[]).map((m) => (
            <label
              key={m}
              className={`flex items-start gap-3 rounded-xl border p-3 cursor-pointer ${
                modelo === m
                  ? m === "EMERGENCIAL"
                    ? "border-rose-500 bg-rose-950/30"
                    : "border-emerald-500/50 bg-emerald-950/20"
                  : "border-cgo-border bg-cgo-bg"
              }`}
            >
              <input
                type="radio"
                name="modelo"
                checked={modelo === m}
                onChange={() => setModelo(m)}
                className="mt-1"
              />
              <span>
                <span className="font-medium text-white">{m}</span>
                <span className="block text-xs text-cgo-muted mt-0.5">{MODELO_LABELS[m]}</span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <label className="block text-sm">
        <span className="text-cgo-muted">Operador de calda responsável</span>
        <input
          className="mt-1 w-full rounded-lg bg-cgo-bg border border-cgo-border px-3 py-2.5 text-white"
          value={opCaldaNome}
          onChange={(e) => setOpCaldaNome(e.target.value)}
          required
        />
      </label>
      <label className="block text-sm">
        <span className="text-cgo-muted">WhatsApp do operador de calda</span>
        <input
          className="mt-1 w-full rounded-lg bg-cgo-bg border border-cgo-border px-3 py-2.5 text-white"
          value={opCaldaZap}
          onChange={(e) => setOpCaldaZap(e.target.value)}
          placeholder="+55..."
        />
      </label>

      <label className="block text-sm">
        <span className="text-cgo-muted">Observações técnicas</span>
        <textarea
          rows={2}
          className="mt-1 w-full rounded-lg bg-cgo-bg border border-cgo-border px-3 py-2.5 text-white"
          value={obsTec}
          onChange={(e) => setObsTec(e.target.value)}
        />
      </label>
      <label className="block text-sm">
        <span className="text-cgo-muted">Observações de acesso</span>
        <textarea
          rows={2}
          className="mt-1 w-full rounded-lg bg-cgo-bg border border-cgo-border px-3 py-2.5 text-white"
          value={obsAcesso}
          onChange={(e) => setObsAcesso(e.target.value)}
        />
      </label>
      <label className="block text-sm">
        <span className="text-cgo-muted">Ponto de entrada da fazenda</span>
        <input
          className="mt-1 w-full rounded-lg bg-cgo-bg border border-cgo-border px-3 py-2.5 text-white"
          value={pontoEntrada}
          onChange={(e) => setPontoEntrada(e.target.value)}
        />
      </label>

      <label className="block text-sm">
        <span className="text-cgo-muted">Anexo mapa/croqui (opcional)</span>
        <input
          type="file"
          accept="image/*,.pdf"
          className="mt-1 w-full text-xs text-cgo-muted"
          onChange={(e) => setAnexo(e.target.files?.[0]?.name ?? null)}
        />
      </label>

      <label className="flex items-start gap-3 rounded-xl border border-cgo-border p-4 text-sm">
        <input
          type="checkbox"
          checked={confirmacao}
          onChange={(e) => setConfirmacao(e.target.checked)}
          className="mt-1"
        />
        <span className="text-cgo-muted">
          Confirmo a responsabilidade técnica da fazenda pelas informações desta solicitação.
        </span>
      </label>

      <div className="flex flex-col gap-2 sm:flex-row">
        <button
          type="button"
          onClick={salvarRascunho}
          className="flex-1 rounded-xl border border-cgo-border py-3 text-sm font-medium text-white hover:bg-white/5"
        >
          Salvar rascunho
        </button>
        <button
          type="submit"
          className="flex-1 rounded-xl bg-emerald-600 py-3 text-sm font-semibold text-white hover:bg-emerald-500"
        >
          Enviar OSF para análise
        </button>
      </div>
    </form>
  );
}
