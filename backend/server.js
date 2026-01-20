import express from "express";
import mysql from "mysql2";
import cors from "cors";
import path from "path";
import multer from "multer";
import { fileURLToPath } from "url";
import { v2 as cloudinary } from "cloudinary";
import ExcelJS from "exceljs";

/* ================= APP ================= */
const app = express();
const PORT = process.env.PORT || 3002;

/* ================= MIDDLEWARE ================= */
app.use(cors({ origin: "*", methods: ["GET", "POST", "PUT", "DELETE"] }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* ================= PATH ================= */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use("/images", express.static(path.join(__dirname, "public/images")));

/* ================= MYSQL ================= */
const DB = mysql.createPool({
  host: process.env.MYSQLHOST,
  user: process.env.MYSQLUSER,
  password: process.env.MYSQLPASSWORD,
  database: process.env.MYSQLDATABASE,
  port: process.env.MYSQLPORT,
});

/* ================= CLOUDINARY CONFIG ================= */
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/* ================= MULTER ================= */
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const mimetype = allowedTypes.test(file.mimetype);
    if (mimetype) {
      cb(null, true);
    } else {
      cb(new Error("Solo se permiten imágenes"));
    }
  },
});

/* ================= ROOT ================= */
app.get("/", (_, res) => res.json({ ok: true }));

/* ================= UPLOAD UNA IMAGEN - CLOUDINARY ================= */
app.post("/api/upload-imagen", upload.single("imagen"), async (req, res) => {
  try {
    console.log("📤 Recibiendo archivo...");

    if (!req.file) {
      return res.status(400).json({
        ok: false,
        message: "No se subió imagen",
      });
    }

    const b64 = req.file.buffer.toString("base64");
    const dataURI = `data:${req.file.mimetype};base64,${b64}`;

    console.log("☁️ Subiendo a Cloudinary...");

    const result = await cloudinary.uploader.upload(dataURI, {
      folder: "punto-g-productos",
      resource_type: "auto",
    });

    console.log("✅ Imagen subida a Cloudinary");

    res.json({
      ok: true,
      url: result.secure_url,
      public_id: result.public_id,
      filename: req.file.originalname,
    });
  } catch (error) {
    console.error("❌ ERROR Cloudinary:", error);
    res.status(500).json({
      ok: false,
      message: "Error al subir imagen a Cloudinary",
      error: error.message,
    });
  }
});

