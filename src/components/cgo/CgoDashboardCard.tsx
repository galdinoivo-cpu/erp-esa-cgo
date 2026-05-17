import { Link } from "react-router-dom";
import { HelpCircle } from "lucide-react";
import type { CgoDashboardCardConfig } from "@/domain/cgoDashboardCards";
import { CGO_COLOR_STYLES } from "@/domain/cgoDashboardCards";

export default function CgoDashboardCard({
  config,
  quantidade,
}: {
  config: CgoDashboardCardConfig;
  quantidade: number;
}) {
  const styles = CGO_COLOR_STYLES[config.cor];
  const Icon = config.icone;
  const radarUrl = `/cgo/radar?card=${config.id}`;
  const helpUrl = `/cgo/help#${config.id}`;

  return (
    <article
      className={`relative rounded-xl border ${styles.border} ${styles.bg} p-4 flex flex-col min-h-[168px] transition-shadow hover:shadow-lg hover:shadow-black/20`}
      title={config.descricao}
    >
      <div className="flex items-start justify-between gap-2">
        <span className={`rounded-lg p-2.5 ${styles.badge}`}>
          <Icon className={`w-7 h-7 ${styles.icon}`} strokeWidth={1.75} aria-hidden />
        </span>
        <Link
          to={helpUrl}
          className="text-cgo-muted hover:text-white p-1"
          title="Ajuda sobre este indicador"
          aria-label={`Ajuda: ${config.titulo}`}
        >
          <HelpCircle className="w-4 h-4" />
        </Link>
      </div>

      <p className={`mt-3 text-4xl font-bold tabular-nums ${quantidade > 0 ? "text-white" : "text-slate-500"}`}>
        {quantidade}
      </p>
      <h3 className="text-sm font-semibold text-white mt-1 leading-snug">{config.titulo}</h3>
      <p className="text-xs text-cgo-muted mt-2 flex-1 leading-relaxed">{config.descricao}</p>

      <Link
        to={radarUrl}
        className="mt-4 inline-flex items-center justify-center rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-slate-200 hover:bg-white/10 hover:border-white/20"
      >
        Ver detalhes no Radar
      </Link>
    </article>
  );
}
