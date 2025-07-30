const fetch = require("node-fetch");

exports.handler = async function (event, context) {
  // Solo permitir GET
  if (event.httpMethod !== "GET") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Método no permitido" }),
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

    // Filtrar y limpiar los datos antes de devolverlos
    const rows = csvText.split("\n").filter((row) => row.trim() !== "");
    if (rows.length === 0) {
      return {
        statusCode: 200,
        headers: {
          "Content-Type": "text/plain",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Headers": "Content-Type",
        },
        body: "",
      };
    }

    const headers = rows[0]
      .split(",")
      .map((header) => header.trim().replace(/[\ufeff\r]/g, ""));

    // Solo permitir campos específicos para testimonios
    const allowedFields = [
      "Nombre Completo",
      "Tu Testimonio",
      "Calificación",
      "Fecha",
    ];

    // Filtrar solo las columnas permitidas
    const allowedIndices = headers
      .map((header, index) => (allowedFields.includes(header) ? index : -1))
      .filter((index) => index !== -1);

    // Reconstruir el CSV solo con los campos permitidos
    const filteredRows = rows.map((row, rowIndex) => {
      if (rowIndex === 0) {
        // Headers
        return allowedFields.join(",");
      } else {
        // Datos
        const fields = row.split(",");
        return allowedIndices.map((index) => fields[index] || "").join(",");
      }
    });

    const filteredCsv = filteredRows.join("\n");

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "text/plain",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
      },
      body: filteredCsv,
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
