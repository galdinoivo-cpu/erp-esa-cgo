import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { ClipboardList, FileCheck, Map, History, LogOut } from "lucide-react";
import { useAuth } from "@/state/AuthContext";

const tabs = [
  { to: "/cliente/engenheiro/nova-osf", label: "Abrir OSF", icon: ClipboardList },
  { to: "/cliente/engenheiro/mapa-preparacao", label: "Preparação", icon: Map },
  { to: "/cliente/engenheiro/laudos", label: "Laudos", icon: FileCheck },
  { to: "/cliente/engenheiro/minhas-osf", label: "Histórico", icon: History },
];

export default function PortalEngenheiroLayout() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0c1218] to-cgo-bg">
      <header className="border-b border-cgo-border bg-[#0f1724]/95 backdrop-blur sticky top-0 z-40">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <p className="text-[10px] uppercase tracking-[0.25em] text-emerald-400/90">ESA · Acesso Técnico da Fazenda</p>
          <h1 className="text-xl font-bold text-white mt-0.5">Portal do Engenheiro</h1>
          {currentUser && (
            <p className="text-sm text-cgo-muted mt-1">
              {currentUser.nomeCompleto}
              {currentUser.crea ? ` · ${currentUser.crea}` : ""}
            </p>
          )}
        </div>
        <nav className="max-w-3xl mx-auto px-2 pb-2 flex gap-1 overflow-x-auto">
          {tabs.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex-shrink-0 inline-flex items-center gap-1.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-emerald-600/25 text-emerald-100 border border-emerald-500/40"
                    : "text-cgo-muted hover:text-white hover:bg-white/5 border border-transparent"
                }`
              }
            >
              <Icon className="w-4 h-4" />
              {label}
            </NavLink>
          ))}
        </nav>
      </header>

      <main className="max-w-3xl mx-auto p-4 pb-24">
        <Outlet />
      </main>

      <footer className="fixed bottom-0 inset-x-0 border-t border-cgo-border bg-cgo-panel/95 backdrop-blur">
        <div className="max-w-3xl mx-auto px-4 py-3 flex justify-between items-center">
          <NavLink to="/cliente/engenheiro" className="text-xs text-emerald-400 hover:underline">
            Início do portal
          </NavLink>
          <button
            type="button"
            className="inline-flex items-center gap-1 text-xs text-cgo-muted hover:text-white"
            onClick={() => {
              logout();
              navigate("/login");
            }}
          >
            <LogOut className="w-3.5 h-3.5" />
            Sair
          </button>
        </div>
      </footer>
    </div>
  );
}
