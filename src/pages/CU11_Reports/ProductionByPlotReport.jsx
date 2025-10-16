import React, { useState, useEffect } from 'react';
import { MapPin, Download, TrendingUp, Calendar } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { campaignService } from '../../api/campaignService';
import { parcelaService } from '../../api/parcelaService';
import { exportProductionByPlotToPDF } from '../../utils/reportPDFExports';

const ProductionByPlotReport = () => {
  const [parcelas, setParcelas] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [filtros, setFiltros] = useState({
    plot_id: '',
    campaign_id: '',
    start_date: '',
    end_date: '',
  });

  useEffect(() => {
    cargarParcelas();
    cargarCampaigns();
  }, []);

  const cargarParcelas = async () => {
    try {
      const response = await parcelaService.getParcelas();
      setParcelas(response.results || response || []);
    } catch (error) {
      console.error('Error al cargar parcelas:', error);
    }
  };

  const cargarCampaigns = async () => {
    try {
      const response = await campaignService.getCampaigns();
      // getCampaigns ya maneja la extracción de results
      setCampaigns(Array.isArray(response) ? response : []);
    } catch (error) {
      console.error('Error al cargar campañas:', error);
    }
  };

  // Función para formatear fechas al formato YYYY-MM-DD
  const formatDate = (dateString) => {
    if (!dateString || dateString.trim() === '') return '';
    
    console.log('formatDate - entrada:', dateString, 'tipo:', typeof dateString);
    
    // Si ya está en formato YYYY-MM-DD, devolverla tal cual
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      console.log('formatDate - ya está en formato correcto');
      return dateString;
    }
    
    // Si está en otro formato, convertirla
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      console.error('formatDate - fecha inválida:', dateString);
      return ''; // Fecha inválida
    }
    
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    const formatted = `${year}-${month}-${day}`;
    console.log('formatDate - resultado:', formatted);
    return formatted;
  };

  const handleGenerate = async () => {
    if (!filtros.plot_id) {
      alert('Debe seleccionar una parcela');
      return;
    }

    // Validar formato de fechas si están presentes
    if (filtros.start_date && filtros.end_date) {
      const startDate = new Date(filtros.start_date);
      const endDate = new Date(filtros.end_date);
      
      if (endDate < startDate) {
        alert('La fecha hasta debe ser posterior a la fecha desde');
        return;
      }
    }

    try {
      setLoading(true);
      const params = { plot_id: parseInt(filtros.plot_id) };
      
      if (filtros.campaign_id) {
        params.campaign_id = parseInt(filtros.campaign_id);
      }
      
      // Asegurar formato YYYY-MM-DD para las fechas usando la función formatDate
      console.log('Filtros originales:', filtros);
      
      // Solo agregar fechas si están presentes Y no vacías
      if (filtros.start_date && filtros.start_date.trim() !== '') {
        const formattedStartDate = formatDate(filtros.start_date);
        console.log('start_date - original:', filtros.start_date, 'formateada:', formattedStartDate);
        if (formattedStartDate) {
          params.start_date = formattedStartDate;
        }
      } else {
        console.log('start_date - NO enviada (vacía o undefined)');
      }
      
      if (filtros.end_date && filtros.end_date.trim() !== '') {
        const formattedEndDate = formatDate(filtros.end_date);
        console.log('end_date - original:', filtros.end_date, 'formateada:', formattedEndDate);
        if (formattedEndDate) {
          params.end_date = formattedEndDate;
        }
      } else {
        console.log('end_date - NO enviada (vacía o undefined)');
      }

      console.log('Parámetros finales a enviar:', JSON.stringify(params, null, 2));
      console.log('URL que se construirá:', `/api/reports/production-by-plot/?${new URLSearchParams(params).toString()}`);
      
      const data = await campaignService.getProductionByPlot(params);
      console.log('Datos recibidos:', data);
      setReportData(data);
    } catch (error) {
      console.error('Error completo:', error);
      console.error('Respuesta del backend:', error.response?.data);
      
      // Mostrar mensaje de error específico del backend
      const errorMsg = error.response?.data?.detail 
        || error.response?.data?.error 
        || error.response?.data?.message
        || error.response?.data?.end_date?.[0]
        || error.response?.data?.start_date?.[0]
        || JSON.stringify(error.response?.data)
        || 'Error al generar el reporte';
      
      alert(`Error al generar el reporte:\n${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDF = () => {
    if (!reportData) {
      alert('No hay datos para exportar');
      return;
    }
    
    try {
      exportProductionByPlotToPDF(reportData);
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
          <h1 className="text-2xl font-bold text-white">Reporte de Producción por Parcela</h1>
          <p className="text-emerald-100/80 mt-1">
            Analiza el rendimiento histórico de una parcela específica
          </p>
        </div>
        {reportData && (
          <button
            onClick={handleExportPDF}
            className="bg-red-500/20 hover:bg-red-500/30 text-red-200 font-medium py-2 px-4 rounded-lg transition-colors flex items-center space-x-2 mt-4 sm:mt-0"
          >
            <Download className="w-4 h-4" />
            <span>Exportar PDF</span>
          </button>
        )}
      </div>

      {/* Filtros */}
      <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6">
        <h3 className="text-white font-medium mb-4">Filtros</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-emerald-100 text-sm font-medium mb-2">
              Parcela *
            </label>
            <select
              value={filtros.plot_id}
              onChange={(e) => setFiltros({...filtros, plot_id: e.target.value})}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-400"
            >
              <option value="">Seleccione una parcela</option>
              {parcelas.map(p => (
                <option key={p.id} value={p.id}>
                  {p.nombre} - {p.superficie_hectareas} ha
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-emerald-100 text-sm font-medium mb-2">
              Campaña (opcional)
            </label>
            <select
              value={filtros.campaign_id}
              onChange={(e) => setFiltros({...filtros, campaign_id: e.target.value})}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-400"
            >
              <option value="">Todas las campañas</option>
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
              onChange={(e) => setFiltros({...filtros, start_date: e.target.value})}
              max={filtros.end_date || undefined}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-400 [&::-webkit-calendar-picker-indicator]:filter [&::-webkit-calendar-picker-indicator]:invert"
            />
          </div>

          <div>
            <label className="block text-emerald-100 text-sm font-medium mb-2">
              Fecha Hasta
            </label>
            <input
              type="date"
              value={filtros.end_date}
              onChange={(e) => setFiltros({...filtros, end_date: e.target.value})}
              min={filtros.start_date || undefined}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-400 [&::-webkit-calendar-picker-indicator]:filter [&::-webkit-calendar-picker-indicator]:invert"
            />
          </div>
        </div>

        <div className="mt-4">
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="w-full bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200 font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
          >
            {loading ? 'Generando...' : 'Generar Reporte'}
          </button>
        </div>
      </div>

      {/* Reporte */}
      {reportData && (
        <>
          {/* Info de la parcela */}
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6">
            <div className="flex items-center space-x-3 mb-4">
              <MapPin className="w-6 h-6 text-emerald-300" />
              <h3 className="text-white font-medium text-xl">{reportData.parcela.nombre}</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <div className="text-emerald-100/60 text-sm mb-1">Superficie</div>
                <div className="text-white font-bold">{reportData.parcela.superficie_hectareas} ha</div>
              </div>
              <div>
                <div className="text-emerald-100/60 text-sm mb-1">Tipo de Suelo</div>
                <div className="text-white">{reportData.parcela.tipo_suelo}</div>
              </div>
              <div>
                <div className="text-emerald-100/60 text-sm mb-1">Ubicación</div>
                <div className="text-white text-sm">{reportData.parcela.ubicacion || 'N/A'}</div>
              </div>
              <div>
                <div className="text-emerald-100/60 text-sm mb-1">Propietario</div>
                <div className="text-white">{reportData.parcela.socio?.nombre_completo}</div>
              </div>
            </div>
          </div>

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
              <div className="text-emerald-100/60 text-sm mb-2">Rendimiento/ha</div>
              <div className="text-2xl font-bold text-white">
                {reportData.estadisticas.yield_per_hectare?.toFixed(2)} kg
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6">
              <div className="text-emerald-100/60 text-sm mb-2">Total Cosechas</div>
              <div className="text-2xl font-bold text-white">
                {reportData.estadisticas.numero_total_cosechas}
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6">
              <div className="text-emerald-100/60 text-sm mb-2">Valor Económico</div>
              <div className="text-2xl font-bold text-white">
                Bs. {reportData.estadisticas.valor_economico_total?.toLocaleString()}
              </div>
            </div>
          </div>

          {/* Gráfico: Evolución de rendimiento */}
          {reportData.cosechas_detail && reportData.cosechas_detail.length > 0 && (
            <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6">
              <h3 className="text-white font-medium mb-4">Evolución de Producción en el Tiempo</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={reportData.cosechas_detail}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                  <XAxis dataKey="fecha_cosecha" stroke="#a7f3d0" />
                  <YAxis stroke="#a7f3d0" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#064e3b', border: '1px solid #10b981', borderRadius: '8px' }}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="cantidad_cosechada" 
                    name="Cantidad (kg)" 
                    stroke="#10b981" 
                    strokeWidth={2}
                    dot={{ fill: '#10b981' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Productos cosechados */}
          {reportData.productos_cosechados && reportData.productos_cosechados.length > 0 && (
            <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6">
              <h3 className="text-white font-medium mb-4">Productos Cosechados</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={reportData.productos_cosechados}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                  <XAxis dataKey="cultivo_especie" stroke="#a7f3d0" />
                  <YAxis stroke="#a7f3d0" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#064e3b', border: '1px solid #10b981', borderRadius: '8px' }}
                  />
                  <Legend />
                  <Bar dataKey="cantidad_total" name="Cantidad (kg)" fill="#10b981" />
                  <Bar dataKey="valor_total" name="Valor (Bs.)" fill="#f59e0b" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Histórico de campañas */}
          {reportData.historico_campañas && reportData.historico_campañas.length > 0 && (
            <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl overflow-hidden">
              <div className="p-6 border-b border-white/20">
                <h3 className="text-white font-medium">Histórico de Campañas</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-white/5">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-emerald-200 uppercase">Campaña</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-emerald-200 uppercase">Periodo</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-emerald-200 uppercase">Cultivo</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-emerald-200 uppercase">Producción</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-emerald-200 uppercase">N° Cosechas</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-emerald-200 uppercase">Meta</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {reportData.historico_campañas.map((camp, idx) => (
                      <tr key={idx} className="hover:bg-white/5">
                        <td className="px-4 py-3 text-white font-medium">{camp.campaign_nombre}</td>
                        <td className="px-4 py-3 text-emerald-100/80 text-sm">
                          {camp.fecha_inicio} - {camp.fecha_fin}
                        </td>
                        <td className="px-4 py-3 text-white">{camp.cultivo_planificado || 'N/A'}</td>
                        <td className="px-4 py-3 text-white">
                          {camp.produccion_total?.toLocaleString()} kg
                        </td>
                        <td className="px-4 py-3 text-white">{camp.numero_cosechas}</td>
                        <td className="px-4 py-3">
                          {camp.meta_parcela ? (
                            <span className="text-white">{camp.meta_parcela?.toLocaleString()} kg</span>
                          ) : (
                            <span className="text-emerald-100/60 text-sm">No definida</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Detalle de cosechas */}
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl overflow-hidden">
            <div className="p-6 border-b border-white/20">
              <h3 className="text-white font-medium">Detalle de Cosechas</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-white/5">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-emerald-200 uppercase">Fecha</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-emerald-200 uppercase">Cultivo</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-emerald-200 uppercase">Variedad</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-emerald-200 uppercase">Cantidad</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-emerald-200 uppercase">Calidad</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-emerald-200 uppercase">Precio</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-emerald-200 uppercase">Observaciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {reportData.cosechas_detail.map((cosecha, idx) => (
                    <tr key={idx} className="hover:bg-white/5">
                      <td className="px-4 py-3 text-white">{cosecha.fecha_cosecha}</td>
                      <td className="px-4 py-3 text-white">{cosecha.cultivo_especie}</td>
                      <td className="px-4 py-3 text-emerald-100/80 text-sm">{cosecha.cultivo_variedad || 'N/A'}</td>
                      <td className="px-4 py-3 text-white font-medium">
                        {cosecha.cantidad_cosechada?.toLocaleString()} {cosecha.unidad_medida}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          cosecha.calidad === 'EXCELENTE' ? 'bg-emerald-500/20 text-emerald-200' :
                          cosecha.calidad === 'BUENA' ? 'bg-blue-500/20 text-blue-200' :
                          cosecha.calidad === 'REGULAR' ? 'bg-yellow-500/20 text-yellow-200' :
                          'bg-red-500/20 text-red-200'
                        }`}>
                          {cosecha.calidad}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-white">
                        Bs. {cosecha.precio_venta?.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-emerald-100/80 text-sm">
                        {cosecha.observaciones || '-'}
                      </td>
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
          <MapPin className="w-12 h-12 text-emerald-400/50 mx-auto mb-4" />
          <p className="text-emerald-100/60">Seleccione una parcela y genere el reporte</p>
        </div>
      )}
    </div>
  );
};

export default ProductionByPlotReport;
