import mysql from "mysql2/promise";
import cloudinary from "cloudinary";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

/* ================= CLOUDINARY ================= */
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/* ================= MYSQL ================= */
const db = await mysql.createConnection({
  host: process.env.MYSQLHOST,
  user: process.env.MYSQLUSER,
  password: process.env.MYSQLPASSWORD,
  database: process.env.MYSQLDATABASE,
  port: process.env.MYSQLPORT,
});

/* ================= PATH IMAGES ================= */
const IMAGES_DIR = path.resolve("public/images");

const [productos] = await db.execute(
  "SELECT id, imagen FROM productos WHERE imagen IS NOT NULL"
);

console.log(`📦 Productos encontrados: ${productos.length}`);

for (const producto of productos) {
  const localPath = path.join(IMAGES_DIR, producto.imagen);

  if (!fs.existsSync(localPath)) {
    console.log(`❌ No existe: ${producto.imagen}`);
    continue;
  }

  console.log(`⬆️ Subiendo: ${producto.imagen}`);

  const result = await cloudinary.v2.uploader.upload(localPath, {
    folder: "productos",
    public_id: path.parse(producto.imagen).name,
    overwrite: true,
  });

  await db.execute("UPDATE productos SET imagen = ? WHERE id = ?", [
    result.secure_url,
    producto.id,
  ]);

  console.log(`✅ Migrada: ${producto.imagen}`);
}

await db.end();
console.log("🎉 MIGRACIÓN COMPLETA");
process.exit(0);
