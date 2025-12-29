import mysql from "mysql2/promise";
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const DB = await mysql.createConnection({
  host: process.env.MYSQLHOST,
  user: process.env.MYSQLUSER,
  password: process.env.MYSQLPASSWORD,
  database: process.env.MYSQLDATABASE,
  port: process.env.MYSQLPORT,
});

async function migrarImagenes() {
  console.log("🚀 Iniciando migración de imágenes...\n");

  try {
    const [productos] = await DB.query(
      "SELECT id, nombre, imagen FROM productos WHERE imagen IS NOT NULL"
    );

    console.log(`📦 Encontrados ${productos.length} productos con imágenes\n`);

    let exitosos = 0;
    let fallidos = 0;
    const errores = [];

    for (const producto of productos) {
      const { id, nombre, imagen } = producto;

      if (imagen.includes("cloudinary.com")) {
        console.log(`⏭️  [${id}] ${nombre} - Ya está en Cloudinary`);
        continue;
      }

      try {
        const rutaImagen = path.join(__dirname, "public", "images", imagen);

        if (!fs.existsSync(rutaImagen)) {
          console.log(
            `⚠️  [${id}] ${nombre} - Archivo no encontrado: ${imagen}`
          );
          fallidos++;
          errores.push({ id, nombre, error: "Archivo no encontrado" });
          continue;
        }

        console.log(`📤 [${id}] Subiendo: ${nombre}...`);

        const result = await cloudinary.uploader.upload(rutaImagen, {
          folder: "punto-g-productos",
          public_id: `producto_${id}_${Date.now()}`,
        });

        await DB.query("UPDATE productos SET imagen = ? WHERE id = ?", [
          result.secure_url,
          id,
        ]);

        console.log(`✅ [${id}] ${nombre} - Migrado exitosamente`);
        console.log(`   URL: ${result.secure_url}\n`);

        exitosos++;
        await new Promise((resolve) => setTimeout(resolve, 500));
      } catch (error) {
        console.error(`❌ [${id}] ${nombre} - Error: ${error.message}\n`);
        fallidos++;
        errores.push({ id, nombre, error: error.message });
      }
    }

    console.log("\n" + "=".repeat(50));
    console.log("📊 RESUMEN DE MIGRACIÓN");
    console.log("=".repeat(50));
    console.log(`✅ Exitosos: ${exitosos}`);
    console.log(`❌ Fallidos: ${fallidos}`);
    console.log(`📦 Total: ${productos.length}`);

    if (errores.length > 0) {
      console.log("\n⚠️  ERRORES:");
      errores.forEach(({ id, nombre, error }) => {
        console.log(`   [${id}] ${nombre}: ${error}`);
      });
    }
  } catch (error) {
    console.error("🔥 Error fatal:", error);
  } finally {
    await DB.end();
    console.log("\n✅ Migración completada");
  }
}

migrarImagenes();
