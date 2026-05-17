import { Link, useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";
import { useAuth } from "@/state/AuthContext";
import { PROFILE_LABELS } from "@/domain/authRoutes";

export default function ShellHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="border-b border-cgo-border bg-cgo-panel/90 backdrop-blur sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <Link to="/login" className="text-xs uppercase tracking-wide text-cgo-muted hover:text-white">
            ESA ERP
          </Link>
          <div>
            <h1 className="text-lg font-semibold text-white">{title}</h1>
            {subtitle && <p className="text-xs text-cgo-muted">{subtitle}</p>}
          </div>
        </div>
        <div className="flex items-center gap-3 text-sm">
          {currentUser && (
            <span className="text-cgo-muted text-xs hidden sm:inline">
              {currentUser.nomeCompleto} · {PROFILE_LABELS[currentUser.perfil]}
            </span>
          )}
          <button
            type="button"
            className="inline-flex items-center gap-1 rounded-md border border-cgo-border px-3 py-1.5 text-xs hover:bg-white/5"
            onClick={() => {
              logout();
              navigate("/login");
            }}
          >
            <LogOut className="w-3.5 h-3.5" />
            Sair
          </button>
        </div>
      </div>
    </header>
  );
}
