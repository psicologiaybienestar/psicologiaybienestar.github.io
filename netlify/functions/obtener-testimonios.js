const fetch = require("node-fetch");

exports.handler = async function (event, context) {
  // Solo permitir POST
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Método no permitido o no tienes permiso" }),
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
