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

// Servicio de Precios por Temporada
export const preciosTemporadaService = {
  // Listar precios vigentes
  async listar(filtros = {}) {
    try {
      const params = new URLSearchParams();
      
      if (filtros.tipo_insumo) params.append('tipo_insumo', filtros.tipo_insumo);
      if (filtros.temporada) params.append('temporada', filtros.temporada);
      if (filtros.activo !== undefined) params.append('activo', filtros.activo);
      if (filtros.vigente !== undefined) params.append('vigente', filtros.vigente);
      
      const response = await api.get(`/api/ventas/insumos/precios-temporada/?${params}`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener precios:', error);
      throw error;
    }
  },

  // Obtener detalle de precio
  async obtener(id) {
    try {
      const response = await api.get(`/api/ventas/insumos/precios-temporada/${id}/`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener precio:', error);
      throw error;
    }
  }
};

// Servicio de Pedidos de Insumos
export const pedidosInsumosService = {
  // Listar pedidos
  async listar(filtros = {}) {
    try {
      const params = new URLSearchParams();
      
      if (filtros.socio) params.append('socio', filtros.socio);
      if (filtros.estado) params.append('estado', filtros.estado);
      if (filtros.fecha_desde) params.append('fecha_desde', filtros.fecha_desde);
      if (filtros.fecha_hasta) params.append('fecha_hasta', filtros.fecha_hasta);
      if (filtros.page) params.append('page', filtros.page);
      if (filtros.page_size) params.append('page_size', filtros.page_size);
      
      const response = await api.get(`/api/ventas/insumos/pedidos/?${params}`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener pedidos de insumos:', error);
      throw error;
    }
  },

  // Obtener detalle de pedido
  async obtener(id) {
    try {
      const response = await api.get(`/api/ventas/insumos/pedidos/${id}/`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener pedido de insumo:', error);
      throw error;
    }
  },

  // Crear pedido (solicitud)
  async crear(datos) {
    try {
      const payload = {
        socio: parseInt(datos.socio_id),
        fecha_entrega_solicitada: datos.fecha_entrega_solicitada,
        motivo_solicitud: datos.motivo_solicitud,
        observaciones: datos.observaciones || '',
        items: datos.items.map(item => ({
          tipo_insumo: item.tipo_insumo,
          semilla: item.semilla ? parseInt(item.semilla) : undefined,
          pesticida: item.pesticida ? parseInt(item.pesticida) : undefined,
          fertilizante: item.fertilizante ? parseInt(item.fertilizante) : undefined,
          cantidad: parseFloat(item.cantidad),
          precio_unitario: parseFloat(item.precio_unitario)
        }))
      };
      
      const response = await api.post('/api/ventas/insumos/pedidos/', payload);
      return response.data;
    } catch (error) {
      console.error('Error al crear pedido de insumo:', error);
      throw error;
    }
  },

  // Aprobar pedido (solo admin)
  async aprobar(id) {
    try {
      const response = await api.post(`/api/ventas/insumos/pedidos/${id}/aprobar/`);
      return response.data;
    } catch (error) {
      console.error('Error al aprobar pedido:', error);
      throw error;
    }
  },

  // Marcar como entregado (solo admin)
  async entregar(id) {
    try {
      const response = await api.post(`/api/ventas/insumos/pedidos/${id}/entregar/`);
      return response.data;
    } catch (error) {
      console.error('Error al marcar pedido como entregado:', error);
      throw error;
    }
  }
};

// Servicio de Pagos de Insumos
export const pagosInsumosService = {
  // Listar pagos
  async listar(filtros = {}) {
    try {
      const params = new URLSearchParams();
      
      if (filtros.pedido_insumo) params.append('pedido_insumo', filtros.pedido_insumo);
      if (filtros.metodo_pago) params.append('metodo_pago', filtros.metodo_pago);
      if (filtros.estado) params.append('estado', filtros.estado);
      if (filtros.fecha_desde) params.append('fecha_desde', filtros.fecha_desde);
      if (filtros.fecha_hasta) params.append('fecha_hasta', filtros.fecha_hasta);
      
      const response = await api.get(`/api/ventas/insumos/pagos/?${params}`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener pagos de insumos:', error);
      throw error;
    }
  },

  // Registrar pago
  async crear(datos) {
    try {
      const payload = {
        pedido_insumo: parseInt(datos.pedido_insumo_id || datos.pedido_insumo),
        monto: parseFloat(datos.monto),
        metodo_pago: datos.metodo_pago,
        observaciones: datos.observaciones || ''
      };

      // Agregar campos opcionales según el método de pago
      if (datos.metodo_pago === 'TRANSFERENCIA') {
        if (datos.referencia_bancaria) payload.referencia_bancaria = datos.referencia_bancaria;
        if (datos.banco) payload.banco = datos.banco;
      }
      
      const response = await api.post('/api/ventas/insumos/pagos/', payload);
      return response.data;
    } catch (error) {
      console.error('Error al registrar pago de insumo:', error);
      throw error;
    }
  }
};

// Servicio de Historial
export const historialInsumosService = {
  // Obtener historial de compras
  async obtenerHistorial(filtros = {}) {
    try {
      const params = new URLSearchParams();
      
      if (filtros.socio) params.append('socio', filtros.socio);
      if (filtros.fecha_desde) params.append('fecha_desde', filtros.fecha_desde);
      if (filtros.fecha_hasta) params.append('fecha_hasta', filtros.fecha_hasta);
      if (filtros.estado) params.append('estado', filtros.estado);
      
      const response = await api.get(`/api/ventas/insumos/historial/?${params}`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener historial de compras:', error);
      throw error;
    }
  },

  // Exportar a CSV
  async exportarCSV(filtros = {}) {
    try {
      const params = new URLSearchParams();
      
      if (filtros.socio) params.append('socio', filtros.socio);
      if (filtros.fecha_desde) params.append('fecha_desde', filtros.fecha_desde);
      if (filtros.fecha_hasta) params.append('fecha_hasta', filtros.fecha_hasta);
      if (filtros.estado) params.append('estado', filtros.estado);
      
      const response = await api.get(`/api/ventas/insumos/exportar-csv/?${params}`, {
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `compras_insumos_${new Date().toISOString().split('T')[0]}.csv`);
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

export default {
  preciosTemporadaService,
  pedidosInsumosService,
  pagosInsumosService,
  historialInsumosService
};
