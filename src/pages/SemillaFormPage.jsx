import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Sprout, Package, Calendar, DollarSign, User } from 'lucide-react';
import { semillaService } from '../api/semillaService';

const SemillaFormPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id;
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(isEditing);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    especie: '',
    variedad: '',
    cantidad: '',
    unidad_medida: 'Kilogramos',
    fecha_vencimiento: '',
    porcentaje_germinacion: '',
    lote: '',
    proveedor: '',
    precio_unitario: '',
    ubicacion_almacen: '',
    registro_sanitario: '',
    dosis_siembra: '',
    ciclo_cultivo: '',
    estado: 'DISPONIBLE'
  });

  useEffect(() => {
    if (isEditing) {
      cargarSemilla();
    }
  }, [id]);

  const cargarSemilla = async () => {
    try {
      setLoadingData(true);
      const response = await semillaService.getSemillaById(id);
      setFormData({
        especie: response.especie || '',
        variedad: response.variedad || '',
        cantidad: response.cantidad || '',
        unidad_medida: response.unidad_medida || 'Kilogramos',
        fecha_vencimiento: response.fecha_vencimiento || '',
        porcentaje_germinacion: response.porcentaje_germinacion || '',
        lote: response.lote || '',
        proveedor: response.proveedor || '',
        precio_unitario: response.precio_unitario || '',
        ubicacion_almacen: response.ubicacion_almacen || '',
        registro_sanitario: response.registro_sanitario || '',
        dosis_siembra: response.dosis_siembra || '',
        ciclo_cultivo: response.ciclo_cultivo || '',
        estado: response.estado || 'DISPONIBLE'
      });
    } catch (error) {
      console.error('Error al cargar semilla:', error);
      alert('Error al cargar los datos de la semilla');
      navigate('/semillas');
    } finally {
      setLoadingData(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Limpiar error del campo si existe
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateField = async (field, value) => {
    // Validación local simple sin llamada al backend
    if (!value && ['especie', 'lote', 'proveedor'].includes(field)) {
      setErrors(prev => ({
        ...prev,
        [field]: `${field.charAt(0).toUpperCase() + field.slice(1)} es requerido${field === 'especie' ? 'a' : ''}`
      }));
    } else {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateCantidad = (value) => {
    const cantidad = parseFloat(value);
    if (isNaN(cantidad) || cantidad < 0) {
      setErrors(prev => ({
        ...prev,
        cantidad: 'La cantidad debe ser un número positivo'
      }));
      return false;
    }
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors.cantidad;
      return newErrors;
    });
    return true;
  };

  const validatePrecio = (value) => {
    const precio = parseFloat(value);
    if (isNaN(precio) || precio < 0) {
      setErrors(prev => ({
        ...prev,
        precio_unitario: 'El precio debe ser un número positivo'
      }));
      return false;
    }
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors.precio_unitario;
      return newErrors;
    });
    return true;
  };

  const validateGerminacion = (value) => {
    const germinacion = parseFloat(value);
    if (isNaN(germinacion) || germinacion < 0 || germinacion > 100) {
      setErrors(prev => ({
        ...prev,
        porcentaje_germinacion: 'El porcentaje de germinación debe estar entre 0 y 100'
      }));
      return false;
    }
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors.porcentaje_germinacion;
      return newErrors;
    });
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validaciones básicas
    const newErrors = {};

    if (!formData.especie) newErrors.especie = 'Especie es requerida';
    if (!formData.cantidad) newErrors.cantidad = 'Cantidad es requerida';
    if (!formData.fecha_vencimiento) newErrors.fecha_vencimiento = 'Fecha de vencimiento es requerida';
    if (!formData.lote) newErrors.lote = 'Lote es requerido';
    if (!formData.proveedor) newErrors.proveedor = 'Proveedor es requerido';

    // Validar cantidad
    if (formData.cantidad && !validateCantidad(formData.cantidad)) {
      newErrors.cantidad = 'Cantidad inválida';
    }

    // Validar precio
    if (formData.precio_unitario && !validatePrecio(formData.precio_unitario)) {
      newErrors.precio_unitario = 'Precio inválido';
    }

    // Validar germinación
    if (formData.porcentaje_germinacion && !validateGerminacion(formData.porcentaje_germinacion)) {
      newErrors.porcentaje_germinacion = 'Porcentaje de germinación inválido';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setLoading(true);

      // Preparar datos para el backend
      const semillaData = {
        especie: formData.especie,
        variedad: formData.variedad || null,
        cantidad: parseFloat(formData.cantidad),
        unidad_medida: formData.unidad_medida,
        fecha_vencimiento: formData.fecha_vencimiento,
        porcentaje_germinacion: formData.porcentaje_germinacion ? parseFloat(formData.porcentaje_germinacion) : null,
        lote: formData.lote,
        proveedor: formData.proveedor,
        precio_unitario: formData.precio_unitario ? parseFloat(formData.precio_unitario) : null,
        ubicacion_almacen: formData.ubicacion_almacen || null,
        registro_sanitario: formData.registro_sanitario || null,
        dosis_siembra: formData.dosis_siembra || null,
        ciclo_cultivo: formData.ciclo_cultivo || null,
        estado: formData.estado
      };

      if (isEditing) {
        await semillaService.updateSemilla(id, semillaData);
      } else {
        await semillaService.crearSemilla(semillaData);
      }

      // Redirigir a la lista de semillas
      navigate('/semillas');
    } catch (error) {
      console.error('Error al guardar semilla:', error);
      if (error.response?.data) {
        setErrors(error.response.data);
      } else {
        alert(`Error al ${isEditing ? 'actualizar' : 'crear'} la semilla. Intente nuevamente.`);
      }
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
        <span className="ml-3 text-emerald-100">Cargando datos de la semilla...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <button
          onClick={() => navigate('/semillas')}
          className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-white">
            {isEditing ? 'Editar Semilla' : 'Nueva Semilla'}
          </h1>
          <p className="text-emerald-100/80 mt-1">
            {isEditing ? 'Modifique la información de la semilla' : 'Complete la información para registrar una nueva semilla'}
          </p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Información Básica */}
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6">
          <div className="flex items-center space-x-3 mb-6">
            <Sprout className="w-5 h-5 text-emerald-400" />
            <h2 className="text-xl font-semibold text-white">Información Básica</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-emerald-200 mb-2">
                Especie *
              </label>
              <div className="relative">
                <Sprout className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-emerald-300/60" />
                <input
                  type="text"
                  value={formData.especie}
                  onChange={(e) => handleInputChange('especie', e.target.value)}
                  className="w-full bg-white/10 border border-white/20 rounded-lg pl-12 pr-4 py-3 text-white placeholder-emerald-200/50 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  placeholder="Maíz, Trigo, Soya..."
                />
              </div>
              {errors.especie && (
                <p className="mt-1 text-sm text-red-400">{errors.especie}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-emerald-200 mb-2">
                Variedad
              </label>
              <input
                type="text"
                value={formData.variedad}
                onChange={(e) => handleInputChange('variedad', e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-emerald-200/50 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                placeholder="Híbrido, Criolla..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-emerald-200 mb-2">
                Lote *
              </label>
              <input
                type="text"
                value={formData.lote}
                onChange={(e) => handleInputChange('lote', e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-emerald-200/50 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                placeholder="MZ-HYB-2025-001"
              />
              {errors.lote && (
                <p className="mt-1 text-sm text-red-400">{errors.lote}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-emerald-200 mb-2">
                Proveedor *
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-emerald-300/60" />
                <input
                  type="text"
                  value={formData.proveedor}
                  onChange={(e) => handleInputChange('proveedor', e.target.value)}
                  className="w-full bg-white/10 border border-white/20 rounded-lg pl-12 pr-4 py-3 text-white placeholder-emerald-200/50 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  placeholder="AgroSemillas SA"
                />
              </div>
              {errors.proveedor && (
                <p className="mt-1 text-sm text-red-400">{errors.proveedor}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-emerald-200 mb-2">
                Ubicación de Almacén
              </label>
              <input
                type="text"
                value={formData.ubicacion_almacen}
                onChange={(e) => handleInputChange('ubicacion_almacen', e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-emerald-200/50 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                placeholder="Sector A-15"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-emerald-200 mb-2">
                Estado
              </label>
              <select
                value={formData.estado}
                onChange={(e) => handleInputChange('estado', e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-400"
              >
                <option value="DISPONIBLE">Disponible</option>
                <option value="AGOTADO">Agotado</option>
                <option value="VENCIDO">Vencido</option>
                <option value="EN_TRANSITO">En Tránsito</option>
                <option value="EN_USO">En Uso</option>
                <option value="RESERVADO">Reservado</option>
              </select>
            </div>
          </div>
        </div>

        {/* Características Técnicas */}
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6">
          <div className="flex items-center space-x-3 mb-6">
            <Package className="w-5 h-5 text-blue-400" />
            <h2 className="text-xl font-semibold text-white">Características Técnicas</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-emerald-200 mb-2">
                Cantidad *
              </label>
              <div className="relative">
                <Package className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-emerald-300/60" />
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.cantidad}
                  onChange={(e) => handleInputChange('cantidad', e.target.value)}
                  onBlur={(e) => validateCantidad(formData.cantidad)}
                  className="w-full bg-white/10 border border-white/20 rounded-lg pl-12 pr-4 py-3 text-white placeholder-emerald-200/50 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  placeholder="100.00"
                />
              </div>
              {errors.cantidad && (
                <p className="mt-1 text-sm text-red-400">{errors.cantidad}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-emerald-200 mb-2">
                Unidad de Medida
              </label>
              <select
                value={formData.unidad_medida}
                onChange={(e) => handleInputChange('unidad_medida', e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-400"
              >
                <option value="Kilogramos">Kilogramos</option>
                <option value="Gramos">Gramos</option>
                <option value="Toneladas">Toneladas</option>
                <option value="Litros">Litros</option>
                <option value="Mililitros">Mililitros</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-emerald-200 mb-2">
                Fecha de Vencimiento *
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-emerald-300/60" />
                <input
                  type="date"
                  value={formData.fecha_vencimiento}
                  onChange={(e) => handleInputChange('fecha_vencimiento', e.target.value)}
                  className="w-full bg-white/10 border border-white/20 rounded-lg pl-12 pr-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-400"
                />
              </div>
              {errors.fecha_vencimiento && (
                <p className="mt-1 text-sm text-red-400">{errors.fecha_vencimiento}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-emerald-200 mb-2">
                Porcentaje de Germinación (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={formData.porcentaje_germinacion}
                onChange={(e) => handleInputChange('porcentaje_germinacion', e.target.value)}
                onBlur={(e) => validateGerminacion(formData.porcentaje_germinacion)}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-emerald-200/50 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                placeholder="95.0"
              />
              {errors.porcentaje_germinacion && (
                <p className="mt-1 text-sm text-red-400">{errors.porcentaje_germinacion}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-emerald-200 mb-2">
                Precio Unitario
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-emerald-300/60" />
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.precio_unitario}
                  onChange={(e) => handleInputChange('precio_unitario', e.target.value)}
                  onBlur={(e) => validatePrecio(formData.precio_unitario)}
                  className="w-full bg-white/10 border border-white/20 rounded-lg pl-12 pr-4 py-3 text-white placeholder-emerald-200/50 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  placeholder="25.50"
                />
              </div>
              {errors.precio_unitario && (
                <p className="mt-1 text-sm text-red-400">{errors.precio_unitario}</p>
              )}
            </div>
          </div>
        </div>

        {/* Información Adicional */}
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6">
          <div className="flex items-center space-x-3 mb-6">
            <Calendar className="w-5 h-5 text-purple-400" />
            <h2 className="text-xl font-semibold text-white">Información Adicional</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-emerald-200 mb-2">
                Registro Sanitario
              </label>
              <input
                type="text"
                value={formData.registro_sanitario}
                onChange={(e) => handleInputChange('registro_sanitario', e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-emerald-200/50 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                placeholder="REG-SEM-001-2025"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-emerald-200 mb-2">
                Dosis de Siembra
              </label>
              <input
                type="text"
                value={formData.dosis_siembra}
                onChange={(e) => handleInputChange('dosis_siembra', e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-emerald-200/50 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                placeholder="25-30 kg/ha"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-emerald-200 mb-2">
                Ciclo de Cultivo
              </label>
              <input
                type="text"
                value={formData.ciclo_cultivo}
                onChange={(e) => handleInputChange('ciclo_cultivo', e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-emerald-200/50 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                placeholder="120-150 días"
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate('/semillas')}
            className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-medium rounded-lg transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200 font-medium rounded-lg transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-emerald-200"></div>
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>{loading ? 'Guardando...' : 'Guardar Semilla'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default SemillaFormPage;