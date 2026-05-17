import { Routes, Route, Navigate } from "react-router-dom";
import { CgoProvider } from "@/state/CgoContext";
import AppLayout from "@/components/AppLayout";
import Dashboard from "@/pages/Dashboard";
import RadarCGO from "@/pages/RadarCGO";
import Programadas from "@/pages/Programadas";
import ConfiguracaoCGO from "@/pages/ConfiguracaoCGO";
import ModelosOperacao from "@/pages/ModelosOperacao";
import TarefasModelo from "@/pages/TarefasModelo";
import ChecklistsPage from "@/pages/ChecklistsPage";
import AtivosPage from "@/pages/AtivosPage";
import LogsPage from "@/pages/LogsPage";
import DecisoesPage from "@/pages/DecisoesPage";
import HistoricoPage from "@/pages/HistoricoPage";
import AdminUsuariosPage from "@/pages/admin/AdminUsuariosPage";
import RequireAuth from "@/components/RequireAuth";

export default function CgoRoutes() {
  return (
    <RequireAuth profiles={["DIRETOR_CGO_MASTER", "CGO_ADMIN"]}>
      <CgoProvider>
        <Routes>
          <Route element={<AppLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="radar" element={<RadarCGO />} />
            <Route path="programadas" element={<Programadas />} />
            <Route path="config" element={<ConfiguracaoCGO />} />
            <Route path="modelos" element={<ModelosOperacao />} />
            <Route path="tarefas" element={<TarefasModelo />} />
            <Route path="checklists" element={<ChecklistsPage />} />
            <Route path="ativos" element={<AtivosPage />} />
            <Route path="logs" element={<LogsPage />} />
            <Route path="decisoes" element={<DecisoesPage />} />
            <Route path="historico" element={<HistoricoPage />} />
            <Route path="admin-usuarios" element={<AdminUsuariosPage />} />
            <Route path="*" element={<Navigate to="/cgo" replace />} />
          </Route>
        </Routes>
      </CgoProvider>
    </RequireAuth>
  );
}
