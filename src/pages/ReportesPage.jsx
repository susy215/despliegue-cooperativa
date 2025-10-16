import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart3,
  Users,
  MapPin,
  FileText,
  Download,
  Filter,
  Search,
  Calendar,
  TrendingUp,
  PieChart,
  Activity
} from 'lucide-react';
import { socioService } from '../api/socioService';
import { parcelaService } from '../api/parcelaService';

const ReportesPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('socios');
  const [sociosData, setSociosData] = useState([]);
  const [parcelasData, setParcelasData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filtrosSocios, setFiltrosSocios] = useState({
    estado: '',
    comunidad: '',
    fecha_desde: '',
    fecha_hasta: ''
  });
  const [filtrosParcelas, setFiltrosParcelas] = useState({
    tipo_suelo: '',
    superficie_min: '',
    superficie_max: '',
    estado: ''
  });

  useEffect(() => {
    if (activeTab === 'socios') {
      cargarDatosSocios();
    } else if (activeTab === 'parcelas') {
      cargarDatosParcelas();
    }
  }, [activeTab]);

  const cargarDatosSocios = async () => {
    try {
      setLoading(true);
      const response = await socioService.buscarSociosAvanzado();
      setSociosData(response.results || []);
    } catch (error) {
      console.error('Error al cargar datos de socios:', error);
      setSociosData([]);
    } finally {
      setLoading(false);
    }
  };

  const cargarDatosParcelas = async () => {
    try {
      setLoading(true);
      const response = await parcelaService.buscarParcelasAvanzado();
      setParcelasData(response.results || []);
    } catch (error) {
      console.error('Error al cargar datos de parcelas:', error);
      setParcelasData([]);
    } finally {
      setLoading(false);
    }
  };

  const aplicarFiltrosSocios = async () => {
    try {
      setLoading(true);
      const params = {
        estado: filtrosSocios.estado,
        comunidad: filtrosSocios.comunidad,
        fecha_ingreso_desde: filtrosSocios.fecha_desde,
        fecha_ingreso_hasta: filtrosSocios.fecha_hasta
      };
      const response = await socioService.buscarSociosAvanzado(params);
      setSociosData(response.results || []);
    } catch (error) {
      console.error('Error al filtrar socios:', error);
    } finally {
      setLoading(false);
    }
  };

  const aplicarFiltrosParcelas = async () => {
    try {
      setLoading(true);
      const params = {
        tipo_suelo: filtrosParcelas.tipo_suelo,
        superficie_min: filtrosParcelas.superficie_min,
        superficie_max: filtrosParcelas.superficie_max,
        estado: filtrosParcelas.estado
      };
      const response = await parcelaService.buscarParcelasAvanzado(params);
      setParcelasData(response.results || []);
    } catch (error) {
      console.error('Error al filtrar parcelas:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportarReporte = (tipo) => {
    // Implementar exportación según el tipo
    alert(`Exportando reporte de ${tipo}... (Funcionalidad próximamente)`);
  };

  const calcularEstadisticasSocios = () => {
    const total = sociosData.length;
    const activos = sociosData.filter(s => s.estado === 'ACTIVO').length;
    const inactivos = total - activos;
    const comunidades = [...new Set(sociosData.map(s => s.comunidad?.nombre).filter(Boolean))].length;

    return { total, activos, inactivos, comunidades };
  };

  const calcularEstadisticasParcelas = () => {
    const total = parcelasData.length;
    const superficieTotal = parcelasData.reduce((sum, p) => sum + (parseFloat(p.superficie) || 0), 0);
    const tiposSuelo = [...new Set(parcelasData.map(p => p.tipo_suelo).filter(Boolean))].length;
    const activas = parcelasData.filter(p => p.estado === 'ACTIVA').length;

    return { total, superficieTotal: superficieTotal.toFixed(2), tiposSuelo, activas };
  };

  const tabs = [
    { id: 'socios', label: 'Reportes de Socios', icon: Users },
    { id: 'parcelas', label: 'Reportes de Parcelas', icon: MapPin },
    { id: 'campañas', label: 'Reportes de Campañas', icon: Calendar },
    { id: 'estadisticas', label: 'Estadísticas Generales', icon: BarChart3 }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Reportes y Consultas</h1>
          <p className="text-emerald-100/80 mt-1">
            Consulta y genera reportes de socios y parcelas
          </p>
        </div>
        <div className="flex space-x-3 mt-4 sm:mt-0">
          <button
            onClick={() => exportarReporte(activeTab)}
            className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-200 font-medium py-2 px-4 rounded-lg transition-colors flex items-center space-x-2"
          >
            <Download className="w-4 h-4" />
            <span>Exportar</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-1">
        <div className="flex space-x-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-lg transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-emerald-500/20 text-emerald-200 border border-emerald-400/30'
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-sm font-medium">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Content based on active tab */}
      {activeTab === 'socios' && (
        <div className="space-y-6">
          {/* Estadísticas rápidas */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {Object.entries(calcularEstadisticasSocios()).map(([key, value]) => (
              <div key={key} className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                    <Activity className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-white/60 text-sm capitalize">
                      {key.replace('_', ' ')}
                    </p>
                    <p className="text-white font-semibold text-lg">{value}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Filtros */}
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6">
            <h3 className="text-white font-medium mb-4 flex items-center space-x-2">
              <Filter className="w-4 h-4" />
              <span>Filtros de Socios</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <select
                value={filtrosSocios.estado}
                onChange={(e) => setFiltrosSocios({...filtrosSocios, estado: e.target.value})}
                className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-400"
              >
                <option value="">Todos los estados</option>
                <option value="ACTIVO">Activo</option>
                <option value="INACTIVO">Inactivo</option>
              </select>
              <input
                type="text"
                placeholder="Comunidad"
                value={filtrosSocios.comunidad}
                onChange={(e) => setFiltrosSocios({...filtrosSocios, comunidad: e.target.value})}
                className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-emerald-200/50 focus:outline-none focus:ring-2 focus:ring-emerald-400"
              />
              <input
                type="date"
                placeholder="Fecha desde"
                value={filtrosSocios.fecha_desde}
                onChange={(e) => setFiltrosSocios({...filtrosSocios, fecha_desde: e.target.value})}
                className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-400"
              />
              <input
                type="date"
                placeholder="Fecha hasta"
                value={filtrosSocios.fecha_hasta}
                onChange={(e) => setFiltrosSocios({...filtrosSocios, fecha_hasta: e.target.value})}
                className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-400"
              />
            </div>
            <div className="flex justify-end mt-4">
              <button
                onClick={aplicarFiltrosSocios}
                className="bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200 font-medium py-2 px-6 rounded-lg transition-colors"
              >
                Aplicar Filtros
              </button>
            </div>
          </div>

          {/* Tabla de resultados */}
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-white/20">
              <h3 className="text-white font-medium">Resultado de Socios</h3>
            </div>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
                <span className="ml-3 text-emerald-100">Cargando...</span>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-white/5">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-medium text-emerald-200 uppercase tracking-wider">
                        Socio
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-emerald-200 uppercase tracking-wider">
                        CI/NIT
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-emerald-200 uppercase tracking-wider">
                        Comunidad
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-emerald-200 uppercase tracking-wider">
                        Estado
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-emerald-200 uppercase tracking-wider">
                        Fecha Ingreso
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {sociosData.slice(0, 10).map((socio) => (
                      <tr key={socio.id} className="hover:bg-white/5 transition-colors">
                        <td className="px-6 py-4 text-white font-medium">
                          {socio.usuario?.nombres} {socio.usuario?.apellidos}
                        </td>
                        <td className="px-6 py-4 text-white">{socio.usuario?.ci_nit}</td>
                        <td className="px-6 py-4 text-white">{socio.comunidad?.nombre || 'Sin comunidad'}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                            socio.estado === 'ACTIVO'
                              ? 'bg-emerald-500/20 text-emerald-200'
                              : 'bg-red-500/20 text-red-200'
                          }`}>
                            {socio.estado}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-white text-sm">
                          {new Date(socio.fecha_ingreso).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {sociosData.length > 10 && (
                  <div className="px-6 py-4 text-center text-emerald-100/60">
                    Mostrando 10 de {sociosData.length} resultados
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'parcelas' && (
        <div className="space-y-6">
          {/* Estadísticas rápidas */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {Object.entries(calcularEstadisticasParcelas()).map(([key, value]) => (
              <div key={key} className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-white/60 text-sm capitalize">
                      {key.replace('_', ' ')}
                    </p>
                    <p className="text-white font-semibold text-lg">{value}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Filtros */}
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6">
            <h3 className="text-white font-medium mb-4 flex items-center space-x-2">
              <Filter className="w-4 h-4" />
              <span>Filtros de Parcelas</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <input
                type="text"
                placeholder="Tipo de suelo"
                value={filtrosParcelas.tipo_suelo}
                onChange={(e) => setFiltrosParcelas({...filtrosParcelas, tipo_suelo: e.target.value})}
                className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-emerald-200/50 focus:outline-none focus:ring-2 focus:ring-emerald-400"
              />
              <input
                type="number"
                placeholder="Superficie mínima (ha)"
                value={filtrosParcelas.superficie_min}
                onChange={(e) => setFiltrosParcelas({...filtrosParcelas, superficie_min: e.target.value})}
                className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-emerald-200/50 focus:outline-none focus:ring-2 focus:ring-emerald-400"
              />
              <input
                type="number"
                placeholder="Superficie máxima (ha)"
                value={filtrosParcelas.superficie_max}
                onChange={(e) => setFiltrosParcelas({...filtrosParcelas, superficie_max: e.target.value})}
                className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-emerald-200/50 focus:outline-none focus:ring-2 focus:ring-emerald-400"
              />
              <select
                value={filtrosParcelas.estado}
                onChange={(e) => setFiltrosParcelas({...filtrosParcelas, estado: e.target.value})}
                className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-400"
              >
                <option value="">Todos los estados</option>
                <option value="ACTIVA">Activa</option>
                <option value="INACTIVA">Inactiva</option>
              </select>
            </div>
            <div className="flex justify-end mt-4">
              <button
                onClick={aplicarFiltrosParcelas}
                className="bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200 font-medium py-2 px-6 rounded-lg transition-colors"
              >
                Aplicar Filtros
              </button>
            </div>
          </div>

          {/* Tabla de resultados */}
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-white/20">
              <h3 className="text-white font-medium">Resultado de Parcelas</h3>
            </div>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
                <span className="ml-3 text-emerald-100">Cargando...</span>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-white/5">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-medium text-emerald-200 uppercase tracking-wider">
                        Socio
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-emerald-200 uppercase tracking-wider">
                        Ubicación
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-emerald-200 uppercase tracking-wider">
                        Superficie
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-emerald-200 uppercase tracking-wider">
                        Tipo Suelo
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-emerald-200 uppercase tracking-wider">
                        Estado
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {parcelasData.slice(0, 10).map((parcela) => (
                      <tr key={parcela.id} className="hover:bg-white/5 transition-colors">
                        <td className="px-6 py-4 text-white font-medium">
                          {parcela.socio?.usuario?.nombres} {parcela.socio?.usuario?.apellidos}
                        </td>
                        <td className="px-6 py-4 text-white">{parcela.ubicacion}</td>
                        <td className="px-6 py-4 text-white">{parcela.superficie} ha</td>
                        <td className="px-6 py-4 text-white">{parcela.tipo_suelo}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                            parcela.estado === 'ACTIVA'
                              ? 'bg-emerald-500/20 text-emerald-200'
                              : 'bg-red-500/20 text-red-200'
                          }`}>
                            {parcela.estado}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {parcelasData.length > 10 && (
                  <div className="px-6 py-4 text-center text-emerald-100/60">
                    Mostrando 10 de {parcelasData.length} resultados
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'campañas' && (
        <div className="space-y-6">
          {/* Header de la sección */}
          <div className="bg-gradient-to-r from-emerald-500/10 to-blue-500/10 backdrop-blur-lg border border-white/20 rounded-xl p-6">
            <div className="flex items-center space-x-3 mb-4">
              <Calendar className="w-8 h-8 text-emerald-300" />
              <div>
                <h3 className="text-white font-bold text-xl">Reportes de Campañas Agrícolas</h3>
                <p className="text-emerald-100/80 text-sm">
                  Analiza labores, producción y rendimiento de tus campañas
                </p>
              </div>
            </div>
          </div>

          {/* Tarjetas de reportes disponibles */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Reporte de Labores */}
            <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6 hover:bg-white/15 transition-all duration-300 cursor-pointer group"
                 onClick={() => navigate('/reports/labors')}>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Activity className="w-6 h-6 text-purple-300" />
                </div>
                <h4 className="text-white font-bold text-lg">Labores por Campaña</h4>
              </div>
              <p className="text-emerald-100/70 text-sm mb-4">
                Visualiza todas las labores agrícolas realizadas en una campaña: fertilización, riego, fumigación, etc.
              </p>
              <ul className="space-y-2 text-emerald-100/60 text-xs mb-4">
                <li className="flex items-center space-x-2">
                  <div className="w-1 h-1 bg-emerald-400 rounded-full"></div>
                  <span>Total de labores y costos</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="w-1 h-1 bg-emerald-400 rounded-full"></div>
                  <span>Gráficos por tipo de labor</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="w-1 h-1 bg-emerald-400 rounded-full"></div>
                  <span>Detalle de insumos utilizados</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="w-1 h-1 bg-emerald-400 rounded-full"></div>
                  <span>Exportar a CSV</span>
                </li>
              </ul>
              <div className="flex items-center justify-between text-purple-200 text-sm font-medium group-hover:text-purple-100">
                <span>Ver reporte</span>
                <TrendingUp className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Reporte de Producción por Campaña */}
            <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6 hover:bg-white/15 transition-all duration-300 cursor-pointer group"
                 onClick={() => navigate('/reports/production-campaign')}>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-emerald-500/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                  <TrendingUp className="w-6 h-6 text-emerald-300" />
                </div>
                <h4 className="text-white font-bold text-lg">Producción por Campaña</h4>
              </div>
              <p className="text-emerald-100/70 text-sm mb-4">
                Analiza la producción total de una campaña y compárala con las metas establecidas.
              </p>
              <ul className="space-y-2 text-emerald-100/60 text-xs mb-4">
                <li className="flex items-center space-x-2">
                  <div className="w-1 h-1 bg-emerald-400 rounded-full"></div>
                  <span>Cumplimiento de metas</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="w-1 h-1 bg-emerald-400 rounded-full"></div>
                  <span>Rendimiento por hectárea</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="w-1 h-1 bg-emerald-400 rounded-full"></div>
                  <span>Distribución por producto</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="w-1 h-1 bg-emerald-400 rounded-full"></div>
                  <span>Valor económico total</span>
                </li>
              </ul>
              <div className="flex items-center justify-between text-emerald-200 text-sm font-medium group-hover:text-emerald-100">
                <span>Ver reporte</span>
                <TrendingUp className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Reporte de Producción por Parcela */}
            <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6 hover:bg-white/15 transition-all duration-300 cursor-pointer group"
                 onClick={() => navigate('/reports/production-plot')}>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                  <MapPin className="w-6 h-6 text-blue-300" />
                </div>
                <h4 className="text-white font-bold text-lg">Producción por Parcela</h4>
              </div>
              <p className="text-emerald-100/70 text-sm mb-4">
                Consulta el histórico de producción de una parcela específica a través del tiempo.
              </p>
              <ul className="space-y-2 text-emerald-100/60 text-xs mb-4">
                <li className="flex items-center space-x-2">
                  <div className="w-1 h-1 bg-emerald-400 rounded-full"></div>
                  <span>Evolución de producción</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="w-1 h-1 bg-emerald-400 rounded-full"></div>
                  <span>Histórico de campañas</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="w-1 h-1 bg-emerald-400 rounded-full"></div>
                  <span>Análisis por cultivo</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="w-1 h-1 bg-emerald-400 rounded-full"></div>
                  <span>Exportar a PDF</span>
                </li>
              </ul>
              <div className="flex items-center justify-between text-blue-200 text-sm font-medium group-hover:text-blue-100">
                <span>Ver reporte</span>
                <TrendingUp className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>

          {/* Información adicional */}
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6">
            <h4 className="text-white font-medium mb-4">ℹ️ Información sobre Reportes de Campañas</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-emerald-100/70">
              <div>
                <h5 className="text-white font-medium mb-2">¿Qué puedes hacer?</h5>
                <ul className="space-y-1 text-xs">
                  <li>• Filtrar por fechas y tipos de labor</li>
                  <li>• Comparar producción con metas establecidas</li>
                  <li>• Analizar costos y rendimientos</li>
                  <li>• Exportar datos en múltiples formatos</li>
                </ul>
              </div>
              <div>
                <h5 className="text-white font-medium mb-2">Requisitos</h5>
                <ul className="space-y-1 text-xs">
                  <li>• Tener campañas creadas en el sistema</li>
                  <li>• Registrar labores y cosechas</li>
                  <li>• Asignar parcelas y socios a campañas</li>
                  <li>• Mantener datos actualizados</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Acciones rápidas */}
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6">
            <h4 className="text-white font-medium mb-4">Acciones Rápidas</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={() => navigate('/campaigns')}
                className="bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200 font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
              >
                <Calendar className="w-4 h-4" />
                <span>Gestionar Campañas</span>
              </button>
              <button
                onClick={() => exportarReporte('campañas')}
                className="bg-purple-500/20 hover:bg-purple-500/30 text-purple-200 font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
              >
                <Download className="w-4 h-4" />
                <span>Exportar Todos los Reportes</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'estadisticas' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Estadísticas generales */}
            <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6">
              <h3 className="text-white font-medium mb-4 flex items-center space-x-2">
                <TrendingUp className="w-5 h-5" />
                <span>Estadísticas Generales</span>
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-emerald-100/80">Total Socios</span>
                  <span className="text-white font-semibold">{calcularEstadisticasSocios().total}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-emerald-100/80">Socios Activos</span>
                  <span className="text-white font-semibold">{calcularEstadisticasSocios().activos}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-emerald-100/80">Total Parcelas</span>
                  <span className="text-white font-semibold">{calcularEstadisticasParcelas().total}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-emerald-100/80">Superficie Total</span>
                  <span className="text-white font-semibold">{calcularEstadisticasParcelas().superficieTotal} ha</span>
                </div>
              </div>
            </div>

            {/* Gráficos placeholder */}
            <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6">
              <h3 className="text-white font-medium mb-4 flex items-center space-x-2">
                <PieChart className="w-5 h-5" />
                <span>Distribución por Comunidad</span>
              </h3>
              <div className="flex items-center justify-center h-32">
                <div className="text-center">
                  <PieChart className="w-12 h-12 text-emerald-400/50 mx-auto mb-2" />
                  <p className="text-emerald-100/60 text-sm">
                    Gráfico próximamente disponible
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Accesos rápidos */}
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6">
            <h3 className="text-white font-medium mb-4">Accesos Rápidos</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={() => navigate('/socios')}
                className="bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200 font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
              >
                <Users className="w-4 h-4" />
                <span>Ver Todos los Socios</span>
              </button>
              <button
                onClick={() => navigate('/parcelas')}
                className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-200 font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
              >
                <MapPin className="w-4 h-4" />
                <span>Ver Todas las Parcelas</span>
              </button>
              <button
                onClick={() => exportarReporte('completo')}
                className="bg-purple-500/20 hover:bg-purple-500/30 text-purple-200 font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
              >
                <FileText className="w-4 h-4" />
                <span>Reporte Completo</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportesPage;