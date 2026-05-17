import { Link } from "react-router-dom";
import { CGO_COLOR_STYLES, CGO_DASHBOARD_CARDS } from "@/domain/cgoDashboardCards";

export default function CgoHelpPage() {
  return (
    <div className="space-y-8 max-w-3xl">
      <header>
        <p className="text-xs uppercase tracking-[0.2em] text-cgo-muted">ESA · CGO</p>
        <h1 className="text-2xl font-semibold text-white mt-1">Help CGO — Como interpretar o Radar Operacional</h1>
        <p className="text-sm text-cgo-muted mt-3 leading-relaxed">
          A CGO acompanha em tempo real as operações em andamento, operações planejadas, operações em alerta,
          operações emergenciais, operações bloqueadas, tarefas atrasadas, COLRs com pendência, manutenção crítica,
          laudos pendentes e bloqueios financeiros que impedem o avanço de OSF, OP ou OCE. Cada card do Dashboard
          representa uma área de atenção operacional e utiliza ícones, cores e indicadores para facilitar a tomada de
          decisão.
        </p>
        <Link to="/cgo" className="inline-block mt-4 text-sm text-cgo-accent hover:underline">
          ← Voltar ao Dashboard
        </Link>
      </header>

      <section className="rounded-xl border border-cgo-border bg-cgo-panel p-5" id="legenda">
        <h2 className="text-lg font-semibold text-white">Legenda de cores</h2>
        <ul className="mt-4 space-y-3 text-sm">
          <li className="flex gap-3">
            <span className="w-3 h-3 rounded-full bg-emerald-500 mt-1 shrink-0" />
            <div>
              <strong className="text-emerald-300">Verde</strong>
              <p className="text-cgo-muted">Processo regular, validado, em execução normal ou concluído.</p>
            </div>
          </li>
          <li className="flex gap-3">
            <span className="w-3 h-3 rounded-full bg-blue-500 mt-1 shrink-0" />
            <div>
              <strong className="text-blue-300">Azul</strong>
              <p className="text-cgo-muted">Processo planejado, programado ou em preparação.</p>
            </div>
          </li>
          <li className="flex gap-3">
            <span className="w-3 h-3 rounded-full bg-amber-500 mt-1 shrink-0" />
            <div>
              <strong className="text-amber-300">Amarelo</strong>
              <p className="text-cgo-muted">Atenção, pendência corrigível, atraso próximo ou divergência em análise.</p>
            </div>
          </li>
          <li className="flex gap-3">
            <span className="w-3 h-3 rounded-full bg-rose-500 mt-1 shrink-0" />
            <div>
              <strong className="text-rose-300">Vermelho</strong>
              <p className="text-cgo-muted">Bloqueio, falha crítica, emergência ou impedimento de avanço.</p>
            </div>
          </li>
          <li className="flex gap-3">
            <span className="w-3 h-3 rounded-full bg-slate-500 mt-1 shrink-0" />
            <div>
              <strong className="text-slate-300">Cinza</strong>
              <p className="text-cgo-muted">Processo ainda não iniciado ou sem movimentação.</p>
            </div>
          </li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-white">Indicadores do Radar</h2>
        {CGO_DASHBOARD_CARDS.map((card) => {
          const styles = CGO_COLOR_STYLES[card.cor];
          const Icon = card.icone;
          return (
            <article
              key={card.id}
              id={card.id}
              className={`rounded-xl border ${styles.border} ${styles.bg} p-5 scroll-mt-6`}
            >
              <div className="flex items-center gap-3">
                <span className={`rounded-lg p-2 ${styles.badge}`}>
                  <Icon className={`w-6 h-6 ${styles.icon}`} />
                </span>
                <h3 className="text-base font-semibold text-white">{card.titulo}</h3>
              </div>
              <p className="text-sm text-cgo-muted mt-3">{card.help.significado}</p>
              <p className="text-sm text-white mt-2">
                <span className="text-cgo-muted">Ação da CGO: </span>
                {card.help.acao}
              </p>
              <dl className="mt-4 grid gap-2 text-xs sm:grid-cols-2">
                <div>
                  <dt className="text-emerald-400/90 font-medium">Verde</dt>
                  <dd className="text-cgo-muted mt-0.5">{card.help.verde}</dd>
                </div>
                <div>
                  <dt className="text-amber-400/90 font-medium">Amarelo</dt>
                  <dd className="text-cgo-muted mt-0.5">{card.help.amarelo}</dd>
                </div>
                <div>
                  <dt className="text-rose-400/90 font-medium">Vermelho</dt>
                  <dd className="text-cgo-muted mt-0.5">{card.help.vermelho}</dd>
                </div>
                <div>
                  <dt className="text-slate-400 font-medium">Cinza</dt>
                  <dd className="text-cgo-muted mt-0.5">{card.help.cinza}</dd>
                </div>
              </dl>
              <Link
                to={`/cgo/radar?card=${card.id}`}
                className="inline-block mt-4 text-xs text-cgo-accent hover:underline"
              >
                Abrir no Radar operacional →
              </Link>
            </article>
          );
        })}
      </section>
    </div>
  );
}
