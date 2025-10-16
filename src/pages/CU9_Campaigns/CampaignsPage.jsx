import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Search, Plus, Edit, Trash2, Eye, Filter, Download, TrendingUp } from 'lucide-react';
import { campaignService } from '../../api/campaignService';
import CampaignForm from '../../components/Campaigns/CampaignForm';

const CampaignsPage = () => {
  const navigate = useNavigate();
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  
  const [filtros, setFiltros] = useState({
    estado: '',
    fecha_inicio_desde: '',
    fecha_inicio_hasta: '',
    responsable_id: '',
  });

  useEffect(() => {
    cargarCampaigns();
  }, []);

  const cargarCampaigns = async () => {
    try {
      setLoading(true);
      const response = await campaignService.getCampaigns();
      setCampaigns(Array.isArray(response) ? response : []);
    } catch (error) {
      console.error('Error al cargar campañas:', error);
      setCampaigns([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    try {
      setLoading(true);
      const params = {
        estado: filtros.estado,
        fecha_inicio_desde: filtros.fecha_inicio_desde,
        fecha_inicio_hasta: filtros.fecha_inicio_hasta,
        responsable_id: filtros.responsable_id,
        nombre: searchTerm,
      };
      const response = await campaignService.getCampaigns(params);
      setCampaigns(Array.isArray(response) ? response : []);
    } catch (error) {
      console.error('Error en búsqueda:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (campaignId, campaignName) => {
    if (!window.confirm(`¿Está seguro de eliminar la campaña "${campaignName}"?\n\nEsta acción no se puede deshacer.`)) {
      return;
    }

    try {
      await campaignService.deleteCampaign(campaignId);
      alert('Campaña eliminada exitosamente');
      await cargarCampaigns();
    } catch (error) {
      console.error('Error al eliminar campaña:', error);
      if (error.response?.data?.error) {
        alert(error.response.data.error);
      } else {
        alert('Error al eliminar la campaña. Puede tener dependencias asociadas.');
      }
    }
  };

  const handleEdit = (campaign) => {
    setSelectedCampaign(campaign);
    setShowForm(true);
  };

  const handleCreate = () => {
    setSelectedCampaign(null);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setSelectedCampaign(null);
    cargarCampaigns();
  };

  const handleExportCSV = () => {
    const headers = ['ID', 'Nombre', 'Fecha Inicio', 'Fecha Fin', 'Estado', 'Meta Producción', 'Socios', 'Parcelas'];
    const rows = filteredCampaigns.map(c => [
      c.id,
      c.nombre,
      c.fecha_inicio,
      c.fecha_fin,
      c.estado,
      `${c.meta_produccion} ${c.unidad_meta}`,
      c.total_socios || 0,
      c.total_parcelas || 0,
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `campañas_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const filteredCampaigns = campaigns.filter(campaign => {
    const searchLower = searchTerm.toLowerCase();
    return campaign.nombre?.toLowerCase().includes(searchLower) ||
           campaign.descripcion?.toLowerCase().includes(searchLower);
  });

  const getEstadoBadgeColor = (estado) => {
    const colors = {
      'PLANIFICADA': 'bg-blue-500/20 text-blue-200',
      'EN_CURSO': 'bg-emerald-500/20 text-emerald-200',
      'FINALIZADA': 'bg-gray-500/20 text-gray-200',
      'CANCELADA': 'bg-red-500/20 text-red-200',
    };
    return colors[estado] || 'bg-gray-500/20 text-gray-200';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Gestión de Campañas</h1>
          <p className="text-emerald-100/80 mt-1">
            Administra las campañas agrícolas de la cooperativa
          </p>
        </div>
        <div className="flex space-x-3 mt-4 sm:mt-0">
          <button
            onClick={handleExportCSV}
            className="bg-purple-500/20 hover:bg-purple-500/30 text-purple-200 font-medium py-2 px-4 rounded-lg transition-colors flex items-center space-x-2"
          >
            <Download className="w-4 h-4" />
            <span>Exportar CSV</span>
          </button>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-200 font-medium py-2 px-4 rounded-lg transition-colors flex items-center space-x-2"
          >
            <Filter className="w-4 h-4" />
            <span>Filtros</span>
          </button>
          <button
            onClick={handleCreate}
            className="bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200 font-medium py-2 px-4 rounded-lg transition-colors flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Nueva Campaña</span>
          </button>
        </div>
      </div>

      {/* Filtros avanzados */}
      {showFilters && (
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6">
          <h3 className="text-white font-medium mb-4">Filtros Avanzados</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <select
              value={filtros.estado}
              onChange={(e) => setFiltros({...filtros, estado: e.target.value})}
              className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-400"
            >
              <option value="">Todos los estados</option>
              <option value="PLANIFICADA">Planificada</option>
              <option value="EN_CURSO">En Curso</option>
              <option value="FINALIZADA">Finalizada</option>
              <option value="CANCELADA">Cancelada</option>
            </select>
            
            <input
              type="date"
              placeholder="Fecha inicio desde"
              value={filtros.fecha_inicio_desde}
              onChange={(e) => setFiltros({...filtros, fecha_inicio_desde: e.target.value})}
              className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-emerald-200/50 focus:outline-none focus:ring-2 focus:ring-emerald-400"
            />
            
            <input
              type="date"
              placeholder="Fecha inicio hasta"
              value={filtros.fecha_inicio_hasta}
              onChange={(e) => setFiltros({...filtros, fecha_inicio_hasta: e.target.value})}
              className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-emerald-200/50 focus:outline-none focus:ring-2 focus:ring-emerald-400"
            />
            
            <button
              onClick={handleSearch}
              className="bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200 font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Buscar
            </button>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-emerald-300/60" />
          <input
            type="text"
            placeholder="Buscar campaña por nombre o descripción..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white/10 border border-white/20 rounded-lg pl-12 pr-4 py-3 text-white placeholder-emerald-200/50 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent"
          />
        </div>
      </div>

      {/* Campaigns Table */}
      <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
            <span className="ml-3 text-emerald-100">Cargando campañas...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/5">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-emerald-200 uppercase tracking-wider">
                    Campaña
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-emerald-200 uppercase tracking-wider">
                    Fechas
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-emerald-200 uppercase tracking-wider">
                    Meta Producción
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-emerald-200 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-emerald-200 uppercase tracking-wider">
                    Recursos
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-emerald-200 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {filteredCampaigns.map((campaign) => (
                  <tr key={campaign.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center">
                          <Calendar className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <div className="text-white font-medium">{campaign.nombre}</div>
                          <div className="text-emerald-100/60 text-sm">
                            {campaign.descripcion?.substring(0, 40)}
                            {campaign.descripcion?.length > 40 ? '...' : ''}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-emerald-100/80 text-sm">
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-3 h-3" />
                          <span>{campaign.fecha_inicio}</span>
                        </div>
                        <div className="flex items-center space-x-1 text-emerald-100/60">
                          <Calendar className="w-3 h-3" />
                          <span>{campaign.fecha_fin}</span>
                        </div>
                        <div className="text-xs text-emerald-100/50 mt-1">
                          {campaign.duracion_dias} días
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <TrendingUp className="w-4 h-4 text-emerald-300" />
                        <span className="text-white">
                          {parseFloat(campaign.meta_produccion).toLocaleString()} {campaign.unidad_meta}
                        </span>
                      </div>
                      {campaign.presupuesto && (
                        <div className="text-emerald-100/60 text-sm mt-1">
                          Bs. {parseFloat(campaign.presupuesto).toLocaleString()}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getEstadoBadgeColor(campaign.estado)}`}>
                        {campaign.estado?.replace('_', ' ')}
                      </span>
                      {campaign.progreso_temporal !== undefined && campaign.estado === 'EN_CURSO' && (
                        <div className="text-xs text-emerald-100/60 mt-1">
                          {campaign.progreso_temporal?.toFixed(1)}% completado
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1 text-sm text-emerald-100/80">
                        <div>👥 {campaign.total_socios || 0} socios</div>
                        <div>🌾 {campaign.total_parcelas || 0} parcelas</div>
                        {campaign.total_superficie > 0 && (
                          <div className="text-xs text-emerald-100/60">
                            {campaign.total_superficie} ha
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => navigate(`/campaigns/${campaign.id}`)}
                          className="text-blue-200 hover:text-blue-100 transition-colors"
                          title="Ver detalle"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEdit(campaign)}
                          className="text-yellow-200 hover:text-yellow-100 transition-colors"
                          title="Editar"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(campaign.id, campaign.nombre)}
                          className="text-red-200 hover:text-red-100 transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {filteredCampaigns.length === 0 && !loading && (
          <div className="text-center py-12">
            <Calendar className="w-12 h-12 text-emerald-400/50 mx-auto mb-4" />
            <p className="text-emerald-100/60">No se encontraron campañas</p>
          </div>
        )}
      </div>

      {/* Modal de formulario */}
      {showForm && (
        <CampaignForm
          campaign={selectedCampaign}
          onClose={handleFormClose}
        />
      )}
    </div>
  );
};

export default CampaignsPage;
