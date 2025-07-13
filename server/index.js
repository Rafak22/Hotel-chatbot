const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();
const axios = require('axios');
const dialogflow = require('dialogflow');
const uuid = require('uuid');
const QRCode = require('qrcode');
const router = express.Router();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// 1. Register QR code route FIRST
const qrCodeRoutes = require('./routes/qrcode');
app.use('/qrcode', qrCodeRoutes);

// 2. THEN serve React static files
app.use(express.static(path.join(__dirname, '../client/build')));

// 3. All other routes (API, catch-all, etc.)
const chatRoutes = require('./routes/chat');
const orderRoutes = require('./routes/orders');
const hotelRoutes = require('./routes/hotel');

// Routes
app.use('/api/chat', chatRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/hotel', hotelRoutes);

// Serve React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build/index.html'));
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  socket.on('join-room', (roomNumber) => {
    socket.join(`room-${roomNumber}`);
    console.log(`Client ${socket.id} joined room ${roomNumber}`);
  });

  socket.on('send-message', async (data) => {
    try {
      const { message, roomNumber, language = 'en' } = data;
      
      // Process message with AI assistant
      const response = await processMessage(message, roomNumber, language);
      
      // Emit response back to the room
      io.to(`room-${roomNumber}`).emit('receive-message', {
        type: 'assistant',
        content: response,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error processing message:', error);
      socket.emit('error', { message: 'Sorry, I encountered an error. Please try again.' });
    }
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Dialogflow setup
const DIALOGFLOW_PROJECT_ID = 'hotelassistant-lcym';
const KEYFILE = path.join(__dirname, '../hotelassistant-lcym-12969a919c28.json');
const sessionClient = new dialogflow.SessionsClient({ keyFilename: KEYFILE });

// Replace processMessage with Dialogflow integration
async function processMessage(message, roomNumber, language) {
  const sessionId = roomNumber || uuid.v4();
  const sessionPath = sessionClient.sessionPath(DIALOGFLOW_PROJECT_ID, sessionId);

  const request = {
    session: sessionPath,
    queryInput: {
      text: {
        text: message,
        languageCode: language || 'en',
      },
    },
  };

  try {
    const responses = await sessionClient.detectIntent(request);
    const result = responses[0].queryResult;
    return result.fulfillmentText;
  } catch (err) {
    console.error('Dialogflow API error:', err.message);
    return "Sorry, I'm having trouble connecting to the AI service right now.";
  }
}

// Response functions
function getRoomServiceResponse(language) {
  const responses = {
    en: "I'd be happy to help you with room service! Here's our menu:\n\n🍕 Pizzas: Margherita ($15), Pepperoni ($17), Vegetarian ($16)\n🍔 Burgers: Classic ($12), Chicken ($14), Veggie ($13)\n🍝 Pasta: Carbonara ($18), Bolognese ($19), Alfredo ($17)\n🥗 Salads: Caesar ($10), Greek ($11), Garden ($9)\n🍰 Desserts: Chocolate Cake ($8), Ice Cream ($6), Cheesecake ($9)\n\nJust tell me what you'd like and your room number, and I'll place the order for you!",
    es: "¡Me complace ayudarte con el servicio a la habitación! Aquí está nuestro menú:\n\n🍕 Pizzas: Margherita ($15), Pepperoni ($17), Vegetariana ($16)\n🍔 Hamburguesas: Clásica ($12), Pollo ($14), Vegetariana ($13)\n🍝 Pasta: Carbonara ($18), Boloñesa ($19), Alfredo ($17)\n🥗 Ensaladas: César ($10), Griega ($11), Jardín ($9)\n🍰 Postres: Pastel de Chocolate ($8), Helado ($6), Tarta de Queso ($9)\n\n¡Solo dime qué te gustaría y tu número de habitación, y haré el pedido por ti!",
    fr: "Je serais ravi de vous aider avec le service en chambre ! Voici notre menu :\n\n🍕 Pizzas : Margherita (15$), Pepperoni (17$), Végétarienne (16$)\n🍔 Burgers : Classique (12$), Poulet (14$), Végétarien (13$)\n🍝 Pâtes : Carbonara (18$), Bolognaise (19$), Alfredo (17$)\n🥗 Salades : César (10$), Grecque (11$), Jardin (9$)\n🍰 Desserts : Gâteau au Chocolat (8$), Glace (6$), Cheesecake (9$)\n\nDites-moi simplement ce que vous voulez et votre numéro de chambre, et je passerai la commande pour vous !",
    ar: "سأكون سعيداً بمساعدتك في خدمة الغرف! إليك قائمة الطعام:\n\n🍕 بيتزا: مارجريتا (15$)، بيبروني (17$)، نباتية (16$)\n🍔 برجر: كلاسيك (12$)، دجاج (14$)، نباتي (13$)\n🍝 معكرونة: كاربونارا (18$)، بولونيز (19$)، ألفريدو (17$)\n🥗 سلطات: قيصر (10$)، يونانية (11$)، حديقة (9$)\n🍰 حلويات: كيك شوكولاتة (8$)، آيس كريم (6$)، تشيز كيك (9$)\n\nفقط أخبرني ماذا تريد ورقم غرفتك، وسأقوم بطلب الطعام لك!"
  };
  return responses[language] || responses.en;
}

function getWiFiResponse(language) {
  const responses = {
    en: "Here's your WiFi information:\n\n📶 Network Name: Hotel_Guest_WiFi\n🔑 Password: Welcome2024!\n\nTo connect:\n1. Go to your device's WiFi settings\n2. Select 'Hotel_Guest_WiFi'\n3. Enter the password: Welcome2024!\n4. Accept the terms and conditions\n\nIf you have any issues, please let me know!",
    es: "Aquí está la información de tu WiFi:\n\n📶 Nombre de Red: Hotel_Guest_WiFi\n🔑 Contraseña: Welcome2024!\n\nPara conectar:\n1. Ve a la configuración de WiFi de tu dispositivo\n2. Selecciona 'Hotel_Guest_WiFi'\n3. Ingresa la contraseña: Welcome2024!\n4. Acepta los términos y condiciones\n\n¡Si tienes algún problema, házmelo saber!",
    fr: "Voici les informations WiFi :\n\n📶 Nom du réseau : Hotel_Guest_WiFi\n🔑 Mot de passe : Welcome2024!\n\nPour se connecter :\n1. Allez dans les paramètres WiFi de votre appareil\n2. Sélectionnez 'Hotel_Guest_WiFi'\n3. Entrez le mot de passe : Welcome2024!\n4. Acceptez les termes et conditions\n\nSi vous avez des problèmes, faites-le moi savoir !",
    ar: "إليك معلومات الواي فاي:\n\n📶 اسم الشبكة: Hotel_Guest_WiFi\n🔑 كلمة المرور: Welcome2024!\n\nللتواصل:\n1. اذهب إلى إعدادات الواي فاي في جهازك\n2. اختر 'Hotel_Guest_WiFi'\n3. أدخل كلمة المرور: Welcome2024!\n4. وافق على الشروط والأحكام\n\nإذا واجهت أي مشاكل، أخبرني!"
  };
  return responses[language] || responses.en;
}

function getHousekeepingResponse(language, roomNumber) {
  const responses = {
    en: `I've submitted a housekeeping request for room ${roomNumber}. Our housekeeping team will be notified immediately.\n\nWhat do you need?\n• Fresh towels\n• Extra toiletries (soap, shampoo, etc.)\n• Additional pillows or blankets\n• Room cleaning\n• Any other special requests\n\nPlease let me know the specific items you need, and I'll make sure they're delivered to your room as soon as possible!`,
    es: `He enviado una solicitud de limpieza para la habitación ${roomNumber}. Nuestro equipo de limpieza será notificado inmediatamente.\n\n¿Qué necesitas?\n• Toallas frescas\n• Artículos de aseo adicionales (jabón, champú, etc.)\n• Almohadas o mantas adicionales\n• Limpieza de habitación\n• Cualquier otra solicitud especial\n\n¡Por favor, dime los artículos específicos que necesitas, y me aseguraré de que se entreguen a tu habitación lo antes posible!`,
    fr: `J'ai soumis une demande de ménage pour la chambre ${roomNumber}. Notre équipe de ménage sera notifiée immédiatement.\n\nDe quoi avez-vous besoin ?\n• Serviettes fraîches\n• Articles de toilette supplémentaires (savon, shampooing, etc.)\n• Oreillers ou couvertures supplémentaires\n• Nettoyage de chambre\n• Toute autre demande spéciale\n\nDites-moi simplement les articles spécifiques dont vous avez besoin, et je m'assurerai qu'ils soient livrés dans votre chambre dès que possible !`,
    ar: `لقد أرسلت طلب تنظيف للغرفة ${roomNumber}. سيتم إخطار فريق التنظيف لدينا فوراً.\n\nماذا تحتاج؟\n• مناشف جديدة\n• مستلزمات إضافية (صابون، شامبو، إلخ)\n• وسائد أو أغطية إضافية\n• تنظيف الغرفة\n• أي طلبات خاصة أخرى\n\nأخبرني بالعناصر المحددة التي تحتاجها، وسأتأكد من توصيلها إلى غرفتك في أقرب وقت ممكن!`
  };
  return responses[language] || responses.en;
}

function getLateCheckoutResponse(language, roomNumber) {
  const responses = {
    en: `I'd be happy to help you with a late checkout request for room ${roomNumber}!\n\nWhat time would you like to check out?\n\nOur standard checkout time is 11:00 AM, but we can accommodate late checkout requests based on availability.\n\nPlease let me know your preferred checkout time, and I'll check availability and confirm with you.`,
    es: `¡Me complace ayudarte con una solicitud de salida tardía para la habitación ${roomNumber}!\n\n¿A qué hora te gustaría hacer el check-out?\n\nNuestra hora de salida estándar es a las 11:00 AM, pero podemos acomodar solicitudes de salida tardía según la disponibilidad.\n\nPor favor, dime tu hora de salida preferida, y verificaré la disponibilidad y te confirmaré.`,
    fr: `Je serais ravi de vous aider avec une demande de départ tardif pour la chambre ${roomNumber} !\n\nÀ quelle heure souhaitez-vous partir ?\n\nNotre heure de départ standard est 11h00, mais nous pouvons accommoder les demandes de départ tardif selon la disponibilité.\n\nDites-moi simplement votre heure de départ préférée, et je vérifierai la disponibilité et vous confirmerai.`,
    ar: `سأكون سعيداً بمساعدتك في طلب المغادرة المتأخرة للغرفة ${roomNumber}!\n\nفي أي وقت تريد المغادرة؟\n\nوقت المغادرة القياسي لدينا هو 11:00 صباحاً، لكن يمكننا استيعاب طلبات المغادرة المتأخرة حسب التوفر.\n\nأخبرني بوقت المغادرة المفضل لديك، وسأتحقق من التوفر وأؤكد لك.`
  };
  return responses[language] || responses.en;
}

function getLocalGuideResponse(language) {
  const responses = {
    en: "I'd love to help you explore the area! Here are some great nearby options:\n\n🏛️ **Attractions:**\n• City Museum (0.5 miles) - Open 9AM-6PM\n• Central Park (0.3 miles) - Beautiful walking trails\n• Art Gallery (0.8 miles) - Contemporary exhibitions\n\n🍽️ **Restaurants:**\n• La Trattoria (0.2 miles) - Italian cuisine\n• Sushi Master (0.4 miles) - Fresh sushi\n• The Grill House (0.6 miles) - Steaks & seafood\n\n🛍️ **Shopping:**\n• Downtown Mall (0.7 miles) - 100+ stores\n• Fashion District (1.2 miles) - Designer boutiques\n• Local Market (0.9 miles) - Artisan goods\n\nWould you like specific directions or recommendations for any of these places?",
    es: "¡Me encantaría ayudarte a explorar el área! Aquí tienes algunas excelentes opciones cercanas:\n\n🏛️ **Atracciones:**\n• Museo de la Ciudad (0.5 millas) - Abierto 9AM-6PM\n• Parque Central (0.3 millas) - Hermosos senderos para caminar\n• Galería de Arte (0.8 millas) - Exposiciones contemporáneas\n\n🍽️ **Restaurantes:**\n• La Trattoria (0.2 millas) - Cocina italiana\n• Sushi Master (0.4 millas) - Sushi fresco\n• The Grill House (0.6 millas) - Carnes y mariscos\n\n🛍️ **Compras:**\n• Centro Comercial Downtown (0.7 millas) - 100+ tiendas\n• Distrito de la Moda (1.2 millas) - Boutiques de diseñador\n• Mercado Local (0.9 millas) - Productos artesanales\n\n¿Te gustaría direcciones específicas o recomendaciones para alguno de estos lugares?",
    fr: "J'adorerais vous aider à explorer la région ! Voici quelques excellentes options à proximité :\n\n🏛️ **Attractions :**\n• Musée de la Ville (0.8 km) - Ouvert 9h-18h\n• Parc Central (0.5 km) - Magnifiques sentiers de randonnée\n• Galerie d'Art (1.3 km) - Expositions contemporaines\n\n🍽️ **Restaurants :**\n• La Trattoria (0.3 km) - Cuisine italienne\n• Sushi Master (0.6 km) - Sushi frais\n• The Grill House (1.0 km) - Steaks et fruits de mer\n\n🛍️ **Shopping :**\n• Centre Commercial Downtown (1.1 km) - 100+ magasins\n• District de la Mode (1.9 km) - Boutiques de créateurs\n• Marché Local (1.4 km) - Produits artisanaux\n\nSouhaitez-vous des directions spécifiques ou des recommandations pour l'un de ces endroits ?",
    ar: "أحب مساعدتك في استكشاف المنطقة! إليك بعض الخيارات الرائعة القريبة:\n\n🏛️ **المعالم السياحية:**\n• متحف المدينة (0.5 ميل) - مفتوح 9ص-6م\n• الحديقة المركزية (0.3 ميل) - مسارات مشي جميلة\n• معرض الفن (0.8 ميل) - معارض معاصرة\n\n🍽️ **المطاعم:**\n• لا تراتوريا (0.2 ميل) - مطبخ إيطالي\n• سوشي ماستر (0.4 ميل) - سوشي طازج\n• ذا غريل هاوس (0.6 ميل) - ستيك ومأكولات بحرية\n\n🛍️ **التسوق:**\n• مول وسط المدينة (0.7 ميل) - 100+ متجر\n• حي الأزياء (1.2 ميل) - محلات مصممين\n• السوق المحلي (0.9 ميل) - منتجات حرفية\n\nهل تريد اتجاهات محددة أو توصيات لأي من هذه الأماكن؟"
  };
  return responses[language] || responses.en;
}

function getFacilitiesResponse(language) {
  const responses = {
    en: "Here's information about our hotel facilities:\n\n🏊‍♂️ **Swimming Pool:**\n• Open: 6:00 AM - 10:00 PM\n• Location: 3rd floor\n• Towels provided\n\n💪 **Fitness Center:**\n• Open: 24/7\n• Location: 2nd floor\n• Equipment: Treadmills, weights, yoga studio\n\n💆‍♀️ **Spa & Wellness:**\n• Open: 9:00 AM - 8:00 PM\n• Services: Massage, facial, sauna\n• Booking required\n\n🍽️ **Restaurants:**\n• Main Restaurant: 6:30 AM - 10:30 PM\n• Rooftop Bar: 4:00 PM - 12:00 AM\n• Room Service: 24/7\n\n🏢 **Business Center:**\n• Open: 7:00 AM - 9:00 PM\n• Printing, fax, meeting rooms available\n\nWould you like to make a reservation for any of these facilities?",
    es: "Aquí tienes información sobre las instalaciones de nuestro hotel:\n\n🏊‍♂️ **Piscina:**\n• Abierta: 6:00 AM - 10:00 PM\n• Ubicación: 3er piso\n• Toallas proporcionadas\n\n💪 **Centro de Fitness:**\n• Abierto: 24/7\n• Ubicación: 2do piso\n• Equipamiento: Cintas de correr, pesas, estudio de yoga\n\n💆‍♀️ **Spa y Bienestar:**\n• Abierto: 9:00 AM - 8:00 PM\n• Servicios: Masaje, facial, sauna\n• Reserva requerida\n\n🍽️ **Restaurantes:**\n• Restaurante Principal: 6:30 AM - 10:30 PM\n• Bar en la Azotea: 4:00 PM - 12:00 AM\n• Servicio a la Habitación: 24/7\n\n🏢 **Centro de Negocios:**\n• Abierto: 7:00 AM - 9:00 PM\n• Impresión, fax, salas de reuniones disponibles\n\n¿Te gustaría hacer una reserva para alguna de estas instalaciones?",
    fr: "Voici les informations sur les installations de notre hôtel :\n\n🏊‍♂️ **Piscine :**\n• Ouvert : 6h00 - 22h00\n• Emplacement : 3e étage\n• Serviettes fournies\n\n💪 **Centre de Fitness :**\n• Ouvert : 24h/24, 7j/7\n• Emplacement : 2e étage\n• Équipement : Tapis de course, poids, studio de yoga\n\n💆‍♀️ **Spa et Bien-être :**\n• Ouvert : 9h00 - 20h00\n• Services : Massage, soin du visage, sauna\n• Réservation requise\n\n🍽️ **Restaurants :**\n• Restaurant Principal : 6h30 - 22h30\n• Bar sur le Toit : 16h00 - 00h00\n• Service en Chambre : 24h/24, 7j/7\n\n🏢 **Centre d'Affaires :**\n• Ouvert : 7h00 - 21h00\n• Impression, fax, salles de réunion disponibles\n\nSouhaitez-vous faire une réservation pour l'une de ces installations ?",
    ar: "إليك معلومات عن مرافق الفندق:\n\n🏊‍♂️ **المسبح:**\n• مفتوح: 6:00 صباحاً - 10:00 مساءً\n• الموقع: الطابق الثالث\n• مناشف متوفرة\n\n💪 **مركز اللياقة:**\n• مفتوح: 24/7\n• الموقع: الطابق الثاني\n• المعدات: أجهزة مشي، أوزان، استوديو يوغا\n\n💆‍♀️ **السبا والعافية:**\n• مفتوح: 9:00 صباحاً - 8:00 مساءً\n• الخدمات: تدليك، عناية بالوجه، ساونا\n• الحجز مطلوب\n\n🍽️ **المطاعم:**\n• المطعم الرئيسي: 6:30 صباحاً - 10:30 مساءً\n• بار السطح: 4:00 مساءً - 12:00 منتصف الليل\n• خدمة الغرف: 24/7\n\n🏢 **مركز الأعمال:**\n• مفتوح: 7:00 صباحاً - 9:00 مساءً\n• طباعة، فاكس، غرف اجتماعات متوفرة\n\nهل تريد حجز أي من هذه المرافق؟"
  };
  return responses[language] || responses.en;
}

function getGreetingResponse(language) {
  const responses = {
    en: "Hello! 👋 Welcome to our hotel! I'm your personal virtual assistant, here to make your stay as comfortable and enjoyable as possible.\n\nI can help you with:\n• 🍽️ Room service and dining\n• 📶 WiFi information\n• 🧹 Housekeeping requests\n• ⏰ Late checkout arrangements\n• 🗺️ Local area recommendations\n• 🏊‍♂️ Hotel facilities information\n• 💬 General assistance\n\nHow can I assist you today?",
    es: "¡Hola! 👋 ¡Bienvenido a nuestro hotel! Soy tu asistente virtual personal, aquí para hacer tu estadía lo más cómoda y agradable posible.\n\nPuedo ayudarte con:\n• 🍽️ Servicio a la habitación y restaurantes\n• 📶 Información de WiFi\n• 🧹 Solicitudes de limpieza\n• ⏰ Arreglos de salida tardía\n• 🗺️ Recomendaciones del área local\n• 🏊‍♂️ Información de instalaciones del hotel\n• 💬 Asistencia general\n\n¿Cómo puedo ayudarte hoy?",
    fr: "Bonjour ! 👋 Bienvenue dans notre hôtel ! Je suis votre assistant virtuel personnel, ici pour rendre votre séjour aussi confortable et agréable que possible.\n\nJe peux vous aider avec :\n• 🍽️ Service en chambre et restauration\n• 📶 Informations WiFi\n• 🧹 Demandes de ménage\n• ⏰ Arrangements de départ tardif\n• 🗺️ Recommandations de la région\n• 🏊‍♂️ Informations sur les installations de l'hôtel\n• 💬 Assistance générale\n\nComment puis-je vous aider aujourd'hui ?",
    ar: "مرحباً! 👋 أهلاً وسهلاً في فندقنا! أنا مساعدك الافتراضي الشخصي، هنا لجعل إقامتك مريحة وممتعة قدر الإمكان.\n\nيمكنني مساعدتك في:\n• 🍽️ خدمة الغرف والمطاعم\n• 📶 معلومات الواي فاي\n• 🧹 طلبات التنظيف\n• ⏰ ترتيبات المغادرة المتأخرة\n• 🗺️ توصيات المنطقة المحلية\n• 🏊‍♂️ معلومات مرافق الفندق\n• 💬 المساعدة العامة\n\nكيف يمكنني مساعدتك اليوم؟"
  };
  return responses[language] || responses.en;
}

function getDefaultResponse(language) {
  const responses = {
    en: "I'm here to help! I can assist you with room service, WiFi information, housekeeping requests, late checkout, local recommendations, hotel facilities, and more. Just let me know what you need!",
    es: "¡Estoy aquí para ayudar! Puedo ayudarte con servicio a la habitación, información de WiFi, solicitudes de limpieza, salida tardía, recomendaciones locales, instalaciones del hotel y más. ¡Solo dime qué necesitas!",
    fr: "Je suis là pour vous aider ! Je peux vous assister avec le service en chambre, les informations WiFi, les demandes de ménage, le départ tardif, les recommandations locales, les installations de l'hôtel et plus encore. Dites-moi simplement ce dont vous avez besoin !",
    ar: "أنا هنا للمساعدة! يمكنني مساعدتك في خدمة الغرف، معلومات الواي فاي، طلبات التنظيف، المغادرة المتأخرة، التوصيات المحلية، مرافق الفندق والمزيد. فقط أخبرني ماذا تحتاج!"
  };
  return responses[language] || responses.en;
}

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Hotel Virtual Assistant server running on port ${PORT}`);
  console.log(`📱 QR Code URL: http://localhost:${PORT}`);
}); 