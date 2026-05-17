import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  CalendarClock,
  ClipboardList,
  FileStack,
  History,
  Home,
  Layers,
  LogOut,
  Package,
  Radar,
  ScrollText,
  Settings,
  UserCog,
  Users,
} from "lucide-react";
import { useCgo } from "@/state/CgoContext";
import { useAuth } from "@/state/AuthContext";
import { formatDateTime } from "@/domain/time";
import { PROFILE_LABELS } from "@/domain/authRoutes";

const nav = [
  { to: "/cgo", label: "Dashboard", icon: Home, end: true },
  { to: "/cgo/radar", label: "Radar CGO", icon: Radar },
  { to: "/cgo/programadas", label: "Operações Programadas", icon: CalendarClock },
  { to: "/cgo/config", label: "Configuração CGO", icon: Settings },
  { to: "/cgo/modelos", label: "Modelos de Operação", icon: Layers },
  { to: "/cgo/tarefas", label: "Tarefas (modelo)", icon: ClipboardList },
  { to: "/cgo/checklists", label: "Checklists", icon: FileStack },
  { to: "/cgo/ativos", label: "Ativos", icon: Package },
  { to: "/cgo/logs", label: "Logs", icon: ScrollText },
  { to: "/cgo/decisoes", label: "Decisões CGO", icon: Users },
  { to: "/cgo/historico", label: "Histórico", icon: History },
];

export default function AppLayout() {
  const { now, offsetMs, setClockOffsetMinutes, advanceClockHours, resetClock } = useCgo();
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <section className="flex min-h-screen">
      <aside className="w-60 shrink-0 border-r border-cgo-border bg-cgo-panel flex flex-col">
        <header className="p-4 border-b border-cgo-border">
          <p className="text-xs uppercase tracking-wide text-cgo-muted">ESA ERP</p>
          <p className="text-lg font-semibold text-white">CGO</p>
          <p className="text-xs text-cgo-muted mt-1">Central de Gerência de Operação</p>
        </header>
        <nav className="flex-1 overflow-y-auto p-2 space-y-0.5">
          {nav.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
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
          {currentUser?.perfil === "DIRETOR_CGO_MASTER" && (
            <NavLink
              to="/cgo/admin-usuarios"
              className={({ isActive }) =>
                `flex items-center gap-2 rounded-md px-3 py-2 text-sm ${
                  isActive ? "bg-cgo-accent/20 text-white border border-cgo-accent/40" : "text-slate-300 hover:bg-white/5 border border-transparent"
                }`
              }
            >
              <UserCog className="w-4 h-4" />
              Administração de Usuários
            </NavLink>
          )}
        </nav>
        <footer className="p-3 border-t border-cgo-border text-xs text-cgo-muted space-y-2">
          {currentUser && (
            <p className="text-slate-300">
              {currentUser.nomeCompleto}
              <br />
              <span className="text-cgo-muted">{PROFILE_LABELS[currentUser.perfil]}</span>
            </p>
          )}
          <p className="text-white font-mono text-[11px]">{formatDateTime(now.toISOString())}</p>
          <p className="flex flex-wrap gap-1">
            <button type="button" className="px-2 py-1 rounded bg-white/10" onClick={() => advanceClockHours(6)}>
              +6h
            </button>
            <button type="button" className="px-2 py-1 rounded bg-white/10" onClick={() => advanceClockHours(24)}>
              +24h
            </button>
            <button type="button" className="px-2 py-1 rounded bg-white/10" onClick={() => resetClock()}>
              real
            </button>
          </p>
          <button
            type="button"
            className="w-full flex items-center justify-center gap-1 rounded border border-cgo-border py-1.5 text-slate-300 hover:bg-white/5"
            onClick={() => {
              logout();
              navigate("/login");
            }}
          >
            <LogOut className="w-3.5 h-3.5" />
            Sair
          </button>
        </footer>
      </aside>
      <section className="flex-1 flex flex-col min-w-0">
        <header className="h-12 border-b border-cgo-border flex items-center px-4 bg-cgo-panel/80">
          <span className="text-sm text-cgo-muted">MVP — JSON / localStorage · pronto para backend</span>
        </header>
        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </section>
    </section>
  );
}
