import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Save, MapPin, Ruler, Droplets, User, Calendar } from 'lucide-react';
import { parcelaService } from '../api/parcelaService';
import { socioService } from '../api/socioService';

const ParcelaFormPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const isEditing = !!id;
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(isEditing);
  const [validating, setValidating] = useState(false);
  const [errors, setErrors] = useState({});
  const [socios, setSocios] = useState([]);
  const [tiposSuelo, setTiposSuelo] = useState([]);
  const [formData, setFormData] = useState({
    socio_id: searchParams.get('socio') || '',
    superficie: '',
    tipo_suelo: '',
    ubicacion: '',
    coordenadas: '',
    descripcion: '',
    fecha_registro: new Date().toISOString().split('T')[0],
    estado: 'ACTIVA'
  });

  useEffect(() => {
    cargarSocios();
    cargarTiposSuelo();
    if (isEditing) {
      cargarParcela();
    }
  }, [id]);

  const cargarSocios = async () => {
    try {
      const response = await socioService.getSocios();
      setSocios(response.results || []);
    } catch (error) {
      console.error('Error al cargar socios:', error);
      // Fallback a datos simulados
      setSocios([
        { id: 1, usuario: { nombres: 'Juan', apellidos: 'Pérez' } }
      ]);
    }
  };

  const cargarTiposSuelo = async () => {
    try {
      const response = await parcelaService.getTiposSuelo();
      setTiposSuelo(response.tipos_suelo || []);
    } catch (error) {
      console.error('Error al cargar tipos de suelo:', error);
      // Fallback a tipos comunes
      setTiposSuelo(['ARCILLOSO', 'ARENAL', 'LIMOSO', 'FRANCO']);
    }
  };

  const cargarParcela = async () => {
    try {
      setLoadingData(true);
      const response = await parcelaService.getParcelaById(id);
      setFormData({
        socio_id: response.socio?.id || '',
        superficie: response.superficie || '',
        tipo_suelo: response.tipo_suelo || '',
        ubicacion: response.ubicacion || '',
        coordenadas: response.coordenadas || '',
        descripcion: response.descripcion || '',
        fecha_registro: response.fecha_registro || '',
        estado: response.estado || 'ACTIVA'
      });
    } catch (error) {
      console.error('Error al cargar parcela:', error);
      alert('Error al cargar los datos de la parcela');
      navigate('/parcelas');
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
    if (!value) return;

    try {
      setValidating(true);
      const params = { [field]: value };
      const response = await parcelaService.validarDatosParcela(params);

      if (!response.valido) {
        setErrors(prev => ({
          ...prev,
          [field]: response.errores[field]
        }));
      } else {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[field];
          return newErrors;
        });
      }
    } catch (error) {
      console.error('Error en validación:', error);
    } finally {
      setValidating(false);
    }
  };

  const validateSuperficie = (value) => {
    const superficie = parseFloat(value);
    if (isNaN(superficie) || superficie <= 0) {
      setErrors(prev => ({
        ...prev,
        superficie: 'La superficie debe ser un número positivo'
      }));
      return false;
    }
    if (superficie > 1000) {
      setErrors(prev => ({
        ...prev,
        superficie: 'La superficie no puede ser mayor a 1000 hectáreas'
      }));
      return false;
    }
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors.superficie;
      return newErrors;
    });
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validaciones básicas
    const newErrors = {};

    if (!formData.socio_id) newErrors.socio_id = 'Socio es requerido';
    if (!formData.superficie) newErrors.superficie = 'Superficie es requerida';
    if (!formData.tipo_suelo) newErrors.tipo_suelo = 'Tipo de suelo es requerido';
    if (!formData.ubicacion) newErrors.ubicacion = 'Ubicación es requerida';

    // Validar superficie
    if (formData.superficie && !validateSuperficie(formData.superficie)) {
      newErrors.superficie = 'Superficie inválida';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setLoading(true);

      // Preparar datos para el backend
      const parcelaData = {
        socio_id: formData.socio_id,
        superficie: parseFloat(formData.superficie),
        tipo_suelo: formData.tipo_suelo,
        ubicacion: formData.ubicacion,
        coordenadas: formData.coordenadas || null,
        descripcion: formData.descripcion || '',
        fecha_registro: formData.fecha_registro,
        estado: formData.estado
      };

      if (isEditing) {
        await parcelaService.updateParcela(id, parcelaData);
      } else {
        await parcelaService.crearParcela(parcelaData);
      }

      // Redirigir a la lista de parcelas
      navigate('/parcelas');
    } catch (error) {
      console.error('Error al guardar parcela:', error);
      if (error.response?.data) {
        setErrors(error.response.data);
      } else {
        alert(`Error al ${isEditing ? 'actualizar' : 'crear'} la parcela. Intente nuevamente.`);
      }
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
        <span className="ml-3 text-emerald-100">Cargando datos de la parcela...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <button
          onClick={() => navigate('/parcelas')}
          className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-white">
            {isEditing ? 'Editar Parcela' : 'Nueva Parcela'}
          </h1>
          <p className="text-emerald-100/80 mt-1">
            {isEditing ? 'Modifique la información de la parcela' : 'Complete la información para registrar una nueva parcela'}
          </p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Información de la Parcela */}
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6">
          <div className="flex items-center space-x-3 mb-6">
            <MapPin className="w-5 h-5 text-emerald-400" />
            <h2 className="text-xl font-semibold text-white">Información de la Parcela</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-emerald-200 mb-2">
                Socio *
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-emerald-300/60" />
                <select
                  value={formData.socio_id}
                  onChange={(e) => handleInputChange('socio_id', e.target.value)}
                  className="w-full bg-white/10 border border-white/20 rounded-lg pl-12 pr-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-400"
                >
                  <option value="">Seleccionar socio</option>
                  {socios.map(socio => (
                    <option key={socio.id} value={socio.id}>
                      {socio.usuario?.nombres} {socio.usuario?.apellidos}
                    </option>
                  ))}
                </select>
              </div>
              {errors.socio_id && (
                <p className="mt-1 text-sm text-red-400">{errors.socio_id}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-emerald-200 mb-2">
                Superficie (hectáreas) *
              </label>
              <div className="relative">
                <Ruler className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-emerald-300/60" />
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="1000"
                  value={formData.superficie}
                  onChange={(e) => handleInputChange('superficie', e.target.value)}
                  onBlur={(e) => validateSuperficie(formData.superficie)}
                  className="w-full bg-white/10 border border-white/20 rounded-lg pl-12 pr-4 py-3 text-white placeholder-emerald-200/50 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  placeholder="5.5"
                />
              </div>
              {errors.superficie && (
                <p className="mt-1 text-sm text-red-400">{errors.superficie}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-emerald-200 mb-2">
                Tipo de Suelo *
              </label>
              <div className="relative">
                <Droplets className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-emerald-300/60" />
                <select
                  value={formData.tipo_suelo}
                  onChange={(e) => handleInputChange('tipo_suelo', e.target.value)}
                  className="w-full bg-white/10 border border-white/20 rounded-lg pl-12 pr-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-400"
                >
                  <option value="">Seleccionar tipo de suelo</option>
                  {tiposSuelo.map(tipo => (
                    <option key={tipo} value={tipo}>{tipo}</option>
                  ))}
                </select>
              </div>
              {errors.tipo_suelo && (
                <p className="mt-1 text-sm text-red-400">{errors.tipo_suelo}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-emerald-200 mb-2">
                Fecha de Registro
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-emerald-300/60" />
                <input
                  type="date"
                  value={formData.fecha_registro}
                  onChange={(e) => handleInputChange('fecha_registro', e.target.value)}
                  className="w-full bg-white/10 border border-white/20 rounded-lg pl-12 pr-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-400"
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-emerald-200 mb-2">
                Ubicación *
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 w-4 h-4 text-emerald-300/60" />
                <input
                  type="text"
                  value={formData.ubicacion}
                  onChange={(e) => handleInputChange('ubicacion', e.target.value)}
                  className="w-full bg-white/10 border border-white/20 rounded-lg pl-12 pr-4 py-3 text-white placeholder-emerald-200/50 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  placeholder="Comunidad A, Parcela 1"
                />
              </div>
              {errors.ubicacion && (
                <p className="mt-1 text-sm text-red-400">{errors.ubicacion}</p>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-emerald-200 mb-2">
                Coordenadas (opcional)
              </label>
              <input
                type="text"
                value={formData.coordenadas}
                onChange={(e) => handleInputChange('coordenadas', e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-emerald-200/50 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                placeholder="-16.5, -68.1"
              />
              <p className="mt-1 text-xs text-emerald-200/60">
                Formato: latitud, longitud (ej: -16.5, -68.1)
              </p>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-emerald-200 mb-2">
                Descripción
              </label>
              <textarea
                value={formData.descripcion}
                onChange={(e) => handleInputChange('descripcion', e.target.value)}
                rows={3}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-emerald-200/50 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                placeholder="Descripción adicional de la parcela"
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate('/parcelas')}
            className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-medium rounded-lg transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading || validating}
            className="px-6 py-3 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200 font-medium rounded-lg transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-emerald-200"></div>
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>{loading ? 'Guardando...' : 'Guardar Parcela'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default ParcelaFormPage;