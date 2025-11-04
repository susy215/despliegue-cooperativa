import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import MainLayout from './components/Layout/MainLayout';
import LoginPage from './components/Auth/LoginPage';
import DashboardPage from './pages/DashboardPage';
import AuditoriaPage from './pages/AuditoriaPage';
import SociosPage from './pages/SociosPage';
import SocioFormPage from './pages/SocioFormPage';
import SocioEditPage from './pages/SocioEditPage';
import UserManagementPage from './pages/UserManagementPage';
import UserEditPage from './pages/UserEditPage';
import ParcelasPage from './pages/ParcelasPage';
import ParcelaFormPage from './pages/ParcelaFormPage';
import ParcelaDetailPage from './pages/ParcelaDetailPage';
import ParcelasSocioPage from './pages/ParcelasSocioPage';
import ReportesPage from './pages/ReportesPage';
import RolesPage from './pages/RolesPage';
import SemillasPage from './pages/SemillasPage';
import SemillaDetailPage from './pages/SemillaDetailPage';
import SemillaFormPage from './pages/SemillaFormPage';
import InsumosPage from './pages/InsumosPage';
import InsumoDetailPage from './pages/InsumoDetailPage';
import InsumoFormPage from './pages/InsumoFormPage';

// ===== PWA Install Prompt =====
import PWAInstallPrompt from './components/PWAInstallPrompt';

// ===== CU9: Gestión de Campañas =====
import CampaignsPage from './pages/CU9_Campaigns/CampaignsPage';
import CampaignDetailPage from './pages/CU9_Campaigns/CampaignDetailPage';

// ===== CU10: Gestión de Labores Agrícolas =====
import LaborPage from './pages/LaborPage';
import LaborFormPage from './pages/LaborFormPage';
import LaborDetailPage from './pages/LaborDetailPage';

// ===== CU11: Reportes =====
import LaborsByCampaignReport from './pages/CU11_Reports/LaborsByCampaignReport';
import ProductionByCampaignReport from './pages/CU11_Reports/ProductionByCampaignReport';
import ProductionByPlotReport from './pages/CU11_Reports/ProductionByPlotReport';

// ===== CU12: Sistema de Pagos =====
import PedidosPage from './pages/CU12_Pagos/PedidosPage';
import PedidoFormPage from './pages/CU12_Pagos/PedidoFormPage';
import PedidoDetailPage from './pages/CU12_Pagos/PedidoDetailPage';
import HistorialVentasPage from './pages/CU12_Pagos/HistorialVentasPage';

// ===== CU13: Ventas de Insumos =====
import PedidosInsumosPage from './pages/CU13_VentasInsumos/PedidosInsumosPage';
import PedidoInsumoFormPage from './pages/CU13_VentasInsumos/PedidoInsumoFormPage';
import PedidoInsumoDetailPage from './pages/CU13_VentasInsumos/PedidoInsumoDetailPage';

// ===== CU15: Productos Cosechados =====
import ProductosCosechadosPage from './pages/ProductosCosechadosPage';
import ProductosCosechadosFormPage from './pages/ProductosCosechadosFormPage';
import ProductosCosechadosDetailPage from './pages/ProductosCosechadosDetailPage';

