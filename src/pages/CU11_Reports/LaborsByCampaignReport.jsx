import React, { useState, useEffect } from 'react';
import { Calendar, Filter, Download, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { campaignService } from '../../api/campaignService';
import { exportLaborsByCampaignToPDF } from '../../utils/reportPDFExports';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

const LaborsByCampaignReport = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [filtros, setFiltros] = useState({
    campaign_id: '',
    start_date: '',
    end_date: '',
    tipo_tratamiento: '',
    parcela_id: '',
  });

  useEffect(() => {
    cargarCampaigns();
  }, []);

  const cargarCampaigns = async () => {
    try {
      const response = await campaignService.getCampaigns();
      // getCampaigns ya maneja la extracción de results
      setCampaigns(Array.isArray(response) ? response : []);
    } catch (error) {
      console.error('Error al cargar campañas:', error);
    }
  };

  const consolidateAllCampaigns = async () => {
    try {
      const allReports = [];

      // Obtener reportes de todas las campañas
      for (const campaign of campaigns) {
        try {
          const params = { campaign_id: campaign.id };
          if (filtros.start_date) params.start_date = filtros.start_date;
          if (filtros.end_date) params.end_date = filtros.end_date;
          if (filtros.tipo_tratamiento) params.tipo_tratamiento = filtros.tipo_tratamiento;
          if (filtros.parcela_id) params.parcela_id = filtros.parcela_id;

          const data = await campaignService.getLaborsByCampaign(params);
          allReports.push(data);
        } catch (err) {
          console.warn(`Error al obtener reporte de campaña ${campaign.nombre}:`, err);
        }
      }

      if (allReports.length === 0) {
        throw new Error('No se pudo obtener datos de ninguna campaña');
      }

      // Consolidar estadísticas
      const consolidatedStats = {
        total_labors: 0,
        total_area_worked: 0,
        costo_total_labores: 0,
        parcelas_trabajadas: 0,
      };

      const allLaborsDetail = [];
      const laborsByTypeMap = new Map();

      allReports.forEach(report => {
        // Sumar estadísticas
        consolidatedStats.total_labors += report.estadisticas?.total_labors || 0;
        consolidatedStats.total_area_worked += report.estadisticas?.total_area_worked || 0;
        consolidatedStats.costo_total_labores += report.estadisticas?.costo_total_labores || 0;

        // Agregar labores detalladas
        if (report.labors_detail) {
          allLaborsDetail.push(...report.labors_detail);
        }

        // Consolidar labores por tipo
        if (report.labors_by_type) {
          report.labors_by_type.forEach(labor => {
            const existing = laborsByTypeMap.get(labor.tipo_tratamiento) || {
              tipo_tratamiento: labor.tipo_tratamiento,
              count: 0,
              costo_total: 0,
            };

            existing.count += labor.count || 0;
            existing.costo_total += labor.costo_total || 0;
            laborsByTypeMap.set(labor.tipo_tratamiento, existing);
          });
        }
      });

      // Calcular parcelas únicas
      const uniqueParcelas = new Set(allLaborsDetail.map(l => l.parcela_nombre));
      consolidatedStats.parcelas_trabajadas = uniqueParcelas.size;

      return {
        campaign: { nombre: 'Todas las Campañas' },
        estadisticas: consolidatedStats,
        labors_by_type: Array.from(laborsByTypeMap.values()),
        labors_detail: allLaborsDetail,
      };
    } catch (error) {
      throw error;
    }
  };

  const handleGenerate = async () => {
    if (!filtros.campaign_id) {
      alert('Debe seleccionar una campaña');
      return;
    }

    try {
      setLoading(true);

      if (filtros.campaign_id === 'ALL') {
        // Consolidar todas las campañas
        const consolidatedData = await consolidateAllCampaigns();
        setReportData(consolidatedData);
      } else {
        // Reporte de una campaña específica
        const params = { campaign_id: filtros.campaign_id };

        if (filtros.start_date) params.start_date = filtros.start_date;
        if (filtros.end_date) params.end_date = filtros.end_date;
        if (filtros.tipo_tratamiento) params.tipo_tratamiento = filtros.tipo_tratamiento;
        if (filtros.parcela_id) params.parcela_id = filtros.parcela_id;

        const data = await campaignService.getLaborsByCampaign(params);
        setReportData(data);
      }
    } catch (error) {
      console.error('Error al generar reporte:', error);
      alert('Error al generar el reporte: ' + (error.message || 'Error desconocido'));
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
    if (!reportData) return;

    const headers = ['Tipo', 'Producto', 'Dosis', 'Unidad', 'Fecha', 'Costo', 'Parcela', 'Cultivo', 'Aplicado Por'];
    const rows = reportData.labors_detail.map(l => [
      l.tipo_tratamiento,
      l.nombre_producto,
      l.dosis || '',
      l.unidad_dosis || '',
      l.fecha_aplicacion,
      l.costo || '',
      l.parcela_nombre,
      l.cultivo_especie || '',
      l.aplicado_por || '',
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    const campaignName = reportData.campaign?.nombre || 'Todas_las_campañas';
    link.download = `reporte_labores_${campaignName}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const handleExportPDF = () => {
    if (!reportData) {
      alert('No hay datos para exportar');
      return;
    }

    try {
      const campaignName = reportData.campaign?.nombre || 'Todas las Campañas';
      exportLaborsByCampaignToPDF(reportData, campaignName);
    } catch (error) {
      console.error('Error al exportar PDF:', error);
      alert('Error al generar el PDF. Por favor intente nuevamente.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Reporte de Labores por Campaña</h1>
          <p className="text-emerald-100/80 mt-1">
            Analiza las labores agrícolas realizadas en una campaña
          </p>
        </div>
        {reportData && (
          <div className="flex items-center space-x-2 mt-4 sm:mt-0">
            <button
              onClick={handleExportPDF}
              className="bg-red-500/20 hover:bg-red-500/30 text-red-200 font-medium py-2 px-4 rounded-lg transition-colors flex items-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span>Exportar PDF</span>
            </button>
            <button
              onClick={handleExportCSV}
              className="bg-purple-500/20 hover:bg-purple-500/30 text-purple-200 font-medium py-2 px-4 rounded-lg transition-colors flex items-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span>Exportar CSV</span>
            </button>
          </div>
        )}
      </div>

      {/* Filtros */}
      <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Filter className="w-5 h-5 text-emerald-300" />
          <h3 className="text-white font-medium">Filtros</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-emerald-100 text-sm font-medium mb-2">
              Campaña *
            </label>
            <select
              value={filtros.campaign_id}
              onChange={(e) => setFiltros({ ...filtros, campaign_id: e.target.value })}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-400"
            >
              <option value="">Seleccione una campaña</option>
              <option value="ALL">📊 TODAS LAS CAMPAÑAS</option>
              {campaigns.map(c => (
                <option key={c.id} value={c.id}>{c.nombre}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-emerald-100 text-sm font-medium mb-2">
              Fecha Desde
            </label>
            <input
              type="date"
              value={filtros.start_date}
              onChange={(e) => setFiltros({ ...filtros, start_date: e.target.value })}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-400"
            />
          </div>

          <div>
            <label className="block text-emerald-100 text-sm font-medium mb-2">
              Fecha Hasta
            </label>
            <input
              type="date"
              value={filtros.end_date}
              onChange={(e) => setFiltros({ ...filtros, end_date: e.target.value })}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-400"
            />
          </div>

          <div>
            <label className="block text-emerald-100 text-sm font-medium mb-2">
              Tipo de Labor
            </label>
            <select
              value={filtros.tipo_tratamiento}
              onChange={(e) => setFiltros({ ...filtros, tipo_tratamiento: e.target.value })}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-400"
            >
              <option value="">Todos</option>
              <option value="FERTILIZANTE">Fertilizante</option>
              <option value="PESTICIDA">Pesticida</option>
              <option value="HERBICIDA">Herbicida</option>
              <option value="RIEGO">Riego</option>
              <option value="FUMIGACION">Fumigación</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-emerald-100 text-sm font-medium mb-2">
              &nbsp;
            </label>
            <button
              onClick={handleGenerate}
              disabled={loading}
              className="w-full bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200 font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? 'Generando...' : 'Generar Reporte'}
            </button>
          </div>
        </div>
      </div>

      {/* Reporte */}
      {reportData && (
        <>
          {/* KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6">
              <div className="text-emerald-100/60 text-sm mb-1">Total Labores</div>
              <div className="text-2xl font-bold text-white">
                {reportData.estadisticas.total_labors}
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6">
              <div className="text-emerald-100/60 text-sm mb-1">Área Trabajada</div>
              <div className="text-2xl font-bold text-white">
                {reportData.estadisticas.total_area_worked?.toFixed(2)} ha
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6">
              <div className="text-emerald-100/60 text-sm mb-1">Costo Total</div>
              <div className="text-2xl font-bold text-white">
                Bs. {reportData.estadisticas.costo_total_labores?.toLocaleString()}
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6">
              <div className="text-emerald-100/60 text-sm mb-1">Parcelas Trabajadas</div>
              <div className="text-2xl font-bold text-white">
                {reportData.estadisticas.parcelas_trabajadas}
              </div>
            </div>
          </div>

          {/* Gráficos: Labores por tipo */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Gráfico de barras: Cantidad de labores */}
            <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6">
              <h3 className="text-white font-medium mb-4">Cantidad de Labores por Tipo</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={reportData.labors_by_type}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                  <XAxis dataKey="tipo_tratamiento" stroke="#a7f3d0" />
                  <YAxis stroke="#a7f3d0" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#064e3b', border: '1px solid #10b981', borderRadius: '8px' }}
                    labelStyle={{ color: '#ffffff' }}
                  />
                  <Legend />
                  <Bar dataKey="count" name="Cantidad de Labores" fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Gráfico de barras: Costo por tipo */}
            <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6">
              <h3 className="text-white font-medium mb-4">Costo Total por Tipo (Bs.)</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={reportData.labors_by_type}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                  <XAxis dataKey="tipo_tratamiento" stroke="#a7f3d0" />
                  <YAxis stroke="#a7f3d0" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#064e3b', border: '1px solid #10b981', borderRadius: '8px' }}
                    labelStyle={{ color: '#ffffff' }}
                    formatter={(value) => `Bs. ${value.toLocaleString()}`}
                  />
                  <Legend />
                  <Bar dataKey="costo_total" name="Costo Total (Bs.)" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Tabla detallada */}
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl overflow-hidden">
            <div className="p-6 border-b border-white/20">
              <h3 className="text-white font-medium">Detalle de Labores</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-white/5">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-emerald-200 uppercase">Fecha</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-emerald-200 uppercase">Tipo</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-emerald-200 uppercase">Producto</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-emerald-200 uppercase">Dosis</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-emerald-200 uppercase">Parcela</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-emerald-200 uppercase">Costo</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-emerald-200 uppercase">Aplicado Por</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {reportData.labors_detail.map((labor, idx) => (
                    <tr key={idx} className="hover:bg-white/5">
                      <td className="px-4 py-3 text-white text-sm">{labor.fecha_aplicacion}</td>
                      <td className="px-4 py-3">
                        <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-emerald-500/20 text-emerald-200">
                          {labor.tipo_tratamiento}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-white text-sm">{labor.nombre_producto}</td>
                      <td className="px-4 py-3 text-emerald-100/80 text-sm">
                        {labor.dosis} {labor.unidad_dosis}
                      </td>
                      <td className="px-4 py-3 text-white text-sm">{labor.parcela_nombre}</td>
                      <td className="px-4 py-3 text-white text-sm">
                        Bs. {labor.costo?.toLocaleString() || 0}
                      </td>
                      <td className="px-4 py-3 text-emerald-100/80 text-sm">{labor.aplicado_por || 'N/A'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {!reportData && !loading && (
        <div className="text-center py-12 bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl">
          <Calendar className="w-12 h-12 text-emerald-400/50 mx-auto mb-4" />
          <p className="text-emerald-100/60">Seleccione una campaña y genere el reporte</p>
        </div>
      )}
    </div>
  );
};

export default LaborsByCampaignReport;
