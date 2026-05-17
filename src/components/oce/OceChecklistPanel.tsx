import { useState } from "react";
import type { OceRecord } from "@/types/oce";
import { allMandatoryItemsValidated } from "@/domain/oceRules";
import { useAuth } from "@/state/AuthContext";

export default function OceChecklistPanel({
  oce,
  canValidate,
}: {
  oce: OceRecord;
  canValidate: boolean;
}) {
  const { currentUser, validateChecklistItem } = useAuth();
  const [readId, setReadId] = useState<Record<string, string>>({});
  const [msg, setMsg] = useState("");

  function validateItem(itemId: string) {
    if (!currentUser) return;
    const id = (readId[itemId] ?? "").trim();
    if (!id) {
      setMsg("Informe o ID lido (simulação QR/NFC/manual).");
      return;
    }
    const res = validateChecklistItem(oce.oce_id, itemId, id, currentUser.id, currentUser.perfil);
    if (!res.ok) setMsg(res.error ?? "Falha na validação.");
    else setMsg("Item validado.");
  }

  const authorized = oce.status === "OPERACAO_AUTORIZADA" && allMandatoryItemsValidated(oce.checklist_retirada);

  return (
    <section className="rounded-xl border border-cgo-border bg-cgo-panel p-4 space-y-3">
      <h3 className="font-semibold text-white">Checklist de retirada no COLR</h3>
      <ul className="space-y-3">
        {oce.checklist_retirada.map((item) => (
          <li key={item.item_id} className="rounded-lg border border-cgo-border/80 p-3 text-sm">
            <div className="flex justify-between gap-2">
              <span className="font-medium text-slate-100">{item.nome}</span>
              <span className="text-[10px] text-cgo-muted uppercase">{item.status}</span>
            </div>
            <p className="text-xs text-cgo-muted mt-1">
              {item.item_id} · {item.validacao} {item.obrigatorio ? "· obrigatório" : ""}
            </p>
            {canValidate && item.status !== "validado" && (
              <div className="mt-2 flex gap-2">
                <input
                  className="flex-1 rounded bg-cgo-bg border border-cgo-border px-2 py-1 text-xs"
                  placeholder={`ID (${item.validacao})`}
                  value={readId[item.item_id] ?? ""}
                  onChange={(e) => setReadId((m) => ({ ...m, [item.item_id]: e.target.value }))}
                />
                <button
                  type="button"
                  className="rounded bg-cgo-accent px-3 py-1 text-xs text-white"
                  onClick={() => validateItem(item.item_id)}
                >
                  Validar
                </button>
              </div>
            )}
            {item.observacao && <p className="text-xs text-amber-300 mt-1">{item.observacao}</p>}
          </li>
        ))}
      </ul>
      {msg && <p className="text-xs text-cgo-muted">{msg}</p>}
      {authorized && (
        <aside className="rounded-lg bg-emerald-950/40 border border-emerald-700 p-4 text-center">
          <p className="text-lg font-bold text-emerald-300">Operação Autorizada</p>
          <p className="text-xs text-emerald-200/80 mt-2">
            {oce.autorizacao.data_hora && new Date(oce.autorizacao.data_hora).toLocaleString("pt-BR")}
          </p>
          <p className="text-sm text-slate-200 mt-1">Operador: {oce.autorizacao.operador_responsavel}</p>
          <p className="text-xs text-cgo-muted">COLR: {oce.autorizacao.colr_origem}</p>
          <p className="text-xs text-cgo-muted mt-1">Checklist concluído</p>
        </aside>
      )}
    </section>
  );
}
