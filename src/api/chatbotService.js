import api from './authService.js';

export const chatbotService = {
  // Enviar mensaje al chatbot
  sendMessage: async (message) => {
    try {
      const response = await api.post('/chatbot/api/', {
        message: message,
        cliente_id: 'frontend_user' // ID único para identificar la conversación del frontend
      });
      return response.data;
    } catch (error) {
      console.error('Error enviando mensaje al chatbot:', error);
      throw error;
    }
  },

  // Obtener historial de conversación
  getHistory: async () => {
    try {
      const response = await api.get('/chatbot/historial/frontend_user/');
      return response.data;
    } catch (error) {
      console.error('Error obteniendo historial del chatbot:', error);
      throw error;
    }
  },

  // Limpiar historial de conversación
  clearHistory: async () => {
    try {
      const response = await api.post('/chatbot/limpiar/frontend_user/');
      return response.data;
    } catch (error) {
      console.error('Error limpiando historial del chatbot:', error);
      throw error;
    }
  }
};

export default chatbotService;