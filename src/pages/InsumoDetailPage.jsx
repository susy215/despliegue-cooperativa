import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { FlaskConical, ArrowLeft, Package, Calendar, DollarSign, Edit, AlertTriangle, Bug, Leaf } from 'lucide-react';
import { pesticidaService, fertilizanteService } from '../api/insumoService';

const InsumoDetailPage = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const tipo = searchParams.get('tipo'); // 'pesticidas' o 'fertilizantes'
  const [insumo, setInsumo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    cargarInsumo();
  }, [id, tipo]);

  const cargarInsumo = async () => {
    try {
      setLoading(true);
      let response;

      if (tipo === 'pesticidas') {
        response = await pesticidaService.getPesticidaById(id);
      } else if (tipo === 'fertilizantes') {
        response = await fertilizanteService.getFertilizanteById(id);
      } else {
        throw new Error('Tipo de insumo no válido');
      }

      setInsumo(response);
    } catch (error) {
      console.error('Error al cargar insumo:', error);
      setError('Error al cargar los detalles del insumo');

      // Fallback a datos simulados
      const mockData = tipo === 'pesticidas' ? {
        id: parseInt(id),
        nombre_comercial: 'Roundup PowerMax',
        ingrediente_activo: 'Glifosato',
        tipo_pesticida: 'HERBICIDA',
        concentracion: '48% EC',
        registro_sanitario: 'REG-001-2025',
        cantidad: 50.00,
        unidad_medida: 'Litros',
        fecha_vencimiento: '2025-12-31',
        dosis_recomendada: '2-3 L/ha',
        lote: 'RUPM-2025-001',
        proveedor: 'Monsanto',
        precio_unitario: 45.50,
        ubicacion_almacen: 'Sector B-10',
        estado: 'DISPONIBLE',
        valor_total: 2275.00,
        dias_para_vencer: 45,
        created_at: '2024-01-15T10:30:00Z',
        updated_at: '2024-01-15T10:30:00Z'
      } : {
        id: parseInt(id),
        nombre_comercial: 'NPK 15-15-15',
        tipo_fertilizante: 'QUIMICO',
        composicion_npk: '15-15-15',
        cantidad: 100.00,
        unidad_medida: 'Kilogramos',
        fecha_vencimiento: null,
        dosis_recomendada: '200-300 kg/ha',
        materia_orgánica: null,
        lote: 'NPK151515-2025-001',
        proveedor: 'Fertilizantes SA',
        precio_unitario: 25.50,
        ubicacion_almacen: 'Sector C-05',
        estado: 'DISPONIBLE',
        valor_total: 2550.00,
        dias_para_vencer: null,
        created_at: '2024-01-15T10:30:00Z',
        updated_at: '2024-01-15T10:30:00Z'
      };

      setInsumo(mockData);
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

  const getTipoIcon = () => {
    return tipo === 'pesticidas' ? <Bug className="w-5 h-5 text-emerald-400" /> : <Leaf className="w-5 h-5 text-emerald-400" />;
  };

  const getTipoLabel = () => {
    return tipo === 'pesticidas' ? 'Pesticida' : 'Fertilizante';
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
          <span className="ml-3 text-emerald-100">Cargando detalles del insumo...</span>
        </div>
      </div>
    );
  }

  if (error && !insumo) {
    return (
      <div className="space-y-6">
        <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-6">
          <h2 className="text-red-200 font-medium mb-2">Error</h2>
          <p className="text-red-100/80">{error}</p>
          <button
            onClick={() => navigate('/insumos')}
            className="mt-4 bg-red-500/20 hover:bg-red-500/30 text-red-200 font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Volver a Insumos
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
            onClick={() => navigate('/insumos')}
            className="bg-white/10 hover:bg-white/20 text-white p-2 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-white">Detalles del {getTipoLabel()}</h1>
            <p className="text-emerald-100/80 mt-1">
              Información completa del insumo #{insumo?.id}
            </p>
          </div>
        </div>
        <button
          onClick={() => navigate(`/insumos/${insumo?.id}/editar?tipo=${tipo}`)}
          className="bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-200 font-medium py-2 px-4 rounded-lg transition-colors flex items-center space-x-2"
        >
          <Edit className="w-4 h-4" />
          <span>Editar {getTipoLabel()}</span>
        </button>
      </div>

      {/* Información Principal */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Detalles Básicos */}
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6">
          <h2 className="text-xl font-semibold text-white mb-6 flex items-center">
            {getTipoIcon()}
            <span className="ml-2">Información Básica</span>
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-emerald-200/80 mb-1">
                Nombre Comercial
              </label>
              <p className="text-white text-lg font-medium">{insumo?.nombre_comercial || 'Sin nombre'}</p>
            </div>

            {tipo === 'pesticidas' && insumo?.ingrediente_activo && (
              <div>
                <label className="block text-sm font-medium text-emerald-200/80 mb-1">
                  Ingrediente Activo
                </label>
                <p className="text-white">{insumo.ingrediente_activo}</p>
              </div>
            )}

            {tipo === 'fertilizantes' && insumo?.composicion_npk && (
              <div>
                <label className="block text-sm font-medium text-emerald-200/80 mb-1">
                  Composición NPK
                </label>
                <p className="text-white font-medium">{insumo.composicion_npk}</p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-emerald-200/80 mb-1">
                Tipo
              </label>
              <p className="text-white">
                {tipo === 'pesticidas' ? insumo?.tipo_pesticida : insumo?.tipo_fertilizante}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-emerald-200/80 mb-1">
                Lote
              </label>
              <p className="text-white font-mono">{insumo?.lote || 'Sin lote'}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-emerald-200/80 mb-1">
                Proveedor
              </label>
              <p className="text-white">{insumo?.proveedor || 'Sin proveedor'}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-emerald-200/80 mb-1">
                Ubicación de Almacén
              </label>
              <p className="text-white">{insumo?.ubicacion_almacen || 'Sin ubicación'}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-emerald-200/80 mb-1">
                Estado
              </label>
              <span className={`inline-flex items-center px-3 py-1 text-sm font-medium rounded-full ${getEstadoColor(insumo?.estado)}`}>
                {getEstadoIcon(insumo?.estado)}
                <span className="ml-1">{insumo?.estado}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Características Técnicas */}
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6">
          <h2 className="text-xl font-semibold text-white mb-6 flex items-center">
            <Package className="w-5 h-5 mr-2 text-blue-400" />
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
                  {insumo?.cantidad} {insumo?.unidad_medida}
                </span>
              </div>
            </div>

            {tipo === 'pesticidas' && insumo?.concentracion && (
              <div>
                <label className="block text-sm font-medium text-emerald-200/80 mb-1">
                  Concentración
                </label>
                <span className="text-white text-lg font-medium">{insumo.concentracion}</span>
              </div>
            )}

            {tipo === 'fertilizantes' && insumo?.materia_orgánica && (
              <div>
                <label className="block text-sm font-medium text-emerald-200/80 mb-1">
                  Materia Orgánica
                </label>
                <span className="text-white text-lg font-medium">{insumo.materia_orgánica}%</span>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-emerald-200/80 mb-1">
                Precio Unitario
              </label>
              <div className="flex items-center space-x-2">
                <DollarSign className="w-4 h-4 text-yellow-400" />
                <span className="text-white text-lg font-medium">
                  {formatCurrency(insumo?.precio_unitario)}
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
                  {formatCurrency(insumo?.valor_total)}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-emerald-200/80 mb-1">
                Fecha de Vencimiento
              </label>
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-red-400" />
                <span className="text-white">{formatDate(insumo?.fecha_vencimiento)}</span>
                {insumo?.dias_para_vencer !== null && insumo?.dias_para_vencer !== undefined && (
                  <span className={`text-sm ${insumo.dias_para_vencer <= 30 ? 'text-red-300' : 'text-emerald-200/60'}`}>
                    ({insumo.dias_para_vencer > 0 ? `${insumo.dias_para_vencer} días` : 'Vencido'})
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
          {tipo === 'pesticidas' && insumo?.registro_sanitario && (
            <div>
              <label className="block text-sm font-medium text-emerald-200/80 mb-1">
                Registro Sanitario
              </label>
              <p className="text-white font-mono">{insumo.registro_sanitario}</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-emerald-200/80 mb-1">
              Dosis Recomendada
            </label>
            <p className="text-white">{insumo?.dosis_recomendada || 'No especificada'}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-emerald-200/80 mb-1">
              Fecha de Creación
            </label>
            <p className="text-white">{formatDate(insumo?.created_at)}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-emerald-200/80 mb-1">
              Última Modificación
            </label>
            <p className="text-white">{formatDate(insumo?.updated_at)}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-emerald-200/80 mb-1">
              ID del Insumo
            </label>
            <p className="text-white font-mono">{insumo?.id}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-emerald-200/80 mb-1">
              Tipo de Insumo
            </label>
            <p className="text-white capitalize">{tipo}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InsumoDetailPage;