/* ================= CREAR PRODUCTO ================= */
app.post("/api/productos", async (req, res) => {
  console.log("📥 Creando nuevo producto...");

  const {
    categoria = null,
    nombre,
    talla = null,
    color = null,
    precio,
    categoria_id,
    precio_antes = null,
    descuento = null,
    es_oferta = 0,
    descripcion = null,
    imagenes = [],
  } = req.body;

  // Validación
  if (!nombre || !precio || !categoria_id) {
    return res.status(400).json({
      ok: false,
      message: "Faltan campos obligatorios: nombre, precio, categoria_id",
    });
  }

  if (imagenes.length === 0) {
    return res.status(400).json({
      ok: false,
      message: "Debe subir al menos una imagen",
    });
  }

  // Preparar imágenes
  const imagen_cloud1 = imagenes.length > 0 ? imagenes[0] : null;
  const imagen_cloud2 = imagenes.length > 1 ? imagenes[1] : null;
  const imagen_cloud3 = imagenes.length > 2 ? imagenes[2] : null;
  const imagen = imagenes.length > 0 ? imagenes[0] : null;

  console.log(`🖼️ Guardando ${imagenes.length} imágenes...`);

  try {
    const [result] = await DB.promise().query(
      `INSERT INTO productos 
      (categoria, nombre, talla, color, precio, imagen, categoria_id,
       precio_antes, descuento, es_oferta, descripcion,
       imagen_cloud1, imagen_cloud2, imagen_cloud3)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [
        categoria,
        nombre,
        talla,
        color,
        precio,
        imagen,
        categoria_id,
        precio_antes,
        descuento,
        es_oferta,
        descripcion,
        imagen_cloud1,
        imagen_cloud2,
        imagen_cloud3,
      ],
    );

    console.log(`✅ Producto creado ID: ${result.insertId}`);

    res.status(201).json({
      ok: true,
      producto_id: result.insertId,
      message: `Producto creado con ${imagenes.length} imagen(es)`,
    });
  } catch (error) {
    console.error("❌ Error MySQL:", error);
    console.error("SQL Error details:", error.sqlMessage, error.sql);
    res.status(500).json({
      ok: false,
      message: error.sqlMessage || error.message,
      sql: error.sql,
    });
  }
});

/* ================= PRODUCTOS CON FILTROS FUNCIONALES ================= */
app.get("/api/productos", (req, res) => {
  const { categoria, es_oferta, limit } = req.query;

  // 🔥 DEBUG: Ver qué parámetros llegan
  console.log("===================");
  console.log("🎯 PARÁMETROS RECIBIDOS:");
  console.log("  categoria:", categoria || "todas");
  console.log("  es_oferta:", es_oferta || "false");
  console.log("===================");

  // 🔥 QUERY CORREGIDA: INNER JOIN para asegurar relación
  let query = `
    SELECT 
      p.*,
      c.nombre as categoria_nombre,
      c.slug as categoria_slug
    FROM productos p
    INNER JOIN categorias c ON p.categoria_id = c.id
    WHERE p.activo = 1 AND c.activo = 1
  `;

  const params = [];

  // 🔥 FILTRO POR CATEGORÍA CORREGIDO - usa slug: categoria1, categoria2, categoria3
  if (categoria && categoria !== "todas") {
    query += " AND c.slug = ?";
    params.push(categoria);
    console.log(`✅ Aplicando filtro categoría: "${categoria}"`);
  }

  // Filtro por ofertas
  if (es_oferta === "true") {
    query += " AND p.es_oferta = 1";
  }

  query += " ORDER BY p.id DESC";

  if (limit) {
    query += " LIMIT ?";
    params.push(parseInt(limit));
  }

  // 🔥 DEBUG: Mostrar query completa
  console.log("📝 QUERY EJECUTADA:", query);
  console.log("📦 PARÁMETROS:", params);

  DB.query(query, params, (err, results) => {
    if (err) {
      console.error("❌ ERROR PRODUCTOS:", err);
      return res.status(500).json({ error: err.message });
    }

    console.log(`✅ PRODUCTOS ENCONTRADOS: ${results.length}`);

    const productos = results.map((p) => {
      // Construir array de imágenes
      const imagenesArray = [];

      if (p.imagen_cloud1 && p.imagen_cloud1 !== "null") {
        imagenesArray.push(p.imagen_cloud1);
      }
      if (p.imagen_cloud2 && p.imagen_cloud2 !== "null") {
        imagenesArray.push(p.imagen_cloud2);
      }
      if (p.imagen_cloud3 && p.imagen_cloud3 !== "null") {
        imagenesArray.push(p.imagen_cloud3);
      }

      // Si no hay imágenes en los campos cloud, usar imagen principal
      if (imagenesArray.length === 0 && p.imagen && p.imagen !== "null") {
        imagenesArray.push(p.imagen);
      }

      return {
        id: p.id,
        nombre: p.nombre,
        descripcion: p.descripcion,
        precio: Number(p.precio),
        precio_antes: p.precio_antes ? Number(p.precio_antes) : null,
        descuento: p.descuento ? Number(p.descuento) : 0,
        es_oferta: Boolean(p.es_oferta),
        categoria: p.categoria,
        talla: p.talla,
        color: p.color,
        categoria_id: p.categoria_id,
        categoria_nombre: p.categoria_nombre,
        categoria_slug: p.categoria_slug,
        activo: Boolean(p.activo),
        imagen: p.imagen,
        imagenes: imagenesArray,
        imagen_cloud1: p.imagen_cloud1,
        imagen_cloud2: p.imagen_cloud2,
        imagen_cloud3: p.imagen_cloud3,
      };
    });

    res.json(productos);
  });
});

/* ================= PRODUCTO POR ID ================= */
app.get("/api/productos/:id", (req, res) => {
  const { id } = req.params;

  console.log(`🔍 Solicitando producto ID: ${id}`);

  const query = `
    SELECT 
      p.*,
      c.nombre as categoria_nombre,
      c.slug as categoria_slug
    FROM productos p
    LEFT JOIN categorias c ON p.categoria_id = c.id
    WHERE p.id = ? AND p.activo = 1
  `;

  DB.query(query, [id], (err, rows) => {
    if (err) {
      console.error("❌ ERROR PRODUCTO:", err);
      return res.status(500).json({ error: err.message });
    }

    if (!rows.length) {
      console.log(`❌ Producto ${id} no encontrado`);
      return res.status(404).json({ error: "Producto no encontrado" });
    }

    const p = rows[0];

    const imagenesArray = [];
    if (p.imagen_cloud1 && p.imagen_cloud1 !== "null") {
      imagenesArray.push(p.imagen_cloud1);
    }
    if (p.imagen_cloud2 && p.imagen_cloud2 !== "null") {
      imagenesArray.push(p.imagen_cloud2);
    }
    if (p.imagen_cloud3 && p.imagen_cloud3 !== "null") {
      imagenesArray.push(p.imagen_cloud3);
    }

    if (imagenesArray.length === 0 && p.imagen && p.imagen !== "null") {
      imagenesArray.push(p.imagen);
    }

    const producto = {
      id: p.id,
      nombre: p.nombre,
      descripcion: p.descripcion,
      precio: Number(p.precio),
      precio_antes: p.precio_antes ? Number(p.precio_antes) : null,
      descuento: p.descuento ? Number(p.descuento) : 0,
      es_oferta: Boolean(p.es_oferta),
      categoria: p.categoria,
      talla: p.talla,
      color: p.color,
      categoria_id: p.categoria_id,
      categoria_nombre: p.categoria_nombre,
      categoria_slug: p.categoria_slug,
      activo: Boolean(p.activo),
      imagen: p.imagen,
      imagenes: imagenesArray,
      imagen_cloud1: p.imagen_cloud1,
      imagen_cloud2: p.imagen_cloud2,
      imagen_cloud3: p.imagen_cloud3,
    };

    console.log(
      `✅ Producto ${id} enviado con ${imagenesArray.length} imágenes`,
    );
    res.json(producto);
  });
});

/* ================= CATEGORÍAS ================= */
app.get("/api/categorias", (req, res) => {
  console.log("📥 Solicitando categorías...");

  const query = `
    SELECT id, nombre, slug
    FROM categorias 
    WHERE activo = 1 
    ORDER BY nombre
  `;

  DB.query(query, (err, results) => {
    if (err) {
      console.error("❌ ERROR CATEGORÍAS:", err);
      return res.status(500).json({ error: err.message });
    }

    console.log(`✅ Enviando ${results.length} categorías`);
    res.json(results);
  });
});

/* ================= PEDIDOS ================= */
app.get("/api/pedidos", (req, res) => {
  console.log("📥 Solicitando pedidos...");
  res.json([]);
});

app.get("/api/pedidos-completo", (req, res) => {
  console.log("📥 Solicitando pedidos completos...");
  res.json([]);
});

/* ================= PRODUCTOS RECOMENDADOS ================= */
app.get("/api/productos-recomendados/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const [producto] = await DB.promise().query(
      "SELECT categoria_id FROM productos WHERE id = ? AND activo = 1",
      [id],
    );

    if (!producto.length) {
      return res.status(404).json([]);
    }

    const categoriaId = producto[0].categoria_id;

    const [recomendados] = await DB.promise().query(
      `
      SELECT 
        p.id, 
        p.nombre, 
        p.precio,
        p.imagen,
        p.imagen_cloud1,
        p.imagen_cloud2,
        p.imagen_cloud3,
        p.es_oferta,
        p.precio_antes
      FROM productos p
      WHERE p.categoria_id = ?
        AND p.id != ?
        AND p.activo = 1
      ORDER BY RAND()
      LIMIT 10
      `,
      [categoriaId, id],
    );

    const productosConImagenes = recomendados.map((p) => {
      const imagenes = [];

      if (p.imagen_cloud1 && p.imagen_cloud1 !== "null")
        imagenes.push(p.imagen_cloud1);
      if (p.imagen_cloud2 && p.imagen_cloud2 !== "null")
        imagenes.push(p.imagen_cloud2);
      if (p.imagen_cloud3 && p.imagen_cloud3 !== "null")
        imagenes.push(p.imagen_cloud3);

      if (imagenes.length === 0 && p.imagen && p.imagen !== "null") {
        imagenes.push(p.imagen);
      }

      return {
        id: p.id,
        nombre: p.nombre,
        precio: Number(p.precio),
        es_oferta: Boolean(p.es_oferta),
        precio_antes: p.precio_antes ? Number(p.precio_antes) : null,
        imagen: p.imagen,
        imagenes: imagenes,
      };
    });

    console.log(`✅ ${productosConImagenes.length} productos recomendados`);
    res.json(productosConImagenes);
  } catch (error) {
    console.error("❌ ERROR RECOMENDADOS:", error);
    res.status(500).json([]);
  }
});

/* ================= ACTUALIZAR PRODUCTO ================= */
app.put("/api/productos/:id", async (req, res) => {
  const { id } = req.params;
  const {
    categoria = null,
    nombre,
    talla = null,
    color = null,
    precio,
    categoria_id,
    precio_antes = null,
    descuento = null,
    es_oferta = 0,
    descripcion = null,
    imagenes = [],
  } = req.body;

  if (!nombre || !precio || !categoria_id) {
    return res.status(400).json({
      ok: false,
      message: "Faltan campos obligatorios: nombre, precio, categoria_id",
    });
  }

  const imagen_cloud1 = imagenes.length > 0 ? imagenes[0] : null;
  const imagen_cloud2 = imagenes.length > 1 ? imagenes[1] : null;
  const imagen_cloud3 = imagenes.length > 2 ? imagenes[2] : null;
  const imagen = imagenes.length > 0 ? imagenes[0] : null;

  try {
    const [result] = await DB.promise().query(
      `UPDATE productos SET
        categoria = ?,
        nombre = ?,
        talla = ?,
        color = ?,
        precio = ?,
        imagen = ?,
        categoria_id = ?,
        precio_antes = ?,
        descuento = ?,
        es_oferta = ?,
        descripcion = ?,
        imagen_cloud1 = ?,
        imagen_cloud2 = ?,
        imagen_cloud3 = ?
      WHERE id = ?`,
      [
        categoria,
        nombre,
        talla,
        color,
        precio,
        imagen,
        categoria_id,
        precio_antes,
        descuento,
        es_oferta,
        descripcion,
        imagen_cloud1,
        imagen_cloud2,
        imagen_cloud3,
        id,
      ],
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        ok: false,
        message: "Producto no encontrado",
      });
    }

    res.json({
      ok: true,
      message: "Producto actualizado correctamente",
    });
  } catch (error) {
    console.error("❌ Error actualizando producto:", error);
    res.status(500).json({
      ok: false,
      message: error.message,
    });
  }
});

/* ================= ELIMINAR PRODUCTO ================= */
app.delete("/api/productos/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await DB.promise().query(
      "UPDATE productos SET activo = 0 WHERE id = ?",
      [id],
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        ok: false,
        message: "Producto no encontrado",
      });
    }

    res.json({
      ok: true,
      message: "Producto eliminado correctamente",
    });
  } catch (error) {
    console.error("❌ Error eliminando producto:", error);
    res.status(500).json({
      ok: false,
      message: error.message,
    });
  }
});

/* ================= ELIMINAR IMAGEN CLOUDINARY ================= */
app.delete("/api/eliminar-imagen-cloudinary", async (req, res) => {
  const { public_id } = req.body;

  if (!public_id) {
    return res.status(400).json({
      ok: false,
      message: "Se requiere public_id",
    });
  }

  try {
    const result = await cloudinary.uploader.destroy(public_id);

    if (result.result === "ok") {
      res.json({
        ok: true,
        message: "Imagen eliminada correctamente",
      });
    } else {
      res.status(500).json({
        ok: false,
        message: "Error al eliminar imagen",
      });
    }
  } catch (error) {
    console.error("❌ ERROR ELIMINAR IMAGEN:", error);
    res.status(500).json({
      ok: false,
      message: error.message,
    });
  }
});

/* ================= EXPORTAR A EXCEL ================= */
app.get("/api/exportar-productos-excel", async (req, res) => {
  try {
    const [productos] = await DB.promise().query(`
      SELECT 
        p.id,
        p.nombre,
        p.categoria,
        p.precio,
        p.precio_antes,
        p.descuento,
        p.es_oferta,
        p.talla,
        p.color,
        p.descripcion,
        p.imagen_cloud1,
        p.imagen_cloud2,
        p.imagen_cloud3,
        c.nombre as categoria_nombre
      FROM productos p
      LEFT JOIN categorias c ON p.categoria_id = c.id
      WHERE p.activo = 1
      ORDER BY p.id DESC
    `);

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Productos");

    worksheet.columns = [
      { header: "ID", key: "id", width: 10 },
      { header: "Nombre", key: "nombre", width: 30 },
      { header: "Categoría", key: "categoria", width: 20 },
      { header: "Precio", key: "precio", width: 15 },
      { header: "Precio Anterior", key: "precio_antes", width: 15 },
      { header: "Descuento %", key: "descuento", width: 15 },
      { header: "En Oferta", key: "es_oferta", width: 15 },
      { header: "Talla", key: "talla", width: 10 },
      { header: "Color", key: "color", width: 15 },
      { header: "Descripción", key: "descripcion", width: 40 },
      { header: "Imagen 1", key: "imagen_cloud1", width: 50 },
      { header: "Imagen 2", key: "imagen_cloud2", width: 50 },
      { header: "Imagen 3", key: "imagen_cloud3", width: 50 },
    ];

    productos.forEach((producto) => {
      worksheet.addRow(producto);
    });

    worksheet.getRow(1).eachCell((cell) => {
      cell.font = { bold: true, color: { argb: "FFFFFF" } };
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF6B46C1" },
      };
      cell.alignment = { vertical: "middle", horizontal: "center" };
    });

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
    res.setHeader("Content-Disposition", "attachment; filename=productos.xlsx");

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error("❌ ERROR EXPORTAR EXCEL:", error);
    res.status(500).json({ error: error.message });
  }
});

/* ================= SERVER ================= */
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Backend funcionando en puerto ${PORT}`);
  console.log("🔗 Endpoints disponibles:");
  console.log(`   GET  /api/categorias`);
  console.log(`   GET  /api/productos?categoria=categoria2 (Lencería)`);
  console.log(`   GET  /api/productos?categoria=categoria3 (Lubricantes)`);
  console.log(`   GET  /api/productos?categoria=categoria1 (Juguetes)`);
});

// import express from "express";
// import mysql from "mysql2";
// import cors from "cors";
// import path from "path";
// import multer from "multer";
// import { fileURLToPath } from "url";
// import { v2 as cloudinary } from "cloudinary";
// import ExcelJS from "exceljs";

// /* ================= APP ================= */
// const app = express();
// const PORT = process.env.PORT || 3002;

// /* ================= MIDDLEWARE ================= */
// app.use(cors({ origin: "*", methods: ["GET", "POST", "PUT", "DELETE"] }));
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// /* ================= PATH ================= */
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// // 🔥 HACER PUBLICAS LAS IMÁGENES ojo si algo borar esto

// app.use("/images", express.static(path.join(__dirname, "public/images")));

// /* ================= STATIC ================= */
// app.use("/images", express.static(path.join(__dirname, "public/images")));

// /* ================= MYSQL ================= */
// const DB = mysql.createPool({
//   host: process.env.MYSQLHOST,
//   user: process.env.MYSQLUSER,
//   password: process.env.MYSQLPASSWORD,
//   database: process.env.MYSQLDATABASE,
//   port: process.env.MYSQLPORT,
// });

// /* ================= CLOUDINARY CONFIG ================= */
// cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//   api_key: process.env.CLOUDINARY_API_KEY,
//   api_secret: process.env.CLOUDINARY_API_SECRET,
// });

// /* ================= MULTER ================= */
// const storage = multer.memoryStorage();

// const upload = multer({
//   storage,
//   limits: { fileSize: 5 * 1024 * 1024 },
//   fileFilter: (req, file, cb) => {
//     const allowedTypes = /jpeg|jpg|png|gif|webp/;
//     const mimetype = allowedTypes.test(file.mimetype);
//     if (mimetype) {
//       cb(null, true);
//     } else {
//       cb(new Error("Solo se permiten imágenes"));
//     }
//   },
// });

// /* ================= ROOT ================= */
// app.get("/", (_, res) => res.json({ ok: true }));

// /* ================= UPLOAD IMAGEN - CLOUDINARY ================= */
// app.post("/api/upload-imagen", upload.single("imagen"), async (req, res) => {
//   try {
//     if (!req.file) {
//       return res.status(400).json({
//         ok: false,
//         message: "No se subió imagen",
//       });
//     }

//     const b64 = req.file.buffer.toString("base64");
//     const dataURI = `data:${req.file.mimetype};base64,${b64}`;

//     const result = await cloudinary.uploader.upload(dataURI, {
//       folder: "punto-g-productos",
//     });

//     console.log("✅ Imagen subida:", result.secure_url);

//     res.json({
//       ok: true,
//       url: result.secure_url,
//       filename: result.public_id,
//     });
//   } catch (error) {
//     console.error("❌ Cloudinary error FULL:", error);

//     res.status(500).json({
//       ok: false,
//       message: error.message || "Error al subir imagen",
//     });
//   }
// });

// /* ================= DEPARTAMENTOS ================= */
// app.get("/api/departamentos", (_, res) => {
//   DB.query("SELECT id, nombre FROM departamentos", (err, rows) => {
//     if (err) return res.status(500).json(err);
//     res.json(rows);
//   });
// });

// /* ================= CIUDADES ================= */
// app.get("/api/ciudades", (req, res) => {
//   const { departamento_id } = req.query;
//   if (!departamento_id) return res.json([]);

//   DB.query(
//     "SELECT id, nombre FROM ciudades WHERE departamento_id = ? ORDER BY nombre",
//     [departamento_id],
//     (err, rows) => {
//       if (err) return res.status(500).json([]);
//       res.json(rows);
//     }
//   );
// });

// /* ================= CATEGORIAS ================= */
// app.get("/api/categorias", (req, res) => {
//   DB.query("SELECT * FROM categorias", (err, rows) => {
//     if (err) {
//       console.error(err);
//       return res.status(500).json({ error: "Error al obtener categorías" });
//     }

//     res.json(rows);
//   });
// });

// /* ================= PRODUCTOS ================= */
// app.get("/api/productos", (req, res) => {
//   const { categoria, es_oferta, limit } = req.query;

//   let query = `
//     SELECT p.*
//     FROM productos p
//   `;

//   const params = [];
//   const conditions = ["p.activo = 1"];

//   // JOIN solo si hay categoría
//   if (categoria && categoria !== "todas") {
//     query += " INNER JOIN categorias c ON p.categoria_id = c.id";
//     conditions.push("c.slug = ?");
//     params.push(categoria);
//   }

//   if (es_oferta === "true") {
//     conditions.push("p.es_oferta = 1");
//   }

//   if (conditions.length) {
//     query += " WHERE " + conditions.join(" AND ");
//   }

//   query += " ORDER BY p.id DESC";

//   if (limit) {
//     query += " LIMIT ?";
//     params.push(parseInt(limit));
//   }

//   console.log("🔍 QUERY FINAL:", query);
//   console.log("📦 PARAMS:", params);

//   DB.query(query, params, (err, results) => {
//     if (err) {
//       console.error("❌ ERROR PRODUCTOS:", err);
//       return res.status(500).json({ error: err.message });
//     }

//     const productos = results.map((p) => ({
//       ...p,
//       precio: Number(p.precio),
//       precio_antes: p.precio_antes ? Number(p.precio_antes) : null,
//       descuento: p.descuento ? Number(p.descuento) : 0,
//       es_oferta: Boolean(p.es_oferta),
//     }));

//     res.json(productos);
//   });
// });

// // app.get("/api/productos", (req, res) => {
// //   const { categoria, es_oferta, limit } = req.query;

// //   let query = "SELECT p.* FROM productos p WHERE p.activo = 1";
// //   const params = [];
// //   const conditions = [];

// //   if (categoria && categoria !== "todas") {
// //     query += " INNER JOIN categorias c ON p.categoria_id = c.id";
// //     conditions.push("c.slug = ?");
// //     params.push(categoria);
// //   }

// //   if (es_oferta === "true") {
// //     conditions.push("p.es_oferta = 1");
// //   }

// //   if (conditions.length > 0) {
// //     query += " WHERE " + conditions.join(" AND ");
// //   }

// //   query += " ORDER BY p.id DESC";

// //   if (limit) {
// //     query += " LIMIT ?";
// //     params.push(parseInt(limit));
// //   }

// //   console.log("🔍 Query:", query);
// //   console.log("📊 Params:", params);

// //   DB.query(query, params, (err, results) => {
// //     if (err) {
// //       console.error("❌ Error en productos:", err);
// //       return res.status(500).json({ error: err.message });
// //     }

// //     const productos = results.map((p) => ({
// //       ...p,
// //       precio: parseFloat(p.precio) || 0,
// //       precio_antes: p.precio_antes ? parseFloat(p.precio_antes) : null,
// //       descuento: p.descuento ? parseInt(p.descuento) : 0,
// //       es_oferta: Boolean(p.es_oferta),
// //     }));

// //     console.log(`✅ ${productos.length} productos encontrados`);
// //     res.json(productos);
// //   });
// // });

// /* ================= PRODUCTO INDIVIDUAL ================= */
// app.get("/api/productos/:id", (req, res) => {
//   DB.query(
//     "SELECT * FROM productos WHERE id = ?",
//     [req.params.id],
//     (err, rows) => {
//       if (err) return res.status(500).json({ error: err.message });
//       if (!rows.length) return res.status(404).json({ error: "No encontrado" });

//       const p = rows[0];
//       res.json({
//         ...p,
//         precio: Number(p.precio),
//         precio_antes: p.precio_antes ? Number(p.precio_antes) : null,
//         descuento: p.descuento ? Number(p.descuento) : 0,
//         es_oferta: Boolean(p.es_oferta),
//       });
//     }
//   );
// });

// /* ================= CREAR PRODUCTO ================= */
// app.post("/api/productos", (req, res) => {
//   const {
//     categoria = null, // ✅ Valor por defecto NULL
//     nombre,
//     talla = null, // ✅ Valor por defecto NULL
//     color = null, // ✅ Valor por defecto NULL
//     precio,
//     imagen,
//     categoria_id,
//     precio_antes = null,
//     descuento = null,
//     es_oferta = 0,
//     descripcion = null,
//   } = req.body;

//   // Validación solo de campos realmente obligatorios
//   if (!nombre || !precio || !imagen || !categoria_id) {
//     return res.status(400).json({
//       ok: false,
//       message:
//         "Faltan campos obligatorios: nombre, precio, imagen, categoria_id",
//     });
//   }

//   DB.query(
//     `INSERT INTO productos
//     (categoria, nombre, talla, color, precio, imagen, categoria_id,
//      precio_antes, descuento, es_oferta, descripcion)
//     VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
//     [
//       categoria,
//       nombre,
//       talla,
//       color,
//       precio,
//       imagen,
//       categoria_id,
//       precio_antes,
//       descuento,
//       es_oferta,
//       descripcion,
//     ],
//     (err, result) => {
//       if (err) {
//         console.error("❌ Error MySQL:", err);
//         return res.status(500).json({
//           ok: false,
//           message: err.sqlMessage || err.message,
//         });
//       }

//       res.status(201).json({
//         ok: true,
//         producto_id: result.insertId,
//       });
//     }
//   );
// });
// /* ================= FORMULARIO CLIENTE ================= */
// app.post("/api/enviar-formulario", (req, res) => {
//   const {
//     nombre,
//     email = null,
//     telefono,
//     direccion,
//     departamento_id,
//     ciudad_id,
//     carrito,
//     costo_envio = 0,
//   } = req.body;

//   if (!nombre || !telefono || !direccion || !departamento_id || !ciudad_id) {
//     return res.status(400).json({ ok: false });
//   }

//   if (!Array.isArray(carrito) || !carrito.length) {
//     return res.status(400).json({ ok: false });
//   }

//   const subtotal = carrito.reduce(
//     (s, p) => s + Number(p.precio) * Number(p.cantidad),
//     0
//   );

//   const total = subtotal + Number(costo_envio);

//   DB.query(
//     `
//     SELECT d.nombre AS departamento, c.nombre AS ciudad
//     FROM departamentos d
//     JOIN ciudades c ON c.id = ?
//     WHERE d.id = ?
//     `,
//     [ciudad_id, departamento_id],
//     (err, rows) => {
//       if (err || !rows.length) return res.status(500).json({ ok: false });

//       const { departamento, ciudad } = rows[0];

//       DB.query(
//         `
//         INSERT INTO pedidos
//         (
//           nombre, email, telefono, direccion,
//           departamento, departamento_id,
//           ciudad, ciudad_id,
//           total, costo_envio, estado
//         )
//         VALUES (?,?,?,?,?,?,?,?,?,?,'pendiente')
//         `,
//         [
//           nombre,
//           email,
//           telefono,
//           direccion,
//           departamento,
//           departamento_id,
//           ciudad,
//           ciudad_id,
//           total,
//           costo_envio,
//         ],
//         (err2, result) => {
//           if (err2) return res.status(500).json({ ok: false });

//           const detalles = carrito.map((p) => [
//             result.insertId,
//             p.id,
//             p.nombre,
//             Number(p.precio),
//             Number(p.cantidad),
//             Number(p.precio) * Number(p.cantidad),
//           ]);

//           DB.query(
//             `
//             INSERT INTO pedido_detalles
//             (pedido_id,producto_id,nombre,precio,cantidad,subtotal)
//             VALUES ?
//             `,
//             [detalles],
//             () => res.json({ ok: true, pedido_id: result.insertId })
//           );
//         }
//       );
//     }
//   );
// });

// /* ================= ADMIN PEDIDOS ================= */
// app.get("/api/pedidos-completo", (req, res) => {
//   try {
//     const page = Math.max(Number(req.query.page) || 1, 1);
//     const limit = 10;
//     const offset = (page - 1) * limit;

//     const { search, inicio, fin, estado } = req.query;

//     let where = "WHERE 1=1";
//     const params = [];

//     if (search) {
//       where += `
//         AND (
//           p.nombre LIKE ?
//           OR CAST(p.telefono AS CHAR) LIKE ?
//         )
//       `;
//       params.push(`%${search}%`, `%${search}%`);
//     }

//     if (inicio) {
//       where += " AND DATE(p.fecha) >= ?";
//       params.push(inicio);
//     }

//     if (fin) {
//       where += " AND DATE(p.fecha) <= ?";
//       params.push(fin);
//     }

//     if (estado && estado !== "todos") {
//       where += " AND p.estado = ?";
//       params.push(estado);
//     }

//     DB.query(
//       `SELECT COUNT(*) AS total FROM pedidos p ${where}`,
//       params,
//       (errCount, countRows) => {
//         if (errCount) {
//           console.error("❌ Error COUNT:", errCount);
//           return res.status(500).json({ ok: false });
//         }

//         const total = countRows[0].total;

//         DB.query(
//           `
//           SELECT
//             p.id,
//             p.nombre,
//             p.telefono,
//             p.direccion,
//             d.nombre AS departamento_nombre,
//             c.nombre AS ciudad_nombre,
//             p.total,
//             p.costo_envio,
//             p.estado,
//             p.fecha
//           FROM pedidos p
//           LEFT JOIN departamentos d ON p.departamento_id = d.id
//           LEFT JOIN ciudades c ON p.ciudad_id = c.id
//           ${where}
//           ORDER BY p.id DESC
//           LIMIT ? OFFSET ?
//           `,
//           [...params, limit, offset],
//           (errRows, rows) => {
//             if (errRows) {
//               console.error("❌ Error pedidos:", errRows);
//               return res.status(500).json({ ok: false });
//             }

//             res.json({
//               ok: true,
//               results: rows,
//               total,
//               totalPages: Math.ceil(total / limit),
//               page,
//             });
//           }
//         );
//       }
//     );
//   } catch (error) {
//     console.error("🔥 Error general:", error);
//     res.status(500).json({ ok: false });
//   }
// });

// app.get("/api/orden-servicio/:id", async (req, res) => {
//   const { id } = req.params;

//   try {
//     const [pedido] = await DB.promise().query(
//       `
//       SELECT
//         p.*,
//         d.nombre AS departamento_nombre,
//         c.nombre AS ciudad_nombre
//       FROM pedidos p
//       LEFT JOIN departamentos d ON p.departamento = d.id
//       LEFT JOIN ciudades c ON p.ciudad = c.id
//       WHERE p.id = ?
//       `,
//       [id]
//     );

//     if (!pedido.length) {
//       return res.status(404).json({ error: "Pedido no encontrado" });
//     }

//     const [detalle] = await DB.promise().query(
//       "SELECT * FROM pedido_detalles WHERE pedido_id = ?",
//       [id]
//     );

//     res.json({
//       pedido: pedido[0],
//       productos: detalle,
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: "Error del servidor" });
//   }
// });

