import { Link } from "react-router-dom";
import ShellHeader from "@/components/ShellHeader";
import { useAuth } from "@/state/AuthContext";

export default function HistoricoProducaoPage() {
  const { currentUser, oceDb } = useAuth();
  const rows = oceDb.producaoHistorico.filter((p) => p.operador_id === currentUser?.id);

  return (
    <>
      <ShellHeader title="Histórico de Produção" subtitle="Somente seus dados" />
      <main className="max-w-lg mx-auto p-4 space-y-4">
        <Link to="/operador/oce" className="text-sm text-cgo-accent underline">
          ← Minha OCE
        </Link>
        {rows.length === 0 ? (
          <p className="text-cgo-muted text-sm">Sem histórico registrado.</p>
        ) : (
          rows.map((r) => (
            <article key={r.id} className="rounded-xl border border-cgo-border bg-cgo-panel p-4 text-sm space-y-1">
              <p className="font-medium text-white">{r.fazenda}</p>
              <p className="text-cgo-muted">
                {r.data_operacao} · Talhão {r.talhao} · {r.hectares_executados} ha
              </p>
              <p>OCE: {r.oce_id}</p>
              <p>Laudo: {r.status_laudo}</p>
              <p className="text-emerald-300 font-semibold">
                A receber: R$ {r.valor_a_receber.toLocaleString("pt-BR")}
              </p>
              <p className="text-xs text-cgo-muted">
                Pagamento: {r.status_pagamento} · previsto {r.data_prevista_pagamento}
              </p>
              {r.observacao_pendencia && (
                <p className="text-amber-300 text-xs">{r.observacao_pendencia}</p>
              )}
            </article>
          ))
        )}
        <p className="text-[10px] text-cgo-muted border-t border-cgo-border pt-3">
          Não exibimos: valor cobrado da fazenda, margem ESA, contrato comercial ou dados de outros operadores.
        </p>
      </main>
    </>
  );
}
