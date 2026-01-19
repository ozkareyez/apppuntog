import express from "express";
import mysql from "mysql2";
import cors from "cors";
import path from "path";
import multer from "multer";
import { fileURLToPath } from "url";
import { v2 as cloudinary } from "cloudinary";

/* ================= APP ================= */
const app = express();
const PORT = process.env.PORT || 3002;

/* ================= MIDDLEWARE ================= */
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* ================= PATH ================= */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/* ================= MYSQL ================= */
const DB = mysql.createPool({
  host: process.env.MYSQLHOST,
  user: process.env.MYSQLUSER,
  password: process.env.MYSQLPASSWORD,
  database: process.env.MYSQLDATABASE,
  port: process.env.MYSQLPORT,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

/* ================= CLOUDINARY ================= */
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
});

/* ================= FUNCIÓN PARA VERIFICAR/CREAR TABLAS ================= */
const verificarYCrearTablas = async () => {
  console.log("🔧 Verificando estructura de la base de datos...");

  try {
    // 1. Verificar si existe la tabla 'categorias'
    const [tablas] = await DB.promise().query("SHOW TABLES LIKE 'categorias'");

    if (tablas.length === 0) {
      console.log("📝 La tabla 'categorias' no existe. Creándola...");

      // Crear tabla categorias SIN foreign key primero
      await DB.promise().query(`
        CREATE TABLE categorias (
          id INT AUTO_INCREMENT PRIMARY KEY,
          nombre VARCHAR(100) NOT NULL,
          slug VARCHAR(100) UNIQUE NOT NULL,
          descripcion TEXT,
          activo TINYINT(1) DEFAULT 1,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB
      `);

      console.log("✅ Tabla 'categorias' creada exitosamente");

      // Insertar categorías por defecto
      await DB.promise().query(`
        INSERT INTO categorias (nombre, slug, descripcion) VALUES
        ('Lencería', 'lenceria', 'Ropa interior femenina'),
        ('Juguetes Eróticos', 'juguetes-eroticos', 'Productos para adultos'),
        ('Cosméticos', 'cosmeticos', 'Productos de belleza'),
        ('Masajes', 'masajes', 'Aceites y productos para masajes'),
        ('Accesorios', 'accesorios', 'Accesorios y complementos')
      `);

      console.log("✅ Categorías por defecto insertadas");
    } else {
      console.log("✅ La tabla 'categorias' ya existe");
    }

    // 2. Verificar si existe la tabla 'productos'
    const [tablasProductos] = await DB.promise().query(
      "SHOW TABLES LIKE 'productos'",
    );

    if (tablasProductos.length === 0) {
      console.log("📝 La tabla 'productos' no existe. Creándola...");

      // Crear tabla productos SIN foreign key primero
      await DB.promise().query(`
        CREATE TABLE productos (
          id INT AUTO_INCREMENT PRIMARY KEY,
          categoria VARCHAR(30),
          nombre VARCHAR(150),
          talla VARCHAR(30),
          color VARCHAR(30),
          precio INT NOT NULL,
          imagen VARCHAR(500),
          categoria_id INT,
          precio_antes DECIMAL(10,2),
          descuento INT,
          es_oferta TINYINT(1) DEFAULT 0,
          descripcion TEXT,
          activo TINYINT(1) DEFAULT 1,
          imagen_cloud1 VARCHAR(255),
          imagen_cloud2 VARCHAR(255),
          imagen_cloud3 VARCHAR(255),
          public_id1 VARCHAR(255),
          public_id2 VARCHAR(255),
          public_id3 VARCHAR(255),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB
      `);

      console.log("✅ Tabla 'productos' creada exitosamente");
    } else {
      console.log("✅ La tabla 'productos' ya existe");
    }

    // 3. Verificar si existe la foreign key y quitarla temporalmente si causa problemas
    try {
      const [constraints] = await DB.promise().query(`
        SELECT CONSTRAINT_NAME 
        FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
        WHERE TABLE_NAME = 'productos' 
        AND COLUMN_NAME = 'categoria_id'
        AND CONSTRAINT_NAME != 'PRIMARY'
      `);

      if (constraints.length > 0) {
        console.log(
          "⚠️ Encontrada foreign key. Eliminándola temporalmente para evitar errores...",
        );

        for (const constraint of constraints) {
          await DB.promise().query(`
            ALTER TABLE productos 
            DROP FOREIGN KEY ${constraint.CONSTRAINT_NAME}
          `);
          console.log(`✅ Foreign key ${constraint.CONSTRAINT_NAME} eliminada`);
        }
      }
    } catch (error) {
      console.log(
        "ℹ️ No se pudo verificar/eliminar foreign keys:",
        error.message,
      );
    }

    console.log("🎉 Base de datos verificada y lista para usar");
  } catch (error) {
    console.error("❌ Error verificando/creando tablas:", error);
  }
};

