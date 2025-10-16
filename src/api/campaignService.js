import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

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
    if (!config.url.includes('/api/auth/login/') && !config.url.includes('/api/auth/csrf/')) {
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

// Servicio para gestión de campañas
export const campaignService = {
  // ========== CRUD de Campañas ==========
  
  // Obtener todas las campañas
  async getCampaigns(params = {}) {
    try {
      const response = await api.get('/api/campaigns/', { params });
      // El backend devuelve un objeto paginado: { count, next, previous, results }
      // Retornamos results si existe, sino el array completo
      return response.data.results || response.data;
    } catch (error) {
      console.error('Error al obtener campañas:', error);
      throw error;
    }
  },

  // Obtener campaña por ID
  async getCampaignById(id) {
    try {
      const response = await api.get(`/api/campaigns/${id}/`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener campaña:', error);
      throw error;
    }
  },

  // Crear campaña
  async createCampaign(campaignData) {
    try {
      const response = await api.post('/api/campaigns/', campaignData);
      return response.data;
    } catch (error) {
      console.error('Error al crear campaña:', error);
      throw error;
    }
  },

  // Actualizar campaña
  async updateCampaign(id, campaignData) {
    try {
      const response = await api.put(`/api/campaigns/${id}/`, campaignData);
      return response.data;
    } catch (error) {
      console.error('Error al actualizar campaña:', error);
      throw error;
    }
  },

  // Actualización parcial de campaña
  async patchCampaign(id, campaignData) {
    try {
      const response = await api.patch(`/api/campaigns/${id}/`, campaignData);
      return response.data;
    } catch (error) {
      console.error('Error al actualizar campaña:', error);
      throw error;
    }
  },

  // Eliminar campaña
  async deleteCampaign(id) {
    try {
      const response = await api.delete(`/api/campaigns/${id}/`);
      return response.data;
    } catch (error) {
      console.error('Error al eliminar campaña:', error);
      throw error;
    }
  },

  // ========== Gestión de Socios en Campaña ==========

  // Listar socios de una campaña
  async getCampaignPartners(campaignId) {
    try {
      const response = await api.get(`/api/campaigns/${campaignId}/partners/`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener socios de campaña:', error);
      throw error;
    }
  },

  // Asignar socio a campaña
  async assignPartner(campaignId, partnerData) {
    try {
      const response = await api.post(`/api/campaigns/${campaignId}/assign_partner/`, partnerData);
      return response.data;
    } catch (error) {
      console.error('Error al asignar socio:', error);
      throw error;
    }
  },

  // Desasignar socio de campaña
  async removePartner(campaignId, socioId) {
    try {
      const response = await api.post(`/api/campaigns/${campaignId}/remove_partner/`, { socio_id: socioId });
      return response.data;
    } catch (error) {
      console.error('Error al desasignar socio:', error);
      throw error;
    }
  },

  // ========== Gestión de Parcelas en Campaña ==========

  // Listar parcelas de una campaña
  async getCampaignPlots(campaignId) {
    try {
      const response = await api.get(`/api/campaigns/${campaignId}/plots/`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener parcelas de campaña:', error);
      throw error;
    }
  },

  // Asignar parcela a campaña
  async assignPlot(campaignId, plotData) {
    try {
      const response = await api.post(`/api/campaigns/${campaignId}/assign_plot/`, plotData);
      return response.data;
    } catch (error) {
      console.error('Error al asignar parcela:', error);
      throw error;
    }
  },

  // Desasignar parcela de campaña
  async removePlot(campaignId, parcelaId) {
    try {
      const response = await api.post(`/api/campaigns/${campaignId}/remove_plot/`, { parcela_id: parcelaId });
      return response.data;
    } catch (error) {
      console.error('Error al desasignar parcela:', error);
      throw error;
    }
  },

  // ========== Reportes ==========

  // Reporte de labores por campaña
  async getLaborsByCampaign(params = {}) {
    try {
      const response = await api.get('/api/reports/labors-by-campaign/', { params });
      return response.data;
    } catch (error) {
      console.error('Error al obtener reporte de labores:', error);
      throw error;
    }
  },

  // Reporte de producción por campaña
  async getProductionByCampaign(params = {}) {
    try {
      const response = await api.get('/api/reports/production-by-campaign/', { params });
      return response.data;
    } catch (error) {
      console.error('Error al obtener reporte de producción:', error);
      throw error;
    }
  },

  // Reporte de producción por parcela
  async getProductionByPlot(params = {}) {
    try {
      console.log('getProductionByPlot - Parámetros enviados:', params);
      const response = await api.get('/api/reports/production-by-plot/', { params });
      console.log('getProductionByPlot - Respuesta recibida:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error al obtener reporte de producción por parcela:', error);
      console.error('Error response:', error.response);
      console.error('Error data:', error.response?.data);
      throw error;
    }
  },
};
