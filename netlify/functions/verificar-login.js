const fetch = require("node-fetch");

exports.handler = async function (event, context) {
  // Solo permitir POST
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Método no permitido" }),
    };
  }

  try {
    const { username, password } = JSON.parse(event.body);

    // Credenciales almacenadas en variables de entorno de Netlify
    const USER = process.env.DASHBOARD_USER || "adminPsico";
    const PASS = process.env.DASHBOARD_PASS || "Psicologia&Bienestar";

    if (username === USER && password === PASS) {
      return {
        statusCode: 200,
        body: JSON.stringify({
          success: true,
          message: "Login exitoso",
        }),
      };
    } else {
      return {
        statusCode: 401,
        body: JSON.stringify({
          success: false,
          message: "Credenciales incorrectas",
        }),
      };
    }
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "Error interno del servidor",
        details: error.message,
      }),
    };
  }
};
