import { useEffect } from "react";
import { Link } from "react-router-dom";
import ShellHeader from "@/components/ShellHeader";
import OceDetailBlocks from "@/components/oce/OceDetailBlocks";
import { useAuth } from "@/state/AuthContext";

export default function OperadorOcePage() {
  const { currentUser, getOcesForOperador, getOceById, activeOceId, setActiveOceId, appendOceEvent } = useAuth();

  const list = currentUser ? getOcesForOperador(currentUser.id) : [];

  useEffect(() => {
    if (list.length === 1 && !activeOceId) setActiveOceId(list[0].oce_id);
  }, [list, activeOceId, setActiveOceId]);

  if (!currentUser) return null;

  if (list.length === 0) {
    return (
      <>
        <ShellHeader title="Minha OCE" subtitle="Operador terceirizado" />
        <main className="max-w-lg mx-auto p-4 text-cgo-muted text-sm">Nenhuma OCE ativa vinculada a você.</main>
      </>
    );
  }

  if (list.length > 1 && !activeOceId) {
    return (
      <>
        <ShellHeader title="Selecionar OCE" subtitle={currentUser.nomeCompleto} />
        <main className="max-w-lg mx-auto p-4 space-y-3">
          <p className="text-sm text-cgo-muted">Escolha a operação de campo (mesmo login):</p>
          {list.map((o) => (
            <button
              key={o.oce_id}
              type="button"
              className="w-full text-left rounded-xl border border-cgo-border bg-cgo-panel p-4 hover:border-cgo-accent"
              onClick={() => {
                setActiveOceId(o.oce_id);
                appendOceEvent(o.oce_id, "OCE_ABERTA", currentUser.id, currentUser.perfil, {});
              }}
            >
              <p className="font-mono text-white">{o.oce_id}</p>
              <p className="text-sm text-cgo-muted">{o.fazenda.nome}</p>
            </button>
          ))}
        </main>
      </>
    );
  }

  const oce = activeOceId ? getOceById(activeOceId) : list[0];
  if (!oce) return null;

  return (
    <>
      <ShellHeader title="Minha OCE" subtitle={oce.oce_id} />
      <main className="max-w-lg mx-auto p-4 operador-shell">
        <nav className="flex gap-3 text-xs mb-4">
          <Link to="/operador/historico-producao" className="text-cgo-accent underline">
            Histórico de produção
          </Link>
          {list.length > 1 && (
            <button type="button" className="text-cgo-muted underline" onClick={() => setActiveOceId(null)}>
              Trocar OCE
            </button>
          )}
        </nav>
        <OceDetailBlocks oce={oce} showChecklistValidation={false} />
      </main>
    </>
  );
}
