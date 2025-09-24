const express = require('express');

const app = express();
const PORT = 3000;

app.use(express.json());

// In-memory storage for feedback and orders (in production, use a database)
const storage = {
  negativeFeedback: [],
  orders: []
};

// Placeholder function to add client to bubble tea store database
const addClientToDatabase = async (clientData) => {
  try {
    console.log('📝 Would add client to database:', clientData);
    
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const success = Math.random() > 0.1;
    
    if (success) {
      console.log('✅ Client registration successful (simulated)');
      return true;
    } else {
      console.log('❌ Client registration failed (simulated)');
      return false;
    }
  } catch (error) {
    console.error('Error adding client to database:', error);
    return false;
  }
};

// Function to create a new bubble tea order
const createBubbleTeaOrder = async (orderData) => {
  try {
    console.log('🧋 Creating new bubble tea order:', orderData);
    
    // Validate required fields
    if (!orderData.clientName || !orderData.teaType || !orderData.sugarPercentage) {
      throw new Error('Client name, tea type, and sugar percentage are required');
    }

    // Create order object with metadata
    const order = {
      orderId: generateOrderId(),
      clientName: orderData.clientName.trim(),
      phone: orderData.phone ? orderData.phone.trim() : null,
      teaType: orderData.teaType.trim(),
      sugarPercentage: orderData.sugarPercentage,
      iceLevel: orderData.iceLevel || 'normal', // low, normal, extra, none
      size: orderData.size || 'medium', // small, medium, large
      toppings: orderData.toppings || [], // array of toppings
      specialInstructions: orderData.specialInstructions || '',
      orderDate: new Date().toISOString(),
      estimatedReadyTime: new Date(Date.now() + 15 * 60000).toISOString(), // 15 minutes from now
      status: 'received', // received, preparing, ready, completed
      totalPrice: calculateOrderPrice(orderData),
      source: 'whatsapp_bot'
    };

    // Store order (in production, save to database)
    storage.orders.push(order);
    
    // Simulate order processing delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    console.log('✅ Order created successfully');
    return {
      success: true,
      order: order,
      message: 'Order received successfully'
    };
    
  } catch (error) {
    console.error('Error creating order:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Calculate order price based on selections
const calculateOrderPrice = (orderData) => {
  let basePrice = 0;
  
  // Base price by size
  switch (orderData.size) {
    case 'small': basePrice = 4.50; break;
    case 'large': basePrice = 6.50; break;
    default: basePrice = 5.50; // medium
  }
  
  // Add toppings (each topping costs $0.75)
  const toppingsPrice = (orderData.toppings ? orderData.toppings.length : 0) * 0.75;
  
  return basePrice + toppingsPrice;
};

// Generate unique order ID
const generateOrderId = () => {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `ORD${timestamp}${random}`;
};

// Function to collect and store negative feedback
const collectNegativeFeedback = async (feedbackData) => {
  try {
    console.log('📋 Collecting negative feedback:', feedbackData);
    
    if (!feedbackData.clientName || !feedbackData.feedback) {
      throw new Error('Client name and feedback are required');
    }

    const feedbackEntry = {
      id: generateFeedbackId(),
      clientName: feedbackData.clientName.trim(),
      feedback: feedbackData.feedback.trim(),
      email: feedbackData.email ? feedbackData.email.trim() : null,
      phone: feedbackData.phone ? feedbackData.phone.trim() : null,
      rating: feedbackData.rating || null,
      category: feedbackData.category || 'general',
      date: new Date().toISOString(),
      status: 'new',
      source: 'whatsapp_bot'
    };

    storage.negativeFeedback.push(feedbackEntry);
    
    await new Promise(resolve => setTimeout(resolve, 300));
    
    console.log('✅ Negative feedback stored successfully');
    return {
      success: true,
      feedbackId: feedbackEntry.id,
      message: 'Gracias por tus comentarios. Los revisaremos pronto.'
    };
    
  } catch (error) {
    console.error('Error collecting negative feedback:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Generate unique feedback ID
const generateFeedbackId = () => {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `FB${timestamp}${random}`;
};

// Function to generate a simple client ID
const generateClientId = () => {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `BUBBLE${timestamp}${random}`;
};

// Route to handle bubble tea orders
app.post('/place-order', async (req, res) => {
  try {
    const {
      clientName,
      phone,
      teaType,
      sugarPercentage,
      iceLevel,
      size,
      toppings,
      specialInstructions
    } = req.body;

    // Validate required fields
    if (!clientName || !teaType || !sugarPercentage) {
      return res.status(400).json({
        error: "Missing required fields: clientName, teaType, and sugarPercentage are required"
      });
    }

    // Log received order data
    console.log("🧋 Received new order:");
    console.log("👤 Client Name:", clientName);
    console.log("📞 Phone:", phone || "Not provided");
    console.log("🍵 Tea Type:", teaType);
    console.log("🍯 Sugar Percentage:", sugarPercentage + "%");
    console.log("🧊 Ice Level:", iceLevel || "normal");
    console.log("📏 Size:", size || "medium");
    console.log("🍡 Toppings:", toppings ? toppings.join(', ') : "None");
    console.log("📝 Special Instructions:", specialInstructions || "None");

    // Create the order
    const orderResult = await createBubbleTeaOrder({
      clientName,
      phone,
      teaType,
      sugarPercentage,
      iceLevel,
      size,
      toppings,
      specialInstructions
    });

    if (orderResult.success) {
      const order = orderResult.order;
      
      // Success response - CLIENT FACING IN SPANISH
      const rawData = {
        "order_status": "received",
        "order_id": order.orderId,
        "order_details": {
          "client_name": clientName,
          "tea_type": teaType,
          "sugar_percentage": sugarPercentage,
          "ice_level": iceLevel,
          "size": size,
          "toppings": toppings,
          "special_instructions": specialInstructions,
          "order_date": order.orderDate,
          "estimated_ready_time": order.estimatedReadyTime,
          "total_price": order.totalPrice
        }
      };

      let description = `🧋 **¡Pedido Confirmado!**\n\n`;
      description += `✅ Hemos recibido tu pedido correctamente.\n\n`;
      description += `🔑 **Número de Pedido:** ${order.orderId}\n`;
      description += `💰 **Total:** $${order.totalPrice.toFixed(2)}\n\n`;
      description += `📋 **Detalles de tu pedido:**\n`;
      description += `• 👤 Nombre: ${clientName}\n`;
      if (phone) description += `• 📞 Teléfono: ${phone}\n`;
      description += `• 🍵 Tipo de Té: ${teaType}\n`;
      description += `• 🍯 Azúcar: ${sugarPercentage}%\n`;
      description += `• 🧊 Hielo: ${iceLevel || 'normal'}\n`;
      description += `• 📏 Tamaño: ${size || 'medium'}\n`;
      if (toppings && toppings.length > 0) {
        description += `• 🍡 Toppings: ${toppings.join(', ')}\n`;
      }
      if (specialInstructions) {
        description += `• 📝 Instrucciones: ${specialInstructions}\n`;
      }
      description += `• ⏰ Hora del pedido: ${new Date(order.orderDate).toLocaleTimeString('es-ES')}\n`;
      description += `• 🕐 Tiempo estimado: 15-20 minutos\n\n`;
      description += `📍 **Para recoger en:** The Bubble Tea Shop\n`;
      description += `📞 **Teléfono de la tienda:** +1 (555) 123-TEA\n\n`;
      description += `¡Gracias por tu pedido! 🧋✨`;

      res.json({
        raw: rawData,
        markdown: "...",
        type: "markdown",
        desc: description
      });
    } else {
      // Failure response - CLIENT FACING IN SPANISH
      let description = `❌ **Error al Procesar Pedido**\n\n`;
      description += `Lo sentimos, ocurrió un error al procesar tu pedido.\n\n`;
      description += `Por favor, verifica que todos los datos estén correctos e intenta nuevamente.`;

      res.json({
        raw: { error: orderResult.error },
        markdown: "...",
        type: "markdown",
        desc: description
      });
    }
  } catch (error) {
    console.error("Error processing order:", error);
    
    let description = `❌ **Error del Sistema**\n\n`;
    description += `Ocurrió un error inesperado al procesar tu pedido. Por favor, intenta más tarde.`;

    res.json({
      raw: { error: error.message },
      markdown: "...", 
      type: "markdown",
      desc: description
    });
  }
});

// Route to handle negative feedback collection
app.post('/negative-feedback', async (req, res) => {
  try {
    const {
      clientName,
      feedback,
      email,
      phone,
      rating,
      category
    } = req.body;

    if (!clientName || !feedback) {
      return res.status(400).json({
        error: "Missing required fields: clientName and feedback are required"
      });
    }

    console.log("📋 Received negative feedback:");
    console.log("👤 Client Name:", clientName);
    console.log("💬 Feedback:", feedback);
    console.log("📧 Email:", email || "Not provided");
    console.log("📞 Phone:", phone || "Not provided");
    console.log("⭐ Rating:", rating || "Not provided");
    console.log("🏷️ Category:", category || "general");

    const feedbackResult = await collectNegativeFeedback({
      clientName,
      feedback,
      email,
      phone,
      rating,
      category
    });

    if (feedbackResult.success) {
      const rawData = {
        "feedback_status": "received",
        "feedback_id": feedbackResult.feedbackId,
        "feedback_data": {
          "client_name": clientName,
          "feedback": feedback,
          "email": email,
          "phone": phone,
          "rating": rating,
          "category": category,
          "submission_date": new Date().toISOString()
        }
      };

      let description = `📋 **Gracias por tus Comentarios**\n\n`;
      description += `Agradecemos que te tomes el tiempo para compartir tu experiencia con nosotros.\n\n`;
      description += `🔑 **ID de Referencia:** ${feedbackResult.feedbackId}\n\n`;
      description += `📝 **Hemos recibido tus comentarios:**\n`;
      description += `• 👤 Nombre: ${clientName}\n`;
      description += `• 💬 Comentarios: ${feedback}\n`;
      if (email) description += `• 📧 Email: ${email}\n`;
      if (phone) description += `• 📞 Teléfono: ${phone}\n`;
      if (rating) description += `• ⭐ Calificación: ${rating}/5\n`;
      description += `• 🏷️ Categoría: ${category || 'general'}\n\n`;
      description += `Tomamos todos los comentarios seriamente y revisaremos tus observaciones cuidadosamente.\n\n`;
      description += `🙏 ¡Gracias por ayudarnos a mejorar nuestro servicio!`;

      res.json({
        raw: rawData,
        markdown: "...",
        type: "markdown",
        desc: description
      });
    } else {
      let description = `❌ **Error al Procesar Comentarios**\n\n`;
      description += `Lo sentimos, ocurrió un error al procesar tus comentarios.\n\n`;
      description += `Por favor, intenta nuevamente en unos minutos.`;

      res.json({
        raw: { error: feedbackResult.error },
        markdown: "...",
        type: "markdown",
        desc: description
      });
    }
  } catch (error) {
    console.error("Error processing negative feedback:", error);
    
    let description = `❌ **Error del Sistema**\n\n`;
    description += `Ocurrió un error inesperado. Por favor, intenta más tarde.`;

    res.json({
      raw: { error: error.message },
      markdown: "...", 
      type: "markdown",
      desc: description
    });
  }
});

// Route to handle bubble tea client registration
app.post('/register-client', async (req, res) => {
  try {
    const {
      fullName,
      phone,
      email,
      favoriteDrink,
      preferences
    } = req.body;

    if (!fullName || !phone) {
      return res.status(400).json({
        error: "Missing required fields: fullName and phone are required"
      });
    }

    console.log("🧋 Received client registration data:");
    console.log("👤 Name:", fullName);
    console.log("📞 Phone:", phone);
    console.log("📧 Email:", email || "Not provided");
    console.log("🥤 Favorite Drink:", favoriteDrink || "Not specified");

    const clientId = generateClientId();

    const clientData = {
      clientId,
      fullName: fullName.trim(),
      phone: phone.trim(),
      email: email ? email.trim() : null,
      favoriteDrink: favoriteDrink ? favoriteDrink.trim() : null,
      preferences: preferences || [],
      registrationDate: new Date().toISOString(),
      source: 'whatsapp_bot'
    };

    const registrationSuccess = await addClientToDatabase(clientData);

    if (registrationSuccess) {
      const rawData = {
        "registration_status": "success",
        "client_id": clientId,
        "client_data": {
          "full_name": fullName,
          "phone": phone,
          "email": email,
          "favorite_drink": favoriteDrink,
          "registration_date": new Date().toISOString()
        }
      };

      let description = `🧋 **¡Bienvenido a The Bubble Tea Shop!**\n\n`;
      description += `🎉 ¡Ya estás oficialmente registrado, ${fullName}!\n\n`;
      description += `📋 **Detalles de tu registro:**\n`;
      description += `• 🔑 ID de Cliente: **${clientId}**\n`;
      description += `• 👤 Nombre: ${fullName}\n`;
      description += `• 📞 Teléfono: ${phone}\n`;
      if (email) description += `• 📧 Email: ${email}\n`;
      if (favoriteDrink) description += `• 🧋 Bebida Favorita: ${favoriteDrink}\n`;
      description += `• 📅 Fecha de Registro: ${new Date().toLocaleDateString('es-ES')}\n\n`;
      description += `💫 **¿Qué sigue?**\n`;
      description += `• Muestra este mensaje para un 10% de descuento en tu primera visita\n`;
      description += `• Acumularás puntos con cada compra\n`;
      description += `• Recibirás ofertas exclusivas para miembros\n\n`;
      description += `¡Estamos emocionados de tenerte! ¡Te esperamos pronto! 🧋✨`;

      res.json({
        raw: rawData,
        markdown: "...",
        type: "markdown",
        desc: description
      });
    } else {
      const rawData = {
        "registration_status": "failed",
        "client_id": clientId,
        "error": "Database registration failed"
      };

      let description = `❌ **Registro Incompleto**\n\n`;
      description += `Encontramos un problema temporal y no pudimos completar tu registro.\n\n`;
      description += `🔑 Referencia Temporal: **${clientId}**\n\n`;
      description += `📋 **Detalles que recibimos:**\n`;
      description += `• 👤 Nombre: ${fullName}\n`;
      description += `• 📞 Teléfono: ${phone}\n`;
      if (email) description += `• 📧 Email: ${email}\n`;
      if (favoriteDrink) description += `• 🧋 Bebida Favorita: ${favoriteDrink}\n\n`;
      description += `Por favor, intenta nuevamente en unos minutos o habla con nuestro personal en la tienda. ¡Disculpa las molestias!`;

      res.json({
        raw: rawData,
        markdown: "...",
        type: "markdown",
        desc: description
      });
    }
  } catch (error) {
    console.error("Error in client registration:", error);
    
    let description = `❌ **Error del Sistema**\n\n`;
    description += `Ocurrió un error inesperado durante el registro. Por favor, intenta más tarde.`;

    res.json({
      raw: { error: error.message },
      markdown: "...",
      type: "markdown",
      desc: description
    });
  }
});

// Admin endpoint to view all orders
app.get('/admin/orders', (req, res) => {
  try {
    res.json({
      total_orders: storage.orders.length,
      orders: storage.orders
    });
  } catch (error) {
    console.error("Error retrieving orders:", error);
    res.status(500).json({
      error: "Error retrieving orders"
    });
  }
});

// Additional endpoint to check client status
app.post('/check-client', async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({
        error: "Phone number is required"
      });
    }

    console.log(`🔍 Checking client status for phone: ${phone}`);
    
    const isRegistered = Math.random() > 0.5;
    
    if (isRegistered) {
      let description = `✅ **Cliente Registrado**\n\n`;
      description += `Encontramos tu registro en nuestro sistema.\n\n`;
      description += `📞 Teléfono: ${phone}\n`;
      description += `🎉 ¡Gracias por ser parte de The Bubble Tea Shop!`;

      res.json({
        status: "registered",
        desc: description
      });
    } else {
      let description = `❌ **Cliente No Encontrado**\n\n`;
      description += `No encontramos un registro con ese número de teléfono.\n\n`;
      description += `¿Te gustaría registrarte ahora?`;

      res.json({
        status: "not_registered", 
        desc: description
      });
    }
  } catch (error) {
    console.error("Error checking client:", error);
    
    let description = `❌ **Error del Sistema**\n\n`;
    description += `Ocurrió un error al verificar tu registro. Por favor, intenta más tarde.`;

    res.json({
      status: "error",
      desc: description
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Bubble Tea Shop System is running',
    timestamp: new Date().toISOString(),
    endpoints: [
      'POST /register-client',
      'POST /check-client',
      'POST /place-order',
      'POST /negative-feedback',
      'GET /admin/orders',
      'GET /admin/feedback',
      'GET /health'
    ],
    stats: {
      total_clients: 'N/A', // Would come from database
      total_orders: storage.orders.length,
      total_feedback: storage.negativeFeedback.length
    }
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    service: 'Bubble Tea Shop System',
    version: '1.2.0',
    description: 'WhatsApp bot backend for client registration, orders, and feedback',
    endpoints: {
      'POST /register-client': 'Register a new client',
      'POST /check-client': 'Check if a client is registered',
      'POST /place-order': 'Place a new bubble tea order',
      'POST /negative-feedback': 'Collect negative feedback from clients',
      'GET /admin/orders': 'View all orders (internal)',
      'GET /admin/feedback': 'View all feedback (internal)',
      'GET /health': 'Health check'
    }
  });
});

// Initialize server
app.listen(PORT, (error) => {
  if (!error) {
    console.log(`🧋 Bubble Tea Shop System running on http://localhost:${PORT}`);
    console.log(`🏥 Health check: http://localhost:${PORT}/health`);
    console.log(`📝 Registration: POST http://localhost:${PORT}/register-client`);
    console.log(`🛒 Place order: POST http://localhost:${PORT}/place-order`);
    console.log(`📋 Feedback: POST http://localhost:${PORT}/negative-feedback`);
    console.log(`🔍 Check client: POST http://localhost:${PORT}/check-client`);
    console.log(`👨‍💼 Admin orders: GET http://localhost:${PORT}/admin/orders`);
  } else {
    console.log("❌ Error occurred, server can't start", error);
  }
});

module.exports = app;