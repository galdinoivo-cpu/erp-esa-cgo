import { Navigate, useLocation } from "react-router-dom";
import { canAccess } from "@/domain/authRoutes";
import { useAuth } from "@/state/AuthContext";
import type { UserProfile } from "@/types/auth";

export default function RequireAuth({
  children,
  profiles,
}: {
  children: React.ReactNode;
  profiles?: UserProfile[];
}) {
  const { session, currentUser } = useAuth();
  const location = useLocation();

  if (!session || !currentUser) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  if (currentUser.status !== "ativo") {
    return <Navigate to="/login" replace />;
  }

  if (profiles && !profiles.includes(currentUser.perfil)) {
    return <Navigate to="/login" replace />;
  }

  if (!canAccess(currentUser.perfil, location.pathname)) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
