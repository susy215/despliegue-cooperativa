import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, MapPin, Ruler, Droplets, Plus, Edit, Eye, User } from 'lucide-react';
import { parcelaService } from '../api/parcelaService';
import { socioService } from '../api/socioService';

const ParcelasSocioPage = () => {
  const navigate = useNavigate();
  const { socioId } = useParams();
  const [parcelas, setParcelas] = useState([]);
  const [socio, setSocio] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingSocio, setLoadingSocio] = useState(true);

  useEffect(() => {
    cargarSocio();
    cargarParcelas();
  }, [socioId]);

  const cargarSocio = async () => {
    try {
      setLoadingSocio(true);
      const response = await socioService.getSocioById(socioId);
      setSocio(response);
    } catch (error) {
      console.error('Error al cargar socio:', error);
      // Fallback a datos simulados
      setSocio({
        id: socioId,
        usuario: { nombres: 'Juan', apellidos: 'Pérez' }
      });
    } finally {
      setLoadingSocio(false);
    }
  };

  const cargarParcelas = async () => {
    try {
      setLoading(true);
      const response = await parcelaService.getParcelasBySocio(socioId);
      setParcelas(response || []);
    } catch (error) {
      console.error('Error al cargar parcelas:', error);
      // Fallback a datos simulados
      setParcelas([
        {
          id: 1,
          superficie: 5.5,
          tipo_suelo: 'ARCILLOSO',
          ubicacion: 'Comunidad A, Parcela 1',
          coordenadas: '-16.5, -68.1',
          fecha_registro: '2023-01-15',
          estado: 'ACTIVA',
          descripcion: 'Parcela principal para cultivo de maíz'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (parcelaId) => {
    if (!confirm('¿Está seguro de que desea eliminar esta parcela?')) {
      return;
    }

    try {
      await parcelaService.deleteParcela(parcelaId);
      await cargarParcelas(); // Recargar la lista
    } catch (error) {
      console.error('Error al eliminar parcela:', error);
      alert('Error al eliminar la parcela');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <button
          onClick={() => navigate('/socios')}
          className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-white">Parcelas del Socio</h1>
          {loadingSocio ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-emerald-500 mt-1"></div>
          ) : (
            <p className="text-emerald-100/80 mt-1">
              Gestionando parcelas de {socio?.usuario?.nombres} {socio?.usuario?.apellidos}
            </p>
          )}
        </div>
      </div>

      {/* Socio Info Card */}
      {!loadingSocio && socio && (
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center">
              <User className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">
                {socio.usuario?.nombres} {socio.usuario?.apellidos}
              </h3>
              <p className="text-emerald-100/60">ID: {socio.id}</p>
            </div>
            <div className="ml-auto">
              <button
                onClick={() => navigate(`/parcelas/nueva?socio=${socioId}`)}
                className="bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200 font-medium py-2 px-4 rounded-lg transition-colors flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Agregar Parcela</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Parcelas List */}
      <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
            <span className="ml-3 text-emerald-100">Cargando parcelas...</span>
          </div>
        ) : parcelas.length > 0 ? (
          <div className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4">
              Parcelas Registradas ({parcelas.length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {parcelas.map((parcela) => (
                <div key={parcela.id} className="bg-white/5 border border-white/10 rounded-lg p-4 hover:bg-white/10 transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                      <MapPin className="w-5 h-5 text-white" />
                    </div>
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      parcela.estado === 'ACTIVA'
                        ? 'bg-emerald-500/20 text-emerald-200'
                        : 'bg-red-500/20 text-red-200'
                    }`}>
                      {parcela.estado}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Ruler className="w-4 h-4 text-emerald-400" />
                      <span className="text-white text-sm">{parcela.superficie} hectáreas</span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Droplets className="w-4 h-4 text-blue-400" />
                      <span className="text-white text-sm">{parcela.tipo_suelo}</span>
                    </div>

                    <div className="text-emerald-100/80 text-sm">
                      <div className="font-medium">Ubicación:</div>
                      <div>{parcela.ubicacion}</div>
                    </div>

                    {parcela.descripcion && (
                      <div className="text-emerald-100/60 text-sm">
                        <div className="font-medium">Descripción:</div>
                        <div className="truncate">{parcela.descripcion}</div>
                      </div>
                    )}

                    <div className="text-emerald-100/60 text-xs">
                      Registrada: {new Date(parcela.fecha_registro).toLocaleDateString()}
                    </div>
                  </div>

                  <div className="flex items-center justify-end space-x-2 mt-4 pt-4 border-t border-white/10">
                    <button
                      onClick={() => navigate(`/parcelas/${parcela.id}`)}
                      className="text-blue-200 hover:text-blue-100 transition-colors p-1"
                      title="Ver detalles"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => navigate(`/parcelas/editar/${parcela.id}`)}
                      className="text-yellow-200 hover:text-yellow-100 transition-colors p-1"
                      title="Editar parcela"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <MapPin className="w-12 h-12 text-emerald-400/50 mx-auto mb-4" />
            <p className="text-emerald-100/60 mb-4">Este socio no tiene parcelas registradas</p>
            <button
              onClick={() => navigate(`/parcelas/nueva?socio=${socioId}`)}
              className="bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200 font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Registrar Primera Parcela
            </button>
          </div>
        )}
      </div>

      {/* Estadísticas */}
      {!loading && parcelas.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6">
            <div className="flex items-center space-x-3">
              <MapPin className="w-8 h-8 text-emerald-400" />
              <div>
                <p className="text-emerald-100/60 text-sm">Total Parcelas</p>
                <p className="text-2xl font-bold text-white">{parcelas.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6">
            <div className="flex items-center space-x-3">
              <Ruler className="w-8 h-8 text-blue-400" />
              <div>
                <p className="text-emerald-100/60 text-sm">Superficie Total</p>
                <p className="text-2xl font-bold text-white">
                  {parcelas.reduce((total, parcela) => total + (parcela.superficie || 0), 0).toFixed(2)} ha
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6">
            <div className="flex items-center space-x-3">
              <Droplets className="w-8 h-8 text-purple-400" />
              <div>
                <p className="text-emerald-100/60 text-sm">Tipos de Suelo</p>
                <p className="text-2xl font-bold text-white">
                  {new Set(parcelas.map(p => p.tipo_suelo)).size}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ParcelasSocioPage;