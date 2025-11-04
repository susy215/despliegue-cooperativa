import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Package, Calendar, User, MapPin, FileText, DollarSign,
  CheckCircle, XCircle, Clock, Truck, AlertCircle, CreditCard, X
} from 'lucide-react';
import { pedidosInsumosService, pagosInsumosService } from '../../api/insumosVentaService';

const PedidoInsumoDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [pedido, setPedido] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [showPagoModal, setShowPagoModal] = useState(false);

  const userData = JSON.parse(localStorage.getItem('user_data') || '{}');
  const isAdmin = userData.rol === 'ADMIN';

  useEffect(() => {
    cargarPedido();
  }, [id]);

  const cargarPedido = async () => {
    try {
      setLoading(true);
      const data = await pedidosInsumosService.obtener(id);
      console.log('📦 Pedido cargado:', data);
      setPedido(data);
      setError(null);
    } catch (error) {
      console.error('Error al cargar pedido:', error);
      setError('Error al cargar el pedido');
    } finally {
      setLoading(false);
    }
  };

  const handleAprobar = async () => {
    if (!window.confirm('¿Está seguro de aprobar esta solicitud de insumos?')) return;

    try {
      setActionLoading(true);
      await pedidosInsumosService.aprobar(id);
      await cargarPedido();
      alert('Solicitud aprobada exitosamente');
    } catch (error) {
      console.error('Error al aprobar:', error);
      alert(error.response?.data?.error || 'Error al aprobar la solicitud');
    } finally {
      setActionLoading(false);
    }
  };

  const handleMarcarEntregado = async () => {
    if (!window.confirm('¿Confirmar que los insumos han sido entregados?')) return;

    try {
      setActionLoading(true);
      await pedidosInsumosService.entregar(id);
      await cargarPedido();
      alert('Pedido marcado como entregado');
    } catch (error) {
      console.error('Error al marcar como entregado:', error);
      alert(error.response?.data?.error || 'Error al actualizar el estado');
    } finally {
      setActionLoading(false);
    }
  };

  const getEstadoBadge = (estado) => {
    const configs = {
      SOLICITADO: { bg: 'bg-blue-500/20', border: 'border-blue-400/30', text: 'text-blue-200', label: 'Solicitado' },
      APROBADO: { bg: 'bg-green-500/20', border: 'border-green-400/30', text: 'text-green-200', label: 'Aprobado' },
      EN_PREPARACION: { bg: 'bg-yellow-500/20', border: 'border-yellow-400/30', text: 'text-yellow-200', label: 'En Preparación' },
      LISTO_ENTREGA: { bg: 'bg-purple-500/20', border: 'border-purple-400/30', text: 'text-purple-200', label: 'Listo para Entrega' },
      ENTREGADO: { bg: 'bg-emerald-500/20', border: 'border-emerald-400/30', text: 'text-emerald-200', label: 'Entregado' },
      RECHAZADO: { bg: 'bg-red-500/20', border: 'border-red-400/30', text: 'text-red-200', label: 'Rechazado' },
      CANCELADO: { bg: 'bg-gray-500/20', border: 'border-gray-400/30', text: 'text-gray-200', label: 'Cancelado' }
    };
    const config = configs[estado] || configs.SOLICITADO;
    return (
      <span className={`${config.bg} ${config.border} ${config.text} px-3 py-1 rounded-full text-sm font-medium border`}>
        {config.label}
      </span>
    );
  };

  const getEstadoPagoBadge = (estadoPago) => {
    const configs = {
      PENDIENTE: { bg: 'bg-red-500/20', border: 'border-red-400/30', text: 'text-red-200', label: 'Pendiente' },
      PARCIAL: { bg: 'bg-yellow-500/20', border: 'border-yellow-400/30', text: 'text-yellow-200', label: 'Parcial' },
      PAGADO: { bg: 'bg-green-500/20', border: 'border-green-400/30', text: 'text-green-200', label: 'Pagado' }
    };
    const config = configs[estadoPago] || configs.PENDIENTE;
    return (
      <span className={`${config.bg} ${config.border} ${config.text} px-3 py-1 rounded-full text-sm font-medium border`}>
        {config.label}
      </span>
    );
  };

  const obtenerNombreInsumo = (item) => {
    if (item.semilla) {
      return `${item.semilla.especie} - ${item.semilla.variedad}`;
    }
    if (item.pesticida) {
      return item.pesticida.nombre_comercial;
    }
    if (item.fertilizante) {
      return item.fertilizante.nombre_comercial;
    }
    return 'Insumo';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  if (error || !pedido) {
    return (
      <div className="bg-red-500/20 border border-red-400/30 text-red-200 px-4 py-3 rounded-lg">
        {error || 'Pedido no encontrado'}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <button
            onClick={() => navigate('/pedidos-insumos')}
            className="flex items-center text-emerald-200 hover:text-emerald-100 mb-2 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver a Pedidos
          </button>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Package className="w-7 h-7" />
            Pedido de Insumos #{pedido.id}
          </h1>
          <p className="text-emerald-100/80 mt-1">
            Solicitado el {new Date(pedido.fecha_solicitud).toLocaleDateString('es-BO')}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {getEstadoBadge(pedido.estado)}
          {getEstadoPagoBadge(pedido.estado_pago)}
        </div>
      </div>

      {/* Acciones de Admin */}
      {isAdmin && pedido.estado === 'SOLICITADO' && (
        <div className="bg-blue-500/20 border border-blue-400/30 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-200 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-white font-semibold mb-2">Solicitud Pendiente de Aprobación</h3>
              <p className="text-blue-100/80 text-sm mb-3">
                Esta solicitud requiere tu aprobación para continuar con el proceso.
              </p>
              <button
                onClick={handleAprobar}
                disabled={actionLoading}
                className="bg-green-500/20 hover:bg-green-500/30 disabled:bg-green-500/10 text-green-200 disabled:text-green-400/30 font-medium py-2 px-4 rounded-lg transition-colors flex items-center gap-2 border border-green-400/30 disabled:border-green-400/10"
              >
                <CheckCircle className="w-4 h-4" />
                {actionLoading ? 'Procesando...' : 'Aprobar Solicitud'}
              </button>
            </div>
          </div>
        </div>
      )}

      {isAdmin && pedido.estado === 'LISTO_ENTREGA' && (
        <div className="bg-purple-500/20 border border-purple-400/30 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Truck className="w-5 h-5 text-purple-200 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-white font-semibold mb-2">Pedido Listo para Entrega</h3>
              <p className="text-purple-100/80 text-sm mb-3">
                Los insumos están preparados. Confirma cuando se hayan entregado al socio.
              </p>
              <button
                onClick={handleMarcarEntregado}
                disabled={actionLoading}
                className="bg-emerald-500/20 hover:bg-emerald-500/30 disabled:bg-emerald-500/10 text-emerald-200 disabled:text-emerald-400/30 font-medium py-2 px-4 rounded-lg transition-colors flex items-center gap-2 border border-emerald-400/30 disabled:border-emerald-400/10"
              >
                <CheckCircle className="w-4 h-4" />
                {actionLoading ? 'Procesando...' : 'Marcar como Entregado'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Información Principal */}
        <div className="lg:col-span-2 space-y-6">
          {/* Información del Socio */}
          <div className="bg-white/10 backdrop-blur-lg rounded-lg border border-white/20 p-6">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <User className="w-5 h-5" />
              Información del Socio
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-white/60 text-sm">Nombre</p>
                <p className="text-white font-medium">
                  {pedido.socio?.nombre} {pedido.socio?.apellido}
                </p>
              </div>
              <div>
                <p className="text-white/60 text-sm">CI</p>
                <p className="text-white font-medium">{pedido.socio?.ci}</p>
              </div>
              <div>
                <p className="text-white/60 text-sm">Teléfono</p>
                <p className="text-white font-medium">{pedido.socio?.telefono || 'No registrado'}</p>
              </div>
              <div>
                <p className="text-white/60 text-sm">Email</p>
                <p className="text-white font-medium">{pedido.socio?.email || 'No registrado'}</p>
              </div>
            </div>
          </div>

          {/* Detalles de la Solicitud */}
          <div className="bg-white/10 backdrop-blur-lg rounded-lg border border-white/20 p-6">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Detalles de la Solicitud
            </h2>
            <div className="space-y-4">
              <div>
                <p className="text-white/60 text-sm mb-1">Fecha de Solicitud</p>
                <p className="text-white font-medium flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {new Date(pedido.fecha_solicitud).toLocaleString('es-BO')}
                </p>
              </div>
              <div>
                <p className="text-white/60 text-sm mb-1">Fecha de Entrega Solicitada</p>
                <p className="text-white font-medium flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {new Date(pedido.fecha_entrega_solicitada).toLocaleDateString('es-BO')}
                </p>
              </div>
              {pedido.fecha_entrega_real && (
                <div>
                  <p className="text-white/60 text-sm mb-1">Fecha de Entrega Real</p>
                  <p className="text-white font-medium flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {new Date(pedido.fecha_entrega_real).toLocaleString('es-BO')}
                  </p>
                </div>
              )}
              <div>
                <p className="text-white/60 text-sm mb-1">Motivo de la Solicitud</p>
                <p className="text-white bg-white/5 p-3 rounded-lg">{pedido.motivo_solicitud}</p>
              </div>
              {pedido.observaciones && (
                <div>
                  <p className="text-white/60 text-sm mb-1">Observaciones</p>
                  <p className="text-white bg-white/5 p-3 rounded-lg">{pedido.observaciones}</p>
                </div>
              )}
            </div>
          </div>

          {/* Items del Pedido */}
          <div className="bg-white/10 backdrop-blur-lg rounded-lg border border-white/20 p-6">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <Package className="w-5 h-5" />
              Insumos Solicitados
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left text-white/80 text-sm font-medium pb-3">Tipo</th>
                    <th className="text-left text-white/80 text-sm font-medium pb-3">Insumo</th>
                    <th className="text-right text-white/80 text-sm font-medium pb-3">Cantidad</th>
                    <th className="text-right text-white/80 text-sm font-medium pb-3">Precio Unit.</th>
                    <th className="text-right text-white/80 text-sm font-medium pb-3">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {pedido.items?.map((item, index) => (
                    <tr key={index} className="border-b border-white/5">
                      <td className="py-3 text-white/80">{item.tipo_insumo}</td>
                      <td className="py-3 text-white">{obtenerNombreInsumo(item)}</td>
                      <td className="py-3 text-right text-white">{parseFloat(item.cantidad).toFixed(2)}</td>
                      <td className="py-3 text-right text-white">Bs. {parseFloat(item.precio_unitario).toFixed(2)}</td>
                      <td className="py-3 text-right text-white font-medium">Bs. {parseFloat(item.subtotal).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Historial de Pagos */}
          {pedido.pagos && pedido.pagos.length > 0 && (
            <div className="bg-white/10 backdrop-blur-lg rounded-lg border border-white/20 p-6">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Historial de Pagos
              </h2>
              <div className="space-y-3">
                {pedido.pagos.map((pago) => (
                  <div key={pago.id} className="bg-white/5 p-4 rounded-lg border border-white/10">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="text-white font-medium">Pago #{pago.id}</p>
                        <p className="text-white/60 text-sm">
                          {new Date(pago.fecha_pago).toLocaleString('es-BO')}
                        </p>
                      </div>
                      <span className="bg-emerald-500/20 text-emerald-200 px-3 py-1 rounded-full text-sm font-medium border border-emerald-400/30">
                        Bs. {parseFloat(pago.monto).toFixed(2)}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-white/60">Método:</span>{' '}
                        <span className="text-white">{pago.metodo_pago}</span>
                      </div>
                      {pago.referencia && (
                        <div>
                          <span className="text-white/60">Referencia:</span>{' '}
                          <span className="text-white">{pago.referencia}</span>
                        </div>
                      )}
                      {pago.observaciones && (
                        <div className="col-span-2">
                          <span className="text-white/60">Observaciones:</span>{' '}
                          <span className="text-white">{pago.observaciones}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Resumen Financiero */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-gradient-to-br from-emerald-500/20 to-teal-500/20 backdrop-blur-lg rounded-lg border border-emerald-400/30 p-6 sticky top-6">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Resumen Financiero
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-white/10">
                <span className="text-white/80">Total del Pedido:</span>
                <span className="text-white font-bold text-lg">Bs. {parseFloat(pedido.monto_total).toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-white/10">
                <span className="text-white/80">Monto Pagado:</span>
                <span className="text-green-300 font-semibold">Bs. {parseFloat(pedido.monto_pagado).toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-white/80">Saldo Pendiente:</span>
                <span className={`font-bold text-lg ${parseFloat(pedido.saldo_pendiente) > 0 ? 'text-red-300' : 'text-green-300'}`}>
                  Bs. {parseFloat(pedido.saldo_pendiente).toFixed(2)}
                </span>
              </div>
            </div>

            {/* Botón de Pago */}
            {parseFloat(pedido.saldo_pendiente) > 0 && pedido.estado !== 'CANCELADO' && pedido.estado !== 'RECHAZADO' && (
              <button
                onClick={() => setShowPagoModal(true)}
                className="w-full mt-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-medium py-3 px-4 rounded-lg transition-all flex items-center justify-center gap-2 shadow-lg"
              >
                <CreditCard className="w-5 h-5" />
                Registrar Pago
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Modal de Pago */}
      {showPagoModal && (
        <ModalPago
          pedido={pedido}
          onClose={() => setShowPagoModal(false)}
          onSuccess={() => {
            setShowPagoModal(false);
            cargarPedido();
          }}
        />
      )}
    </div>
  );
};

// Modal de Pago
const ModalPago = ({ pedido, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    monto: pedido.saldo_pendiente,
    metodo_pago: 'EFECTIVO',
    referencia_bancaria: '',
    banco: '',
    observaciones: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (parseFloat(formData.monto) <= 0) {
      setError('El monto debe ser mayor a 0');
      return;
    }

    if (parseFloat(formData.monto) > parseFloat(pedido.saldo_pendiente)) {
      setError('El monto no puede ser mayor al saldo pendiente');
      return;
    }

    try {
      setLoading(true);
      const datos = {
        pedido_insumo_id: pedido.id,
        monto: parseFloat(formData.monto),
        metodo_pago: formData.metodo_pago,
        observaciones: formData.observaciones || undefined
      };

      // Solo agregar campos de transferencia si es necesario
      if (formData.metodo_pago === 'TRANSFERENCIA') {
        if (!formData.referencia_bancaria || !formData.banco) {
          setError('Referencia bancaria y banco son requeridos para transferencias');
          setLoading(false);
          return;
        }
        datos.referencia_bancaria = formData.referencia_bancaria;
        datos.banco = formData.banco;
      }

      await pagosInsumosService.crear(datos);
      onSuccess();
    } catch (error) {
      console.error('Error al registrar pago:', error);
      setError(error.response?.data?.error || 'Error al registrar el pago');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg border border-white/20 p-6 max-w-md w-full shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <CreditCard className="w-6 h-6" />
            Registrar Pago
          </h3>
          <button onClick={onClose} className="text-white/60 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-400/30 text-red-200 px-4 py-3 rounded-lg mb-4 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="bg-white/5 rounded-lg p-4 mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-white/80">Saldo Pendiente:</span>
            <span className="text-red-300 font-bold text-lg">Bs. {parseFloat(pedido.saldo_pendiente).toFixed(2)}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-white/80 text-sm font-medium mb-2">
              Monto a Pagar *
            </label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              max={pedido.saldo_pendiente}
              value={formData.monto}
              onChange={(e) => setFormData({ ...formData, monto: e.target.value })}
              required
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            />
          </div>

          <div>
            <label className="block text-white/80 text-sm font-medium mb-2">
              Método de Pago *
            </label>
            <select
              value={formData.metodo_pago}
              onChange={(e) => setFormData({ ...formData, metodo_pago: e.target.value })}
              required
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            >
              <option value="EFECTIVO">Efectivo</option>
              <option value="TRANSFERENCIA">Transferencia Bancaria</option>
              <option value="DESCUENTO_PRODUCCION">Descuento de Producción</option>
              <option value="CREDITO">A Crédito</option>
              <option value="OTRO">Otro</option>
            </select>
            {formData.metodo_pago === 'TRANSFERENCIA' && (
              <p className="text-xs text-white/60 mt-1">
                * Referencia bancaria y banco son requeridos para transferencias
              </p>
            )}
          </div>

          <div>
            <label className="block text-white/80 text-sm font-medium mb-2">
              Referencia Bancaria {formData.metodo_pago === 'TRANSFERENCIA' && '*'}
            </label>
            <input
              type="text"
              value={formData.referencia_bancaria}
              onChange={(e) => setFormData({ ...formData, referencia_bancaria: e.target.value })}
              disabled={formData.metodo_pago !== 'TRANSFERENCIA'}
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              placeholder="Número de transacción"
            />
          </div>

          <div>
            <label className="block text-white/80 text-sm font-medium mb-2">
              Banco {formData.metodo_pago === 'TRANSFERENCIA' && '*'}
            </label>
            <input
              type="text"
              value={formData.banco}
              onChange={(e) => setFormData({ ...formData, banco: e.target.value })}
              disabled={formData.metodo_pago !== 'TRANSFERENCIA'}
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              placeholder="Nombre del banco"
            />
          </div>

          <div>
            <label className="block text-white/80 text-sm font-medium mb-2">
              Observaciones
            </label>
            <textarea
              value={formData.observaciones}
              onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
              rows="2"
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              placeholder="Observaciones adicionales"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-white/10 hover:bg-white/20 text-white font-medium rounded-lg transition-all border border-white/20"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 disabled:from-gray-500 disabled:to-gray-600 text-white font-medium rounded-lg transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Procesando...</span>
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  <span>Registrar</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PedidoInsumoDetailPage;
