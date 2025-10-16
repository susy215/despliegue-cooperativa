import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, ArrowLeft, Edit, Users, MapPin, TrendingUp, DollarSign } from 'lucide-react';
import { campaignService } from '../../api/campaignService';
import CampaignPartners from '../../components/Campaigns/CampaignPartners';
import CampaignPlots from '../../components/Campaigns/CampaignPlots';

const CampaignDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [campaign, setCampaign] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('info');

  useEffect(() => {
    cargarCampaign();
  }, [id]);

  const cargarCampaign = async () => {
    try {
      setLoading(true);
      const data = await campaignService.getCampaignById(id);
      setCampaign(data);
    } catch (error) {
      console.error('Error al cargar campaña:', error);
      alert('Error al cargar la campaña');
      navigate('/campaigns');
    } finally {
      setLoading(false);
    }
  };

  const getEstadoBadgeColor = (estado) => {
    const colors = {
      'PLANIFICADA': 'bg-blue-500/20 text-blue-200 border-blue-400/30',
      'EN_CURSO': 'bg-emerald-500/20 text-emerald-200 border-emerald-400/30',
      'FINALIZADA': 'bg-gray-500/20 text-gray-200 border-gray-400/30',
      'CANCELADA': 'bg-red-500/20 text-red-200 border-red-400/30',
    };
    return colors[estado] || 'bg-gray-500/20 text-gray-200 border-gray-400/30';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
        <span className="ml-3 text-emerald-100">Cargando campaña...</span>
      </div>
    );
  }

  if (!campaign) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/campaigns')}
            className="text-emerald-200 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-white">{campaign.nombre}</h1>
            <p className="text-emerald-100/80 mt-1">
              Detalle de la campaña agrícola
            </p>
          </div>
        </div>
        <button
          onClick={() => navigate(`/campaigns/editar/${campaign.id}`)}
          className="bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-200 font-medium py-2 px-4 rounded-lg transition-colors flex items-center space-x-2"
        >
          <Edit className="w-4 h-4" />
          <span>Editar</span>
        </button>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-blue-300" />
            </div>
            <div>
              <div className="text-emerald-100/60 text-sm">Estado</div>
              <div className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${getEstadoBadgeColor(campaign.estado)}`}>
                {campaign.estado?.replace('_', ' ')}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-emerald-500/20 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-emerald-300" />
            </div>
            <div>
              <div className="text-emerald-100/60 text-sm">Meta Producción</div>
              <div className="text-white font-bold">
                {parseFloat(campaign.meta_produccion).toLocaleString()} {campaign.unidad_meta}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-purple-300" />
            </div>
            <div>
              <div className="text-emerald-100/60 text-sm">Socios</div>
              <div className="text-white font-bold">{campaign.total_socios || 0}</div>
            </div>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
              <MapPin className="w-6 h-6 text-green-300" />
            </div>
            <div>
              <div className="text-emerald-100/60 text-sm">Parcelas</div>
              <div className="text-white font-bold">{campaign.total_parcelas || 0}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl overflow-hidden">
        <div className="flex border-b border-white/20">
          <button
            onClick={() => setActiveTab('info')}
            className={`flex-1 px-6 py-4 font-medium transition-colors ${activeTab === 'info'
                ? 'bg-emerald-500/20 text-emerald-200 border-b-2 border-emerald-400'
                : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
          >
            Información General
          </button>
          <button
            onClick={() => setActiveTab('socios')}
            className={`flex-1 px-6 py-4 font-medium transition-colors ${activeTab === 'socios'
                ? 'bg-emerald-500/20 text-emerald-200 border-b-2 border-emerald-400'
                : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
          >
            Socios Asignados
          </button>
          <button
            onClick={() => setActiveTab('parcelas')}
            className={`flex-1 px-6 py-4 font-medium transition-colors ${activeTab === 'parcelas'
                ? 'bg-emerald-500/20 text-emerald-200 border-b-2 border-emerald-400'
                : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
          >
            Parcelas Asignadas
          </button>
        </div>

        <div className="p-6">
          {/* Tab: Información General */}
          {activeTab === 'info' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-emerald-100/60 text-sm font-medium mb-2">
                    Fecha de Inicio
                  </label>
                  <div className="bg-white/5 rounded-lg px-4 py-3 text-white">
                    {campaign.fecha_inicio}
                  </div>
                </div>

                <div>
                  <label className="block text-emerald-100/60 text-sm font-medium mb-2">
                    Fecha de Fin
                  </label>
                  <div className="bg-white/5 rounded-lg px-4 py-3 text-white">
                    {campaign.fecha_fin}
                  </div>
                </div>

                <div>
                  <label className="block text-emerald-100/60 text-sm font-medium mb-2">
                    Duración
                  </label>
                  <div className="bg-white/5 rounded-lg px-4 py-3 text-white">
                    {campaign.duracion_dias} días
                  </div>
                </div>

                {campaign.presupuesto && (
                  <div>
                    <label className="block text-emerald-100/60 text-sm font-medium mb-2">
                      Presupuesto
                    </label>
                    <div className="bg-white/5 rounded-lg px-4 py-3 text-white flex items-center space-x-2">
                      <DollarSign className="w-4 h-4 text-emerald-300" />
                      <span>Bs. {parseFloat(campaign.presupuesto).toLocaleString()}</span>
                    </div>
                  </div>
                )}

                {campaign.responsable && (
                  <div>
                    <label className="block text-emerald-100/60 text-sm font-medium mb-2">
                      Responsable
                    </label>
                    <div className="bg-white/5 rounded-lg px-4 py-3 text-white">
                      {typeof campaign.responsable === 'object'
                        ? `${campaign.responsable.nombres} ${campaign.responsable.apellidos}`
                        : campaign.responsable
                      }
                    </div>
                  </div>
                )}

                {campaign.progreso_temporal !== undefined && campaign.estado === 'EN_CURSO' && (
                  <div>
                    <label className="block text-emerald-100/60 text-sm font-medium mb-2">
                      Progreso Temporal
                    </label>
                    <div className="bg-white/5 rounded-lg px-4 py-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-white">{campaign.progreso_temporal?.toFixed(1)}%</span>
                        <span className="text-emerald-100/60 text-sm">
                          {campaign.dias_restantes || 0} días restantes
                        </span>
                      </div>
                      <div className="w-full bg-white/10 rounded-full h-2">
                        <div
                          className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(campaign.progreso_temporal || 0, 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {campaign.descripcion && (
                <div>
                  <label className="block text-emerald-100/60 text-sm font-medium mb-2">
                    Descripción
                  </label>
                  <div className="bg-white/5 rounded-lg px-4 py-3 text-white whitespace-pre-wrap">
                    {campaign.descripcion}
                  </div>
                </div>
              )}

              {campaign.total_superficie > 0 && (
                <div>
                  <label className="block text-emerald-100/60 text-sm font-medium mb-2">
                    Superficie Total Comprometida
                  </label>
                  <div className="bg-white/5 rounded-lg px-4 py-3 text-white">
                    {campaign.total_superficie} hectáreas
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Tab: Socios */}
          {activeTab === 'socios' && (
            <CampaignPartners campaignId={id} />
          )}

          {/* Tab: Parcelas */}
          {activeTab === 'parcelas' && (
            <CampaignPlots campaignId={id} />
          )}
        </div>
      </div>
    </div>
  );
};

export default CampaignDetailPage;