// /* ================= CONTACTO - GUARDAR ================= */
// app.post("/api/contacto", (req, res) => {
//   console.log("📩 BODY:", req.body);

//   const { nombre, email, mensaje } = req.body;

//   if (!nombre || !email || !mensaje) {
//     return res.status(400).json({
//       ok: false,
//       message: "Todos los campos son obligatorios",
//     });
//   }

//   DB.query(
//     "INSERT INTO contacto (nombre, email, mensaje) VALUES (?,?,?)",
//     [nombre, email, mensaje],
//     (err, result) => {
//       if (err) {
//         console.error("❌ MYSQL ERROR:", err);
//         return res.status(500).json({
//           ok: false,
//           error: err.message,
//         });
//       }

//       res.status(201).json({
//         ok: true,
//         id: result.insertId,
//       });
//     }
//   );
// });

// /* ================= CONTACTO - ADMIN ================= */

// app.get("/api/admin/contacto", (req, res) => {
//   DB.query(
//     "SELECT id, nombre, email, mensaje, fecha FROM contacto ORDER BY fecha DESC",
//     (err, rows) => {
//       if (err) {
//         console.error("❌ MYSQL ERROR:", err);
//         return res.status(500).json({
//           ok: false,
//           error: err.message,
//         });
//       }
//       res.json(rows);
//     }
//   );
// });

