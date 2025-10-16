import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Save, Package, Bug, Leaf, AlertTriangle } from 'lucide-react';
import { pesticidaService, fertilizanteService } from '../api/insumoService';

const InsumoFormPage = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const tipo = searchParams.get('tipo'); // 'pesticidas' o 'fertilizantes'
  const isEditing = !!id;

  const [formData, setFormData] = useState({
    // Campos comunes
    nombre_comercial: '',
    cantidad: '',
    unidad_medida: 'Litros',
    fecha_vencimiento: '',
    dosis_recomendada: '',
    lote: '',
    proveedor: '',
    precio_unitario: '',
    ubicacion_almacen: '',
    estado: 'DISPONIBLE',

    // Campos específicos de pesticidas
    ingrediente_activo: '',
    tipo_pesticida: 'HERBICIDA',
    concentracion: '',
    registro_sanitario: '',

    // Campos específicos de fertilizantes
    tipo_fertilizante: 'QUIMICO',
    composicion_npk: '',
    materia_orgánica: ''
  });

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    if (isEditing) {
      cargarInsumo();
    }
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

      // Formatear fecha para input
      const formattedData = {
        ...response,
        fecha_vencimiento: response.fecha_vencimiento ?
          new Date(response.fecha_vencimiento).toISOString().split('T')[0] : ''
      };

      setFormData(formattedData);
    } catch (error) {
      console.error('Error al cargar insumo:', error);
      setError('Error al cargar los datos del insumo');

      // Fallback a datos simulados
      const mockData = tipo === 'pesticidas' ? {
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
        estado: 'DISPONIBLE'
      } : {
        nombre_comercial: 'NPK 15-15-15',
        tipo_fertilizante: 'QUIMICO',
        composicion_npk: '15-15-15',
        cantidad: 100.00,
        unidad_medida: 'Kilogramos',
        fecha_vencimiento: '',
        dosis_recomendada: '200-300 kg/ha',
        materia_orgánica: '',
        lote: 'NPK151515-2025-001',
        proveedor: 'Fertilizantes SA',
        precio_unitario: 25.50,
        ubicacion_almacen: 'Sector C-05',
        estado: 'DISPONIBLE'
      };

      setFormData(mockData);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Limpiar error de validación cuando el usuario comienza a escribir
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const validateForm = () => {
    const errors = {};

    // Validaciones comunes
    if (!formData.nombre_comercial.trim()) {
      errors.nombre_comercial = 'El nombre comercial es requerido';
    }

    if (!formData.cantidad || formData.cantidad <= 0) {
      errors.cantidad = 'La cantidad debe ser mayor a 0';
    }

    if (!formData.precio_unitario || formData.precio_unitario <= 0) {
      errors.precio_unitario = 'El precio unitario debe ser mayor a 0';
    }

    if (!formData.lote.trim()) {
      errors.lote = 'El lote es requerido';
    }

    if (!formData.proveedor.trim()) {
      errors.proveedor = 'El proveedor es requerido';
    }

    // Validaciones específicas
    if (tipo === 'pesticidas') {
      if (!formData.ingrediente_activo.trim()) {
        errors.ingrediente_activo = 'El ingrediente activo es requerido';
      }
      if (!formData.registro_sanitario.trim()) {
        errors.registro_sanitario = 'El registro sanitario es requerido';
      }
    } else if (tipo === 'fertilizantes') {
      if (!formData.composicion_npk.trim()) {
        errors.composicion_npk = 'La composición NPK es requerida';
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const dataToSend = {
        ...formData,
        cantidad: parseFloat(formData.cantidad),
        precio_unitario: parseFloat(formData.precio_unitario),
        valor_total: parseFloat(formData.cantidad) * parseFloat(formData.precio_unitario),
        fecha_vencimiento: formData.fecha_vencimiento || null,
        materia_orgánica: formData.materia_orgánica ? parseFloat(formData.materia_orgánica) : null
      };

      if (isEditing) {
        if (tipo === 'pesticidas') {
          await pesticidaService.updatePesticida(id, dataToSend);
        } else if (tipo === 'fertilizantes') {
          await fertilizanteService.updateFertilizante(id, dataToSend);
        }
      } else {
        if (tipo === 'pesticidas') {
          await pesticidaService.crearPesticida(dataToSend);
        } else if (tipo === 'fertilizantes') {
          await fertilizanteService.crearFertilizante(dataToSend);
        }
      }

      navigate('/insumos', {
        state: {
          message: `Insumo ${isEditing ? 'actualizado' : 'creado'} exitosamente`,
          type: 'success'
        }
      });
    } catch (error) {
      console.error('Error al guardar insumo:', error);
      setError(`Error al ${isEditing ? 'actualizar' : 'crear'} el insumo: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  const getTipoIcon = () => {
    return tipo === 'pesticidas' ? <Bug className="w-5 h-5 text-emerald-400" /> : <Leaf className="w-5 h-5 text-emerald-400" />;
  };

  const getTipoLabel = () => {
    return tipo === 'pesticidas' ? 'Pesticida' : 'Fertilizante';
  };

  const getTipoOptions = () => {
    if (tipo === 'pesticidas') {
      return [
        { value: 'HERBICIDA', label: 'Herbicida' },
        { value: 'INSECTICIDA', label: 'Insecticida' },
        { value: 'FUNGICIDA', label: 'Fungicida' },
        { value: 'NEMATICIDA', label: 'Nematicida' },
        { value: 'ACARICIDA', label: 'Acaricida' },
        { value: 'BACTERICIDA', label: 'Bactericida' },
        { value: 'VIRICIDA', label: 'Vírícida' },
        { value: 'OTROS', label: 'Otros' }
      ];
    } else {
      return [
        { value: 'QUIMICO', label: 'Químico' },
        { value: 'ORGANICO', label: 'Orgánico' },
        { value: 'MINERAL', label: 'Mineral' },
        { value: 'FOLIARES', label: 'Foliare' },
        { value: 'OTROS', label: 'Otros' }
      ];
    }
  };

  const getUnidadOptions = () => {
    return [
      { value: 'Litros', label: 'Litros' },
      { value: 'Kilogramos', label: 'Kilogramos' },
      { value: 'Gramos', label: 'Gramos' },
      { value: 'Mililitros', label: 'Mililitros' },
      { value: 'Unidades', label: 'Unidades' }
    ];
  };

  const getEstadoOptions = () => {
    return [
      { value: 'DISPONIBLE', label: 'Disponible' },
      { value: 'AGOTADO', label: 'Agotado' },
      { value: 'VENCIDO', label: 'Vencido' },
      { value: 'EN_TRANSITO', label: 'En Tránsito' },
      { value: 'EN_USO', label: 'En Uso' },
      { value: 'RESERVADO', label: 'Reservado' }
    ];
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
          <span className="ml-3 text-emerald-100">Cargando datos del insumo...</span>
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
            <h1 className="text-2xl font-bold text-white">
              {isEditing ? 'Editar' : 'Crear'} {getTipoLabel()}
            </h1>
            <p className="text-emerald-100/80 mt-1">
              {isEditing ? 'Modificar la información del insumo' : 'Agregar un nuevo insumo al inventario'}
            </p>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-4">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-red-400" />
            <span className="text-red-200 font-medium">Error</span>
          </div>
          <p className="text-red-100/80 mt-1">{error}</p>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Información Básica */}
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6">
          <h2 className="text-xl font-semibold text-white mb-6 flex items-center">
            {getTipoIcon()}
            <span className="ml-2">Información Básica</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-emerald-200/80 mb-2">
                Nombre Comercial *
              </label>
              <input
                type="text"
                name="nombre_comercial"
                value={formData.nombre_comercial}
                onChange={handleInputChange}
                className={`w-full bg-white/10 border rounded-lg px-3 py-2 text-white placeholder-emerald-200/50 focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                  validationErrors.nombre_comercial ? 'border-red-500' : 'border-white/20'
                }`}
                placeholder="Ingrese el nombre comercial"
              />
              {validationErrors.nombre_comercial && (
                <p className="text-red-400 text-sm mt-1">{validationErrors.nombre_comercial}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-emerald-200/80 mb-2">
                Tipo de {getTipoLabel()} *
              </label>
              <select
                name={tipo === 'pesticidas' ? 'tipo_pesticida' : 'tipo_fertilizante'}
                value={tipo === 'pesticidas' ? formData.tipo_pesticida : formData.tipo_fertilizante}
                onChange={handleInputChange}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {getTipoOptions().map(option => (
                  <option key={option.value} value={option.value} className="bg-gray-800">
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {tipo === 'pesticidas' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-emerald-200/80 mb-2">
                    Ingrediente Activo *
                  </label>
                  <input
                    type="text"
                    name="ingrediente_activo"
                    value={formData.ingrediente_activo}
                    onChange={handleInputChange}
                    className={`w-full bg-white/10 border rounded-lg px-3 py-2 text-white placeholder-emerald-200/50 focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                      validationErrors.ingrediente_activo ? 'border-red-500' : 'border-white/20'
                    }`}
                    placeholder="Ej: Glifosato"
                  />
                  {validationErrors.ingrediente_activo && (
                    <p className="text-red-400 text-sm mt-1">{validationErrors.ingrediente_activo}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-emerald-200/80 mb-2">
                    Concentración
                  </label>
                  <input
                    type="text"
                    name="concentracion"
                    value={formData.concentracion}
                    onChange={handleInputChange}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-emerald-200/50 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="Ej: 48% EC"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-emerald-200/80 mb-2">
                    Registro Sanitario *
                  </label>
                  <input
                    type="text"
                    name="registro_sanitario"
                    value={formData.registro_sanitario}
                    onChange={handleInputChange}
                    className={`w-full bg-white/10 border rounded-lg px-3 py-2 text-white placeholder-emerald-200/50 focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                      validationErrors.registro_sanitario ? 'border-red-500' : 'border-white/20'
                    }`}
                    placeholder="Ej: REG-001-2025"
                  />
                  {validationErrors.registro_sanitario && (
                    <p className="text-red-400 text-sm mt-1">{validationErrors.registro_sanitario}</p>
                  )}
                </div>
              </>
            )}

            {tipo === 'fertilizantes' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-emerald-200/80 mb-2">
                    Composición NPK *
                  </label>
                  <input
                    type="text"
                    name="composicion_npk"
                    value={formData.composicion_npk}
                    onChange={handleInputChange}
                    className={`w-full bg-white/10 border rounded-lg px-3 py-2 text-white placeholder-emerald-200/50 focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                      validationErrors.composicion_npk ? 'border-red-500' : 'border-white/20'
                    }`}
                    placeholder="Ej: 15-15-15"
                  />
                  {validationErrors.composicion_npk && (
                    <p className="text-red-400 text-sm mt-1">{validationErrors.composicion_npk}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-emerald-200/80 mb-2">
                    Materia Orgánica (%)
                  </label>
                  <input
                    type="number"
                    name="materia_orgánica"
                    value={formData.materia_orgánica}
                    onChange={handleInputChange}
                    min="0"
                    max="100"
                    step="0.1"
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-emerald-200/50 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="Ej: 45.5"
                  />
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-emerald-200/80 mb-2">
                Lote *
              </label>
              <input
                type="text"
                name="lote"
                value={formData.lote}
                onChange={handleInputChange}
                className={`w-full bg-white/10 border rounded-lg px-3 py-2 text-white placeholder-emerald-200/50 focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                  validationErrors.lote ? 'border-red-500' : 'border-white/20'
                }`}
                placeholder="Ej: LOT-2025-001"
              />
              {validationErrors.lote && (
                <p className="text-red-400 text-sm mt-1">{validationErrors.lote}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-emerald-200/80 mb-2">
                Proveedor *
              </label>
              <input
                type="text"
                name="proveedor"
                value={formData.proveedor}
                onChange={handleInputChange}
                className={`w-full bg-white/10 border rounded-lg px-3 py-2 text-white placeholder-emerald-200/50 focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                  validationErrors.proveedor ? 'border-red-500' : 'border-white/20'
                }`}
                placeholder="Nombre del proveedor"
              />
              {validationErrors.proveedor && (
                <p className="text-red-400 text-sm mt-1">{validationErrors.proveedor}</p>
              )}
            </div>
          </div>
        </div>

        {/* Información de Inventario */}
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6">
          <h2 className="text-xl font-semibold text-white mb-6 flex items-center">
            <Package className="w-5 h-5 mr-2 text-blue-400" />
            Información de Inventario
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-emerald-200/80 mb-2">
                Cantidad *
              </label>
              <input
                type="number"
                name="cantidad"
                value={formData.cantidad}
                onChange={handleInputChange}
                min="0"
                step="0.01"
                className={`w-full bg-white/10 border rounded-lg px-3 py-2 text-white placeholder-emerald-200/50 focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                  validationErrors.cantidad ? 'border-red-500' : 'border-white/20'
                }`}
                placeholder="0.00"
              />
              {validationErrors.cantidad && (
                <p className="text-red-400 text-sm mt-1">{validationErrors.cantidad}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-emerald-200/80 mb-2">
                Unidad de Medida
              </label>
              <select
                name="unidad_medida"
                value={formData.unidad_medida}
                onChange={handleInputChange}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {getUnidadOptions().map(option => (
                  <option key={option.value} value={option.value} className="bg-gray-800">
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-emerald-200/80 mb-2">
                Precio Unitario *
              </label>
              <input
                type="number"
                name="precio_unitario"
                value={formData.precio_unitario}
                onChange={handleInputChange}
                min="0"
                step="0.01"
                className={`w-full bg-white/10 border rounded-lg px-3 py-2 text-white placeholder-emerald-200/50 focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                  validationErrors.precio_unitario ? 'border-red-500' : 'border-white/20'
                }`}
                placeholder="0.00"
              />
              {validationErrors.precio_unitario && (
                <p className="text-red-400 text-sm mt-1">{validationErrors.precio_unitario}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-emerald-200/80 mb-2">
                Fecha de Vencimiento
              </label>
              <input
                type="date"
                name="fecha_vencimiento"
                value={formData.fecha_vencimiento}
                onChange={handleInputChange}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-emerald-200/80 mb-2">
                Ubicación de Almacén
              </label>
              <input
                type="text"
                name="ubicacion_almacen"
                value={formData.ubicacion_almacen}
                onChange={handleInputChange}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-emerald-200/50 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="Ej: Sector A-01"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-emerald-200/80 mb-2">
                Estado
              </label>
              <select
                name="estado"
                value={formData.estado}
                onChange={handleInputChange}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {getEstadoOptions().map(option => (
                  <option key={option.value} value={option.value} className="bg-gray-800">
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium text-emerald-200/80 mb-2">
              Dosis Recomendada
            </label>
            <textarea
              name="dosis_recomendada"
              value={formData.dosis_recomendada}
              onChange={handleInputChange}
              rows={3}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-emerald-200/50 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="Ej: 2-3 L/ha cada 15 días"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate('/insumos')}
            className="bg-white/10 hover:bg-white/20 text-white font-medium py-2 px-6 rounded-lg transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={saving}
            className="bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200 font-medium py-2 px-6 rounded-lg transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-emerald-200 mr-2"></div>
                Guardando...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                {isEditing ? 'Actualizar' : 'Crear'} {getTipoLabel()}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default InsumoFormPage;