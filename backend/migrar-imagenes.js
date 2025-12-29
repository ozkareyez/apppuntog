import mysql from "mysql2/promise";
import cloudinary from "cloudinary";
import dotenv from "dotenv";

dotenv.config();

/* ================= CLOUDINARY ================= */
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/* ================= MYSQL (RAILWAY INTERNO) ================= */
const db = await mysql.createConnection({
  host: process.env.MYSQLHOST, // mysql.railway.internal
  user: process.env.MYSQLUSER,
  password: process.env.MYSQLPASSWORD,
  database: process.env.MYSQLDATABASE,
  port: process.env.MYSQLPORT,
});

/* ================= BASE URL BACKEND ================= */
const BASE_IMAGE_URL = process.env.BASE_IMAGE_URL;
// ejemplo: https://appPuntoG-production.up.railway.app/images

const [productos] = await db.execute(
  "SELECT id, imagen FROM productos WHERE imagen IS NOT NULL"
);

console.log(`📦 Productos encontrados: ${productos.length}`);

for (const producto of productos) {
  // si ya es cloudinary, saltar
  if (producto.imagen.startsWith("http")) {
    console.log(`⏭️ Ya migrada: ${producto.imagen}`);
    continue;
  }

  const imageUrl = `${BASE_IMAGE_URL}/${producto.imagen}`;
  console.log(`⬆️ Subiendo: ${imageUrl}`);

  try {
    const result = await cloudinary.v2.uploader.upload(imageUrl, {
      folder: "productos",
      public_id: producto.imagen.replace(/\.[^/.]+$/, ""),
      overwrite: true,
    });

    await db.execute("UPDATE productos SET imagen = ? WHERE id = ?", [
      result.secure_url,
      producto.id,
    ]);

    console.log(`✅ Migrada: ${producto.imagen}`);
  } catch (err) {
    console.error(`❌ Error con ${producto.imagen}`, err.message);
  }
}

await db.end();
console.log("🎉 MIGRACIÓN COMPLETA");
process.exit(0);
