import axios from 'axios';
import { API_BASE_URL } from '../config/api.config';

// Configurar axios con las credenciales y CSRF
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Interceptor para agregar CSRF token
api.interceptors.request.use(
  (config) => {
    let csrfToken = localStorage.getItem('csrf_token');

    if (!csrfToken) {
      const cookies = document.cookie.split('; ');
      const csrfCookie = cookies.find(row => row.startsWith('csrftoken='));
      if (csrfCookie) {
        csrfToken = csrfCookie.split('=')[1];
      }
    }

    if (csrfToken) {
      config.headers['X-CSRFToken'] = csrfToken;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores de autenticación
api.interceptors.response.use(
  (response) => {
    if (response.data && response.data.csrf_token) {
      localStorage.setItem('csrf_token', response.data.csrf_token);
    }

    const cookies = document.cookie.split('; ');
    const csrfFromCookie = cookies.find(row => row.startsWith('csrftoken='));
    if (csrfFromCookie) {
      const csrfToken = csrfFromCookie.split('=')[1];
      localStorage.setItem('csrf_token', csrfToken);
    }

    return response;
  },
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      if (!window.location.pathname.includes('/login')) {
        localStorage.removeItem('user_data');
        localStorage.removeItem('csrf_token');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Servicio de Pedidos
export const pedidosService = {
  // Listar pedidos con filtros
  async listar(filtros = {}) {
    try {
      const params = new URLSearchParams();
      
      if (filtros.socio_id) params.append('socio_id', filtros.socio_id);
      if (filtros.estado) params.append('estado', filtros.estado);
      if (filtros.fecha_desde) params.append('fecha_desde', filtros.fecha_desde);
      if (filtros.fecha_hasta) params.append('fecha_hasta', filtros.fecha_hasta);
      if (filtros.cliente_nombre) params.append('cliente_nombre', filtros.cliente_nombre);
      if (filtros.page) params.append('page', filtros.page);
      if (filtros.page_size) params.append('page_size', filtros.page_size);
      
      const response = await api.get(`/api/pedidos/?${params}`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener pedidos:', error);
      throw error;
    }
  },

  // Obtener detalle de pedido
  async obtener(id) {
    try {
      const response = await api.get(`/api/pedidos/${id}/`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener pedido:', error);
      throw error;
    }
  },

  // Crear pedido
  async crear(datos) {
    try {
      // Mapear datos al formato EXACTO esperado por el backend según SISTEMA_PAGOS_API.md
      const payload = {
        socio: parseInt(datos.socio_id), // Backend espera integer ID directo
        cliente_nombre: datos.cliente_nombre,
        cliente_email: datos.cliente_email || '',
        cliente_telefono: datos.cliente_telefono || '',
        cliente_direccion: datos.cliente_direccion || '',
        fecha_entrega_estimada: datos.fecha_entrega_estimada || null,
        descuento: parseFloat(datos.descuento || 0).toFixed(2),
        observaciones: datos.notas || '',
        items: datos.items.map(item => ({
          producto_cosechado: item.producto_id ? parseInt(item.producto_id) : null, // FK opcional al ProductoCosechado
          producto_nombre: item.producto_nombre || '',
          producto_descripcion: item.producto_descripcion || '',
          cantidad: parseFloat(item.cantidad).toFixed(2),
          unidad_medida: item.unidad_medida || 'kg',
          precio_unitario: parseFloat(item.precio_unitario).toFixed(2)
        }))
      };
      
      const response = await api.post('/api/pedidos/', payload);
      return response.data;
    } catch (error) {
      console.error('Error al crear pedido:', error);
      throw error;
    }
  },

  // Actualizar pedido
  async actualizar(id, datos) {
    try {
      const response = await api.patch(`/api/pedidos/${id}/`, datos);
      return response.data;
    } catch (error) {
      console.error('Error al actualizar pedido:', error);
      throw error;
    }
  },

  // Cambiar estado de pedido
  async cambiarEstado(id, nuevoEstado) {
    try {
      const response = await api.post(`/api/pedidos/${id}/cambiar_estado/`, {
        estado: nuevoEstado
      });
      return response.data;
    } catch (error) {
      console.error('Error al cambiar estado:', error);
      throw error;
    }
  }
};

// Servicio de Pagos
export const pagosService = {
  // Listar pagos
  async listar(filtros = {}) {
    try {
      const params = new URLSearchParams();
      
      if (filtros.pedido_id) params.append('pedido_id', filtros.pedido_id);
      if (filtros.metodo_pago) params.append('metodo_pago', filtros.metodo_pago);
      if (filtros.estado) params.append('estado', filtros.estado);
      if (filtros.fecha_desde) params.append('fecha_desde', filtros.fecha_desde);
      if (filtros.fecha_hasta) params.append('fecha_hasta', filtros.fecha_hasta);
      if (filtros.page) params.append('page', filtros.page);
      if (filtros.page_size) params.append('page_size', filtros.page_size);
      
      const response = await api.get(`/api/pagos/?${params}`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener pagos:', error);
      throw error;
    }
  },

  // Registrar pago (efectivo/transferencia)
  async registrar(datos) {
    try {
      // Mapear al formato EXACTO esperado por el backend
      const payload = {
        pedido: parseInt(datos.pedido_id), // Backend espera integer ID directo
        monto: parseFloat(datos.monto).toFixed(2),
        metodo_pago: datos.metodo_pago,
        referencia_bancaria: datos.referencia_bancaria || null,
        banco: datos.banco || null,
        observaciones: datos.notas || ''
      };
      
      const response = await api.post('/api/pagos/', payload);
      return response.data;
    } catch (error) {
      console.error('Error al registrar pago:', error);
      throw error;
    }
  },

  // Pagar con Stripe
  async pagarConStripe(datos) {
    try {
      // Mapear al formato EXACTO esperado por el backend
      const payload = {
        pedido_id: parseInt(datos.pedido_id), // Para Stripe el endpoint usa pedido_id
        monto: parseFloat(datos.monto).toFixed(2),
        payment_method_id: datos.payment_method_id,
        comprobante: datos.comprobante || ''
      };
      
      const response = await api.post('/api/pagos/pagar_con_stripe/', payload);
      return response.data;
    } catch (error) {
      console.error('Error al procesar pago con Stripe:', error);
      throw error;
    }
  },

  // Reembolsar pago
  async reembolsar(id, motivo) {
    try {
      const response = await api.post(`/api/pagos/${id}/reembolsar/`, {
        motivo: motivo
      });
      return response.data;
    } catch (error) {
      console.error('Error al reembolsar pago:', error);
      throw error;
    }
  }
};

// Servicio de Historial
export const historialService = {
  // Obtener historial de ventas
  async obtenerHistorial(filtros = {}) {
    try {
      const params = new URLSearchParams();
      
      if (filtros.fecha_desde) params.append('fecha_desde', filtros.fecha_desde);
      if (filtros.fecha_hasta) params.append('fecha_hasta', filtros.fecha_hasta);
      if (filtros.cliente_nombre) params.append('cliente_nombre', filtros.cliente_nombre);
      if (filtros.socio_id) params.append('socio_id', filtros.socio_id);
      if (filtros.estado_pedido) params.append('estado_pedido', filtros.estado_pedido);
      if (filtros.metodo_pago) params.append('metodo_pago', filtros.metodo_pago);
      if (filtros.page) params.append('page', filtros.page);
      if (filtros.page_size) params.append('page_size', filtros.page_size);
      
      const response = await api.get(`/api/historial-ventas/?${params}`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener historial:', error);
      throw error;
    }
  },

  // Exportar a CSV
  async exportarCSV(filtros = {}) {
    try {
      const params = new URLSearchParams();
      
      if (filtros.fecha_desde) params.append('fecha_desde', filtros.fecha_desde);
      if (filtros.fecha_hasta) params.append('fecha_hasta', filtros.fecha_hasta);
      if (filtros.cliente_nombre) params.append('cliente_nombre', filtros.cliente_nombre);
      if (filtros.socio_id) params.append('socio_id', filtros.socio_id);
      if (filtros.estado_pedido) params.append('estado_pedido', filtros.estado_pedido);
      if (filtros.metodo_pago) params.append('metodo_pago', filtros.metodo_pago);
      
      const response = await api.get(`/api/exportar-ventas-csv/?${params}`, {
        responseType: 'blob'
      });

      // Crear link de descarga
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `ventas_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error al exportar CSV:', error);
      throw error;
    }
  }
};

// Servicio auxiliar para productos cosechados (necesario para crear pedidos)
export const productosService = {
  async listar() {
    try {
      const response = await api.get('/api/productos-cosechados/');
      return response.data;
    } catch (error) {
      console.error('Error al obtener productos:', error);
      throw error;
    }
  }
};

export default {
  pedidosService,
  pagosService,
  historialService,
  productosService
};
