import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ShoppingBag, Plus, Trash2, ArrowLeft, Save, AlertCircle, X,
  Calendar, MessageSquare, Package, DollarSign
} from 'lucide-react';
import { pedidosInsumosService, preciosTemporadaService } from '../../api/insumosVentaService';

const PedidoInsumoFormPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [preciosDisponibles, setPreciosDisponibles] = useState([]);

  const userData = JSON.parse(localStorage.getItem('user_data') || '{}');
  const socioId = userData.socio_id;

  const [formData, setFormData] = useState({
    fecha_entrega_solicitada: '',
    motivo_solicitud: '',
    observaciones: ''
  });

  const [items, setItems] = useState([
    { tipo_insumo: 'SEMILLA', semilla: '', pesticida: '', fertilizante: '', cantidad: '', precio_unitario: '' }
  ]);

  const [totales, setTotales] = useState({
    subtotal: 0,
    total: 0
  });

  useEffect(() => {
    cargarPreciosDisponibles();
  }, []);

  useEffect(() => {
    calcularTotales();
  }, [items]);

  const cargarPreciosDisponibles = async () => {
    try {
      const response = await preciosTemporadaService.listar({
        vigente: true,
        activo: true
      });
      console.log('📦 Precios disponibles:', response);
      setPreciosDisponibles(response.results || []);
    } catch (error) {
      console.error('Error al cargar precios:', error);
      setError('Error al cargar los precios disponibles');
    }
  };

  const calcularTotales = () => {
    const subtotal = items.reduce((sum, item) => {
      const cantidad = parseFloat(item.cantidad) || 0;
      const precio = parseFloat(item.precio_unitario) || 0;
      return sum + (cantidad * precio);
    }, 0);

    setTotales({ subtotal, total: subtotal });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleItemChange = (index, field, value) => {
    const nuevosItems = [...items];
    nuevosItems[index][field] = value;

    // Si cambió el tipo de insumo, limpiar el insumo seleccionado
    if (field === 'tipo_insumo') {
      nuevosItems[index].semilla = '';
      nuevosItems[index].pesticida = '';
      nuevosItems[index].fertilizante = '';
      nuevosItems[index].precio_unitario = '';
    }

    // Si se seleccionó un insumo, actualizar el precio
    if (['semilla', 'pesticida', 'fertilizante'].includes(field) && value) {
      const precio = preciosDisponibles.find(p => {
        if (field === 'semilla') return p.semilla?.id === parseInt(value);
        if (field === 'pesticida') return p.pesticida?.id === parseInt(value);
        if (field === 'fertilizante') return p.fertilizante?.id === parseInt(value);
        return false;
      });

      if (precio) {
        const cantidad = parseFloat(nuevosItems[index].cantidad) || 0;
        const cantidadMinima = parseFloat(precio.cantidad_minima_mayoreo) || 0;

        // Aplicar precio mayoreo si corresponde
        if (precio.precio_mayoreo && cantidad >= cantidadMinima) {
          nuevosItems[index].precio_unitario = precio.precio_mayoreo;
        } else {
          nuevosItems[index].precio_unitario = precio.precio_venta;
        }
      }
    }

    // Si cambió la cantidad, recalcular precio (por si aplica mayoreo)
    if (field === 'cantidad') {
      const tipoInsumo = nuevosItems[index].tipo_insumo.toLowerCase();
      const insumoId = nuevosItems[index][tipoInsumo];
      
      if (insumoId) {
        const precio = preciosDisponibles.find(p => {
          const id = p[tipoInsumo]?.id;
          return id === parseInt(insumoId);
        });

        if (precio) {
          const cantidad = parseFloat(value) || 0;
          const cantidadMinima = parseFloat(precio.cantidad_minima_mayoreo) || 0;

          if (precio.precio_mayoreo && cantidad >= cantidadMinima) {
            nuevosItems[index].precio_unitario = precio.precio_mayoreo;
          } else {
            nuevosItems[index].precio_unitario = precio.precio_venta;
          }
        }
      }
    }

    setItems(nuevosItems);
  };

  const agregarItem = () => {
    setItems([...items, { 
      tipo_insumo: 'SEMILLA', 
      semilla: '', 
      pesticida: '', 
      fertilizante: '', 
      cantidad: '', 
      precio_unitario: '' 
    }]);
  };

  const eliminarItem = (index) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const validarFormulario = () => {
    if (!socioId) {
      setError('No se pudo identificar al socio. Por favor, inicia sesión nuevamente.');
      return false;
    }
    if (!formData.fecha_entrega_solicitada) {
      setError('La fecha de entrega solicitada es requerida');
      return false;
    }
    if (!formData.motivo_solicitud.trim()) {
      setError('El motivo de la solicitud es requerido');
      return false;
    }
    if (items.length === 0) {
      setError('Debe agregar al menos un insumo');
      return false;
    }
    
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const tipoInsumo = item.tipo_insumo.toLowerCase();
      
      if (!item[tipoInsumo] || !item.cantidad || !item.precio_unitario) {
        setError(`Complete todos los campos del item ${i + 1}`);
        return false;
      }
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!validarFormulario()) {
      return;
    }

    try {
      setLoading(true);

      const datos = {
        socio_id: socioId,
        fecha_entrega_solicitada: formData.fecha_entrega_solicitada,
        motivo_solicitud: formData.motivo_solicitud,
        observaciones: formData.observaciones || '',
        items: items.map(item => ({
          tipo_insumo: item.tipo_insumo,
          semilla: item.semilla || undefined,
          pesticida: item.pesticida || undefined,
          fertilizante: item.fertilizante || undefined,
          cantidad: parseFloat(item.cantidad),
          precio_unitario: parseFloat(item.precio_unitario)
        }))
      };

      const response = await pedidosInsumosService.crear(datos);

      setSuccess(true);
      setTimeout(() => {
        navigate('/pedidos-insumos');
      }, 2000);
    } catch (error) {
      console.error('Error al crear solicitud:', error);
      setError(error.response?.data?.error || 'Error al crear la solicitud');
    } finally {
      setLoading(false);
    }
  };

  const obtenerInsumosDisponibles = (tipoInsumo) => {
    return preciosDisponibles.filter(p => p.tipo_insumo === tipoInsumo);
  };

  const obtenerNombreInsumo = (precio, tipoInsumo) => {
    if (tipoInsumo === 'SEMILLA' && precio.semilla) {
      return `${precio.semilla.especie} - ${precio.semilla.variedad}`;
    }
    if (tipoInsumo === 'PESTICIDA' && precio.pesticida) {
      return precio.pesticida.nombre_comercial;
    }
    if (tipoInsumo === 'FERTILIZANTE' && precio.fertilizante) {
      return precio.fertilizante.nombre_comercial;
    }
    return 'Insumo';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <button
            onClick={() => navigate('/pedidos-insumos')}
            className="flex items-center text-emerald-200 hover:text-emerald-100 mb-2 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver a Pedidos de Insumos
          </button>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <ShoppingBag className="w-7 h-7" />
            Nueva Solicitud de Insumos
          </h1>
          <p className="text-emerald-100/80 mt-1">
            Solicita los insumos agrícolas que necesitas para tu parcela
          </p>
        </div>
      </div>

      {/* Mensajes */}
      {error && (
        <div className="bg-red-500/20 border border-red-400/30 text-red-200 px-4 py-3 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
          <button onClick={() => setError(null)} className="ml-auto">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {success && (
        <div className="bg-green-500/20 border border-green-400/30 text-green-200 px-4 py-3 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>¡Solicitud creada exitosamente! Redirigiendo...</span>
        </div>
      )}

      {preciosDisponibles.length === 0 && !loading && (
        <div className="bg-yellow-500/20 border border-yellow-400/30 text-yellow-200 px-4 py-3 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <div>
            <p className="font-medium">No hay precios de insumos disponibles</p>
            <p className="text-sm text-yellow-200/80">Contacta con el administrador para configurar los precios de temporada.</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Información de la Solicitud */}
        <div className="bg-white/10 backdrop-blur-lg rounded-lg border border-white/20 p-6">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Información de la Solicitud
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-1">
              <label className="block text-white/80 text-sm font-medium mb-2">
                Fecha de Entrega Solicitada *
              </label>
              <input
                type="date"
                name="fecha_entrega_solicitada"
                value={formData.fecha_entrega_solicitada}
                onChange={handleInputChange}
                min={new Date().toISOString().split('T')[0]}
                required
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-white/80 text-sm font-medium mb-2">
                Motivo de la Solicitud *
              </label>
              <textarea
                name="motivo_solicitud"
                value={formData.motivo_solicitud}
                onChange={handleInputChange}
                required
                rows="3"
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                placeholder="Ejemplo: Necesito semillas para la campaña de verano, estoy preparando 2 hectáreas para cultivo de tomate"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-white/80 text-sm font-medium mb-2">
                Observaciones Adicionales
              </label>
              <textarea
                name="observaciones"
                value={formData.observaciones}
                onChange={handleInputChange}
                rows="2"
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                placeholder="Observaciones adicionales (opcional)"
              />
            </div>
          </div>
        </div>

        {/* Items del pedido */}
        <div className="bg-white/10 backdrop-blur-lg rounded-lg border border-white/20 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              <Package className="w-5 h-5" />
              Insumos Solicitados
            </h2>
            <button
              type="button"
              onClick={agregarItem}
              disabled={preciosDisponibles.length === 0}
              className="bg-emerald-500/20 hover:bg-emerald-500/30 disabled:bg-emerald-500/10 disabled:text-emerald-400/30 text-emerald-200 font-medium py-2 px-4 rounded-lg transition-colors flex items-center space-x-2 border border-emerald-400/30 disabled:border-emerald-400/10 disabled:cursor-not-allowed"
            >
              <Plus className="w-4 h-4" />
              <span>Agregar Insumo</span>
            </button>
          </div>

          <div className="space-y-3">
            {items.map((item, index) => (
              <div key={index} className="bg-white/5 p-4 rounded-lg border border-white/10">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-white font-medium">Item #{index + 1}</h4>
                  <button
                    type="button"
                    onClick={() => eliminarItem(index)}
                    disabled={items.length === 1}
                    className="text-red-400 hover:text-red-300 disabled:text-red-400/30 disabled:cursor-not-allowed transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-12 gap-3">
                  <div className="col-span-12 md:col-span-3">
                    <label className="block text-white/60 text-xs mb-1">Tipo de Insumo *</label>
                    <select
                      value={item.tipo_insumo}
                      onChange={(e) => handleItemChange(index, 'tipo_insumo', e.target.value)}
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                    >
                      <option value="SEMILLA">Semilla</option>
                      <option value="PESTICIDA">Pesticida</option>
                      <option value="FERTILIZANTE">Fertilizante</option>
                    </select>
                  </div>

                  <div className="col-span-12 md:col-span-4">
                    <label className="block text-white/60 text-xs mb-1">Insumo *</label>
                    <select
                      value={item[item.tipo_insumo.toLowerCase()] || ''}
                      onChange={(e) => handleItemChange(index, item.tipo_insumo.toLowerCase(), e.target.value)}
                      required
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                    >
                      <option value="">Seleccione...</option>
                      {obtenerInsumosDisponibles(item.tipo_insumo).map(precio => {
                        const id = precio[item.tipo_insumo.toLowerCase()]?.id;
                        const nombre = obtenerNombreInsumo(precio, item.tipo_insumo);
                        return (
                          <option key={precio.id} value={id}>
                            {nombre} - Bs. {precio.precio_venta}
                            {precio.precio_mayoreo && ` (Mayoreo: Bs. ${precio.precio_mayoreo})`}
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  <div className="col-span-6 md:col-span-2">
                    <label className="block text-white/60 text-xs mb-1">Cantidad *</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      value={item.cantidad}
                      onChange={(e) => handleItemChange(index, 'cantidad', e.target.value)}
                      required
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                      placeholder="0"
                    />
                  </div>

                  <div className="col-span-6 md:col-span-2">
                    <label className="block text-white/60 text-xs mb-1">Precio Unit.</label>
                    <input
                      type="number"
                      step="0.01"
                      value={item.precio_unitario}
                      readOnly
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white/60 text-sm cursor-not-allowed"
                      placeholder="0.00"
                    />
                  </div>

                  <div className="col-span-12 md:col-span-1 flex items-end">
                    <div className="w-full text-right">
                      <label className="block text-white/60 text-xs mb-1">Subtotal</label>
                      <div className="text-white font-semibold text-sm py-2">
                        Bs. {((parseFloat(item.cantidad) || 0) * (parseFloat(item.precio_unitario) || 0)).toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Totales */}
        <div className="bg-white/10 backdrop-blur-lg rounded-lg border border-white/20 p-6">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Totales
          </h2>
          <div className="flex justify-end">
            <div className="w-full md:w-96 space-y-3">
              <div className="flex justify-between items-center text-white/80">
                <span>Subtotal:</span>
                <span className="font-semibold">Bs. {totales.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-2xl font-bold text-white border-t border-white/20 pt-3">
                <span>TOTAL:</span>
                <span className="text-emerald-400">Bs. {totales.total.toFixed(2)}</span>
              </div>
              <div className="text-sm text-white/60 text-right">
                {items.length} insumo{items.length !== 1 ? 's' : ''} solicitado{items.length !== 1 ? 's' : ''}
              </div>
            </div>
          </div>
        </div>

        {/* Botones */}
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate('/pedidos-insumos')}
            className="px-6 py-2 bg-white/10 hover:bg-white/20 text-white font-medium rounded-lg transition-all border border-white/20"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading || items.length === 0 || preciosDisponibles.length === 0}
            className="px-6 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 disabled:from-gray-500 disabled:to-gray-600 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-all flex items-center gap-2 shadow-lg"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Enviando...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Enviar Solicitud</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PedidoInsumoFormPage;
