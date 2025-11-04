import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ArrowLeft, ShoppingCart, User, Mail, Phone, Calendar,
  Package, DollarSign, CheckCircle, XCircle, Clock,
  Edit, CreditCard, Banknote, Building, QrCode,
  AlertCircle, X, Save
} from 'lucide-react';
import { pedidosService, pagosService } from '../../api/pagosService';

const PedidoDetailPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [pedido, setPedido] = useState(null);
  const [pagos, setPagos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPagoModal, setShowPagoModal] = useState(false);
  const [showEstadoModal, setShowEstadoModal] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const [formPago, setFormPago] = useState({
    monto: '',
    metodo_pago: 'EFECTIVO',
    referencia_bancaria: '',
    banco: '',
    notas: ''
  });

  const [nuevoEstado, setNuevoEstado] = useState('');

  useEffect(() => {
    cargarDatos();
  }, [id]);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const [pedidoData, pagosData] = await Promise.all([
        pedidosService.obtener(id),
        pagosService.listar({ pedido_id: id })
      ]);
      setPedido(pedidoData);
      setPagos(pagosData.results || []);
      setFormPago(prev => ({
        ...prev,
        monto: pedidoData.saldo_pendiente
      }));
    } catch (error) {
      console.error('Error al cargar datos:', error);
      setError('Error al cargar la información del pedido');
    } finally {
      setLoading(false);
    }
  };

  const handleCambiarEstado = async () => {
    if (!nuevoEstado) return;

    try {
      setLoading(true);
      await pedidosService.cambiarEstado(id, nuevoEstado);
      setSuccess('Estado del pedido actualizado exitosamente');
      setShowEstadoModal(false);
      await cargarDatos();
    } catch (error) {
      console.error('Error al cambiar estado:', error);
      setError(error.response?.data?.error || 'Error al cambiar el estado');
    } finally {
      setLoading(false);
    }
  };

  const handleRegistrarPago = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      const datos = {
        pedido_id: parseInt(id),
        monto: parseFloat(formPago.monto),
        metodo_pago: formPago.metodo_pago,
        comprobante: formPago.comprobante,
        notas: formPago.notas
      };

      await pagosService.registrar(datos);
      setSuccess('Pago registrado exitosamente');
      setShowPagoModal(false);
      setFormPago({
        monto: '',
        metodo_pago: 'EFECTIVO',
        referencia_bancaria: '',
        banco: '',
        notas: ''
      });
      await cargarDatos();
    } catch (error) {
      console.error('Error al registrar pago:', error);
      setError(error.response?.data?.error || 'Error al registrar el pago');
    } finally {
      setLoading(false);
    }
  };

  const getEstadoBadge = (estado) => {
    const badges = {
      'PENDIENTE': { bg: 'bg-yellow-500/20', text: 'text-yellow-200', border: 'border-yellow-400/30', icon: Clock },
      'CONFIRMADO': { bg: 'bg-blue-500/20', text: 'text-blue-200', border: 'border-blue-400/30', icon: CheckCircle },
      'EN_PROCESO': { bg: 'bg-purple-500/20', text: 'text-purple-200', border: 'border-purple-400/30', icon: Package },
      'COMPLETADO': { bg: 'bg-green-500/20', text: 'text-green-200', border: 'border-green-400/30', icon: CheckCircle },
      'CANCELADO': { bg: 'bg-red-500/20', text: 'text-red-200', border: 'border-red-400/30', icon: XCircle }
    };
    return badges[estado] || badges['PENDIENTE'];
  };

  const getMetodoPagoIcon = (metodo) => {
    const iconos = {
      'EFECTIVO': Banknote,
      'TRANSFERENCIA': Building,
      'STRIPE': CreditCard,
      'QR': QrCode,
      'OTRO': DollarSign
    };
    return iconos[metodo] || DollarSign;
  };

  const formatFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-BO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatMonto = (monto) => {
    return new Intl.NumberFormat('es-BO', {
      style: 'currency',
      currency: 'BOB'
    }).format(monto);
  };

  if (loading && !pedido) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
        <span className="ml-3 text-white">Cargando...</span>
      </div>
    );
  }

  if (!pedido) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-16 h-16 text-white/40 mx-auto mb-4" />
        <p className="text-white/60">Pedido no encontrado</p>
        <button
          onClick={() => navigate('/pedidos')}
          className="mt-4 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200 font-medium py-2 px-4 rounded-lg transition-colors"
        >
          Volver a Pedidos
        </button>
      </div>
    );
  }

  const estadoBadge = getEstadoBadge(pedido.estado);
  const EstadoIcon = estadoBadge.icon;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
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
            Pedido {pedido.numero_pedido}
          </h1>
          <p className="text-emerald-100/80 mt-1">
            Detalle completo del pedido
          </p>
        </div>
        <div className="flex gap-2">
          {pedido.estado !== 'CANCELADO' && pedido.estado !== 'COMPLETADO' && (
            <button
              onClick={() => setShowEstadoModal(true)}
              className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-200 font-medium py-2 px-4 rounded-lg transition-colors flex items-center space-x-2 border border-blue-400/30"
            >
              <Edit className="w-4 h-4" />
              <span>Cambiar Estado</span>
            </button>
          )}
          {pedido.estado_pago !== 'PAGADO' && pedido.estado !== 'CANCELADO' && (
            <button
              onClick={() => setShowPagoModal(true)}
              className="bg-green-500/20 hover:bg-green-500/30 text-green-200 font-medium py-2 px-4 rounded-lg transition-colors flex items-center space-x-2 border border-green-400/30"
            >
              <CreditCard className="w-4 h-4" />
              <span>Registrar Pago</span>
            </button>
          )}
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
          <CheckCircle className="w-5 h-5 flex-shrink-0" />
          <span>{success}</span>
          <button onClick={() => setSuccess(null)} className="ml-auto">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Estado y resumen */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white/10 backdrop-blur-lg rounded-lg p-4 border border-white/20">
          <p className="text-white/60 text-sm mb-2">Estado del Pedido</p>
          <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border ${estadoBadge.bg} ${estadoBadge.text} ${estadoBadge.border}`}>
            <EstadoIcon className="w-4 h-4" />
            {pedido.estado}
          </div>
        </div>
        <div className="bg-white/10 backdrop-blur-lg rounded-lg p-4 border border-white/20">
          <p className="text-white/60 text-sm mb-2">Total del Pedido</p>
          <p className="text-2xl font-bold text-white">{formatMonto(pedido.total)}</p>
        </div>
        <div className="bg-white/10 backdrop-blur-lg rounded-lg p-4 border border-white/20">
          <p className="text-white/60 text-sm mb-2">Saldo Pendiente</p>
          <p className="text-2xl font-bold text-orange-300">{formatMonto(pedido.saldo_pendiente)}</p>
        </div>
      </div>

      {/* Información del cliente y pedido */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white/10 backdrop-blur-lg rounded-lg border border-white/20 p-6">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <User className="w-5 h-5" />
            Información del Cliente
          </h2>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <User className="w-5 h-5 text-white/40 mt-0.5" />
              <div>
                <p className="text-white/60 text-sm">Cliente</p>
                <p className="text-white font-medium">{pedido.cliente_nombre}</p>
              </div>
            </div>
            {pedido.cliente_email && (
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-white/40 mt-0.5" />
                <div>
                  <p className="text-white/60 text-sm">Email</p>
                  <p className="text-white">{pedido.cliente_email}</p>
                </div>
              </div>
            )}
            {pedido.cliente_telefono && (
              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-white/40 mt-0.5" />
                <div>
                  <p className="text-white/60 text-sm">Teléfono</p>
                  <p className="text-white">{pedido.cliente_telefono}</p>
                </div>
              </div>
            )}
            {pedido.cliente_direccion && (
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-white/40 mt-0.5" />
                <div>
                  <p className="text-white/60 text-sm">Dirección</p>
                  <p className="text-white">{pedido.cliente_direccion}</p>
                </div>
              </div>
            )}
            <div className="flex items-start gap-3">
              <User className="w-5 h-5 text-white/40 mt-0.5" />
              <div>
                <p className="text-white/60 text-sm">Socio</p>
                <p className="text-white">
                  {pedido.socio?.usuario?.nombres} {pedido.socio?.usuario?.apellidos}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-lg rounded-lg border border-white/20 p-6">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Detalles del Pedido
          </h2>
          <div className="space-y-3">
            <div>
              <p className="text-white/60 text-sm">Fecha del Pedido</p>
              <p className="text-white">{formatFecha(pedido.fecha_pedido)}</p>
            </div>
            {pedido.fecha_entrega_estimada && (
              <div>
                <p className="text-white/60 text-sm">Fecha de Entrega Estimada</p>
                <p className="text-white">{new Date(pedido.fecha_entrega_estimada).toLocaleDateString('es-BO', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}</p>
              </div>
            )}
            {pedido.fecha_entrega_real && (
              <div>
                <p className="text-white/60 text-sm">Fecha de Entrega Real</p>
                <p className="text-white">{formatFecha(pedido.fecha_entrega_real)}</p>
              </div>
            )}
            <div>
              <p className="text-white/60 text-sm">Estado de Pago</p>
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium mt-1 ${
                pedido.estado_pago === 'PAGADO' ? 'bg-green-500/20 text-green-200 border border-green-400/30' :
                pedido.estado_pago === 'PARCIAL' ? 'bg-orange-500/20 text-orange-200 border border-orange-400/30' :
                'bg-red-500/20 text-red-200 border border-red-400/30'
              }`}>
                {pedido.estado_pago}
              </span>
            </div>
            {pedido.observaciones && (
              <div>
                <p className="text-white/60 text-sm">Observaciones</p>
                <p className="text-white">{pedido.observaciones}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Productos */}
      <div className="bg-white/10 backdrop-blur-lg rounded-lg border border-white/20 p-6">
        <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
          <Package className="w-5 h-5" />
          Productos
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/5 border-b border-white/10">
              <tr>
                <th className="text-left py-3 px-4 text-white/80 font-medium text-sm">Producto</th>
                <th className="text-center py-3 px-4 text-white/80 font-medium text-sm">Cantidad</th>
                <th className="text-center py-3 px-4 text-white/80 font-medium text-sm">Unidad</th>
                <th className="text-right py-3 px-4 text-white/80 font-medium text-sm">Precio Unitario</th>
                <th className="text-right py-3 px-4 text-white/80 font-medium text-sm">Subtotal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {pedido.items?.map((item, index) => (
                <tr key={index} className="hover:bg-white/5 transition-colors">
                  <td className="py-3 px-4">
                    <div>
                      <p className="text-white font-medium">{item.producto_nombre || `Producto #${item.producto_cosechado}`}</p>
                      {item.producto_descripcion && (
                        <p className="text-white/60 text-xs">{item.producto_descripcion}</p>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-center text-white">{item.cantidad}</td>
                  <td className="py-3 px-4 text-center text-white/80 text-sm">{item.unidad_medida || 'kg'}</td>
                  <td className="py-3 px-4 text-right text-white">{formatMonto(item.precio_unitario)}</td>
                  <td className="py-3 px-4 text-right text-white font-semibold">{formatMonto(item.subtotal)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totales */}
        <div className="mt-6 pt-6 border-t border-white/10">
          <div className="max-w-md ml-auto space-y-2">
            <div className="flex justify-between text-white/80">
              <span>Subtotal:</span>
              <span>{formatMonto(pedido.subtotal)}</span>
            </div>
            <div className="flex justify-between text-white/80">
              <span>Impuestos:</span>
              <span>{formatMonto(pedido.impuestos)}</span>
            </div>
            <div className="flex justify-between text-white/80">
              <span>Descuento:</span>
              <span>{formatMonto(pedido.descuento)}</span>
            </div>
            <div className="flex justify-between text-white font-bold text-lg pt-2 border-t border-white/10">
              <span>TOTAL:</span>
              <span className="text-emerald-300">{formatMonto(pedido.total)}</span>
            </div>
            <div className="flex justify-between text-white">
              <span>Pagado:</span>
              <span className="text-green-300">{formatMonto(pedido.total_pagado)}</span>
            </div>
            <div className="flex justify-between text-white font-semibold">
              <span>Saldo Pendiente:</span>
              <span className="text-orange-300">{formatMonto(pedido.saldo_pendiente)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Historial de pagos */}
      {pagos.length > 0 && (
        <div className="bg-white/10 backdrop-blur-lg rounded-lg border border-white/20 p-6">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Historial de Pagos
          </h2>
          <div className="space-y-3">
            {pagos.map((pago) => {
              const MetodoIcon = getMetodoPagoIcon(pago.metodo_pago);
              return (
                <div key={pago.id} className="bg-white/5 rounded-lg p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-white/10 p-2 rounded-lg">
                      <MetodoIcon className="w-5 h-5 text-white/80" />
                    </div>
                    <div>
                      <p className="text-white font-medium">{formatMonto(pago.monto)}</p>
                      <p className="text-white/60 text-sm">
                        {pago.metodo_pago_display} - {formatFecha(pago.fecha_pago)}
                      </p>
                      {pago.referencia_bancaria && (
                        <p className="text-white/40 text-xs">
                          Ref: {pago.referencia_bancaria} {pago.banco && `- ${pago.banco}`}
                        </p>
                      )}
                      {pago.numero_recibo && (
                        <p className="text-white/40 text-xs">Recibo: {pago.numero_recibo}</p>
                      )}
                    </div>
                  </div>
                  <div>
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                      pago.estado === 'COMPLETADO' ? 'bg-green-500/20 text-green-200 border border-green-400/30' :
                      pago.estado === 'PROCESANDO' ? 'bg-blue-500/20 text-blue-200 border border-blue-400/30' :
                      'bg-red-500/20 text-red-200 border border-red-400/30'
                    }`}>
                      {pago.estado_display}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Modal de Registro de Pago */}
      {showPagoModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-emerald-950 via-emerald-900 to-emerald-800 rounded-lg border border-white/20 p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Registrar Pago
              </h3>
              <button
                onClick={() => setShowPagoModal(false)}
                className="text-white/60 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRegistrarPago} className="space-y-4">
              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">
                  Monto a Pagar *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max={pedido.saldo_pendiente}
                  value={formPago.monto}
                  onChange={(e) => setFormPago(prev => ({ ...prev, monto: e.target.value }))}
                  required
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                />
                <p className="text-white/60 text-xs mt-1">Saldo pendiente: {formatMonto(pedido.saldo_pendiente)}</p>
              </div>

              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">
                  Método de Pago *
                </label>
                <select
                  value={formPago.metodo_pago}
                  onChange={(e) => setFormPago(prev => ({ ...prev, metodo_pago: e.target.value }))}
                  required
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                >
                  <option value="EFECTIVO">Efectivo</option>
                  <option value="TRANSFERENCIA">Transferencia Bancaria</option>
                  <option value="QR">Código QR</option>
                  <option value="OTRO">Otro</option>
                </select>
              </div>

              {formPago.metodo_pago === 'TRANSFERENCIA' && (
                <>
                  <div>
                    <label className="block text-white/80 text-sm font-medium mb-2">
                      Banco
                    </label>
                    <input
                      type="text"
                      value={formPago.banco}
                      onChange={(e) => setFormPago(prev => ({ ...prev, banco: e.target.value }))}
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                      placeholder="Nombre del banco"
                    />
                  </div>
                  <div>
                    <label className="block text-white/80 text-sm font-medium mb-2">
                      Referencia Bancaria
                    </label>
                    <input
                      type="text"
                      value={formPago.referencia_bancaria}
                      onChange={(e) => setFormPago(prev => ({ ...prev, referencia_bancaria: e.target.value }))}
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                      placeholder="Número de referencia o transacción"
                    />
                  </div>
                </>
              )}

              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">
                  Notas
                </label>
                <textarea
                  value={formPago.notas}
                  onChange={(e) => setFormPago(prev => ({ ...prev, notas: e.target.value }))}
                  rows="2"
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  placeholder="Información adicional"
                ></textarea>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPagoModal(false)}
                  className="flex-1 bg-white/10 hover:bg-white/20 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-emerald-500/20 hover:bg-emerald-500/30 disabled:bg-emerald-500/10 text-emerald-200 font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 border border-emerald-400/30"
                >
                  <Save className="w-4 h-4" />
                  <span>{loading ? 'Guardando...' : 'Registrar'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Cambiar Estado */}
      {showEstadoModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-emerald-950 via-emerald-900 to-emerald-800 rounded-lg border border-white/20 p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                <Edit className="w-5 h-5" />
                Cambiar Estado
              </h3>
              <button
                onClick={() => setShowEstadoModal(false)}
                className="text-white/60 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">
                  Estado Actual
                </label>
                <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border ${estadoBadge.bg} ${estadoBadge.text} ${estadoBadge.border}`}>
                  <EstadoIcon className="w-4 h-4" />
                  {pedido.estado}
                </div>
              </div>

              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">
                  Nuevo Estado *
                </label>
                <select
                  value={nuevoEstado}
                  onChange={(e) => setNuevoEstado(e.target.value)}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                >
                  <option value="">Seleccione un estado</option>
                  <option value="CONFIRMADO">Confirmado</option>
                  <option value="EN_PROCESO">En Proceso</option>
                  <option value="COMPLETADO">Completado</option>
                  <option value="CANCELADO">Cancelado</option>
                </select>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEstadoModal(false)}
                  className="flex-1 bg-white/10 hover:bg-white/20 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleCambiarEstado}
                  disabled={!nuevoEstado || loading}
                  className="flex-1 bg-blue-500/20 hover:bg-blue-500/30 disabled:bg-blue-500/10 text-blue-200 font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 border border-blue-400/30 disabled:cursor-not-allowed"
                >
                  <Save className="w-4 h-4" />
                  <span>{loading ? 'Actualizando...' : 'Actualizar'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PedidoDetailPage;
