import type { OceRecord } from "@/types/oce";
import OceStatusBadge from "./OceStatusBadge";
import OceChecklistPanel from "./OceChecklistPanel";

function waLink(phone: string) {
  const n = phone.replace(/\D/g, "");
  return `https://wa.me/${n}`;
}

export default function OceDetailBlocks({
  oce,
  showChecklistValidation,
}: {
  oce: OceRecord;
  showChecklistValidation: boolean;
}) {
  return (
    <article className="space-y-4 pb-8">
      <section className="rounded-xl border border-cgo-border bg-cgo-panel p-4">
        <h2 className="text-sm font-semibold text-cgo-muted uppercase mb-2">Identificação</h2>
        <p className="text-white font-mono text-lg">{oce.oce_id}</p>
        <p className="text-sm text-cgo-muted">OSF: {oce.osf_id} · OP: {oce.operacao_id}</p>
        <p className="mt-2">
          <OceStatusBadge status={oce.status} />
        </p>
        <ul className="mt-3 text-sm space-y-1 text-slate-200">
          <li>Data: {oce.data_prevista} · Hora: {oce.hora_prevista}</li>
          <li>COLR: {oce.colr_origem.nome}</li>
          <li>Enxame: {oce.enxame_designado}</li>
        </ul>
      </section>

      <section className="rounded-xl border border-cgo-border bg-cgo-panel p-4">
        <h2 className="text-sm font-semibold text-cgo-muted uppercase mb-2">Fazenda</h2>
        <p className="text-white font-medium">{oce.fazenda.nome}</p>
        <p className="text-sm text-slate-300 mt-1">{oce.fazenda.endereco}</p>
        {oce.fazenda.google_maps_url && (
          <a
            href={oce.fazenda.google_maps_url}
            target="_blank"
            rel="noreferrer"
            className="inline-block mt-2 text-sm text-cgo-accent underline"
          >
            Abrir no Google Maps
          </a>
        )}
        <ul className="mt-3 text-sm text-slate-200 space-y-1">
          <li>Talhão: {oce.fazenda.talhao}</li>
          <li>{oce.fazenda.hectares} ha · {oce.fazenda.cultura}</li>
          <li>{oce.fazenda.observacoes_acesso}</li>
        </ul>
      </section>

      <section className="rounded-xl border border-cgo-border bg-cgo-panel p-4">
        <h2 className="text-sm font-semibold text-cgo-muted uppercase mb-2">Contatos</h2>
        <p className="text-sm">
          Eng.: {oce.contatos.engenheiro.nome}{" "}
          <a className="text-emerald-400 underline ml-1" href={waLink(oce.contatos.engenheiro.whatsapp)}>
            WhatsApp
          </a>
        </p>
        <p className="text-sm mt-2">
          Calda: {oce.contatos.operador_calda.nome}{" "}
          <a className="text-emerald-400 underline ml-1" href={waLink(oce.contatos.operador_calda.whatsapp)}>
            WhatsApp
          </a>
        </p>
      </section>

      <OceChecklistPanel oce={oce} canValidate={showChecklistValidation} />
    </article>
  );
}
