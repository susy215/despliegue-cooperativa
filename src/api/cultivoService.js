// /src/api/cultivoService.js
import { api } from './productoCosechadoService';

// Servicio directo para Cultivo (usado por ProductoCosechado)
export const cultivoService = {
  async getCultivos(params = {}) {
    try {
      const response = await api.get('/api/cultivos/', { params });
      return response.data;
    } catch (error) {
      console.error('Error al obtener cultivos:', error);
      throw error;
    }
  },
};



