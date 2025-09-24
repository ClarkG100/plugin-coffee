const express = require('express');

const app = express();
const PORT = 3000;

app.use(express.json());

// In-memory storage for feedback (in production, use a database)
const feedbackStorage = {
  negativeFeedback: []
};

// Placeholder function to add client to bubble tea store database
const addClientToDatabase = async (clientData) => {
  try {
    console.log('📝 Would add client to database:', clientData);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Simulate success (90% success rate for testing)
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

// Function to collect and store negative feedback
const collectNegativeFeedback = async (feedbackData) => {
  try {
    console.log('📋 Collecting negative feedback:', feedbackData);
    
    // Validate required fields
    if (!feedbackData.clientName || !feedbackData.feedback) {
      throw new Error('Client name and feedback are required');
    }

    // Create feedback object with metadata
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

    // Store feedback (in production, save to database)
    feedbackStorage.negativeFeedback.push(feedbackEntry);
    
    // Simulate processing delay
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
  return `BUBBLE${timestamp}${random}`; // Changed from CAFE to BUBBLE
};

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

    // Validate required fields
    if (!clientName || !feedback) {
      return res.status(400).json({
        error: "Missing required fields: clientName and feedback are required",
        details: "Please provide your name and feedback description"
      });
    }

    // Log received feedback data
    console.log("📋 Received negative feedback:");
    console.log("👤 Client Name:", clientName);
    console.log("💬 Feedback:", feedback);
    console.log("📧 Email:", email || "Not provided");
    console.log("📞 Phone:", phone || "Not provided");
    console.log("⭐ Rating:", rating || "Not provided");
    console.log("🏷️ Category:", category || "general");

    // Collect and store feedback
    const feedbackResult = await collectNegativeFeedback({
      clientName,
      feedback,
      email,
      phone,
      rating,
      category
    });

    if (feedbackResult.success) {
      // Success response - CLIENT FACING IN SPANISH
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
      // Failure response - CLIENT FACING IN SPANISH
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

    // Validate required fields
    if (!fullName || !phone) {
      return res.status(400).json({
        error: "Missing required fields: fullName and phone are required",
        details: "Please provide at least a name and phone number for registration"
      });
    }

    // Log received data
    console.log("🧋 Received client registration data:");
    console.log("👤 Name:", fullName);
    console.log("📞 Phone:", phone);
    console.log("📧 Email:", email || "Not provided");
    console.log("🥤 Favorite Drink:", favoriteDrink || "Not specified");

    // Generate client ID
    const clientId = generateClientId();

    // Prepare client data for database
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

    // Add client to database
    const registrationSuccess = await addClientToDatabase(clientData);

    if (registrationSuccess) {
      // Success response - CLIENT FACING IN SPANISH
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
      // Failure response - CLIENT FACING IN SPANISH
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

// Additional endpoint to check client status (optional)
app.post('/check-client', async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({
        error: "Phone number is required"
      });
    }

    console.log(`🔍 Checking client status for phone: ${phone}`);
    
    // Simulate database lookup
    const isRegistered = Math.random() > 0.5;
    
    if (isRegistered) {
      // CLIENT FACING IN SPANISH
      let description = `✅ **Cliente Registrado**\n\n`;
      description += `Encontramos tu registro en nuestro sistema.\n\n`;
      description += `📞 Teléfono: ${phone}\n`;
      description += `🎉 ¡Gracias por ser parte de The Bubble Tea Shop!`;

      res.json({
        status: "registered",
        desc: description
      });
    } else {
      // CLIENT FACING IN SPANISH
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

// Health check endpoint (internal - keep in English)
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Bubble Tea Shop Feedback System is running',
    timestamp: new Date().toISOString(),
    endpoints: [
      'POST /register-client',
      'POST /check-client',
      'POST /negative-feedback',
      'GET /admin/feedback',
      'GET /health'
    ],
    stats: {
      total_feedback: feedbackStorage.negativeFeedback.length
    }
  });
});

// Root endpoint (internal - keep in English)
app.get('/', (req, res) => {
  res.json({
    service: 'Bubble Tea Shop Feedback System',
    version: '1.1.0',
    description: 'WhatsApp bot backend for client registration and feedback collection',
    endpoints: {
      'POST /register-client': 'Register a new client',
      'POST /check-client': 'Check if a client is registered',
      'POST /negative-feedback': 'Collect negative feedback from clients',
      'GET /admin/feedback': 'View all feedback (internal)',
      'GET /health': 'Health check'
    }
  });
});

// Initialize server
app.listen(PORT, (error) => {
  if (!error) {
    console.log(`🧋 Bubble Tea Shop Feedback System running on http://localhost:${PORT}`);
    console.log(`🏥 Health check: http://localhost:${PORT}/health`);
    console.log(`📝 Registration endpoint: POST http://localhost:${PORT}/register-client`);
    console.log(`📋 Feedback endpoint: POST http://localhost:${PORT}/negative-feedback`);
    console.log(`🔍 Check client endpoint: POST http://localhost:${PORT}/check-client`);
    console.log(`👨‍💼 Admin feedback: GET http://localhost:${PORT}/admin/feedback`);
  } else {
    console.log("❌ Error occurred, server can't start", error);
  }
});

module.exports = app;