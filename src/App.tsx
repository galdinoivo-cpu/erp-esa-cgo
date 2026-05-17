import { Navigate, Route, Routes } from "react-router-dom";
import LoginPage from "@/pages/portal/LoginPage";
import CgoRoutes from "@/routes/CgoRoutes";
import RequireAuth from "@/components/RequireAuth";
import { CgoProvider } from "@/state/CgoContext";
import ColrGerenciaPage from "@/pages/colr/ColrGerenciaPage";
import ColrTRPage from "@/pages/colr/ColrTRPage";
import ColrManutencaoPage from "@/pages/colr/ColrManutencaoPage";
import OperadorOcePage from "@/pages/operador/OperadorOcePage";
import HistoricoProducaoPage from "@/pages/operador/HistoricoProducaoPage";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<Navigate to="/login" replace />} />

      <Route path="/cgo/*" element={<CgoRoutes />} />

      <Route
        path="/colr/gerencia"
        element={
          <RequireAuth profiles={["COLR_GERENCIA", "DIRETOR_CGO_MASTER"]}>
            <CgoProvider>
              <ColrGerenciaPage />
            </CgoProvider>
          </RequireAuth>
        }
      />
      <Route
        path="/colr/tr"
        element={
          <RequireAuth profiles={["COLR_TR", "DIRETOR_CGO_MASTER"]}>
            <ColrTRPage />
          </RequireAuth>
        }
      />
      <Route
        path="/colr/manutencao"
        element={
          <RequireAuth profiles={["COLR_MANUTENCAO", "DIRETOR_CGO_MASTER"]}>
            <CgoProvider>
              <ColrManutencaoPage />
            </CgoProvider>
          </RequireAuth>
        }
      />

      <Route
        path="/operador/oce"
        element={
          <RequireAuth profiles={["TERCEIRIZADO_OPERADOR", "DIRETOR_CGO_MASTER"]}>
            <OperadorOcePage />
          </RequireAuth>
        }
      />
      <Route
        path="/operador/historico-producao"
        element={
          <RequireAuth profiles={["TERCEIRIZADO_OPERADOR", "DIRETOR_CGO_MASTER"]}>
            <HistoricoProducaoPage />
          </RequireAuth>
        }
      />

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
