import { Route, Routes } from "react-router-dom";
import RequireAuth from "@/components/RequireAuth";
import PortalEngenheiroLayout from "@/components/cliente/PortalEngenheiroLayout";
import { PortalClienteProvider } from "@/state/PortalClienteContext";
import PortalEngenheiroHomePage from "@/pages/cliente/PortalEngenheiroHomePage";
import NovaOsfPage from "@/pages/cliente/NovaOsfPage";
import MapaPreparacaoPage from "@/pages/cliente/MapaPreparacaoPage";
import LaudosPage from "@/pages/cliente/LaudosPage";
import LaudoDetailPage from "@/pages/cliente/LaudoDetailPage";
import MinhasOsfPage from "@/pages/cliente/MinhasOsfPage";

export default function EngenheiroRoutes() {
  return (
    <RequireAuth profiles={["ENGENHEIRO_CLIENTE", "DIRETOR_CGO_MASTER"]}>
      <PortalClienteProvider>
        <Routes>
          <Route element={<PortalEngenheiroLayout />}>
            <Route index element={<PortalEngenheiroHomePage />} />
            <Route path="nova-osf" element={<NovaOsfPage />} />
            <Route path="minhas-osf" element={<MinhasOsfPage />} />
            <Route path="mapa-preparacao" element={<MapaPreparacaoPage />} />
            <Route path="laudos" element={<LaudosPage />} />
            <Route path="laudos/:id" element={<LaudoDetailPage />} />
          </Route>
        </Routes>
      </PortalClienteProvider>
    </RequireAuth>
  );
}
