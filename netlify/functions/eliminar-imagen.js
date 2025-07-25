const fetch = require("node-fetch");

exports.handler = async function (event, context) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }
  const CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
  const API_KEY = process.env.CLOUDINARY_API_KEY;
  const API_SECRET = process.env.CLOUDINARY_API_SECRET;
  let public_id;
  try {
    const body = JSON.parse(event.body);
    public_id = body.public_id;
    if (!public_id) throw new Error("public_id requerido");
  } catch (e) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "public_id requerido" }),
    };
  }
  const url = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/resources/image/upload?public_ids[]=${encodeURIComponent(
    public_id
  )}`;
  const auth = Buffer.from(`${API_KEY}:${API_SECRET}`).toString("base64");
  try {
    const res = await fetch(url, {
      method: "DELETE",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/json",
      },
    });
    if (!res.ok) {
      const errorText = await res.text();
      return {
        statusCode: res.status,
        body: JSON.stringify({
          error: "Error al eliminar en Cloudinary",
          details: errorText,
        }),
      };
    }
    return { statusCode: 200, body: JSON.stringify({ success: true }) };
  } catch (e) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Error interno", details: e.message }),
    };
  }
};