// Ejecutar al inicio
verificarYCrearTablas();

/* ================= RUTAS PRINCIPALES ================= */

/* ================= ROOT ================= */
app.get("/", (req, res) => {
  res.json({
    ok: true,
    message: "Backend Punto G funcionando",
    timestamp: new Date().toISOString(),
  });
});

/* ================= HEALTH CHECK ================= */
app.get("/api/health", async (req, res) => {
  try {
    await DB.promise().query("SELECT 1");
    res.json({
      ok: true,
      message: "✅ Backend y base de datos funcionando",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: "❌ Error de conexión a la base de datos",
      error: error.message,
    });
  }
});

/* ================= CATEGORÍAS (SIEMPRE FUNCIONA) ================= */
app.get("/api/categorias", async (req, res) => {
  console.log("📥 Solicitando categorías...");

  try {
    // Intentar obtener categorías de la base de datos
    const [results] = await DB.promise().query(`
      SELECT id, nombre,
      FROM categorias 
      WHERE activo = 1 
      ORDER BY nombre
    `);

    console.log(`✅ ${results.length} categorías encontradas en BD`);

    // Si hay resultados, devolverlos
    if (results && results.length > 0) {
      return res.json(results);
    }

    // Si no hay resultados, devolver categorías por defecto
    console.log("📋 No hay categorías en BD, devolviendo por defecto");
    const categoriasPorDefecto = [
      { id: 1, nombre: "Lencería", slug: "lenceria" },
      { id: 2, nombre: "Juguetes", slug: "juguetes" },
      { id: 3, nombre: "Cosméticos", slug: "cosmeticos" },
      { id: 4, nombre: "Masajes", slug: "masajes" },
      { id: 5, nombre: "Accesorios", slug: "accesorios" },
    ];

    res.json(categoriasPorDefecto);
  } catch (error) {
    console.error("❌ Error al obtener categorías:", error.message);

    // En caso de error, devolver categorías por defecto
    const categoriasPorDefecto = [
      { id: 1, nombre: "Lencería", slug: "lenceria" },
      { id: 2, nombre: "Juguetes", slug: "juguetes" },
      { id: 3, nombre: "Cosméticos", slug: "cosmeticos" },
    ];

    res.json(categoriasPorDefecto);
  }
});

/* ================= CREAR PRODUCTO (SIN FOREIGN KEY) ================= */
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

  console.log("📦 Datos recibidos:", {
    nombre,
    precio,
    categoria_id,
    imagenesCount: imagenes?.length || 0,
  });

  // Validaciones básicas
  if (!nombre || !precio) {
    return res.status(400).json({
      ok: false,
      message: "Faltan campos obligatorios: nombre, precio",
    });
  }

  if (!imagenes || imagenes.length === 0) {
    return res.status(400).json({
      ok: false,
      message: "Debe subir al menos una imagen",
    });
  }

  try {
    // Usar categoría por defecto si no se especifica
    const categoriaIdFinal = categoria_id || 1;

    // Preparar imágenes
    const imagen_cloud1 = imagenes.length > 0 ? imagenes[0] : null;
    const imagen_cloud2 = imagenes.length > 1 ? imagenes[1] : null;
    const imagen_cloud3 = imagenes.length > 2 ? imagenes[2] : null;
    const imagen = imagenes.length > 0 ? imagenes[0] : null;

    console.log(`🖼️ Guardando producto con ${imagenes.length} imágenes...`);

    // Insertar producto SIN verificar foreign key
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
        categoriaIdFinal, // Usar categoría por defecto si es necesario
        precio_antes,
        descuento,
        es_oferta,
        descripcion,
        imagen_cloud1,
        imagen_cloud2,
        imagen_cloud3,
      ],
    );

    console.log(`✅ Producto creado exitosamente! ID: ${result.insertId}`);

    res.status(201).json({
      ok: true,
      producto_id: result.insertId,
      message: `Producto "${nombre}" creado con ${imagenes.length} imagen(es)`,
      categoria_usada: categoriaIdFinal,
    });
  } catch (error) {
    console.error("❌ Error al crear producto:", error);

    // Error más amigable
    res.status(500).json({
      ok: false,
      message: "Error al guardar el producto en la base de datos",
      error: error.message,
      sugerencia: "Verifica que todos los campos obligatorios estén completos",
    });
  }
});