// app.delete("/api/admin/contacto/:id", (req, res) => {
//   const { id } = req.params;

//   DB.query("DELETE FROM contacto WHERE id = ?", [id], (err, result) => {
//     if (err) {
//       console.error("❌ MYSQL ERROR:", err);
//       return res.status(500).json({ ok: false });
//     }

//     if (result.affectedRows === 0) {
//       return res.status(404).json({
//         ok: false,
//         message: "Mensaje no encontrado",
//       });
//     }

//     res.json({ ok: true });
//   });
// });

// app.put("/api/pedidos-estado/:id", (req, res) => {
//   DB.query(
//     `
//     UPDATE pedidos
//     SET estado = IF(estado='pendiente','entregado','pendiente')
//     WHERE id = ?
//     `,
//     [req.params.id],
//     (err, result) => {
//       if (err) return res.status(500).json({ ok: false });
//       if (!result.affectedRows) return res.status(404).json({ ok: false });
//       res.json({ ok: true });
//     }
//   );
// });

// app.delete("/api/pedidos/:id", (req, res) => {
//   DB.query("DELETE FROM pedidos WHERE id = ?", [req.params.id], () =>
//     res.json({ ok: true })
//   );
// });

// /* ================= EXCEL ================= */
// app.get("/api/exportar-pedidos-completo", async (req, res) => {
//   try {
//     const workbook = new ExcelJS.Workbook();
//     const worksheet = workbook.addWorksheet("Pedidos");

