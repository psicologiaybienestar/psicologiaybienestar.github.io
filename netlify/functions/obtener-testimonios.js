const fetch = require("node-fetch");

exports.handler = async function (event, context) {
  // Solo permitir GET
  if (event.httpMethod !== "GET") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Método no permitido" }),
    };
  }

  // Verificar que el request venga de un dominio autorizado
  const allowedOrigins = [
    "https://psicologiaybienestar.netlify.app",
    "https://tu-usuario.github.io",
    "http://localhost:3000",
    "http://localhost:5500",
    "http://127.0.0.1:5500",
  ];

  const origin = event.headers.origin || event.headers.referer || "";
  const isAllowedOrigin = allowedOrigins.some(
    (allowedOrigin) =>
      origin.includes(allowedOrigin) ||
      origin.includes("localhost") ||
      origin.includes("127.0.0.1")
  );

  // Si no hay origin/referer o no es un dominio autorizado, devolver mensaje de acceso denegado
  if (!origin || !isAllowedOrigin) {
    return {
      statusCode: 200, // Usar 200 para que se pueda descargar
      headers: {
        "Content-Type": "text/plain",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
      },
      body: "Acceso denegado\n\nEsta función solo puede ser accedida desde dominios autorizados.\nLos datos están protegidos por motivos de seguridad.",
    };
  }

  try {
    // URL del Google Sheets almacenada en variables de entorno
    const csvUrl =
      process.env.GOOGLE_SHEETS_URL ||
      "https://docs.google.com/spreadsheets/d/e/2PACX-1vQ9gc0iLBVHnuWopuxijsTupBn_tvZ-B7D3b4WBVZ-meyKF61a8o24Qy1FQ5fxUYL7DaabkkAgILjac/pub?gid=421205038&single=true&output=csv";

    const response = await fetch(csvUrl);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const csvText = await response.text();

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "text/plain",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
      },
      body: csvText,
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "Error al obtener testimonios",
        details: error.message,
      }),
    };
  }
};
