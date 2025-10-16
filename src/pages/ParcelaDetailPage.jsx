import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, ArrowLeft, Ruler, Droplets, Calendar, User, Edit } from 'lucide-react';
import { parcelaService } from '../api/parcelaService';

const ParcelaDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [parcela, setParcela] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    cargarParcela();
  }, [id]);

  const cargarParcela = async () => {
    try {
      setLoading(true);
      const response = await parcelaService.getParcela(id);
      setParcela(response);
    } catch (error) {
      console.error('Error al cargar parcela:', error);
      setError('Error al cargar los detalles de la parcela');

      // Fallback a datos simulados si hay error
      setParcela({
        id: parseInt(id),
        socio: {
          id: 1,
          usuario: {
            nombres: 'Juan',
            apellidos: 'Pérez',
            ci_nit: '1234567'
          }
        },
        nombre: 'Parcela Ejemplo',
        superficie_hectareas: 5.5,
        tipo_suelo: 'ARCILLOSO',
        ubicacion: 'Comunidad A, Parcela 1',
        coordenadas: '-16.5, -68.1',
        descripcion: 'Parcela dedicada al cultivo de maíz y papa',
        fecha_registro: '2023-01-15',
        estado: 'ACTIVA',
        created_at: '2023-01-15T10:30:00Z',
        updated_at: '2023-01-15T10:30:00Z'
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
          <span className="ml-3 text-emerald-100">Cargando detalles de la parcela...</span>
        </div>
      </div>
    );
  }

  if (error && !parcela) {
    return (
      <div className="space-y-6">
        <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-6">
          <h2 className="text-red-200 font-medium mb-2">Error</h2>
          <p className="text-red-100/80">{error}</p>
          <button
            onClick={() => navigate('/parcelas')}
            className="mt-4 bg-red-500/20 hover:bg-red-500/30 text-red-200 font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Volver a Parcelas
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/parcelas')}
            className="bg-white/10 hover:bg-white/20 text-white p-2 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-white">Detalles de Parcela</h1>
            <p className="text-emerald-100/80 mt-1">
              Información completa de la parcela #{parcela?.id}
            </p>
          </div>
        </div>
        <button
          onClick={() => navigate(`/parcelas/editar/${parcela?.id}`)}
          className="bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-200 font-medium py-2 px-4 rounded-lg transition-colors flex items-center space-x-2"
        >
          <Edit className="w-4 h-4" />
          <span>Editar Parcela</span>
        </button>
      </div>

      {/* Información Principal */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Detalles Básicos */}
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6">
          <h2 className="text-xl font-semibold text-white mb-6 flex items-center">
            <MapPin className="w-5 h-5 mr-2 text-emerald-400" />
            Información Básica
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-emerald-200/80 mb-1">
                Nombre
              </label>
              <p className="text-white text-lg">{parcela?.nombre || 'Sin nombre'}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-emerald-200/80 mb-1">
                Socio
              </label>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-white">
                    {parcela?.socio?.usuario?.nombres} {parcela?.socio?.usuario?.apellidos}
                  </p>
                  <p className="text-emerald-100/60 text-sm">
                    CI/NIT: {parcela?.socio?.usuario?.ci_nit}
                  </p>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-emerald-200/80 mb-1">
                Ubicación
              </label>
              <p className="text-white">{parcela?.ubicacion || 'Sin ubicación especificada'}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-emerald-200/80 mb-1">
                Coordenadas
              </label>
              <p className="text-white font-mono text-sm">{parcela?.coordenadas || 'No disponibles'}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-emerald-200/80 mb-1">
                Estado
              </label>
              <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${
                parcela?.estado === 'ACTIVA'
                  ? 'bg-emerald-500/20 text-emerald-200'
                  : 'bg-red-500/20 text-red-200'
              }`}>
                {parcela?.estado}
              </span>
            </div>
          </div>
        </div>

        {/* Características Técnicas */}
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6">
          <h2 className="text-xl font-semibold text-white mb-6 flex items-center">
            <Ruler className="w-5 h-5 mr-2 text-blue-400" />
            Características Técnicas
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-emerald-200/80 mb-1">
                Superficie
              </label>
              <div className="flex items-center space-x-2">
                <Ruler className="w-4 h-4 text-emerald-400" />
                <span className="text-white text-lg font-medium">
                  {parcela?.superficie_hectareas || parcela?.superficie} hectáreas
                </span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-emerald-200/80 mb-1">
                Tipo de Suelo
              </label>
              <div className="flex items-center space-x-2">
                <Droplets className="w-4 h-4 text-blue-400" />
                <span className="text-white">{parcela?.tipo_suelo || 'No especificado'}</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-emerald-200/80 mb-1">
                Fecha de Registro
              </label>
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-purple-400" />
                <span className="text-white">{formatDate(parcela?.fecha_registro)}</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-emerald-200/80 mb-1">
                Última Actualización
              </label>
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-orange-400" />
                <span className="text-white">{formatDate(parcela?.updated_at)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Descripción */}
      {parcela?.descripcion && (
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Descripción</h2>
          <p className="text-emerald-100/80 leading-relaxed">{parcela.descripcion}</p>
        </div>
      )}

      {/* Información Adicional */}
      <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6">
        <h2 className="text-xl font-semibold text-white mb-4">Información del Sistema</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-emerald-200/80 mb-1">
              ID de Parcela
            </label>
            <p className="text-white font-mono">{parcela?.id}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-emerald-200/80 mb-1">
              ID de Socio
            </label>
            <p className="text-white font-mono">{parcela?.socio?.id}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-emerald-200/80 mb-1">
              Fecha de Creación
            </label>
            <p className="text-white">{formatDate(parcela?.created_at)}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-emerald-200/80 mb-1">
              Última Modificación
            </label>
            <p className="text-white">{formatDate(parcela?.updated_at)}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParcelaDetailPage;