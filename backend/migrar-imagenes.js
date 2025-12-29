import mysql from "mysql2/promise";
import cloudinary from "cloudinary";
import dotenv from "dotenv";

dotenv.config();

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const db = await mysql.createConnection({
  host: process.env.MYSQLHOST,
  user: process.env.MYSQLUSER,
  password: process.env.MYSQLPASSWORD,
  database: process.env.MYSQLDATABASE,
  port: process.env.MYSQLPORT,
});

const BASE_URL =
  "https://gleaming-motivation-production-4018.up.railway.app/images";

const [productos] = await db.execute(
  "SELECT id, imagen FROM productos WHERE imagen NOT LIKE 'http%'"
);

console.log(`📦 Productos encontrados: ${productos.length}`);

for (const producto of productos) {
  const imageUrl = `${BASE_URL}/${producto.imagen}`;

  try {
    console.log("⬆️ Subiendo:", imageUrl);

    const result = await cloudinary.v2.uploader.upload(imageUrl, {
      folder: "productos",
    });

    await db.execute("UPDATE productos SET imagen = ? WHERE id = ?", [
      result.secure_url,
      producto.id,
    ]);

    console.log("✅ Migrada:", producto.imagen);
  } catch (err) {
    console.error("❌ Error con", producto.imagen, err.message);
  }
}

await db.end();
console.log("🎉 MIGRACIÓN COMPLETA");
process.exit(0);