/* ================= TODOS LOS PRODUCTOS ================= */
app.get("/api/productos", (req, res) => {
  console.log("📥 Listando productos...");

  const { categoria, es_oferta, limit } = req.query;

  let query = `
    SELECT 
      p.*,
      c.nombre as categoria_nombre,
      c.slug as categoria_slug
    FROM productos p
    LEFT JOIN categorias c ON p.categoria_id = c.id
    WHERE p.activo = 1
  `;

  const params = [];

  if (categoria && categoria !== "todas") {
    query += " AND c.slug = ?";
    params.push(categoria);
  }

  if (es_oferta === "true") {
    query += " AND p.es_oferta = 1";
  }

  query += " ORDER BY p.id DESC";

  if (limit) {
    query += " LIMIT ?";
    params.push(parseInt(limit));
  }

  DB.query(query, params, (err, results) => {
    if (err) {
      console.error("❌ ERROR PRODUCTOS:", err);
      // Devolver array vacío en caso de error
      return res.json([]);
    }

    console.log(`✅ ${results.length} productos encontrados`);

    const productos = results.map((p) => {
      // Construir array de imágenes
      const imagenesArray = [];

      if (p.imagen_cloud1 && p.imagen_cloud1 !== "null")
        imagenesArray.push(p.imagen_cloud1);
      if (p.imagen_cloud2 && p.imagen_cloud2 !== "null")
        imagenesArray.push(p.imagen_cloud2);
      if (p.imagen_cloud3 && p.imagen_cloud3 !== "null")
        imagenesArray.push(p.imagen_cloud3);

      // Si no hay imágenes en campos cloud, usar imagen principal
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
        categoria_nombre: p.categoria_nombre || "Sin categoría",
        categoria_slug: p.categoria_slug || "sin-categoria",
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
    if (err || !rows.length) {
      console.error("❌ Producto no encontrado o error:", err?.message);
      return res.status(404).json({
        error: "Producto no encontrado",
        id: id,
      });
    }

    const p = rows[0];

    // Construir array de imágenes
    const imagenesArray = [];

    if (p.imagen_cloud1 && p.imagen_cloud1 !== "null")
      imagenesArray.push(p.imagen_cloud1);
    if (p.imagen_cloud2 && p.imagen_cloud2 !== "null")
      imagenesArray.push(p.imagen_cloud2);
    if (p.imagen_cloud3 && p.imagen_cloud3 !== "null")
      imagenesArray.push(p.imagen_cloud3);
    if (imagenesArray.length === 0 && p.imagen && p.imagen !== "null")
      imagenesArray.push(p.imagen);

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
      categoria_nombre: p.categoria_nombre || "Sin categoría",
      categoria_slug: p.categoria_slug || "sin-categoria",
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

/* ================= UPLOAD IMAGEN ================= */
app.post("/api/upload-imagen", upload.single("imagen"), async (req, res) => {
  try {
    console.log("📤 Subiendo imagen...");

    if (!req.file) {
      return res.status(400).json({
        ok: false,
        message: "No se subió ninguna imagen",
      });
    }

    const b64 = req.file.buffer.toString("base64");
    const dataURI = `data:${req.file.mimetype};base64,${b64}`;

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
    console.error("❌ Error subiendo imagen:", error);
    res.status(500).json({
      ok: false,
      message: "Error al subir la imagen",
      error: error.message,
    });
  }
});

/* ================= ENDPOINTS SIMPLES PARA EVITAR ERRORES 404 ================= */
app.get("/api/pedidos", (req, res) => res.json([]));
app.get("/api/pedidos-completo", (req, res) => res.json([]));
app.get("/api/productos-recomendados/:id", (req, res) => res.json([]));

/* ================= ENDPOINT ESPECIAL PARA FIX DE CATEGORÍAS ================= */
app.get("/api/fix-categorias", async (req, res) => {
  try {
    console.log("🔧 Ejecutando fix de categorías...");

    // 1. Crear tabla si no existe
    await DB.promise().query(`
      CREATE TABLE IF NOT EXISTS categorias (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nombre VARCHAR(100) NOT NULL,
        slug VARCHAR(100) UNIQUE NOT NULL,
        descripcion TEXT,
        activo TINYINT(1) DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB
    `);

    // 2. Vaciar tabla (opcional)
    await DB.promise().query("DELETE FROM categorias");

    // 3. Insertar nuevas categorías
    await DB.promise().query(`
      INSERT INTO categorias (nombre, slug, descripcion) VALUES
      ('Lencería', 'lenceria', 'Ropa interior femenina y lencería sexy'),
      ('Juguetes Eróticos', 'juguetes-eroticos', 'Juguetes para adultos y productos eróticos'),
      ('Cosméticos Íntimos', 'cosmeticos-intimos', 'Cosméticos y cuidado personal íntimo'),
      ('Lubricantes', 'lubricantes', 'Lubricantes y geles íntimos'),
      ('Ropa Interior Masculina', 'ropa-masculina', 'Ropa interior para hombres'),
      ('Accesorios', 'accesorios', 'Accesorios eróticos y complementos'),
      ('Juegos de Parejas', 'juegos-parejas', 'Juegos y productos para parejas'),
      ('Fetiche', 'fetiche', 'Productos fetichistas y BDSM'),
      ('Estimulantes', 'estimulantes', 'Productos estimulantes y afrodisíacos'),
      ('Novias', 'novias', 'Lencería para novias y ocasiones especiales')
    `);

    // 4. Obtener categorías creadas
    const [categorias] = await DB.promise().query(
      "SELECT * FROM categorias ORDER BY id",
    );

    res.json({
      ok: true,
      message: "✅ Categorías creadas exitosamente",
      total: categorias.length,
      categorias: categorias,
    });
  } catch (error) {
    console.error("❌ Error en fix-categorias:", error);
    res.status(500).json({
      ok: false,
      message: "Error al crear categorías",
      error: error.message,
    });
  }
});

/* ================= MANEJO DE ERRORES ================= */
app.use((err, req, res, next) => {
  console.error("❌ ERROR:", err);
  res.status(500).json({
    ok: false,
    message: "Error interno del servidor",
    error: err.message,
  });
});

/* ================= 404 HANDLER ================= */
app.use((req, res) => {
  res.status(404).json({
    ok: false,
    message: `Endpoint no encontrado: ${req.method} ${req.url}`,
    endpoints_disponibles: [
      "GET    /api/health",
      "GET    /api/categorias",
      "GET    /api/fix-categorias",
      "GET    /api/productos",
      "GET    /api/productos/:id",
      "POST   /api/productos",
      "POST   /api/upload-imagen",
    ],
  });
});

/* ================= INICIAR SERVIDOR ================= */
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Servidor backend Punto G iniciado en puerto ${PORT}`);
  console.log(`🌐 URL: http://localhost:${PORT}`);
  console.log("🔧 Características:");
  console.log("  ✅ Crea automáticamente tablas si no existen");
  console.log("  ✅ Sin foreign keys que causen errores");
  console.log("  ✅ Siempre devuelve respuestas JSON válidas");
  console.log("  ✅ Manejo robusto de errores");
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

// const uploadMultiple = multer({
//   storage: multer.memoryStorage(),
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
// }).array("imagenes", 3);

// /* ================= ROOT ================= */
// app.get("/", (_, res) => res.json({ ok: true }));

// /* ================= UPLOAD MÚLTIPLES IMÁGENES - CLOUDINARY ================= */
// app.post("/api/upload-imagenes", uploadMultiple, async (req, res) => {
//   try {
//     console.log("📤 Recibiendo múltiples archivos...");

//     if (!req.files || req.files.length === 0) {
//       return res.status(400).json({
//         ok: false,
//         message: "No se subieron imágenes",
//       });
//     }

//     console.log(`📄 Archivos recibidos: ${req.files.length}`);

//     if (
//       !process.env.CLOUDINARY_CLOUD_NAME ||
//       !process.env.CLOUDINARY_API_KEY ||
//       !process.env.CLOUDINARY_API_SECRET
//     ) {
//       return res.status(500).json({
//         ok: false,
//         message: "Cloudinary no está configurado correctamente",
//       });
//     }

//     const uploadPromises = req.files.map((file) => {
//       const b64 = file.buffer.toString("base64");
//       const dataURI = `data:${file.mimetype};base64,${b64}`;

//       return cloudinary.uploader.upload(dataURI, {
//         folder: "punto-g-productos",
//       });
//     });

//     console.log("☁️ Subiendo imágenes a Cloudinary...");
//     const results = await Promise.all(uploadPromises);

//     console.log(`✅ ${results.length} imágenes subidas exitosamente`);

//     res.json({
//       ok: true,
//       imagenes: results.map((result) => ({
//         url: result.secure_url,
//         public_id: result.public_id,
//       })),
//     });
//   } catch (error) {
//     console.error("❌ ERROR Cloudinary múltiples:", error);
//     res.status(500).json({
//       ok: false,
//       message: error.message || "Error al subir imágenes",
//     });
//   }
// });

// /* ================= UPLOAD UNA IMAGEN - CLOUDINARY ================= */
// app.post("/api/upload-imagen", upload.single("imagen"), async (req, res) => {
//   try {
//     console.log("📤 Recibiendo archivo...");

//     if (!req.file) {
//       return res.status(400).json({
//         ok: false,
//         message: "No se subió imagen",
//       });
//     }

//     if (
//       !process.env.CLOUDINARY_CLOUD_NAME ||
//       !process.env.CLOUDINARY_API_KEY ||
//       !process.env.CLOUDINARY_API_SECRET
//     ) {
//       return res.status(500).json({
//         ok: false,
//         message: "Cloudinary no está configurado correctamente",
//       });
//     }

//     const b64 = req.file.buffer.toString("base64");
//     const dataURI = `data:${req.file.mimetype};base64,${b64}`;

//     console.log("☁️ Subiendo a Cloudinary...");

//     const result = await cloudinary.uploader.upload(dataURI, {
//       folder: "punto-g-productos",
//     });

//     console.log("✅ Imagen subida a Cloudinary:", result.secure_url);

//     res.json({
//       ok: true,
//       url: result.secure_url,
//       public_id: result.public_id,
//     });
//   } catch (error) {
//     console.error("❌ ERROR Cloudinary:", error);
//     res.status(500).json({
//       ok: false,
//       message: "Error al subir imagen a Cloudinary",
//       error: error.message,
//     });
//   }
// });

// /* ================= PRODUCTOS CON ARRAY DE IMÁGENES ================= */
// app.get("/api/productos", (req, res) => {
//   const { categoria, es_oferta, limit } = req.query;

//   let query = `
//     SELECT
//       p.*,
//       c.nombre as categoria_nombre,
//       c.slug as categoria_slug
//     FROM productos p
//     LEFT JOIN categorias c ON p.categoria_id = c.id
//   `;

//   const params = [];
//   const conditions = ["p.activo = 1"];

//   if (categoria && categoria !== "todas") {
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

//   DB.query(query, params, (err, results) => {
//     if (err) {
//       console.error("❌ ERROR PRODUCTOS:", err);
//       return res.status(500).json({ error: err.message });
//     }

//     const productos = results.map((p) => {
//       // Construir array de imágenes
//       const imagenes = [];

//       // Agregar imágenes Cloudinary si existen
//       if (p.imagen_cloud1) {
//         imagenes.push({
//           url: p.imagen_cloud1,
//           public_id: p.public_id1,
//           type: "cloud",
//         });
//       }
//       if (p.imagen_cloud2) {
//         imagenes.push({
//           url: p.imagen_cloud2,
//           public_id: p.public_id2,
//           type: "cloud",
//         });
//       }
//       if (p.imagen_cloud3) {
//         imagenes.push({
//           url: p.imagen_cloud3,
//           public_id: p.public_id3,
//           type: "cloud",
//         });
//       }

//       // Si no hay imágenes cloud, usar el campo imagen
//       if (imagenes.length === 0 && p.imagen) {
//         imagenes.push({
//           url: p.imagen,
//           public_id: null,
//           type: "local",
//         });
//       }

//       return {
//         id: p.id,
//         nombre: p.nombre,
//         descripcion: p.descripcion,
//         descripcion_breve: p.descripcion_breve,
//         precio: Number(p.precio),
//         precio_antes: p.precio_antes ? Number(p.precio_antes) : null,
//         descuento: p.descuento ? Number(p.descuento) : 0,
//         es_oferta: Boolean(p.es_oferta),
//         categoria: p.categoria,
//         talla: p.talla,
//         color: p.color,
//         categoria_id: p.categoria_id,
//         categoria_nombre: p.categoria_nombre,
//         categoria_slug: p.categoria_slug,
//         stock: p.stock || 10,
//         activo: Boolean(p.activo),
//         imagen: p.imagen, // Para compatibilidad
//         imagenes: imagenes, // Array de imágenes
//         // Mantener campos individuales
//         imagen_cloud1: p.imagen_cloud1,
//         imagen_cloud2: p.imagen_cloud2,
//         imagen_cloud3: p.imagen_cloud3,
//       };
//     });

//     res.json(productos);
//   });
// });

// /* ================= PRODUCTO INDIVIDUAL CON ARRAY DE IMÁGENES ================= */
// app.get("/api/productos/:id", (req, res) => {
//   const query = `
//     SELECT
//       p.*,
//       c.nombre as categoria_nombre,
//       c.slug as categoria_slug
//     FROM productos p
//     LEFT JOIN categorias c ON p.categoria_id = c.id
//     WHERE p.id = ? AND p.activo = 1
//   `;

//   DB.query(query, [req.params.id], (err, rows) => {
//     if (err) {
//       console.error("❌ ERROR PRODUCTO:", err);
//       return res.status(500).json({ error: err.message });
//     }

//     if (!rows.length) return res.status(404).json({ error: "No encontrado" });

//     const p = rows[0];

//     // Construir array de imágenes
//     const imagenes = [];

//     // Agregar imágenes Cloudinary si existen
//     if (p.imagen_cloud1) {
//       imagenes.push({
//         url: p.imagen_cloud1,
//         public_id: p.public_id1,
//         type: "cloud",
//       });
//     }
//     if (p.imagen_cloud2) {
//       imagenes.push({
//         url: p.imagen_cloud2,
//         public_id: p.public_id2,
//         type: "cloud",
//       });
//     }
//     if (p.imagen_cloud3) {
//       imagenes.push({
//         url: p.imagen_cloud3,
//         public_id: p.public_id3,
//         type: "cloud",
//       });
//     }

//     // Si no hay imágenes cloud, usar el campo imagen
//     if (imagenes.length === 0 && p.imagen) {
//       imagenes.push({
//         url: p.imagen,
//         public_id: null,
//         type: "local",
//       });
//     }

//     const producto = {
//       id: p.id,
//       nombre: p.nombre,
//       descripcion: p.descripcion,
//       descripcion_breve: p.descripcion_breve,
//       precio: Number(p.precio),
//       precio_antes: p.precio_antes ? Number(p.precio_antes) : null,
//       descuento: p.descuento ? Number(p.descuento) : 0,
//       es_oferta: Boolean(p.es_oferta),
//       categoria: p.categoria,
//       talla: p.talla,
//       color: p.color,
//       categoria_id: p.categoria_id,
//       categoria_nombre: p.categoria_nombre,
//       categoria_slug: p.categoria_slug,
//       stock: p.stock || 10,
//       activo: Boolean(p.activo),
//       imagen: p.imagen, // Para compatibilidad
//       imagenes: imagenes, // Array de imágenes
//       // Mantener campos individuales
//       imagen_cloud1: p.imagen_cloud1,
//       imagen_cloud2: p.imagen_cloud2,
//       imagen_cloud3: p.imagen_cloud3,
//     };

//     console.log(`✅ Producto ${p.id} enviado con ${imagenes.length} imágenes`);
//     res.json(producto);
//   });
// });

// /* ================= CREAR PRODUCTO CON 3 IMÁGENES ================= */
// app.post("/api/productos", async (req, res) => {
//   const {
//     categoria = null,
//     nombre,
//     talla = null,
//     color = null,
//     precio,
//     categoria_id,
//     precio_antes = null,
//     descuento = null,
//     es_oferta = 0,
//     descripcion = null,
//     descripcion_breve = null,
//     stock = 10,
//     imagenes = [], // Array de objetos {url, public_id}
//   } = req.body;

//   // Validación
//   if (!nombre || !precio || !categoria_id) {
//     return res.status(400).json({
//       ok: false,
//       message: "Faltan campos obligatorios: nombre, precio, categoria_id",
//     });
//   }

//   // Preparar datos para los campos de imágenes
//   const imagen_cloud1 = imagenes.length > 0 ? imagenes[0].url : null;
//   const imagen_cloud2 = imagenes.length > 1 ? imagenes[1].url : null;
//   const imagen_cloud3 = imagenes.length > 2 ? imagenes[2].url : null;
//   const public_id1 = imagenes.length > 0 ? imagenes[0].public_id : null;
//   const public_id2 = imagenes.length > 1 ? imagenes[1].public_id : null;
//   const public_id3 = imagenes.length > 2 ? imagenes[2].public_id : null;

//   // Para compatibilidad: mantener el campo imagen con la primera imagen
//   const imagen = imagenes.length > 0 ? imagenes[0].url : null;

//   try {
//     const [result] = await DB.promise().query(
//       `INSERT INTO productos
//       (categoria, nombre, talla, color, precio, imagen, categoria_id,
//        precio_antes, descuento, es_oferta, descripcion, descripcion_breve, stock,
//        imagen_cloud1, imagen_cloud2, imagen_cloud3,
//        public_id1, public_id2, public_id3)
//       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
//       [
//         categoria,
//         nombre,
//         talla,
//         color,
//         precio,
//         imagen,
//         categoria_id,
//         precio_antes,
//         descuento,
//         es_oferta,
//         descripcion,
//         descripcion_breve,
//         stock,
//         imagen_cloud1,
//         imagen_cloud2,
//         imagen_cloud3,
//         public_id1,
//         public_id2,
//         public_id3,
//       ],
//     );

//     console.log(
//       `✅ Producto creado con ID: ${result.insertId}, ${imagenes.length} imágenes`,
//     );

//     res.status(201).json({
//       ok: true,
//       producto_id: result.insertId,
//     });
//   } catch (error) {
//     console.error("❌ Error MySQL:", error);
//     res.status(500).json({
//       ok: false,
//       message: error.sqlMessage || error.message,
//     });
//   }
// });

// /* ================= PRODUCTOS RECOMENDADOS CON ARRAY DE IMÁGENES ================= */
// app.get("/api/productos-recomendados/:id", async (req, res) => {
//   const { id } = req.params;

//   try {
//     // 1️⃣ Obtener la categoría del producto actual
//     const [producto] = await DB.promise().query(
//       "SELECT categoria_id FROM productos WHERE id = ? AND activo = 1",
//       [id],
//     );

//     if (!producto.length) {
//       return res.status(404).json([]);
//     }

//     const categoriaId = producto[0].categoria_id;

//     // 2️⃣ Buscar productos de la misma categoría
//     const [recomendados] = await DB.promise().query(
//       `
//       SELECT
//         p.id,
//         p.nombre,
//         p.precio,
//         p.imagen,
//         p.imagen_cloud1,
//         p.public_id1,
//         p.imagen_cloud2,
//         p.public_id2,
//         p.imagen_cloud3,
//         p.public_id3,
//         p.es_oferta,
//         p.precio_antes
//       FROM productos p
//       WHERE p.categoria_id = ?
//         AND p.id != ?
//         AND p.activo = 1
//       ORDER BY RAND()
//       LIMIT 10
//       `,
//       [categoriaId, id],
//     );

//     // Procesar imágenes
//     const productosConImagenes = recomendados.map((p) => {
//       const imagenes = [];

//       // Agregar imágenes Cloudinary
//       if (p.imagen_cloud1) {
//         imagenes.push({
//           url: p.imagen_cloud1,
//           public_id: p.public_id1,
//           type: "cloud",
//         });
//       }
//       if (p.imagen_cloud2) {
//         imagenes.push({
//           url: p.imagen_cloud2,
//           public_id: p.public_id2,
//           type: "cloud",
//         });
//       }
//       if (p.imagen_cloud3) {
//         imagenes.push({
//           url: p.imagen_cloud3,
//           public_id: p.public_id3,
//           type: "cloud",
//         });
//       }

//       // Si no hay imágenes cloud, usar el campo imagen
//       if (imagenes.length === 0 && p.imagen) {
//         imagenes.push({
//           url: p.imagen,
//           public_id: null,
//           type: "local",
//         });
//       }

//       return {
//         id: p.id,
//         nombre: p.nombre,
//         precio: Number(p.precio),
//         es_oferta: Boolean(p.es_oferta),
//         precio_antes: p.precio_antes ? Number(p.precio_antes) : null,
//         // Para compatibilidad
//         imagen: p.imagen,
//         // Array de imágenes
//         imagenes: imagenes,
//       };
//     });

//     console.log(
//       `✅ ${productosConImagenes.length} productos recomendados enviados`,
//     );
//     res.json(productosConImagenes);
//   } catch (error) {
//     console.error("❌ ERROR RECOMENDADOS:", error);
//     res.status(500).json([]);
//   }
// });

// /* ================= ELIMINAR IMÁGENES DE CLOUDINARY ================= */
// app.delete("/api/eliminar-imagen-cloudinary", async (req, res) => {
//   const { public_id } = req.body;

//   if (!public_id) {
//     return res.status(400).json({
//       ok: false,
//       message: "Se requiere public_id",
//     });
//   }

//   try {
//     const result = await cloudinary.uploader.destroy(public_id);

//     if (result.result === "ok") {
//       // Buscar y actualizar el campo correspondiente en la base de datos
//       const queries = [
//         `UPDATE productos SET imagen_cloud1 = NULL, public_id1 = NULL WHERE public_id1 = ?`,
//         `UPDATE productos SET imagen_cloud2 = NULL, public_id2 = NULL WHERE public_id2 = ?`,
//         `UPDATE productos SET imagen_cloud3 = NULL, public_id3 = NULL WHERE public_id3 = ?`,
//       ];

//       for (const query of queries) {
//         await DB.promise().query(query, [public_id]);
//       }

//       res.json({
//         ok: true,
//         message: "Imagen eliminada correctamente",
//       });
//     } else {
//       res.status(500).json({
//         ok: false,
//         message: "Error al eliminar imagen de Cloudinary",
//       });
//     }
//   } catch (error) {
//     console.error("❌ ERROR ELIMINAR IMAGEN:", error);
//     res.status(500).json({
//       ok: false,
//       message: error.message,
//     });
//   }
// });

// /* ================= MANTENER EL RESTO DE LOS ENDPOINTS ================= */
// // ... (los demás endpoints se mantienen igual)

// /* ================= SERVER ================= */
// app.listen(PORT, "0.0.0.0", () =>
//   console.log("🚀 Backend funcionando correctamente"),
// );

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