//     worksheet.columns = [
//       { header: "ID", key: "id", width: 8 },
//       { header: "Cliente", key: "nombre", width: 25 },
//       { header: "Teléfono", key: "telefono", width: 15 },
//       { header: "Dirección", key: "direccion", width: 30 },
//       { header: "Departamento", key: "departamento", width: 20 },
//       { header: "Ciudad", key: "ciudad", width: 20 },
//       { header: "Total", key: "total", width: 12 },
//       { header: "Estado", key: "estado", width: 15 },
//       { header: "Fecha", key: "fecha", width: 20 },
//     ];

//     const [rows] = await DB.promise().query(`
//       SELECT
//         p.id,
//         p.nombre,
//         p.telefono,
//         p.direccion,
//         p.departamento,
//         p.ciudad,
//         p.total,
//         p.estado,
//         p.fecha
//       FROM pedidos p
//       ORDER BY p.id DESC
//     `);

//     rows.forEach((row) => worksheet.addRow(row));

//     res.setHeader(
//       "Content-Type",
//       "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
//     );

//     res.setHeader("Content-Disposition", "attachment; filename=pedidos.xlsx");

//     await workbook.xlsx.write(res);
//     res.end();
//   } catch (error) {
//     console.error("❌ ERROR EXPORTANDO EXCEL:", error);
//     res.status(500).json({ ok: false, error: error.message });
//   }
// });
// /* ================================================= */
// /* ========= ELIMINAR PRODUCTO (SOFT DELETE) ======= */
// /* ================================================= */
// app.delete("/api/productos/:id", async (req, res) => {
//   const { id } = req.params;

