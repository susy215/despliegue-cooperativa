import React, { useState, useEffect } from 'react';
import { TrendingUp, Download, Target, DollarSign } from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { campaignService } from '../../api/campaignService';
import { exportProductionByCampaignToPDF } from '../../utils/reportPDFExports';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];

const ProductionByCampaignReport = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState('');

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

  const handleGenerate = async () => {
    if (!selectedCampaign) {
      alert('Debe seleccionar una campaña');
      return;
    }

    try {
      setLoading(true);
      const data = await campaignService.getProductionByCampaign({ campaign_id: selectedCampaign });
      setReportData(data);
    } catch (error) {
      console.error('Error al generar reporte:', error);
      alert('Error al generar el reporte');
    } finally {
      setLoading(false);
    }
  };

  const handleExportExcel = () => {
    if (!reportData) return;

    // Generar CSV (simulación de Excel)
    const headers = ['Producto', 'Cantidad', 'Unidad', 'N° Cosechas', 'Precio Promedio', 'Valor Total'];
    const rows = reportData.production_by_product.map(p => [
      p.cultivo_especie,
      p.cantidad_total,
      p.unidad_medida,
      p.numero_cosechas,
      p.precio_promedio || 0,
      p.valor_total || 0,
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `reporte_produccion_${reportData.campaign.nombre}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const handleExportPDF = () => {
    if (!reportData) {
      alert('No hay datos para exportar');
      return;
    }

    try {
      const campaignName = reportData.campaign?.nombre || 'Campaña';
      exportProductionByCampaignToPDF(reportData, campaignName);
    } catch (error) {
      console.error('Error al exportar PDF:', error);
      alert('Error al generar el PDF. Por favor intente nuevamente.');
    }
  };

  const getCumplimientoColor = (porcentaje) => {
    if (porcentaje >= 100) return 'text-emerald-300';
    if (porcentaje >= 80) return 'text-yellow-300';
    return 'text-red-300';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Reporte de Producción por Campaña</h1>
          <p className="text-emerald-100/80 mt-1">
            Analiza la producción y rendimiento de una campaña agrícola
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
              onClick={handleExportExcel}
              className="bg-green-500/20 hover:bg-green-500/30 text-green-200 font-medium py-2 px-4 rounded-lg transition-colors flex items-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span>Exportar Excel</span>
            </button>
          </div>
        )}
      </div>

      {/* Filtros */}
      <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6">
        <h3 className="text-white font-medium mb-4">Seleccionar Campaña</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-emerald-100 text-sm font-medium mb-2">
              Campaña *
            </label>
            <select
              value={selectedCampaign}
              onChange={(e) => setSelectedCampaign(e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-400"
            >
              <option value="">Seleccione una campaña</option>
              {campaigns.map(c => (
                <option key={c.id} value={c.id}>{c.nombre} - {c.estado}</option>
              ))}
            </select>
          </div>

          <div>
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
              <div className="flex items-center space-x-2 mb-2">
                <TrendingUp className="w-5 h-5 text-emerald-300" />
                <div className="text-emerald-100/60 text-sm">Producción Total</div>
              </div>
              <div className="text-2xl font-bold text-white">
                {reportData.estadisticas.total_production?.toLocaleString()} kg
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6">
              <div className="flex items-center space-x-2 mb-2">
                <Target className="w-5 h-5 text-blue-300" />
                <div className="text-emerald-100/60 text-sm">Rendimiento/ha</div>
              </div>
              <div className="text-2xl font-bold text-white">
                {reportData.estadisticas.avg_yield_per_hectare?.toFixed(2)} kg
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6">
              <div className="flex items-center space-x-2 mb-2">
                <DollarSign className="w-5 h-5 text-yellow-300" />
                <div className="text-emerald-100/60 text-sm">Valor Económico</div>
              </div>
              <div className="text-2xl font-bold text-white">
                Bs. {reportData.estadisticas.valor_economico_total?.toLocaleString()}
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6">
              <div className="text-emerald-100/60 text-sm mb-2">Total Cosechas</div>
              <div className="text-2xl font-bold text-white">
                {reportData.estadisticas.numero_total_cosechas}
              </div>
            </div>
          </div>

          {/* Comparativa con Meta */}
          {reportData.comparativa_meta && (
            <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6">
              <h3 className="text-white font-medium mb-4">Cumplimiento de Meta</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <div className="text-emerald-100/60 text-sm mb-1">Meta</div>
                  <div className="text-xl font-bold text-white">
                    {reportData.comparativa_meta.meta_produccion?.toLocaleString()} kg
                  </div>
                </div>
                <div>
                  <div className="text-emerald-100/60 text-sm mb-1">Producción Real</div>
                  <div className="text-xl font-bold text-white">
                    {reportData.comparativa_meta.produccion_real?.toLocaleString()} kg
                  </div>
                </div>
                <div>
                  <div className="text-emerald-100/60 text-sm mb-1">% Cumplimiento</div>
                  <div className={`text-3xl font-bold ${getCumplimientoColor(reportData.comparativa_meta.porcentaje_cumplimiento)}`}>
                    {reportData.comparativa_meta.porcentaje_cumplimiento?.toFixed(1)}%
                  </div>
                  {reportData.comparativa_meta.cumplida ? (
                    <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-emerald-500/20 text-emerald-200 mt-2">
                      ✓ Meta Cumplida
                    </span>
                  ) : (
                    <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-yellow-500/20 text-yellow-200 mt-2">
                      ⚠ En Progreso
                    </span>
                  )}
                </div>
              </div>

              {/* Barra de progreso */}
              <div className="mt-4">
                <div className="w-full bg-white/10 rounded-full h-4">
                  <div
                    className={`h-4 rounded-full transition-all duration-500 ${reportData.comparativa_meta.porcentaje_cumplimiento >= 100
                        ? 'bg-emerald-500'
                        : reportData.comparativa_meta.porcentaje_cumplimiento >= 80
                          ? 'bg-yellow-500'
                          : 'bg-red-500'
                      }`}
                    style={{ width: `${Math.min(reportData.comparativa_meta.porcentaje_cumplimiento, 100)}%` }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Gráficos */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Gráfico de pastel: Distribución por producto */}
            {reportData.production_by_product && reportData.production_by_product.length > 0 && (
              <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6">
                <h3 className="text-white font-medium mb-4">Distribución por Producto</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={reportData.production_by_product}
                      dataKey="cantidad_total"
                      nameKey="cultivo_especie"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label
                    >
                      {reportData.production_by_product.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: '#064e3b', border: '1px solid #10b981', borderRadius: '8px' }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Gráfico de pastel: Distribución por calidad */}
            {reportData.calidad_distribucion && reportData.calidad_distribucion.length > 0 && (
              <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6">
                <h3 className="text-white font-medium mb-4">Distribución por Calidad</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={reportData.calidad_distribucion}
                      dataKey="cantidad_total"
                      nameKey="calidad"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label
                    >
                      {reportData.calidad_distribucion.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: '#064e3b', border: '1px solid #10b981', borderRadius: '8px' }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Gráfico de barras: Valor por producto */}
          {reportData.production_by_product && reportData.production_by_product.length > 0 && (
            <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6">
              <h3 className="text-white font-medium mb-4">Valor Económico por Producto</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={reportData.production_by_product}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                  <XAxis dataKey="cultivo_especie" stroke="#a7f3d0" />
                  <YAxis stroke="#a7f3d0" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#064e3b', border: '1px solid #10b981', borderRadius: '8px' }}
                  />
                  <Legend />
                  <Bar dataKey="valor_total" name="Valor (Bs.)" fill="#f59e0b" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Tabla de productos */}
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl overflow-hidden">
            <div className="p-6 border-b border-white/20">
              <h3 className="text-white font-medium">Producción por Producto</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-white/5">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-emerald-200 uppercase">Producto</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-emerald-200 uppercase">Cantidad</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-emerald-200 uppercase">Unidad</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-emerald-200 uppercase">N° Cosechas</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-emerald-200 uppercase">Precio Prom.</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-emerald-200 uppercase">Valor Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {reportData.production_by_product.map((product, idx) => (
                    <tr key={idx} className="hover:bg-white/5">
                      <td className="px-4 py-3 text-white font-medium">{product.cultivo_especie}</td>
                      <td className="px-4 py-3 text-white">{product.cantidad_total?.toLocaleString()}</td>
                      <td className="px-4 py-3 text-emerald-100/80 text-sm">{product.unidad_medida}</td>
                      <td className="px-4 py-3 text-white">{product.numero_cosechas}</td>
                      <td className="px-4 py-3 text-white">Bs. {product.precio_promedio?.toFixed(2)}</td>
                      <td className="px-4 py-3 text-white font-bold">
                        Bs. {product.valor_total?.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Producción por parcela */}
          {reportData.production_by_plot && reportData.production_by_plot.length > 0 && (
            <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl overflow-hidden">
              <div className="p-6 border-b border-white/20">
                <h3 className="text-white font-medium">Producción por Parcela</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-white/5">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-emerald-200 uppercase">Parcela</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-emerald-200 uppercase">Socio</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-emerald-200 uppercase">Cantidad</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-emerald-200 uppercase">N° Cosechas</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-emerald-200 uppercase">Valor</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {reportData.production_by_plot.map((plot, idx) => (
                      <tr key={idx} className="hover:bg-white/5">
                        <td className="px-4 py-3 text-white">{plot.parcela_nombre}</td>
                        <td className="px-4 py-3 text-emerald-100/80">
                          {plot.socio_nombre} {plot.socio_apellido}
                        </td>
                        <td className="px-4 py-3 text-white">{plot.cantidad_total?.toLocaleString()} kg</td>
                        <td className="px-4 py-3 text-white">{plot.numero_cosechas}</td>
                        <td className="px-4 py-3 text-white">Bs. {plot.valor_total?.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {!reportData && !loading && (
        <div className="text-center py-12 bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl">
          <TrendingUp className="w-12 h-12 text-emerald-400/50 mx-auto mb-4" />
          <p className="text-emerald-100/60">Seleccione una campaña y genere el reporte</p>
        </div>
      )}
    </div>
  );
};

export default ProductionByCampaignReport;
