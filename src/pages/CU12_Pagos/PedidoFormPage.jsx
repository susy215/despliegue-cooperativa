import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ShoppingCart, Plus, Trash2, ArrowLeft, Save, AlertCircle,
  User, Mail, Phone, Package, DollarSign, X
} from 'lucide-react';
import { pedidosService, productosService } from '../../api/pagosService';
import { socioService } from '../../api/socioService';

const PedidoFormPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [socios, setSocios] = useState([]);
  const [productos, setProductos] = useState([]);

  const [formData, setFormData] = useState({
    socio_id: '',
    cliente_nombre: '',
    cliente_email: '',
    cliente_telefono: '',
    cliente_direccion: '',
    fecha_entrega_estimada: '',
    notas: ''
  });

  const [items, setItems] = useState([
    { producto_id: '', producto_nombre: '', producto_descripcion: '', cantidad: '', unidad_medida: 'kg', precio_unitario: '' }
  ]);

  const [totales, setTotales] = useState({
    subtotal: 0,
    impuestos: 0,
    descuento: 0,
    total: 0
  });

  useEffect(() => {
    cargarDatos();
  }, []);

  useEffect(() => {
    calcularTotales();
  }, [items]);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const [sociosData, productosData] = await Promise.all([
        socioService.getSocios(),
        productosService.listar()
      ]);
      
      console.log('📦 Productos cargados del backend:', productosData);
      console.log('📦 Primer producto (estructura):', productosData.results?.[0] || productosData[0]);
      
      setSocios(sociosData.results || []);
      setProductos(productosData.results || productosData || []);

      if (isEdit) {
        const pedido = await pedidosService.obtener(id);
        setFormData({
          socio_id: pedido.socio?.id || pedido.socio,
          cliente_nombre: pedido.cliente_nombre,
          cliente_email: pedido.cliente_email || '',
          cliente_telefono: pedido.cliente_telefono || '',
          cliente_direccion: pedido.cliente_direccion || '',
          fecha_entrega_estimada: pedido.fecha_entrega_estimada || '',
          notas: pedido.observaciones || ''
        });
        setItems(pedido.items.map(item => ({
          producto_id: item.producto_cosechado,
          producto_nombre: item.producto_nombre || '',
          producto_descripcion: item.producto_descripcion || '',
          cantidad: item.cantidad,
          unidad_medida: item.unidad_medida || 'kg',
          precio_unitario: item.precio_unitario
        })));
      }
    } catch (error) {
      console.error('Error al cargar datos:', error);
      setError('Error al cargar los datos necesarios');
    } finally {
      setLoading(false);
    }
  };

  const calcularTotales = () => {
    const subtotal = items.reduce((sum, item) => {
      const cantidad = parseFloat(item.cantidad) || 0;
      const precio = parseFloat(item.precio_unitario) || 0;
      return sum + (cantidad * precio);
    }, 0);

    const impuestos = subtotal * 0.13; // 13% de impuestos (ajustar según necesidad)
    const descuento = 0; // Se puede agregar lógica de descuento
    const total = subtotal + impuestos - descuento;

    setTotales({ subtotal, impuestos, descuento, total });
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

    // Si se selecciona un producto, cargar sus datos automáticamente
    if (field === 'producto_id' && value) {
      const producto = productos.find(p => p.id === parseInt(value));
      if (producto) {
        // Intentar obtener el nombre del producto de diferentes formas
        let nombreProducto = 'Producto';
        if (producto.tipo_cultivo?.nombre) {
          nombreProducto = producto.tipo_cultivo.nombre;
        } else if (producto.tipo_cultivo_nombre) {
          nombreProducto = producto.tipo_cultivo_nombre;
        } else if (producto.cultivo?.nombre) {
          nombreProducto = producto.cultivo.nombre;
        } else if (producto.nombre) {
          nombreProducto = producto.nombre;
        } else if (producto.lote) {
          nombreProducto = `Lote ${producto.lote}`;
        }

        nuevosItems[index].producto_nombre = nombreProducto;
        nuevosItems[index].producto_descripcion = `Lote: ${producto.lote || 'Sin lote'} - ${producto.cantidad_kg || 0}kg disponibles`;
        nuevosItems[index].unidad_medida = 'kg';
        
        // Establecer precio si está disponible
        if (producto.precio_venta) {
          nuevosItems[index].precio_unitario = parseFloat(producto.precio_venta);
        } else if (producto.precio_unitario) {
          nuevosItems[index].precio_unitario = parseFloat(producto.precio_unitario);
        }
      }
    }

    setItems(nuevosItems);
  };

  const agregarItem = () => {
    setItems([...items, { producto_id: '', producto_nombre: '', producto_descripcion: '', cantidad: '', unidad_medida: 'kg', precio_unitario: '' }]);
  };

  const eliminarItem = (index) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const validarFormulario = () => {
    if (!formData.socio_id) {
      setError('Debe seleccionar un socio');
      return false;
    }
    if (!formData.cliente_nombre.trim()) {
      setError('El nombre del cliente es requerido');
      return false;
    }
    if (items.length === 0 || items.some(item => !item.producto_id || !item.cantidad || !item.precio_unitario)) {
      setError('Debe agregar al menos un producto con cantidad y precio');
      return false;
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

      // Datos en el formato EXACTO que espera el backend
      // El backend calcula automáticamente: subtotal, impuestos, total
      const datos = {
        socio_id: parseInt(formData.socio_id),
        cliente_nombre: formData.cliente_nombre,
        cliente_email: formData.cliente_email,
        cliente_telefono: formData.cliente_telefono,
        cliente_direccion: formData.cliente_direccion,
        fecha_entrega_estimada: formData.fecha_entrega_estimada || null,
        items: items.map(item => ({
          producto_id: item.producto_id ? parseInt(item.producto_id) : null,
          producto_nombre: item.producto_nombre,
          producto_descripcion: item.producto_descripcion,
          cantidad: parseFloat(item.cantidad),
          unidad_medida: item.unidad_medida || 'kg',
          precio_unitario: parseFloat(item.precio_unitario).toFixed(2)
        })),
        // El backend calcula impuestos automáticamente
        descuento: totales.descuento.toFixed(2),
        notas: formData.notas
      };

      if (isEdit) {
        await pedidosService.actualizar(id, datos);
      } else {
        await pedidosService.crear(datos);
      }

      setSuccess(true);
      setTimeout(() => {
        navigate('/pedidos');
      }, 1500);
    } catch (error) {
      console.error('Error al guardar pedido:', error);
      setError(error.response?.data?.error || 'Error al guardar el pedido');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !productos.length) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
        <span className="ml-3 text-white">Cargando...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <button
            onClick={() => navigate('/pedidos')}
            className="flex items-center text-emerald-200 hover:text-emerald-100 mb-2 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver a Pedidos
          </button>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <ShoppingCart className="w-7 h-7" />
            {isEdit ? 'Editar Pedido' : 'Nuevo Pedido'}
          </h1>
          <p className="text-emerald-100/80 mt-1">
            {isEdit ? 'Modifica la información del pedido' : 'Crea un nuevo pedido de venta'}
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
          <span>Pedido guardado exitosamente</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Información del cliente */}
        <div className="bg-white/10 backdrop-blur-lg rounded-lg border border-white/20 p-6">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <User className="w-5 h-5" />
            Información del Cliente
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">
                Socio *
              </label>
              <select
                name="socio_id"
                value={formData.socio_id}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              >
                <option value="">Seleccione un socio</option>
                {socios.map(socio => (
                  <option key={socio.id} value={socio.id}>
                    {socio.usuario?.nombres} {socio.usuario?.apellidos} - {socio.codigo_interno}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">
                Nombre del Cliente *
              </label>
              <input
                type="text"
                name="cliente_nombre"
                value={formData.cliente_nombre}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                placeholder="Nombre completo del cliente"
              />
            </div>
            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">
                Email
              </label>
              <input
                type="email"
                name="cliente_email"
                value={formData.cliente_email}
                onChange={handleInputChange}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                placeholder="email@ejemplo.com"
              />
            </div>
            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">
                Teléfono
              </label>
              <input
                type="tel"
                name="cliente_telefono"
                value={formData.cliente_telefono}
                onChange={handleInputChange}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                placeholder="+591 00000000"
              />
            </div>
            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">
                Dirección de Entrega
              </label>
              <input
                type="text"
                name="cliente_direccion"
                value={formData.cliente_direccion}
                onChange={handleInputChange}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                placeholder="Av. Principal #123, La Paz"
              />
            </div>
            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">
                Fecha de Entrega Estimada
              </label>
              <input
                type="date"
                name="fecha_entrega_estimada"
                value={formData.fecha_entrega_estimada}
                onChange={handleInputChange}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              />
            </div>
          </div>
        </div>

        {/* Items del pedido */}
        <div className="bg-white/10 backdrop-blur-lg rounded-lg border border-white/20 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              <Package className="w-5 h-5" />
              Productos
            </h2>
            <button
              type="button"
              onClick={agregarItem}
              className="bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200 font-medium py-2 px-4 rounded-lg transition-colors flex items-center space-x-2 border border-emerald-400/30"
            >
              <Plus className="w-4 h-4" />
              <span>Agregar Producto</span>
            </button>
          </div>

          {productos.length === 0 && !loading && (
            <div className="bg-yellow-500/20 border border-yellow-400/30 text-yellow-200 px-4 py-3 rounded-lg flex items-center gap-2 mb-4">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <div>
                <p className="font-medium">No hay productos cosechados disponibles</p>
                <p className="text-sm text-yellow-200/80">Asegúrate de que existan productos cosechados en el sistema antes de crear un pedido.</p>
              </div>
            </div>
          )}

          <div className="space-y-3">
            {items.map((item, index) => (
              <div key={index} className="grid grid-cols-12 gap-3 items-start bg-white/5 p-3 rounded-lg">
                <div className="col-span-12 md:col-span-4">
                  <label className="block text-white/60 text-xs mb-1">Producto</label>
                  <select
                    value={item.producto_id}
                    onChange={(e) => handleItemChange(index, 'producto_id', e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  >
                    <option value="">Seleccione producto</option>
                    {productos.length === 0 ? (
                      <option value="" disabled>No hay productos disponibles</option>
                    ) : (
                      productos.map(producto => {
                        // Obtener el nombre del producto de diferentes estructuras posibles
                        const nombreProducto = producto.tipo_cultivo?.nombre 
                          || producto.tipo_cultivo_nombre 
                          || producto.cultivo?.nombre
                          || producto.nombre
                          || `Lote ${producto.lote}`;
                        
                        const cantidadDisponible = producto.cantidad_kg || producto.cantidad || 0;
                        const precioVenta = producto.precio_venta || producto.precio_unitario || 0;
                        
                        return (
                          <option key={producto.id} value={producto.id}>
                            {nombreProducto} - {cantidadDisponible}kg - Bs. {precioVenta}
                          </option>
                        );
                      })
                    )}
                  </select>
                </div>
                <div className="col-span-6 md:col-span-2">
                  <label className="block text-white/60 text-xs mb-1">Cantidad</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={item.cantidad}
                    onChange={(e) => handleItemChange(index, 'cantidad', e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                    placeholder="0"
                  />
                </div>
                <div className="col-span-6 md:col-span-1">
                  <label className="block text-white/60 text-xs mb-1">Unidad</label>
                  <select
                    value={item.unidad_medida}
                    onChange={(e) => handleItemChange(index, 'unidad_medida', e.target.value)}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  >
                    <option value="kg">kg</option>
                    <option value="unidad">unidad</option>
                    <option value="caja">caja</option>
                    <option value="litro">litro</option>
                  </select>
                </div>
                <div className="col-span-6 md:col-span-2">
                  <label className="block text-white/60 text-xs mb-1">Precio Unit.</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={item.precio_unitario}
                    onChange={(e) => handleItemChange(index, 'precio_unitario', e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                    placeholder="0.00"
                  />
                </div>
                <div className="col-span-5 md:col-span-2">
                  <label className="block text-white/60 text-xs mb-1">Subtotal</label>
                  <div className="text-white font-semibold py-2">
                    Bs. {((parseFloat(item.cantidad) || 0) * (parseFloat(item.precio_unitario) || 0)).toFixed(2)}
                  </div>
                </div>
                <div className="col-span-1 flex items-end">
                  <button
                    type="button"
                    onClick={() => eliminarItem(index)}
                    disabled={items.length === 1}
                    className="w-full bg-red-500/20 hover:bg-red-500/30 disabled:bg-red-500/10 disabled:text-red-400/30 text-red-200 p-2 rounded-lg transition-colors border border-red-400/30 disabled:border-red-400/10 disabled:cursor-not-allowed"
                  >
                    <Trash2 className="w-4 h-4 mx-auto" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Totales */}
        <div className="bg-white/10 backdrop-blur-lg rounded-lg border border-white/20 p-6">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Resumen de Totales
          </h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center pb-3 border-b border-white/10">
              <span className="text-white/80">Subtotal:</span>
              <span className="text-white text-lg">Bs. {totales.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center pb-3 border-b border-white/10">
              <span className="text-white/80">Impuestos (13%):</span>
              <span className="text-white text-lg">Bs. {totales.impuestos.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center pb-3 border-b border-white/10">
              <span className="text-white/80">Descuento:</span>
              <span className="text-white text-lg">Bs. {totales.descuento.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white font-semibold text-xl">TOTAL:</span>
              <span className="text-emerald-300 font-bold text-2xl">Bs. {totales.total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Notas adicionales */}
        <div className="bg-white/10 backdrop-blur-lg rounded-lg border border-white/20 p-6">
          <label className="block text-white/80 text-sm font-medium mb-2">
            Notas Adicionales
          </label>
          <textarea
            name="notas"
            value={formData.notas}
            onChange={handleInputChange}
            rows="3"
            className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            placeholder="Información adicional sobre el pedido..."
          ></textarea>
        </div>

        {/* Botones de acción */}
        <div className="flex gap-3 justify-end">
          <button
            type="button"
            onClick={() => navigate('/pedidos')}
            className="bg-white/10 hover:bg-white/20 text-white font-medium py-2 px-6 rounded-lg transition-colors border border-white/20"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="bg-emerald-500/20 hover:bg-emerald-500/30 disabled:bg-emerald-500/10 text-emerald-200 disabled:text-emerald-400/50 font-medium py-2 px-6 rounded-lg transition-colors flex items-center space-x-2 border border-emerald-400/30 disabled:cursor-not-allowed"
          >
            <Save className="w-4 h-4" />
            <span>{loading ? 'Guardando...' : isEdit ? 'Actualizar Pedido' : 'Crear Pedido'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default PedidoFormPage;