//   try {
//     const [result] = await DB.promise().query(
//       "UPDATE productos SET activo = 0 WHERE id = ?",
//       [id]
//     );

//     if (!result.affectedRows) {
//       return res.status(404).json({
//         ok: false,
//         message: "Producto no encontrado",
//       });
//     }

//     res.json({
//       ok: true,
//       message: "Producto eliminado correctamente",
//     });
//   } catch (error) {
//     console.error("❌ ERROR DELETE PRODUCTO:", error);
//     res.status(500).json({
//       ok: false,
//       message: "Error al eliminar producto",
//     });
//   }
// });
// /*================================================ */
// /* ============ ACTUALIZAR PRODUCTO =============== */
// /* ================================================= */
// app.put("/api/productos/:id", async (req, res) => {
//   const { id } = req.params;
//   const { nombre, precio, descripcion } = req.body;

//   const campos = [];
//   const valores = [];

//   if (typeof nombre === "string" && nombre.trim() !== "") {
//     campos.push("nombre = ?");
//     valores.push(nombre.trim());
//   }

//   if (precio !== undefined && precio !== "" && !isNaN(Number(precio))) {
//     campos.push("precio = ?");
//     valores.push(Number(precio));
//   }

//   if (descripcion !== undefined) {
//     campos.push("descripcion = ?");
//     valores.push(descripcion);
//   }

