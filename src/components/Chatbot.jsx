import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Trash2 } from 'lucide-react';
import { chatbotService } from '../api/chatbotService';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const messagesEndRef = useRef(null);

  // Cargar historial al abrir el chat
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      loadHistory();
    }
  }, [isOpen]);

  // Scroll automático al final de los mensajes
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadHistory = async () => {
    setIsLoadingHistory(true);
    try {
      const history = await chatbotService.getHistory();
      if (history && history.historial) {
        // Convertir el historial del backend al formato del frontend
        const formattedMessages = [];
        history.historial.forEach(item => {
          if (item.usuario) {
            formattedMessages.push({
              id: Date.now() + Math.random(),
              text: item.usuario,
              sender: 'user',
              timestamp: new Date()
            });
          }
          if (item.bot) {
            formattedMessages.push({
              id: Date.now() + Math.random() + 1,
              text: item.bot,
              sender: 'bot',
              timestamp: new Date()
            });
          }
        });
        setMessages(formattedMessages);
      }
    } catch (error) {
      console.error('Error cargando historial:', error);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      text: inputMessage.trim(),
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await chatbotService.sendMessage(userMessage.text);
      console.log('Respuesta del chatbot:', response);

      let botResponse = '';

      // Priorizar respuesta de IA
      if (response && response.response) {
        botResponse = response.response.trim();
      }

      // Si no hay respuesta de IA, intentar otros campos
      if (!botResponse && response && response.respuesta) {
        botResponse = response.respuesta.trim();
      }

      // Si no hay respuesta de IA, intentar otros campos
      if (!botResponse && response && response.mensaje) {
        botResponse = response.mensaje.trim();
      }

      // Si aún no hay respuesta, intentar response directo
      if (!botResponse && typeof response === 'string') {
        botResponse = response.trim();
      }

      // Si no hay respuesta válida de IA, mostrar mensaje de procesamiento
      if (!botResponse) {
        botResponse = '🤖 Procesando tu consulta con IA agrícola especializada...';
      }

      // Limpiar respuesta de tokens de IA y caracteres especiales
      if (botResponse.includes('<｜') || botResponse.includes('<|')) {
        botResponse = botResponse.split('<｜')[0].split('<|')[0].trim();
      }

      // Agregar indicador solo si la respuesta parece incompleta o predefinida
      const respuestaIncompleta = botResponse.length < 50 ||
                                  botResponse.includes('¿En qué puedo ayudarte') ||
                                  botResponse.includes('¿Cómo puedo ayudarte') ||
                                  botResponse.includes('procesando tu consulta');

      const botMessage = {
        id: Date.now() + 1,
        text: botResponse,
        sender: 'bot',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error en chatbot:', error);
      const errorMessage = {
        id: Date.now() + 1,
        text: 'Error de conexión: No pude conectarme al servidor de IA. Verifica tu conexión a internet e intenta nuevamente.',
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const clearHistory = async () => {
    try {
      await chatbotService.clearHistory();
      setMessages([]);
    } catch (error) {
      console.error('Error limpiando historial:', error);
    }
  };

  return (
    <>
      {/* Botón flotante */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 bg-emerald-600 hover:bg-emerald-700 text-white p-4 rounded-full shadow-lg transition-all duration-300 z-50 group"
          aria-label="Abrir chat del asistente"
        >
          <MessageCircle size={24} />
          <div className="absolute bottom-full right-0 mb-2 px-3 py-1 bg-gray-800 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
            Asistente agrícola
          </div>
        </button>
      )}

      {/* Ventana del chat */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-96 h-[500px] bg-white rounded-lg shadow-2xl z-50 flex flex-col">
          {/* Header */}
          <div className="bg-emerald-600 text-white p-4 rounded-t-lg flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <MessageCircle size={20} />
              <h3 className="font-semibold">Asistente Agrícola</h3>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={clearHistory}
                className="hover:bg-emerald-700 p-1 rounded transition-colors"
                aria-label="Limpiar conversación"
              >
                <Trash2 size={16} />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="hover:bg-emerald-700 p-1 rounded transition-colors"
                aria-label="Cerrar chat"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Mensajes */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 && !isLoadingHistory ? (
              <div className="text-center text-gray-600 mt-8">
                <MessageCircle size={48} className="mx-auto mb-4 text-emerald-300" />
                <p className="text-lg font-medium mb-2 text-gray-800">¡Hola! Soy tu asistente agrícola</p>
                <p className="text-sm text-gray-600">Pregúntame sobre semillas, insumos o cualquier tema agrícola.</p>
              </div>
            ) : messages.length === 0 && isLoadingHistory ? (
              <div className="text-center text-gray-600 mt-8">
                <div className="flex justify-center space-x-1 mb-4">
                  <div className="w-2 h-2 bg-emerald-600 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-emerald-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-emerald-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
                <p className="text-sm text-gray-600">Cargando conversación anterior...</p>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-lg ${
                      message.sender === 'user'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                    <span className="text-xs opacity-70 mt-1 block">
                      {message.timestamp.toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                </div>
              ))
            )}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 p-3 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-emerald-600 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-emerald-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-emerald-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex space-x-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Escribe tu mensaje..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-900 placeholder-gray-500"
                disabled={isLoading}
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isLoading}
                className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-400 text-white p-2 rounded-lg transition-colors"
                aria-label="Enviar mensaje"
              >
                <Send size={20} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Chatbot;