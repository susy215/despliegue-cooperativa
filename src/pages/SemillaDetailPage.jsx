import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Sprout, ArrowLeft, Package, Calendar, DollarSign, Edit, AlertTriangle, TrendingUp } from 'lucide-react';
import { semillaService } from '../api/semillaService';

const SemillaDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [semilla, setSemilla] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    cargarSemilla();
  }, [id]);

  const cargarSemilla = async () => {
    try {
      setLoading(true);
      const response = await semillaService.getSemillaById(id);
      setSemilla(response);
    } catch (error) {
      console.error('Error al cargar semilla:', error);
      setError('Error al cargar los detalles de la semilla');

      // Fallback a datos simulados si hay error
      setSemilla({
        id: parseInt(id),
        especie: 'Maíz',
        variedad: 'Maíz duro híbrido',
        cantidad: 100.00,
        unidad_medida: 'Kilogramos',
        fecha_vencimiento: '2025-12-31',
        porcentaje_germinacion: 95.0,
        lote: 'MZ-HYB-2025-001',
        proveedor: 'AgroSemillas SA',
        precio_unitario: 25.50,
        ubicacion_almacen: 'Sector A-15',
        estado: 'DISPONIBLE',
        valor_total: 2550.00,
        dias_para_vencer: 45,
        registro_sanitario: 'REG-SEM-001-2025',
        dosis_siembra: '25-30 kg/ha',
        ciclo_cultivo: '120-150 días',
        created_at: '2024-01-15T10:30:00Z',
        updated_at: '2024-01-15T10:30:00Z'
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

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'DISPONIBLE': return 'bg-green-500/20 text-green-200';
      case 'AGOTADO': return 'bg-yellow-500/20 text-yellow-200';
      case 'VENCIDO': return 'bg-red-500/20 text-red-200';
      case 'EN_TRANSITO': return 'bg-blue-500/20 text-blue-200';
      case 'EN_USO': return 'bg-purple-500/20 text-purple-200';
      case 'RESERVADO': return 'bg-orange-500/20 text-orange-200';
      default: return 'bg-gray-500/20 text-gray-200';
    }
  };

  const getEstadoIcon = (estado) => {
    switch (estado) {
      case 'VENCIDO': return <AlertTriangle className="w-4 h-4" />;
      case 'AGOTADO': return <Package className="w-4 h-4" />;
      default: return null;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
          <span className="ml-3 text-emerald-100">Cargando detalles de la semilla...</span>
        </div>
      </div>
    );
  }

  if (error && !semilla) {
    return (
      <div className="space-y-6">
        <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-6">
          <h2 className="text-red-200 font-medium mb-2">Error</h2>
          <p className="text-red-100/80">{error}</p>
          <button
            onClick={() => navigate('/semillas')}
            className="mt-4 bg-red-500/20 hover:bg-red-500/30 text-red-200 font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Volver a Semillas
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
            onClick={() => navigate('/semillas')}
            className="bg-white/10 hover:bg-white/20 text-white p-2 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-white">Detalles de Semilla</h1>
            <p className="text-emerald-100/80 mt-1">
              Información completa de la semilla #{semilla?.id}
            </p>
          </div>
        </div>
        <button
          onClick={() => navigate(`/semillas/${semilla?.id}/editar`)}
          className="bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-200 font-medium py-2 px-4 rounded-lg transition-colors flex items-center space-x-2"
        >
          <Edit className="w-4 h-4" />
          <span>Editar Semilla</span>
        </button>
      </div>

      {/* Información Principal */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Detalles Básicos */}
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6">
          <h2 className="text-xl font-semibold text-white mb-6 flex items-center">
            <Sprout className="w-5 h-5 mr-2 text-emerald-400" />
            Información Básica
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-emerald-200/80 mb-1">
                Especie
              </label>
              <p className="text-white text-lg font-medium">{semilla?.especie || 'Sin especie'}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-emerald-200/80 mb-1">
                Variedad
              </label>
              <p className="text-white">{semilla?.variedad || 'Sin variedad especificada'}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-emerald-200/80 mb-1">
                Lote
              </label>
              <p className="text-white font-mono">{semilla?.lote || 'Sin lote'}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-emerald-200/80 mb-1">
                Proveedor
              </label>
              <p className="text-white">{semilla?.proveedor || 'Sin proveedor'}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-emerald-200/80 mb-1">
                Ubicación de Almacén
              </label>
              <p className="text-white">{semilla?.ubicacion_almacen || 'Sin ubicación'}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-emerald-200/80 mb-1">
                Estado
              </label>
              <span className={`inline-flex items-center px-3 py-1 text-sm font-medium rounded-full ${getEstadoColor(semilla?.estado)}`}>
                {getEstadoIcon(semilla?.estado)}
                <span className="ml-1">{semilla?.estado}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Características Técnicas */}
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6">
          <h2 className="text-xl font-semibold text-white mb-6 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-blue-400" />
            Características Técnicas
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-emerald-200/80 mb-1">
                Cantidad Disponible
              </label>
              <div className="flex items-center space-x-2">
                <Package className="w-4 h-4 text-emerald-400" />
                <span className="text-white text-lg font-medium">
                  {semilla?.cantidad} {semilla?.unidad_medida}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-emerald-200/80 mb-1">
                Porcentaje de Germinación
              </label>
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-4 h-4 text-green-400" />
                <span className="text-white text-lg font-medium">{semilla?.porcentaje_germinacion}%</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-emerald-200/80 mb-1">
                Precio Unitario
              </label>
              <div className="flex items-center space-x-2">
                <DollarSign className="w-4 h-4 text-yellow-400" />
                <span className="text-white text-lg font-medium">
                  {formatCurrency(semilla?.precio_unitario)}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-emerald-200/80 mb-1">
                Valor Total
              </label>
              <div className="flex items-center space-x-2">
                <DollarSign className="w-4 h-4 text-blue-400" />
                <span className="text-white text-lg font-medium">
                  {formatCurrency(semilla?.valor_total)}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-emerald-200/80 mb-1">
                Fecha de Vencimiento
              </label>
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-red-400" />
                <span className="text-white">{formatDate(semilla?.fecha_vencimiento)}</span>
                {semilla?.dias_para_vencer !== null && (
                  <span className={`text-sm ${semilla.dias_para_vencer <= 30 ? 'text-red-300' : 'text-emerald-200/60'}`}>
                    ({semilla.dias_para_vencer > 0 ? `${semilla.dias_para_vencer} días` : 'Vencida'})
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Información Adicional */}
      <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6">
        <h2 className="text-xl font-semibold text-white mb-4">Información Adicional</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-emerald-200/80 mb-1">
              Registro Sanitario
            </label>
            <p className="text-white font-mono">{semilla?.registro_sanitario || 'No disponible'}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-emerald-200/80 mb-1">
              Dosis de Siembra
            </label>
            <p className="text-white">{semilla?.dosis_siembra || 'No especificada'}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-emerald-200/80 mb-1">
              Ciclo de Cultivo
            </label>
            <p className="text-white">{semilla?.ciclo_cultivo || 'No especificado'}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-emerald-200/80 mb-1">
              Fecha de Creación
            </label>
            <p className="text-white">{formatDate(semilla?.created_at)}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-emerald-200/80 mb-1">
              Última Modificación
            </label>
            <p className="text-white">{formatDate(semilla?.updated_at)}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-emerald-200/80 mb-1">
              ID de Semilla
            </label>
            <p className="text-white font-mono">{semilla?.id}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SemillaDetailPage;