// Componente protegido con layout
const ProtectedLayout = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-950 via-emerald-900 to-emerald-800 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
        <span className="ml-3 text-white">Cargando...</span>
      </div>
    );
  }

  return isAuthenticated ? (
    <MainLayout>
      {children}
    </MainLayout>
  ) : (
    <Navigate to="/login" replace />
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <PWAInstallPrompt />
          <Routes>
            {/* Ruta pública de login */}
            <Route path="/login" element={<LoginPage />} />

            {/* Rutas protegidas */}
            <Route
              path="/dashboard"
              element={
                <ProtectedLayout>
                  <DashboardPage />
                </ProtectedLayout>
              }
            />
            <Route
              path="/socios"
              element={
                <ProtectedLayout>
                  <SociosPage />
                </ProtectedLayout>
              }
            />
            <Route
              path="/socios/nuevo"
              element={
                <ProtectedLayout>
                  <SocioFormPage />
                </ProtectedLayout>
              }
            />
            <Route
              path="/socios/editar/:id"
              element={
                <ProtectedLayout>
                  <SocioEditPage />
                </ProtectedLayout>
              }
            />
            <Route
              path="/parcelas"
              element={
                <ProtectedLayout>
                  <ParcelasPage />
                </ProtectedLayout>
              }
            />
            <Route
              path="/parcelas/nueva"
              element={
                <ProtectedLayout>
                  <ParcelaFormPage />
                </ProtectedLayout>
              }
            />
            <Route
              path="/parcelas/ver/:id"
              element={
                <ProtectedLayout>
                  <ParcelaDetailPage />
                </ProtectedLayout>
              }
            />
            <Route
              path="/parcelas/editar/:id"
              element={
                <ProtectedLayout>
                  <ParcelaFormPage />
                </ProtectedLayout>
              }
            />
            <Route
              path="/socios/:socioId/parcelas"
              element={
                <ProtectedLayout>
                  <ParcelasSocioPage />
                </ProtectedLayout>
              }
            />
            <Route
              path="/usuarios"
              element={
                <ProtectedLayout>
                  <UserManagementPage />
                </ProtectedLayout>
              }
            />
            <Route
              path="/usuarios/editar/:id"
              element={
                <ProtectedLayout>
                  <UserEditPage />
                </ProtectedLayout>
              }
            />
            <Route
              path="/roles"
              element={
                <ProtectedLayout>
                  <RolesPage />
                </ProtectedLayout>
              }
            />
            <Route
              path="/semillas"
              element={
                <ProtectedLayout>
                  <SemillasPage />
                </ProtectedLayout>
              }
            />
            <Route
              path="/semillas/nueva"
              element={
                <ProtectedLayout>
                  <SemillaFormPage />
                </ProtectedLayout>
              }
            />
            <Route
              path="/semillas/:id"
              element={
                <ProtectedLayout>
                  <SemillaDetailPage />
                </ProtectedLayout>
              }
            />
            <Route
              path="/semillas/:id/editar"
              element={
                <ProtectedLayout>
                  <SemillaFormPage />
                </ProtectedLayout>
              }
            />
            <Route
              path="/insumos"
              element={
                <ProtectedLayout>
                  <InsumosPage />
                </ProtectedLayout>
              }
            />
            <Route
              path="/insumos/nueva"
              element={
                <ProtectedLayout>
                  <InsumoFormPage />
                </ProtectedLayout>
              }
            />
            <Route
              path="/insumos/:id"
              element={
                <ProtectedLayout>
                  <InsumoDetailPage />
                </ProtectedLayout>
              }
            />
            <Route
              path="/insumos/:id/editar"
              element={
                <ProtectedLayout>
                  <InsumoFormPage />
                </ProtectedLayout>
              }
            />
            <Route
              path="/auditoria"
              element={
                <ProtectedLayout>
                  <AuditoriaPage />
                </ProtectedLayout>
              }
            />

            <Route
              path="/reportes"
              element={
                <ProtectedLayout>
                  <ReportesPage />
                </ProtectedLayout>
              }
            />

            {/* ===== CU9: CAMPAÑAS ===== */}
            <Route
              path="/campaigns"
              element={
                <ProtectedLayout>
                  <CampaignsPage />
                </ProtectedLayout>
              }
            />
            <Route
              path="/campaigns/:id"
              element={
                <ProtectedLayout>
                  <CampaignDetailPage />
                </ProtectedLayout>
              }
            />

            {/* ===== CU10: LABORES AGRÍCOLAS ===== */}
            <Route
              path="/labores"
              element={
                <ProtectedLayout>
                  <LaborPage />
                </ProtectedLayout>
              }
            />
            <Route
              path="/labores/nueva"
              element={
                <ProtectedLayout>
                  <LaborFormPage />
                </ProtectedLayout>
              }
            />
            <Route
              path="/labores/editar/:id"
              element={
                <ProtectedLayout>
                  <LaborFormPage />
                </ProtectedLayout>
              }
            />
            <Route
              path="/labores/:id"
              element={
                <ProtectedLayout>
                  <LaborDetailPage />
                </ProtectedLayout>
              }
            />

            {/* ===== CU11: REPORTES ===== */}
            <Route
              path="/reports/labors"
              element={
                <ProtectedLayout>
                  <LaborsByCampaignReport />
                </ProtectedLayout>
              }
            />
            <Route
              path="/reports/production-campaign"
              element={
                <ProtectedLayout>
                  <ProductionByCampaignReport />
                </ProtectedLayout>
              }
            />
            <Route
              path="/reports/production-plot"
              element={
                <ProtectedLayout>
                  <ProductionByPlotReport />
                </ProtectedLayout>
              }
            />
            
            {/* ===== CU12: Sistema de Pagos ===== */}
            <Route
              path="/pedidos"
              element={
                <ProtectedLayout>
                  <PedidosPage />
                </ProtectedLayout>
              }
            />
            <Route
              path="/pedidos/nuevo"
              element={
                <ProtectedLayout>
                  <PedidoFormPage />
                </ProtectedLayout>
              }
            />
            <Route
              path="/pedidos/:id"
              element={
                <ProtectedLayout>
                  <PedidoDetailPage />
                </ProtectedLayout>
              }
            />
            <Route
              path="/pedidos/:id/editar"
              element={
                <ProtectedLayout>
                  <PedidoFormPage />
                </ProtectedLayout>
              }
            />
            <Route
              path="/historial-ventas"
              element={
                <ProtectedLayout>
                  <HistorialVentasPage />
                </ProtectedLayout>
              }
            />
            
            {/* ===== CU13: Ventas de Insumos ===== */}
            <Route
              path="/pedidos-insumos"
              element={
                <ProtectedLayout>
                  <PedidosInsumosPage />
                </ProtectedLayout>
              }
            />
            <Route
              path="/pedidos-insumos/nuevo"
              element={
                <ProtectedLayout>
                  <PedidoInsumoFormPage />
                </ProtectedLayout>
              }
            />
            <Route
              path="/pedidos-insumos/:id"
              element={
                <ProtectedLayout>
                  <PedidoInsumoDetailPage />
                </ProtectedLayout>
              }
            />

            {/* ===== CU15: PRODUCTOS COSECHADOS ===== */}
            <Route
              path="/productos-cosechados"
              element={
                <ProtectedLayout>
                  <ProductosCosechadosPage />
                </ProtectedLayout>
              }
            />
            <Route
              path="/productos-cosechados/nuevo"
              element={
                <ProtectedLayout>
                  <ProductosCosechadosFormPage />
                </ProtectedLayout>
              }
            />
            <Route
              path="/productos-cosechados/:id"
              element={
                <ProtectedLayout>
                  <ProductosCosechadosDetailPage />
                </ProtectedLayout>
              }
            />
            <Route
              path="/productos-cosechados/:id/editar"
              element={
                <ProtectedLayout>
                  <ProductosCosechadosFormPage />
                </ProtectedLayout>
              }
            />
            
            {/* Ruta por defecto - redirige al dashboard */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />

            {/* Ruta 404 */}
            <Route
              path="*"
              element={
                <div className="min-h-screen bg-gradient-to-br from-emerald-950 via-emerald-900 to-emerald-800 flex items-center justify-center">
                  <div className="text-center">
                    <h1 className="text-4xl font-bold text-white mb-4">404</h1>
                    <p className="text-emerald-100/80 mb-8">Página no encontrada</p>
                    <button
                      onClick={() => window.location.href = '/dashboard'}
                      className="bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200 font-medium py-2 px-6 rounded-lg transition-colors"
                    >
                      Ir al Dashboard
                    </button>
                  </div>
                </div>
              }
            />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;