//   if (campos.length === 0) {
//     return res.status(400).json({
//       ok: false,
//       message: "No hay campos válidos para actualizar",
//     });
//   }

//   try {
//     const [result] = await DB.promise().query(
//       `UPDATE productos SET ${campos.join(", ")} WHERE id = ?`,
//       [...valores, id]
//     );

//     if (!result.affectedRows) {
//       return res.status(404).json({
//         ok: false,
//         message: "Producto no encontrado",
//       });
//     }

//     res.json({
//       ok: true,
//       message: "Producto actualizado correctamente",
//     });
//   } catch (error) {
//     console.error("❌ ERROR PUT PRODUCTOS:", error);
//     res.status(500).json({
//       ok: false,
//       message: error.message,
//     });
//   }
// });

// /* ================================================= */
// /* ======= PRODUCTOS RECOMENDADOS POR CATEGORÍA ==== */
// /* ================================================= */

// app.get("/api/productos-recomendados/:id", async (req, res) => {
//   const { id } = req.params;

//   try {
//     // 1️⃣ Obtener la categoría del producto actual
//     const [producto] = await DB.promise().query(
//       "SELECT categoria_id FROM productos WHERE id = ? AND activo = 1",
//       [id]
//     );

//     if (!producto.length) {
//       return res.status(404).json([]);
//     }

//     const categoriaId = producto[0].categoria_id;

//     // 2️⃣ Buscar 4 productos de la misma categoría (excluyendo el actual)
//     const [recomendados] = await DB.promise().query(
//       `
//       SELECT id, nombre, precio, imagen
//       FROM productos
//       WHERE categoria_id = ?
//         AND id != ?
//         AND activo = 1
//       ORDER BY RAND()
//       LIMIT 10
//       `,
//       [categoriaId, id]
//     );

//     res.json(recomendados);
//   } catch (error) {
//     console.error("❌ ERROR RECOMENDADOS:", error);
//     res.status(500).json([]);
//   }
// });

// /* ================= SERVER ================= */
// app.listen(PORT, "0.0.0.0", () =>
//   console.log("🚀 Backend funcionando correctamente")
// );
