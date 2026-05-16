import { NavLink, Outlet } from "react-router-dom";
import {
  CalendarClock,
  ClipboardList,
  FileStack,
  History,
  Home,
  Layers,
  Package,
  Radar,
  ScrollText,
  Settings,
  Users,
} from "lucide-react";
import { useCgo } from "@/state/CgoContext";
import { formatDateTime } from "@/domain/time";

const nav = [
  { to: "/", label: "Dashboard", icon: Home },
  { to: "/radar", label: "Radar CGO", icon: Radar },
  { to: "/programadas", label: "Operações Programadas", icon: CalendarClock },
  { to: "/config", label: "Configuração CGO", icon: Settings },
  { to: "/modelos", label: "Modelos de Operação", icon: Layers },
  { to: "/tarefas", label: "Tarefas (modelo)", icon: ClipboardList },
  { to: "/checklists", label: "Checklists", icon: FileStack },
  { to: "/ativos", label: "Ativos", icon: Package },
  { to: "/logs", label: "Logs", icon: ScrollText },
  { to: "/decisoes", label: "Decisões CGO", icon: Users },
  { to: "/historico", label: "Histórico", icon: History },
];

export default function AppLayout() {
  const { now, offsetMs, setClockOffsetMinutes, advanceClockHours, resetClock, currentUserId, setCurrentUserId, rawDb } =
    useCgo();

  return (
    <div className="flex min-h-screen">
      <aside className="w-60 shrink-0 border-r border-cgo-border bg-cgo-panel flex flex-col">
        <div className="p-4 border-b border-cgo-border">
          <div className="text-xs uppercase tracking-wide text-cgo-muted">ESA ERP</div>
          <div className="text-lg font-semibold text-white">CGO</div>
          <div className="text-xs text-cgo-muted mt-1">Central de Gerência de Operação</div>
        </div>
        <nav className="flex-1 overflow-y-auto p-2 space-y-0.5">
          {nav.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              className={({ isActive }) =>
                `flex items-center gap-2 rounded-md px-3 py-2 text-sm ${
                  isActive
                    ? "bg-cgo-accent/20 text-white border border-cgo-accent/40"
                    : "text-slate-300 hover:bg-white/5 border border-transparent"
                }`
              }
            >
              <Icon className="w-4 h-4 shrink-0 opacity-80" />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="p-3 border-t border-cgo-border text-xs text-cgo-muted space-y-2">
          <div>
            <div className="text-cgo-muted mb-1">Relógio simulado</div>
            <div className="text-white font-mono text-[11px]">{formatDateTime(now.toISOString())}</div>
            {offsetMs !== 0 && (
              <div className="text-amber-400 mt-1">Offset ativo (+{Math.round(offsetMs / 3600000)}h)</div>
            )}
          </div>
          <div className="flex flex-wrap gap-1">
            <button
              type="button"
              className="px-2 py-1 rounded bg-white/10 hover:bg-white/15"
              onClick={() => advanceClockHours(6)}
            >
              +6h
            </button>
            <button
              type="button"
              className="px-2 py-1 rounded bg-white/10 hover:bg-white/15"
              onClick={() => advanceClockHours(24)}
            >
              +24h
            </button>
            <button
              type="button"
              className="px-2 py-1 rounded bg-white/10 hover:bg-white/15"
              onClick={() => setClockOffsetMinutes(0)}
            >
              offset 0
            </button>
            <button
              type="button"
              className="px-2 py-1 rounded bg-rose-900/40 hover:bg-rose-800/50"
              onClick={() => resetClock()}
            >
              real
            </button>
          </div>
          <label className="block">
            <span className="text-cgo-muted">Usuário ativo</span>
            <select
              className="mt-1 w-full rounded bg-cgo-bg border border-cgo-border px-2 py-1 text-white text-xs"
              value={currentUserId}
              onChange={(e) => setCurrentUserId(e.target.value)}
            >
              {rawDb.users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.role})
                </option>
              ))}
            </select>
          </label>
        </div>
      </aside>
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-12 border-b border-cgo-border flex items-center px-4 justify-between bg-cgo-panel/80 backdrop-blur">
          <span className="text-sm text-cgo-muted">MVP — dados em JSON / localStorage</span>
        </header>
        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
