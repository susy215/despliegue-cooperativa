import React, { useState, useEffect } from 'react';
import { Users, Plus, Trash2, UserCheck } from 'lucide-react';
import { campaignService } from '../../api/campaignService';
import { socioService } from '../../api/socioService';

const CampaignPartners = ({ campaignId }) => {
  const [partners, setPartners] = useState([]);
  const [socios, setSocios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    socio_id: '',
    rol: 'PRODUCTOR',
    fecha_asignacion: new Date().toISOString().split('T')[0],
    observaciones: '',
  });

  useEffect(() => {
    cargarPartners();
    cargarSocios();
  }, [campaignId]);

  const cargarPartners = async () => {
    try {
      setLoading(true);
      const data = await campaignService.getCampaignPartners(campaignId);
      setPartners(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error al cargar socios:', error);
      setPartners([]);
    } finally {
      setLoading(false);
    }
  };

  const cargarSocios = async () => {
    try {
      const response = await socioService.getSocios({ estado: 'ACTIVO' });
      setSocios(response.results || []);
    } catch (error) {
      console.error('Error al cargar socios disponibles:', error);
      setSocios([]);
    }
  };

  const handleAssign = async (e) => {
    e.preventDefault();

    if (!formData.socio_id) {
      alert('Debe seleccionar un socio');
      return;
    }

    try {
      await campaignService.assignPartner(campaignId, {
        socio_id: parseInt(formData.socio_id),
        rol: formData.rol,
        fecha_asignacion: formData.fecha_asignacion,
        observaciones: formData.observaciones,
      });

      alert('Socio asignado exitosamente');
      setShowModal(false);
      setFormData({
        socio_id: '',
        rol: 'PRODUCTOR',
        fecha_asignacion: new Date().toISOString().split('T')[0],
        observaciones: '',
      });
      cargarPartners();
    } catch (error) {
      console.error('Error al asignar socio:', error);
      if (error.response?.data) {
        alert('Error: ' + JSON.stringify(error.response.data));
      } else {
        alert('Error al asignar el socio');
      }
    }
  };

  const handleRemove = async (partnerId, socioNombre) => {
    if (!window.confirm(`¿Está seguro de desasignar a ${socioNombre}?`)) {
      return;
    }

    try {
      // Buscar el socio_id del partner
      const partner = partners.find(p => p.id === partnerId);
      if (!partner) return;

      // El backend espera el ID del socio, que puede estar en partner.socio.id o partner.socio
      const socioId = typeof partner.socio === 'object' ? partner.socio.id : partner.socio;
      await campaignService.removePartner(campaignId, socioId);
      alert('Socio desasignado exitosamente');
      cargarPartners();
    } catch (error) {
      console.error('Error al desasignar socio:', error);
      alert('Error al desasignar el socio');
    }
  };

  const getRolBadgeColor = (rol) => {
    const colors = {
      'COORDINADOR': 'bg-purple-500/20 text-purple-200',
      'PRODUCTOR': 'bg-emerald-500/20 text-emerald-200',
      'TECNICO': 'bg-blue-500/20 text-blue-200',
      'SUPERVISOR': 'bg-yellow-500/20 text-yellow-200',
    };
    return colors[rol] || 'bg-gray-500/20 text-gray-200';
  };

  // Filtrar socios ya asignados
  const sociosDisponibles = socios.filter(
    socio => !partners.some(p => {
      const partnerSocioId = typeof p.socio === 'object' ? p.socio.id : p.socio;
      return partnerSocioId === socio.id;
    })
  );

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-white font-medium">Socios Asignados</h3>
          <p className="text-emerald-100/60 text-sm">
            {partners.length} socio{partners.length !== 1 ? 's' : ''} en la campaña
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200 font-medium py-2 px-4 rounded-lg transition-colors flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Asignar Socio</span>
        </button>
      </div>

      {/* Lista de socios */}
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-500"></div>
          <span className="ml-3 text-emerald-100">Cargando...</span>
        </div>
      ) : partners.length === 0 ? (
        <div className="text-center py-12 bg-white/5 rounded-lg">
          <Users className="w-12 h-12 text-emerald-400/50 mx-auto mb-4" />
          <p className="text-emerald-100/60">No hay socios asignados</p>
          <button
            onClick={() => setShowModal(true)}
            className="mt-4 text-emerald-300 hover:text-emerald-200 text-sm"
          >
            Asignar el primer socio
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/5">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-emerald-200 uppercase">
                  Socio
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-emerald-200 uppercase">
                  CI/NIT
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-emerald-200 uppercase">
                  Rol
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-emerald-200 uppercase">
                  Fecha Asignación
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-emerald-200 uppercase">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {partners.map((partner) => {
                // Extraer datos del socio según estructura del backend
                const socioData = partner.socio || {};
                const usuarioData = socioData.usuario || {};
                const socioNombre = `${usuarioData.nombres || ''} ${usuarioData.apellidos || ''}`.trim() || 'N/A';
                const socioCiNit = usuarioData.ci_nit || 'N/A';

                return (
                  <tr key={partner.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center space-x-2">
                        <UserCheck className="w-4 h-4 text-emerald-300" />
                        <span className="text-white">{socioNombre}</span>
                      </div>
                      {partner.observaciones && (
                        <div className="text-emerald-100/60 text-xs mt-1">
                          {partner.observaciones}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-white text-sm">
                      {socioCiNit}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getRolBadgeColor(partner.rol)}`}>
                        {partner.rol}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-emerald-100/80 text-sm">
                      {partner.fecha_asignacion}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleRemove(partner.id, socioNombre)}
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
          <div className="bg-gradient-to-br from-emerald-950 via-emerald-900 to-emerald-800 border border-white/20 rounded-xl max-w-md w-full">
            <div className="p-6 border-b border-white/20">
              <h3 className="text-xl font-bold text-white">Asignar Socio</h3>
            </div>

            <form onSubmit={handleAssign} className="p-6 space-y-4">
              <div>
                <label className="block text-emerald-100 text-sm font-medium mb-2">
                  Socio *
                </label>
                <select
                  value={formData.socio_id}
                  onChange={(e) => setFormData({ ...formData, socio_id: e.target.value })}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  required
                >
                  <option value="">Seleccione un socio</option>
                  {sociosDisponibles.map((socio) => (
                    <option key={socio.id} value={socio.id}>
                      {socio.usuario?.nombres} {socio.usuario?.apellidos} - {socio.usuario?.ci_nit}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-emerald-100 text-sm font-medium mb-2">
                  Rol *
                </label>
                <select
                  value={formData.rol}
                  onChange={(e) => setFormData({ ...formData, rol: e.target.value })}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-400"
                >
                  <option value="PRODUCTOR">Productor</option>
                  <option value="COORDINADOR">Coordinador</option>
                  <option value="TECNICO">Técnico</option>
                  <option value="SUPERVISOR">Supervisor</option>
                </select>
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

export default CampaignPartners;
