import { Link } from "react-router-dom";
import { ClipboardList, Map, FileCheck, ArrowRight } from "lucide-react";
import { useAuth } from "@/state/AuthContext";
import { usePortalCliente } from "@/state/PortalClienteContext";

const cards = [
  {
    to: "/cliente/engenheiro/nova-osf",
    title: "Abrir Ordem de Serviço",
    desc: "Solicitar pulverização na fazenda (OSF)",
    icon: ClipboardList,
    accent: "emerald",
  },
  {
    to: "/cliente/engenheiro/mapa-preparacao",
    title: "Mapa de preparação",
    desc: "Acompanhar andamento e previsões",
    icon: Map,
    accent: "blue",
  },
  {
    to: "/cliente/engenheiro/laudos",
    title: "Laudos de finalização",
    desc: "Visualizar e assinar laudos",
    icon: FileCheck,
    accent: "violet",
  },
];

export default function PortalEngenheiroHomePage() {
  const { currentUser } = useAuth();
  const { getFazendaForUser, getOsfsForUser, getLaudosForUser } = usePortalCliente();
  const fazenda = currentUser ? getFazendaForUser(currentUser) : undefined;
  const osfs = currentUser ? getOsfsForUser(currentUser) : [];
  const laudosPendentes =
    currentUser?.perfil === "ENGENHEIRO_CLIENTE"
      ? getLaudosForUser(currentUser).filter((l) => l.status_laudo === "DISPONIVEL_PARA_ASSINATURA").length
      : 0;

  return (
    <div className="space-y-6">
      <article className="rounded-2xl border border-emerald-500/30 bg-emerald-950/20 p-5">
        <h2 className="text-lg font-semibold text-white">Bem-vindo ao portal técnico</h2>
        <p className="text-sm text-cgo-muted mt-2">
          Contrato <span className="font-mono text-emerald-300">{currentUser?.contratoId ?? "—"}</span>
          {fazenda && (
            <>
              {" "}
              · Fazenda <strong className="text-white">{fazenda.nome}</strong>
            </>
          )}
        </p>
        <p className="text-xs text-cgo-muted mt-3">
          Você não acessa o ERP interno da ESA. Apenas OSF, acompanhamento operacional e laudos do seu contrato.
        </p>
      </article>

      <div className="grid gap-3 sm:grid-cols-1">
        {cards.map(({ to, title, desc, icon: Icon }) => (
          <Link
            key={to}
            to={to}
            className="flex items-center gap-4 rounded-xl border border-cgo-border bg-cgo-panel p-4 hover:border-emerald-500/40 transition-colors"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-600/20 text-emerald-300">
              <Icon className="w-6 h-6" />
            </span>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-white">{title}</p>
              <p className="text-sm text-cgo-muted">{desc}</p>
            </div>
            <ArrowRight className="w-5 h-5 text-cgo-muted flex-shrink-0" />
          </Link>
        ))}
      </div>

      <section className="rounded-xl border border-cgo-border bg-cgo-panel/60 p-4 text-sm">
        <h3 className="font-medium text-white mb-2">Resumo rápido</h3>
        <ul className="space-y-1 text-cgo-muted">
          <li>
            OSF registradas: <span className="text-white font-mono">{osfs.length}</span>
          </li>
          <li>
            Laudos aguardando assinatura:{" "}
            <span className={laudosPendentes ? "text-amber-300 font-semibold" : "text-white"}>
              {laudosPendentes}
            </span>
          </li>
        </ul>
      </section>
    </div>
  );
}
