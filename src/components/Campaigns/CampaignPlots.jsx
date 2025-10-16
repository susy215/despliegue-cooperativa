import React, { useState, useEffect } from 'react';
import { MapPin, Plus, Trash2, Sprout } from 'lucide-react';
import { campaignService } from '../../api/campaignService';
import { parcelaService } from '../../api/parcelaService';

const CampaignPlots = ({ campaignId }) => {
  const [plots, setPlots] = useState([]);
  const [parcelas, setParcelas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    parcela_id: '',
    fecha_asignacion: new Date().toISOString().split('T')[0],
    superficie_comprometida: '',
    cultivo_planificado: '',
    meta_produccion_parcela: '',
    observaciones: '',
  });

  useEffect(() => {
    cargarPlots();
    cargarParcelas();
  }, [campaignId]);

  const cargarPlots = async () => {
    try {
      setLoading(true);
      const data = await campaignService.getCampaignPlots(campaignId);
      setPlots(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error al cargar parcelas:', error);
      setPlots([]);
    } finally {
      setLoading(false);
    }
  };

  const cargarParcelas = async () => {
    try {
      const response = await parcelaService.getParcelas({ estado: 'ACTIVA' });
      setParcelas(response.results || response || []);
    } catch (error) {
      console.error('Error al cargar parcelas disponibles:', error);
      setParcelas([]);
    }
  };

  const handleAssign = async (e) => {
    e.preventDefault();

    if (!formData.parcela_id) {
      alert('Debe seleccionar una parcela');
      return;
    }

    try {
      const dataToSend = {
        parcela_id: parseInt(formData.parcela_id),
        fecha_asignacion: formData.fecha_asignacion,
        observaciones: formData.observaciones,
      };

      if (formData.superficie_comprometida) {
        dataToSend.superficie_comprometida = parseFloat(formData.superficie_comprometida);
      }

      if (formData.cultivo_planificado) {
        dataToSend.cultivo_planificado = formData.cultivo_planificado;
      }

      if (formData.meta_produccion_parcela) {
        dataToSend.meta_produccion_parcela = parseFloat(formData.meta_produccion_parcela);
      }

      await campaignService.assignPlot(campaignId, dataToSend);

      alert('Parcela asignada exitosamente');
      setShowModal(false);
      setFormData({
        parcela_id: '',
        fecha_asignacion: new Date().toISOString().split('T')[0],
        superficie_comprometida: '',
        cultivo_planificado: '',
        meta_produccion_parcela: '',
        observaciones: '',
      });
      cargarPlots();
    } catch (error) {
      console.error('Error al asignar parcela:', error);
      if (error.response?.data) {
        alert('Error: ' + JSON.stringify(error.response.data));
      } else {
        alert('Error al asignar la parcela');
      }
    }
  };

  const handleRemove = async (plotId, parcelaNombre) => {
    if (!window.confirm(`¿Está seguro de desasignar la parcela "${parcelaNombre}"?`)) {
      return;
    }

    try {
      const plot = plots.find(p => p.id === plotId);
      if (!plot) return;

      // El backend espera el ID de la parcela, que puede estar en plot.parcela.id o plot.parcela
      const parcelaId = typeof plot.parcela === 'object' ? plot.parcela.id : plot.parcela;
      await campaignService.removePlot(campaignId, parcelaId);
      alert('Parcela desasignada exitosamente');
      cargarPlots();
    } catch (error) {
      console.error('Error al desasignar parcela:', error);
      alert('Error al desasignar la parcela');
    }
  };

  const handleParcelaChange = (e) => {
    const parcelaId = e.target.value;
    setFormData({ ...formData, parcela_id: parcelaId });

    // Auto-completar superficie comprometida con la superficie total
    const parcela = parcelas.find(p => p.id === parseInt(parcelaId));
    if (parcela) {
      setFormData(prev => ({
        ...prev,
        superficie_comprometida: parcela.superficie_hectareas || '',
      }));
    }
  };

  // Filtrar parcelas ya asignadas
  const parcelasDisponibles = parcelas.filter(
    parcela => !plots.some(p => {
      const plotParcelaId = typeof p.parcela === 'object' ? p.parcela.id : p.parcela;
      return plotParcelaId === parcela.id;
    })
  );

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-white font-medium">Parcelas Asignadas</h3>
          <p className="text-emerald-100/60 text-sm">
            {plots.length} parcela{plots.length !== 1 ? 's' : ''} en la campaña
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200 font-medium py-2 px-4 rounded-lg transition-colors flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Asignar Parcela</span>
        </button>
      </div>

      {/* Lista de parcelas */}
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-500"></div>
          <span className="ml-3 text-emerald-100">Cargando...</span>
        </div>
      ) : plots.length === 0 ? (
        <div className="text-center py-12 bg-white/5 rounded-lg">
          <MapPin className="w-12 h-12 text-emerald-400/50 mx-auto mb-4" />
          <p className="text-emerald-100/60">No hay parcelas asignadas</p>
          <button
            onClick={() => setShowModal(true)}
            className="mt-4 text-emerald-300 hover:text-emerald-200 text-sm"
          >
            Asignar la primera parcela
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/5">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-emerald-200 uppercase">
                  Parcela
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-emerald-200 uppercase">
                  Socio
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-emerald-200 uppercase">
                  Superficie
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-emerald-200 uppercase">
                  Cultivo Planificado
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-emerald-200 uppercase">
                  Meta Parcela
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-emerald-200 uppercase">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {plots.map((plot) => {
                // Extraer datos de la parcela según estructura del backend
                const parcelaData = plot.parcela || {};
                const parcelaNombre = parcelaData.nombre || 'N/A';
                const parcelaSuperficie = parcelaData.superficie_hectareas || 0;
                const socioData = parcelaData.socio || {};
                const usuarioData = socioData.usuario || {};
                const socioNombre = `${usuarioData.nombres || ''} ${usuarioData.apellidos || ''}`.trim() || 'N/A';

                return (
                  <tr key={plot.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center space-x-2">
                        <MapPin className="w-4 h-4 text-emerald-300" />
                        <div>
                          <div className="text-white font-medium">{parcelaNombre}</div>
                          <div className="text-emerald-100/60 text-xs">
                            Superficie total: {parcelaSuperficie} ha
                          </div>
                        </div>
                      </div>
                      {plot.observaciones && (
                        <div className="text-emerald-100/60 text-xs mt-1 ml-6">
                          {plot.observaciones}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-white text-sm">
                      {socioNombre}
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-white">
                        {plot.superficie_comprometida ? (
                          <>
                            <div className="font-medium">{plot.superficie_comprometida} ha</div>
                            <div className="text-emerald-100/60 text-xs">
                              {((plot.superficie_comprometida / parcelaSuperficie) * 100).toFixed(1)}% comprometida
                            </div>
                          </>
                        ) : (
                          <span className="text-emerald-100/60">No especificada</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {plot.cultivo_planificado ? (
                        <div className="flex items-center space-x-2">
                          <Sprout className="w-4 h-4 text-green-300" />
                          <span className="text-white">{plot.cultivo_planificado}</span>
                        </div>
                      ) : (
                        <span className="text-emerald-100/60 text-sm">No especificado</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-white text-sm">
                      {plot.meta_produccion_parcela ? (
                        `${parseFloat(plot.meta_produccion_parcela).toLocaleString()} kg`
                      ) : (
                        <span className="text-emerald-100/60">No especificada</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleRemove(plot.id, parcelaNombre)}
                        className="text-red-200 hover:text-red-100 transition-colors"
                        title="Desasignar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal de asignación */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-emerald-950 via-emerald-900 to-emerald-800 border border-white/20 rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-white/20">
              <h3 className="text-xl font-bold text-white">Asignar Parcela</h3>
            </div>

            <form onSubmit={handleAssign} className="p-6 space-y-4">
              <div>
                <label className="block text-emerald-100 text-sm font-medium mb-2">
                  Parcela *
                </label>
                <select
                  value={formData.parcela_id}
                  onChange={handleParcelaChange}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  required
                >
                  <option value="">Seleccione una parcela</option>
                  {parcelasDisponibles.map((parcela) => (
                    <option key={parcela.id} value={parcela.id}>
                      {parcela.nombre} - {parcela.superficie_hectareas} ha
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-emerald-100 text-sm font-medium mb-2">
                  Superficie Comprometida (ha)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.superficie_comprometida}
                  onChange={(e) => setFormData({ ...formData, superficie_comprometida: e.target.value })}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-emerald-200/50 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  placeholder="Ej: 10.5"
                />
              </div>

              <div>
                <label className="block text-emerald-100 text-sm font-medium mb-2">
                  Cultivo Planificado
                </label>
                <input
                  type="text"
                  value={formData.cultivo_planificado}
                  onChange={(e) => setFormData({ ...formData, cultivo_planificado: e.target.value })}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-emerald-200/50 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  placeholder="Ej: Maíz, Quinua, etc."
                />
              </div>

              <div>
                <label className="block text-emerald-100 text-sm font-medium mb-2">
                  Meta de Producción (kg)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.meta_produccion_parcela}
                  onChange={(e) => setFormData({ ...formData, meta_produccion_parcela: e.target.value })}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-emerald-200/50 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  placeholder="Ej: 5000"
                />
              </div>

              <div>
                <label className="block text-emerald-100 text-sm font-medium mb-2">
                  Fecha de Asignación *
                </label>
                <input
                  type="date"
                  value={formData.fecha_asignacion}
                  onChange={(e) => setFormData({ ...formData, fecha_asignacion: e.target.value })}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  required
                />
              </div>

              <div>
                <label className="block text-emerald-100 text-sm font-medium mb-2">
                  Observaciones
                </label>
                <textarea
                  value={formData.observaciones}
                  onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
                  rows="3"
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-emerald-200/50 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  placeholder="Observaciones adicionales..."
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-white/20">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="bg-white/10 hover:bg-white/20 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200 font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  Asignar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CampaignPlots;
