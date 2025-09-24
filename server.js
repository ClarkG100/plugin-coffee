const express = require('express');


const app = express();
const PORT = 3000;

app.use(express.json());

// Placeholder function to add client to coffee store database
// Replace this with your actual database API integration
const addClientToDatabase = async (clientData) => {
  try {
    // TODO: Replace this placeholder with your actual database API integration
    // Example implementations for different database types:
    
    // For REST API integration:
    // const response = await fetch(process.env.COFFEE_DB_API_URL, {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //     'Authorization': `Bearer ${process.env.COFFEE_DB_API_KEY}`
    //   },
    //   body: JSON.stringify(clientData)
    // });
    // return response.ok;

    // For MySQL/PostgreSQL integration:
    // const result = await db.query(
    //   'INSERT INTO clients (name, phone, email, favorite_drink) VALUES (?, ?, ?, ?)',
    //   [clientData.fullName, clientData.phone, clientData.email, clientData.favoriteDrink]
    // );
    // return result.affectedRows > 0;

    // For MongoDB integration:
    // const result = await db.collection('clients').insertOne(clientData);
    // return result.acknowledged;

    // For Firebase Firestore:
    // const docRef = await db.collection('clients').add(clientData);
    // return !!docRef.id;

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

// Function to generate a simple client ID
const generateClientId = () => {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `CAFE${timestamp}${random}`;
};

// Route to handle coffee shop client registration
app.post('/register-client', async (req, res) => {
  try {
    const {
      fullName,
      phone,
      email,
      favoriteDrink,
      preferences // optional: ['newsletter', 'promotions', etc.]
    } = req.body;

    // Validate required fields - at minimum we need name and phone
    if (!fullName || !phone) {
      return res.status(400).json({
        error: "Missing required fields: fullName and phone are required",
        details: "Please provide at least a name and phone number for registration"
      });
    }

    // Log received data
    console.log("☕ Received client registration data:");
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
      // Success response
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

      let description = `☕ **¡Bienvenido a The Coffee Shop!**\n\n`;
      description += `🎉 ¡Ya estás oficialmente registrado, ${fullName}!\n\n`;
      description += `📋 **Detalles de tu registro:**\n`;
      description += `• 🔑 ID de Cliente: **${clientId}**\n`;
      description += `• 👤 Nombre: ${fullName}\n`;
      description += `• 📞 Teléfono: ${phone}\n`;
      if (email) description += `• 📧 Email: ${email}\n`;
      if (favoriteDrink) description += `• 🥤 Bebida Favorita: ${favoriteDrink}\n`;
      description += `• 📅 Fecha de Registro: ${new Date().toLocaleDateString('es-ES')}\n\n`;
      description += `💫 **¿Qué sigue?**\n`;
      description += `• Muestra este mensaje para un 10% de descuento en tu primera visita\n`;
      description += `• Acumularás puntos con cada compra\n`;
      description += `• Recibirás ofertas exclusivas para miembros\n\n`;
      description += `¡Estamos emocionados de tenerte! ¡Te esperamos pronto! ☕✨`;

      res.json({
        raw: rawData,
        markdown: "...",
        type: "markdown",
        desc: description
      });
    } else {
      // Failure response
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
      if (favoriteDrink) description += `• 🥤 Bebida Favorita: ${favoriteDrink}\n\n`;
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
    res.status(500).json({
      error: "Internal server error",
      message: error.message
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

    // TODO: Implement actual client lookup in your database
    console.log(`🔍 Checking client status for phone: ${phone}`);
    
    // Simulate database lookup
    const isRegistered = Math.random() > 0.5; // 50% chance of being registered
    
    if (isRegistered) {
      res.json({
        status: "registered",
        message: "Client is already registered",
        phone: phone
      });
    } else {
      res.json({
        status: "not_registered",
        message: "Client not found - please register",
        phone: phone
      });
    }
  } catch (error) {
    console.error("Error checking client:", error);
    res.status(500).json({
      error: "Error checking client status"
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Coffee Shop Registration server is running',
    timestamp: new Date().toISOString(),
    endpoints: [
      'POST /register-client',
      'POST /check-client',
      'GET /health'
    ]
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    service: 'Coffee Shop Registration API',
    version: '1.0.0',
    description: 'WhatsApp bot backend for coffee store client registration',
    endpoints: {
      'POST /register-client': 'Register a new client',
      'POST /check-client': 'Check if a client is registered',
      'GET /health': 'Health check'
    }
  });
});

// Initialize server
app.listen(PORT, (error) => {
  if (!error) {
    console.log(`☕ Coffee Shop Registration server running on http://localhost:${PORT}`);
    console.log(`🏥 Health check: http://localhost:${PORT}/health`);
    console.log(`📝 Registration endpoint: POST http://localhost:${PORT}/register-client`);
    console.log(`🔍 Check client endpoint: POST http://localhost:${PORT}/check-client`);
  } else {
    console.log("❌ Error occurred, server can't start", error);
  }
});

// Export app for testing purposes
module.exports = app;