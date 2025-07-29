const fetch = require("node-fetch");
exports.handler = async function (event, context) {
  const CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
  const API_KEY = process.env.CLOUDINARY_API_KEY;
  const API_SECRET = process.env.CLOUDINARY_API_SECRET;
  const FOLDER = "galeria";

  const url = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/resources/image/upload?prefix=${FOLDER}/&max_results=100`;

  const auth = Buffer.from(`${API_KEY}:${API_SECRET}`).toString("base64");

  try {
    const res = await fetch(url, {
      headers: {
        Authorization: `Basic ${auth}`,
      },
    });
    if (!res.ok) {
      const errorText = await res.text();
      console.error("Cloudinary error:", errorText);
      return {
        statusCode: res.status,
        body: JSON.stringify({
          error: "Error al consultar Cloudinary",
          details: errorText,
        }),
      };
    }
    const data = await res.json();
    const images = data.resources.map((img) => ({
      url: img.secure_url,
      public_id: img.public_id,
      format: img.format,
      width: img.width,
      height: img.height,
      created_at: img.created_at,
    }));
    return {
      statusCode: 200,
      body: JSON.stringify(images),
    };
  } catch (e) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Error interno", details: e.message }),
    };
  }
};
