import React, { useState, useEffect, useRef } from 'react';
import { FiSend, FiWifi, FiCoffee, FiHome, FiMapPin, FiClock, FiInfo } from 'react-icons/fi';
import ReactMarkdown from 'react-markdown';

const ChatInterface = ({ socket, roomNumber, language, onLanguageChange }) => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const messagesEndRef = useRef(null);

  const quickActions = [
    { text: '🍽️ Room Service', icon: <FiCoffee /> },
    { text: '📶 WiFi Info', icon: <FiWifi /> },
    { text: '🧹 Housekeeping', icon: <FiHome /> },
    { text: '🗺️ Local Guide', icon: <FiMapPin /> },
    { text: '⏰ Late Checkout', icon: <FiClock /> },
    { text: '🏊‍♂️ Facilities', icon: <FiInfo /> }
  ];

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Español' },
    { code: 'fr', name: 'Français' },
    { code: 'ar', name: 'العربية' }
  ];

  useEffect(() => {
    if (!socket) return;

    const handleConnect = () => {
      setIsConnected(true);
      addMessage({
        type: 'assistant',
        content: getWelcomeMessage(language),
        timestamp: new Date().toISOString()
      });
    };
    const handleDisconnect = () => setIsConnected(false);
    const handleReceiveMessage = (message) => addMessage(message);
    const handleError = (error) => {
      addMessage({
        type: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date().toISOString()
      });
    };

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('receive-message', handleReceiveMessage);
    socket.on('error', handleError);

    // Cleanup listeners on unmount or dependency change
    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('receive-message', handleReceiveMessage);
      socket.off('error', handleError);
    };
  }, [socket, language]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const addMessage = (message) => {
    setMessages(prev => [...prev, message]);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = () => {
    if (!inputMessage.trim() || !socket) return;

    const message = {
      type: 'user',
      content: inputMessage,
      timestamp: new Date().toISOString()
    };

    addMessage(message);
    socket.emit('send-message', {
      message: inputMessage,
      roomNumber,
      language
    });

    setInputMessage('');
  };

  const handleQuickAction = (action) => {
    setInputMessage(action.text);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const getWelcomeMessage = (lang) => {
    const messages = {
      en: "Hello! 👋 Welcome to our hotel! I'm your personal virtual assistant, here to make your stay as comfortable and enjoyable as possible.\n\nI can help you with:\n• 🍽️ Room service and dining\n• 📶 WiFi information\n• 🧹 Housekeeping requests\n• ⏰ Late checkout arrangements\n• 🗺️ Local area recommendations\n• 🏊‍♂️ Hotel facilities information\n• 💬 General assistance\n\nHow can I assist you today?",
      es: "¡Hola! 👋 ¡Bienvenido a nuestro hotel! Soy tu asistente virtual personal, aquí para hacer tu estadía lo más cómoda y agradable posible.\n\nPuedo ayudarte con:\n• 🍽️ Servicio a la habitación y restaurantes\n• 📶 Información de WiFi\n• 🧹 Solicitudes de limpieza\n• ⏰ Arreglos de salida tardía\n• 🗺️ Recomendaciones del área local\n• 🏊‍♂️ Información de instalaciones del hotel\n• 💬 Asistencia general\n\n¿Cómo puedo ayudarte hoy?",
      fr: "Bonjour ! 👋 Bienvenue dans notre hôtel ! Je suis votre assistant virtuel personnel, ici pour rendre votre séjour aussi confortable et agréable que possible.\n\nJe peux vous aider avec :\n• 🍽️ Service en chambre et restauration\n• 📶 Informations WiFi\n• 🧹 Demandes de ménage\n• ⏰ Arrangements de départ tardif\n• 🗺️ Recommandations de la région\n• 🏊‍♂️ Informations sur les installations de l'hôtel\n• 💬 Assistance générale\n\nComment puis-je vous aider aujourd'hui ?",
      ar: "مرحباً! 👋 أهلاً وسهلاً في فندقنا! أنا مساعدك الافتراضي الشخصي، هنا لجعل إقامتك مريحة وممتعة قدر الإمكان.\n\nيمكنني مساعدتك في:\n• 🍽️ خدمة الغرف والمطاعم\n• 📶 معلومات الواي فاي\n• 🧹 طلبات التنظيف\n• ⏰ ترتيبات المغادرة المتأخرة\n• 🗺️ توصيات المنطقة المحلية\n• 🏊‍♂️ معلومات مرافق الفندق\n• 💬 المساعدة العامة\n\nكيف يمكنني مساعدتك اليوم؟"
    };
    return messages[lang] || messages.en;
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <h2>🏨 Room {roomNumber} Assistant</h2>
        <div className="language-selector">
          <span>🌐</span>
          <select 
            value={language} 
            onChange={(e) => onLanguageChange(e.target.value)}
          >
            {languages.map(lang => (
              <option key={lang.code} value={lang.code}>
                {lang.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="chat-messages">
        <div className="quick-actions">
          {quickActions.map((action, index) => (
            <button
              key={index}
              className="quick-action"
              onClick={() => handleQuickAction(action)}
            >
              {action.icon} {action.text}
            </button>
          ))}
        </div>

        {messages.map((message, index) => (
          <div key={index} className={`message ${message.type}`}>
            <div className="message-avatar">
              {message.type === 'user' ? '👤' : '🤖'}
            </div>
            <div className="message-content">
              <ReactMarkdown>{message.content}</ReactMarkdown>
              <div className="message-time">
                {formatTime(message.timestamp)}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input">
        <textarea
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={language === 'ar' ? "اكتب رسالتك هنا..." : "Type your message here..."}
          rows="1"
        />
        <button
          className="send-button"
          onClick={sendMessage}
          disabled={!inputMessage.trim() || !isConnected}
        >
          <FiSend />
        </button>
      </div>

      <div className={`connection-status ${isConnected ? 'connected' : 'disconnected'}`}>
        {isConnected ? '🟢 Connected' : '🔴 Disconnected'}
      </div>
    </div>
  );
};

export default ChatInterface; 