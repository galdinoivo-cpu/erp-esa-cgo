import { useState } from "react";
import ShellHeader from "@/components/ShellHeader";
import OceDetailBlocks from "@/components/oce/OceDetailBlocks";
import { useAuth } from "@/state/AuthContext";

export default function ColrTRPage() {
  const { currentUser, authDb, getOcesForColr, getOceById, appendOceEvent } = useAuth();
  const [busca, setBusca] = useState("");
  const [oceId, setOceId] = useState<string | null>(null);

  const colrId = currentUser?.colrId ?? "";
  const ocesColr = getOcesForColr(colrId);

  function buscarOperador() {
    const q = busca.trim().toLowerCase();
    const op = authDb.users.find(
      (u) =>
        u.perfil === "TERCEIRIZADO_OPERADOR" &&
        (u.documento.includes(q) || u.login.toLowerCase() === q || u.nomeCompleto.toLowerCase().includes(q))
    );
    if (!op) {
      alert("Operador não encontrado.");
      return;
    }
    const oce = ocesColr.find((o) => o.operador_id === op.id);
    if (!oce) {
      alert("Nenhuma OCE ativa para este operador neste COLR.");
      return;
    }
    appendOceEvent(oce.oce_id, "OPERADOR_VALIDADO", currentUser!.id, currentUser!.perfil, {
      operador: op.nomeCompleto,
    });
    setOceId(oce.oce_id);
  }

  const oce = oceId ? getOceById(oceId) : undefined;
  // re-fetch after checklist updates
  const oceLive = oceId ? getOceById(oceId) : oce;

  return (
    <>
      <ShellHeader title="COLR TR — Entrega e Recebimento" subtitle={currentUser?.colrId ?? ""} />
      <main className="max-w-2xl mx-auto p-4 space-y-4">
        <section className="rounded-xl border border-cgo-border bg-cgo-panel p-4 space-y-3">
          <h2 className="font-semibold text-white">Receber operador terceirizado</h2>
          <p className="text-xs text-cgo-muted">
            Simule CNH/QR: informe CPF, login ou nome. Validação física do checklist abaixo.
          </p>
          <input
            className="w-full rounded-lg bg-cgo-bg border border-cgo-border px-3 py-2 text-sm"
            placeholder="CPF, login ou nome do operador"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
          <button
            type="button"
            className="w-full rounded-lg bg-cgo-accent py-2 text-sm text-white font-medium"
            onClick={buscarOperador}
          >
            Identificar operador e abrir OCE
          </button>
        </section>

        {oceLive && <OceDetailBlocks oce={oceLive} showChecklistValidation />}
      </main>
    </>
  );
}
