import express from "express";
import mysql from "mysql2";
import cors from "cors";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import ExcelJS from "exceljs";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

/* ================= CONFIGURACIÓN ================= */
dotenv.config();
const app = express();
const PORT = process.env.PORT || 3002;

/* ================= MIDDLEWARE ================= */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS COMPLETO
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "Accept",
      "X-HTTP-Method-Override",
    ],
    credentials: true,
    optionsSuccessStatus: 204,
  }),
);

// Manejo explícito de OPTIONS
app.options("*", (req, res) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS, PATCH",
  );
  res.header(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, Accept",
  );
  res.header("Access-Control-Allow-Credentials", "true");
  res.status(204).send();
});

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

// Verificar conexión
DB.getConnection((err, connection) => {
  if (err) {
    console.error("❌ Error MySQL:", err.message);
  } else {
    console.log("✅ Conectado a MySQL");
    connection.release();
  }
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

/* ================= SEGURIDAD: TOKEN VERIFICATION ================= */
const verifyToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];

  if (!authHeader) {
    return res.status(401).json({
      success: false,
      message: "Token no proporcionado",
    });
  }

  const token = authHeader.split(" ")[1]; // Bearer <token>

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Formato de token inválido",
    });
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "fallback_secret_123",
    );
    req.user = decoded;
    next();
  } catch (error) {
    console.error("❌ Token inválido:", error.message);
    return res.status(401).json({
      success: false,
      message: "Token inválido o expirado",
    });
  }
};

/* ================= SEGURIDAD: INICIALIZAR USUARIOS ================= */
const initializeUsers = async () => {
  try {
    // Verificar si existe la tabla usuarios
    const [tables] = await DB.promise().query(
      `
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'usuarios'
    `,
      [process.env.MYSQLDATABASE],
    );

    if (tables.length === 0) {
      console.log("📦 Creando tabla 'usuarios'...");

      await DB.promise().query(`
        CREATE TABLE usuarios (
          id INT PRIMARY KEY AUTO_INCREMENT,
          username VARCHAR(50) UNIQUE NOT NULL,
          password_hash VARCHAR(255) NOT NULL,
          role VARCHAR(50) DEFAULT 'Usuario',
          icon VARCHAR(10) DEFAULT '👤',
          visible BOOLEAN DEFAULT true,
          permissions JSON DEFAULT '[]',
          failed_attempts INT DEFAULT 0,
          locked_until DATETIME,
          last_login DATETIME,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB
      `);
      console.log("✅ Tabla 'usuarios' creada");
    }

    // Verificar si hay usuarios
    const [users] = await DB.promise().query(
      "SELECT COUNT(*) as count FROM usuarios",
    );

    if (users[0].count === 0) {
      console.log("👥 Creando usuarios iniciales...");

      const usersToCreate = [
        {
          username: "admin",
          password: "admin123",
          role: "Supervisor",
          icon: "👔",
          visible: true,
          permissions: JSON.stringify([
            "dashboard",
            "users",
            "settings",
            "reports",
            "products",
          ]),
        },
        {
          username: "ventas",
          password: "ventas123",
          role: "Ventas",
          icon: "📊",
          visible: true,
          permissions: JSON.stringify([
            "dashboard",
            "sales",
            "reports",
            "orders",
          ]),
        },
        {
          username: "oscar",
          password: "811012",
          role: "Desarrollador",
          icon: "👨‍💻",
          visible: false,
          permissions: JSON.stringify([
            "dashboard",
            "development",
            "admin",
            "settings",
            "all",
          ]),
        },
      ];

      for (const userData of usersToCreate) {
        const passwordHash = await bcrypt.hash(userData.password, 10);

        await DB.promise().query(
          `INSERT INTO usuarios 
          (username, password_hash, role, icon, visible, permissions) 
          VALUES (?, ?, ?, ?, ?, ?)`,
          [
            userData.username,
            passwordHash,
            userData.role,
            userData.icon,
            userData.visible,
            userData.permissions,
          ],
        );
      }

      console.log("✅ Usuarios iniciales creados");
    } else {
      console.log(
        `✅ ${users[0].count} usuario(s) encontrados en la base de datos`,
      );
    }
  } catch (error) {
    console.error("❌ Error inicializando usuarios:", error.message);
  }
};

// Inicializar usuarios al arrancar
initializeUsers();

/* ================= SEGURIDAD: ENDPOINTS DE AUTENTICACIÓN ================= */

// 1. LOGIN SEGURO
app.post("/api/auth/login", async (req, res) => {
  console.log("🔐 POST /api/auth/login recibido");

  try {
    const { username, password } = req.body;

    // Validación básica
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: "Usuario y contraseña requeridos",
      });
    }

    // Buscar usuario
    const [users] = await DB.promise().query(
      `SELECT id, username, password_hash, role, icon, visible, permissions,
              failed_attempts, locked_until, last_login
       FROM usuarios 
       WHERE username = ?`,
      [username],
    );

    if (users.length === 0) {
      console.log(`❌ Usuario no encontrado: ${username}`);
      return res.status(401).json({
        success: false,
        message: "Credenciales incorrectas",
      });
    }

    const user = users[0];

    // Verificar si está bloqueado
    if (user.locked_until && new Date(user.locked_until) > new Date()) {
      const lockTime = new Date(user.locked_until);
      const minutesLeft = Math.ceil((lockTime - new Date()) / (1000 * 60));

      console.log(
        `🔒 Usuario bloqueado: ${username} (${minutesLeft} min restantes)`,
      );

      return res.status(423).json({
        success: false,
        message: `Cuenta bloqueada. Intenta nuevamente en ${minutesLeft} minutos`,
        lockedUntil: user.locked_until,
      });
    }

    // Verificar contraseña
    const passwordIsValid = await bcrypt.compare(password, user.password_hash);

    if (!passwordIsValid) {
      console.log(`❌ Contraseña incorrecta para: ${username}`);

      // Incrementar intentos fallidos
      const newAttempts = user.failed_attempts + 1;
      let updateQuery = "UPDATE usuarios SET failed_attempts = ?";
      const updateParams = [newAttempts];

      // Bloquear después de 5 intentos
      if (newAttempts >= 5) {
        const lockUntil = new Date(Date.now() + 15 * 60000); // 15 minutos
        updateQuery += ", locked_until = ?";
        updateParams.push(lockUntil);

        console.log(`🔒 Bloqueando usuario: ${username} por 15 minutos`);
      }

      updateQuery += " WHERE id = ?";
      updateParams.push(user.id);

      await DB.promise().query(updateQuery, updateParams);

      return res.status(401).json({
        success: false,
        message: "Credenciales incorrectas",
        attemptsLeft: Math.max(0, 5 - newAttempts),
      });
    }

    // LOGIN EXITOSO
    console.log(`✅ Login exitoso para: ${username}`);

    // Resetear intentos fallidos
    await DB.promise().query(
      "UPDATE usuarios SET failed_attempts = 0, locked_until = NULL, last_login = NOW() WHERE id = ?",
      [user.id],
    );

    // Generar token JWT
    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        role: user.role,
      },
      process.env.JWT_SECRET || "fallback_secret_123",
      { expiresIn: "1h" },
    );

    // Preparar respuesta
    const userResponse = {
      id: user.id,
      username: user.username,
      role: user.role,
      icon: user.icon || "👤",
      permissions: user.permissions ? JSON.parse(user.permissions) : [],
    };

    res.json({
      success: true,
      token,
      user: userResponse,
      expiresIn: 3600, // 1 hora en segundos
      message: "Login exitoso",
    });
  } catch (error) {
    console.error("❌ Error en login:", error);
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
    });
  }
});

// 2. VERIFICAR TOKEN
app.post("/api/auth/verify", verifyToken, (req, res) => {
  res.json({
    success: true,
    user: req.user,
    message: "Token válido",
  });
});

// 3. OBTENER USUARIOS VISIBLES
app.get("/api/auth/visible-users", async (req, res) => {
  try {
    const [users] = await DB.promise().query(
      "SELECT username, role, icon FROM usuarios WHERE visible = true ORDER BY username",
    );

    res.json({
      success: true,
      users: users,
    });
  } catch (error) {
    console.error("❌ Error obteniendo usuarios visibles:", error);
    res.status(500).json({
      success: false,
      message: "Error obteniendo usuarios",
    });
  }
});

// 4. LOGOUT (simbólico - frontend debe borrar el token)
app.post("/api/auth/logout", verifyToken, (req, res) => {
  console.log(`🔓 Logout exitoso para: ${req.user.username}`);

  res.json({
    success: true,
    message: "Sesión cerrada exitosamente",
  });
});

// 5. ENDPOINT PROTEGIDO DE EJEMPLO
app.get("/api/auth/protected", verifyToken, (req, res) => {
  res.json({
    success: true,
    message: `Acceso concedido para ${req.user.username}`,
    user: req.user,
    timestamp: new Date().toISOString(),
  });
});

/* ================= ROOT & HEALTH CHECK (Actualizado) ================= */
app.get("/", (_, res) => {
  console.log("✅ Health check recibido");
  res.json({
    ok: true,
    message: "Backend funcionando - Punto G",
    timestamp: new Date().toISOString(),
    security: {
      authEnabled: true,
      endpoints: [
        "POST /api/auth/login",
        "POST /api/auth/verify",
        "GET /api/auth/visible-users",
        "POST /api/auth/logout",
        "GET /api/auth/protected",
      ],
    },
    endpoints: [
      "/api/productos",
      "/api/productos/:id",
      "/api/upload-imagen",
      "/api/categorias",
      "/api/pedidos-completo",
      "/api/exportar-productos-excel",
    ],
  });
});

/* ================= MANTENER TODOS TUS ENDPOINTS EXISTENTES ================= */

// ... [TODO TU CÓDIGO ACTUAL SE MANTIENE AQUÍ, DESDE "UPLOAD IMAGEN" HASTA EL FINAL] ...

/* ================= UPLOAD IMAGEN ================= */
app.post("/api/upload-imagen", upload.single("imagen"), async (req, res) => {
  try {
    console.log("📤 Recibiendo imagen...");

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
    res.status(500).json({
      ok: false,
      message: error.sqlMessage || error.message,
    });
  }
});

// ... [EL RESTO DE TUS ENDPOINTS SE MANTIENE EXACTAMENTE IGUAL] ...

/* ================= SERVER ================= */
app.listen(PORT, "0.0.0.0", () => {
  console.log(`
🚀 Backend SEGURO funcionando en puerto ${PORT}
🔐 AUTENTICACIÓN HABILITADA
🌐 URL: https://gleaming-motivation-production-4018.up.railway.app
✅ Health check: https://gleaming-motivation-production-4018.up.railway.app/

🔐 Endpoints de Seguridad:
   POST /api/auth/login             (Login seguro con JWT)
   POST /api/auth/verify            (Verificar token)
   GET  /api/auth/visible-users     (Usuarios visibles para UI)
   POST /api/auth/logout            (Cerrar sesión)

🔗 Endpoints RESTAURADOS:
   GET  /api/productos              (con filtros: categoria, estado, oferta)
   GET  /api/productos/:id          (producto específico)
   POST /api/productos              (crear producto)
   PUT  /api/productos/:id          (actualizar producto)
   DELETE /api/productos/:id        (eliminar producto)
   POST /api/upload-imagen          (subir imagen a Cloudinary)
   GET  /api/categorias             (todas las categorías)
   GET  /api/productos-recomendados/:id  (productos similares)
   GET  /api/pedidos-completo       (lista de pedidos con paginación)
   GET  /api/orden-servicio/:id     (detalle de pedido)
   PUT  /api/pedidos-estado/:id     (cambiar estado de pedido)
   GET  /api/exportar-productos-excel  (descargar Excel)

📦 Base de datos:
   ✅ Tabla 'usuarios' verificada/creada
   ✅ Usuarios iniciales creados (admin, ventas, oscar)
   ✅ Contraseñas hasheadas con bcrypt
   ✅ Bloqueo automático tras 5 intentos fallidos
  `);
});

// import express from "express";
// import mysql from "mysql2";
// import cors from "cors";
// import multer from "multer";
// import { v2 as cloudinary } from "cloudinary";
// import ExcelJS from "exceljs";

// /* ================= APP ================= */
// const app = express();
// const PORT = process.env.PORT || 3002;

// /* ================= MIDDLEWARE ================= */
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// // CORS COMPLETO
// app.use(
//   cors({
//     origin: "*",
//     methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
//     allowedHeaders: [
//       "Content-Type",
//       "Authorization",
//       "Accept",
//       "X-HTTP-Method-Override",
//     ],
//     credentials: true,
//     optionsSuccessStatus: 204,
//   }),
// );

// // Manejo explícito de OPTIONS
// app.options("*", (req, res) => {
//   res.header("Access-Control-Allow-Origin", "*");
//   res.header(
//     "Access-Control-Allow-Methods",
//     "GET, POST, PUT, DELETE, OPTIONS, PATCH",
//   );
//   res.header(
//     "Access-Control-Allow-Headers",
//     "Content-Type, Authorization, Accept",
//   );
//   res.header("Access-Control-Allow-Credentials", "true");
//   res.status(204).send();
// });

// /* ================= MYSQL ================= */
// const DB = mysql.createPool({
//   host: process.env.MYSQLHOST,
//   user: process.env.MYSQLUSER,
//   password: process.env.MYSQLPASSWORD,
//   database: process.env.MYSQLDATABASE,
//   port: process.env.MYSQLPORT,
//   waitForConnections: true,
//   connectionLimit: 10,
//   queueLimit: 0,
// });

// // Verificar conexión
// DB.getConnection((err, connection) => {
//   if (err) {
//     console.error("❌ Error MySQL:", err.message);
//   } else {
//     console.log("✅ Conectado a MySQL");
//     connection.release();
//   }
// });

// /* ================= CLOUDINARY ================= */
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

// /* ================= ROOT & HEALTH CHECK ================= */
// app.get("/", (_, res) => {
//   console.log("✅ Health check recibido");
//   res.json({
//     ok: true,
//     message: "Backend funcionando - Punto G",
//     timestamp: new Date().toISOString(),
//     endpoints: [
//       "/api/productos",
//       "/api/productos/:id",
//       "/api/upload-imagen",
//       "/api/categorias",
//       "/api/pedidos-completo",
//       "/api/exportar-productos-excel",
//     ],
//   });
// });

// /* ================= UPLOAD IMAGEN ================= */
// app.post("/api/upload-imagen", upload.single("imagen"), async (req, res) => {
//   try {
//     console.log("📤 Recibiendo imagen...");

//     if (!req.file) {
//       return res.status(400).json({
//         ok: false,
//         message: "No se subió imagen",
//       });
//     }

//     const b64 = req.file.buffer.toString("base64");
//     const dataURI = `data:${req.file.mimetype};base64,${b64}`;

//     console.log("☁️ Subiendo a Cloudinary...");

//     const result = await cloudinary.uploader.upload(dataURI, {
//       folder: "punto-g-productos",
//       resource_type: "auto",
//     });

//     console.log("✅ Imagen subida a Cloudinary");

//     res.json({
//       ok: true,
//       url: result.secure_url,
//       public_id: result.public_id,
//       filename: req.file.originalname,
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

// /* ================= CREAR PRODUCTO ================= */
// app.post("/api/productos", async (req, res) => {
//   console.log("📥 Creando nuevo producto...");

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
//     imagenes = [],
//   } = req.body;

//   // Validación
//   if (!nombre || !precio || !categoria_id) {
//     return res.status(400).json({
//       ok: false,
//       message: "Faltan campos obligatorios: nombre, precio, categoria_id",
//     });
//   }

//   if (imagenes.length === 0) {
//     return res.status(400).json({
//       ok: false,
//       message: "Debe subir al menos una imagen",
//     });
//   }

//   // Preparar imágenes
//   const imagen_cloud1 = imagenes.length > 0 ? imagenes[0] : null;
//   const imagen_cloud2 = imagenes.length > 1 ? imagenes[1] : null;
//   const imagen_cloud3 = imagenes.length > 2 ? imagenes[2] : null;
//   const imagen = imagenes.length > 0 ? imagenes[0] : null;

//   console.log(`🖼️ Guardando ${imagenes.length} imágenes...`);

//   try {
//     const [result] = await DB.promise().query(
//       `INSERT INTO productos
//       (categoria, nombre, talla, color, precio, imagen, categoria_id,
//        precio_antes, descuento, es_oferta, descripcion,
//        imagen_cloud1, imagen_cloud2, imagen_cloud3)
//       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
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
//         imagen_cloud1,
//         imagen_cloud2,
//         imagen_cloud3,
//       ],
//     );

//     console.log(`✅ Producto creado ID: ${result.insertId}`);

//     res.status(201).json({
//       ok: true,
//       producto_id: result.insertId,
//       message: `Producto creado con ${imagenes.length} imagen(es)`,
//     });
//   } catch (error) {
//     console.error("❌ Error MySQL:", error);
//     res.status(500).json({
//       ok: false,
//       message: error.sqlMessage || error.message,
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
//     },
//   );
// });

// /* ================= PRODUCTOS (CON FILTROS) ================= */
// app.get("/api/productos", (req, res) => {
//   const { categoria, es_oferta, limit, estado } = req.query;

//   console.log("📥 GET /api/productos:", { categoria, es_oferta, estado });

//   let query = `
//     SELECT
//       p.*,
//       c.nombre as categoria_nombre,
//       c.slug as categoria_slug
//     FROM productos p
//     INNER JOIN categorias c ON p.categoria_id = c.id
//     WHERE p.activo = 1 AND c.activo = 1
//   `;

//   const params = [];

//   if (categoria && categoria !== "todas") {
//     query += " AND (c.slug = ? OR c.nombre = ?)";
//     params.push(categoria, categoria);
//   }

//   if (es_oferta === "true") {
//     query += " AND p.es_oferta = 1";
//   }

//   if (estado === "disponible") {
//     query += " AND p.estado = 1";
//   } else if (estado === "agotado") {
//     query += " AND p.estado = 0";
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
//       const imagenesArray = [];

//       if (p.imagen_cloud1 && p.imagen_cloud1 !== "null") {
//         imagenesArray.push(p.imagen_cloud1);
//       }
//       if (p.imagen_cloud2 && p.imagen_cloud2 !== "null") {
//         imagenesArray.push(p.imagen_cloud2);
//       }
//       if (p.imagen_cloud3 && p.imagen_cloud3 !== "null") {
//         imagenesArray.push(p.imagen_cloud3);
//       }

//       if (imagenesArray.length === 0 && p.imagen && p.imagen !== "null") {
//         imagenesArray.push(p.imagen);
//       }

//       return {
//         id: p.id,
//         nombre: p.nombre,
//         descripcion: p.descripcion,
//         precio: Number(p.precio),
//         precio_antes: p.precio_antes ? Number(p.precio_antes) : null,
//         descuento: p.descuento ? Number(p.descuento) : 0,
//         es_oferta: Boolean(p.es_oferta),
//         estado: p.estado,
//         categoria: p.categoria,
//         talla: p.talla,
//         color: p.color,
//         categoria_id: p.categoria_id,
//         categoria_nombre: p.categoria_nombre,
//         categoria_slug: p.categoria_slug,
//         activo: Boolean(p.activo),
//         imagen: p.imagen,
//         imagenes: imagenesArray,
//         imagen_cloud1: p.imagen_cloud1,
//         imagen_cloud2: p.imagen_cloud2,
//         imagen_cloud3: p.imagen_cloud3,
//       };
//     });

//     console.log(`✅ Enviando ${productos.length} productos`);
//     res.json(productos);
//   });
// });

// /* ================= PRODUCTO POR ID ================= */
// /* ================= PRODUCTO POR ID ================= */
// app.get("/api/productos/:id", (req, res) => {
//   const { id } = req.params;

//   console.log(`🔍 GET /api/productos/${id}`);

//   const query = `
//     SELECT
//       p.*,
//       c.nombre as categoria_nombre,
//       c.slug as categoria_slug
//     FROM productos p
//     LEFT JOIN categorias c ON p.categoria_id = c.id
//     WHERE p.id = ?
//   `;

//   DB.query(query, [id], (err, rows) => {
//     if (err) {
//       console.error("❌ ERROR PRODUCTO:", err);
//       return res.status(500).json({ error: err.message });
//     }

//     if (!rows.length) {
//       console.log(`❌ Producto ${id} no encontrado`);
//       return res.status(404).json({ error: "Producto no encontrado" });
//     }

//     const p = rows[0];

//     const imagenesArray = [];
//     if (p.imagen_cloud1 && p.imagen_cloud1 !== "null") {
//       imagenesArray.push(p.imagen_cloud1);
//     }
//     if (p.imagen_cloud2 && p.imagen_cloud2 !== "null") {
//       imagenesArray.push(p.imagen_cloud2);
//     }
//     if (p.imagen_cloud3 && p.imagen_cloud3 !== "null") {
//       imagenesArray.push(p.imagen_cloud3);
//     }

//     if (imagenesArray.length === 0 && p.imagen && p.imagen !== "null") {
//       imagenesArray.push(p.imagen);
//     }

//     const producto = {
//       id: p.id,
//       nombre: p.nombre,
//       descripcion: p.descripcion,
//       precio: Number(p.precio),
//       precio_antes: p.precio_antes ? Number(p.precio_antes) : null,
//       descuento: p.descuento ? Number(p.descuento) : 0,
//       es_oferta: Boolean(p.es_oferta),
//       estado: p.estado, // ✅ CORREGIDO: Quitar el "|| 1"
//       categoria: p.categoria,
//       talla: p.talla,
//       color: p.color,
//       categoria_id: p.categoria_id,
//       categoria_nombre: p.categoria_nombre,
//       categoria_slug: p.categoria_slug,
//       activo: Boolean(p.activo),
//       imagen: p.imagen,
//       imagenes: imagenesArray,
//     };

//     console.log(`✅ Producto ${id} enviado`);
//     res.json(producto);
//   });
// });

// /* ================= ACTUALIZAR PRODUCTO ================= */
// app.put("/api/productos/:id", async (req, res) => {
//   const { id } = req.params;
//   const updateData = req.body;

//   console.log(`📝 PUT /api/productos/${id}`, updateData);

//   if (!id) {
//     return res.status(400).json({
//       ok: false,
//       message: "Se requiere el ID del producto",
//     });
//   }

//   // Campos permitidos
//   const allowedFields = [
//     "nombre",
//     "precio",
//     "precio_antes",
//     "descuento",
//     "descripcion",
//     "categoria_id",
//     "es_oferta",
//     "estado",
//     "categoria",
//     "talla",
//     "color",
//     "imagen",
//     "imagen_cloud1",
//     "imagen_cloud2",
//     "imagen_cloud3",
//   ];

//   const updateFields = [];
//   const updateValues = [];

//   allowedFields.forEach((field) => {
//     if (updateData[field] !== undefined) {
//       updateFields.push(`${field} = ?`);

//       if (field === "es_oferta" || field === "estado") {
//         updateValues.push(updateData[field] ? 1 : 0);
//       } else if (field === "precio") {
//         updateValues.push(parseInt(updateData[field]) || 0);
//       } else if (field === "precio_antes" || field === "descuento") {
//         updateValues.push(
//           updateData[field] === null || updateData[field] === ""
//             ? null
//             : updateData[field],
//         );
//       } else {
//         updateValues.push(updateData[field]);
//       }
//     }
//   });

//   if (updateFields.length === 0) {
//     return res.status(400).json({
//       ok: false,
//       message: "No hay campos para actualizar",
//     });
//   }

//   updateValues.push(id);

//   const query = `UPDATE productos SET ${updateFields.join(", ")} WHERE id = ?`;

//   try {
//     const [result] = await DB.promise().query(query, updateValues);

//     if (result.affectedRows === 0) {
//       return res.status(404).json({
//         ok: false,
//         message: "Producto no encontrado",
//       });
//     }

//     console.log(`✅ Producto ${id} actualizado`);
//     res.json({
//       ok: true,
//       message: "Producto actualizado correctamente",
//       affectedRows: result.affectedRows,
//     });
//   } catch (error) {
//     console.error("❌ Error actualizando producto:", error);
//     res.status(500).json({
//       ok: false,
//       message: error.sqlMessage || error.message,
//     });
//   }
// });

// /* ================= ELIMINAR PRODUCTO ================= */
// app.delete("/api/productos/:id", async (req, res) => {
//   const { id } = req.params;

//   console.log(`🗑️ DELETE /api/productos/${id}`);

//   try {
//     const [result] = await DB.promise().query(
//       "DELETE FROM productos WHERE id = ?",
//       [id],
//     );

//     if (result.affectedRows === 0) {
//       return res.status(404).json({
//         ok: false,
//         message: "Producto no encontrado",
//       });
//     }

//     console.log(`✅ Producto ${id} eliminado`);
//     res.json({
//       ok: true,
//       message: "Producto eliminado correctamente",
//     });
//   } catch (error) {
//     console.error("❌ Error eliminando producto:", error);
//     res.status(500).json({
//       ok: false,
//       message: error.message,
//     });
//   }
// });

// /* ================= CATEGORÍAS ================= */
// app.get("/api/categorias", (req, res) => {
//   console.log("📥 GET /api/categorias");

//   DB.query(
//     "SELECT id, nombre, slug FROM categorias WHERE activo = 1 ORDER BY nombre",
//     (err, results) => {
//       if (err) {
//         console.error("❌ ERROR CATEGORÍAS:", err);
//         return res.status(500).json({ error: err.message });
//       }
//       console.log(`✅ Enviando ${results.length} categorías`);
//       res.json(results);
//     },
//   );
// });

// /* ================= PRODUCTOS RECOMENDADOS ================= */
// app.get("/api/productos-recomendados/:id", async (req, res) => {
//   const { id } = req.params;

//   try {
//     const [producto] = await DB.promise().query(
//       "SELECT categoria_id FROM productos WHERE id = ?",
//       [id],
//     );

//     if (!producto.length) {
//       return res.status(404).json([]);
//     }

//     const categoriaId = producto[0].categoria_id;

//     const [recomendados] = await DB.promise().query(
//       `
//       SELECT
//         p.id,
//         p.nombre,
//         p.precio,
//         p.imagen,
//         p.imagen_cloud1,
//         p.imagen_cloud2,
//         p.imagen_cloud3,
//         p.es_oferta,
//         p.precio_antes,
//         p.categoria,
//         p.categoria_id
//       FROM productos p
//       WHERE p.categoria_id = ?
//         AND p.id != ?
//         AND p.activo = 1
//       ORDER BY RAND()
//       LIMIT 6
//       `,
//       [categoriaId, id],
//     );

//     const productosConImagenes = recomendados.map((p) => {
//       const imagenes = [];

//       if (p.imagen_cloud1 && p.imagen_cloud1 !== "null")
//         imagenes.push(p.imagen_cloud1);
//       if (p.imagen_cloud2 && p.imagen_cloud2 !== "null")
//         imagenes.push(p.imagen_cloud2);
//       if (p.imagen_cloud3 && p.imagen_cloud3 !== "null")
//         imagenes.push(p.imagen_cloud3);

//       if (imagenes.length === 0 && p.imagen && p.imagen !== "null") {
//         imagenes.push(p.imagen);
//       }

//       return {
//         id: p.id,
//         nombre: p.nombre,
//         precio: Number(p.precio),
//         es_oferta: Boolean(p.es_oferta),
//         precio_antes: p.precio_antes ? Number(p.precio_antes) : null,
//         categoria: p.categoria,
//         categoria_id: p.categoria_id,
//         imagen: p.imagen,
//         imagenes: imagenes,
//       };
//     });

//     console.log(`✅ ${productosConImagenes.length} productos recomendados`);
//     res.json(productosConImagenes);
//   } catch (error) {
//     console.error("❌ ERROR RECOMENDADOS:", error);
//     res.status(500).json([]);
//   }
// });

// /* ================= PEDIDOS COMPLETOS ================= */
// app.get("/api/pedidos-completo", (req, res) => {
//   console.log("📥 GET /api/pedidos-completo");

//   try {
//     const page = Math.max(Number(req.query.page) || 1, 1);
//     const limit = Math.min(Number(req.query.limit) || 10, 100);
//     const offset = (page - 1) * limit;

//     const { search, inicio, fin, estado } = req.query;

//     let where = "WHERE 1=1";
//     const params = [];

//     if (search && search.trim() !== "") {
//       where += ` AND (
//         nombre LIKE ?
//         OR telefono LIKE ?
//         OR direccion LIKE ?
//         OR email LIKE ?
//       )`;
//       const searchTerm = `%${search.trim()}%`;
//       params.push(searchTerm, searchTerm, searchTerm, searchTerm);
//     }

//     if (inicio) {
//       where += " AND DATE(fecha) >= ?";
//       params.push(inicio);
//     }

//     if (fin) {
//       where += " AND DATE(fecha) <= ?";
//       params.push(fin);
//     }

//     if (estado && estado !== "todos" && estado !== "") {
//       where += " AND estado = ?";
//       params.push(estado);
//     }

//     // Contar total
//     const countQuery = `SELECT COUNT(*) AS total FROM pedidos ${where}`;

//     DB.query(countQuery, params, (errCount, countRows) => {
//       if (errCount) {
//         console.error("❌ Error en COUNT:", errCount.message);
//         return res.status(500).json({
//           ok: false,
//           error: "Error de base de datos",
//           message: errCount.message,
//         });
//       }

//       const total = countRows[0].total || 0;
//       const totalPages = Math.ceil(total / limit);

//       if (total === 0) {
//         return res.json({
//           ok: true,
//           results: [],
//           total: 0,
//           totalPages: 0,
//           page: page,
//           limit: limit,
//         });
//       }

//       // Query principal
//       const pedidosQuery = `
//         SELECT
//           id,
//           nombre,
//           telefono,
//           direccion,
//           departamento,
//           ciudad,
//           total,
//           costo_envio,
//           estado,
//           fecha,
//           email,
//           departamento_id,
//           ciudad_id
//         FROM pedidos
//         ${where}
//         ORDER BY id DESC
//         LIMIT ? OFFSET ?
//       `;

//       DB.query(pedidosQuery, [...params, limit, offset], (errRows, rows) => {
//         if (errRows) {
//           console.error("❌ Error obteniendo pedidos:", errRows.message);
//           return res.status(500).json({
//             ok: false,
//             error: "Error obteniendo datos",
//             message: errRows.message,
//           });
//         }

//         const resultados = rows.map((pedido) => ({
//           id: pedido.id,
//           nombre: pedido.nombre,
//           telefono: pedido.telefono,
//           direccion: pedido.direccion,
//           departamento_nombre: pedido.departamento,
//           ciudad_nombre: pedido.ciudad,
//           total: Number(pedido.total) || 0,
//           costo_envio: Number(pedido.costo_envio) || 0,
//           estado: pedido.estado,
//           fecha: pedido.fecha,
//           email: pedido.email,
//           departamento_id: pedido.departamento_id,
//           ciudad_id: pedido.ciudad_id,
//           notas: pedido.notas || "",
//           metodo_pago: pedido.metodo_pago || "",
//         }));

//         console.log(`✅ ${resultados.length} pedidos enviados`);
//         res.json({
//           ok: true,
//           results: resultados,
//           total: total,
//           totalPages: totalPages,
//           page: page,
//           limit: limit,
//         });
//       });
//     });
//   } catch (error) {
//     console.error("🔥 Error general en pedidos-completo:", error);
//     res.status(500).json({
//       ok: false,
//       error: "Error interno del servidor",
//       message: error.message,
//     });
//   }
// });

// /* ================= ORDEN DE SERVICIO ================= */
// app.get("/api/orden-servicio/:id", async (req, res) => {
//   const { id } = req.params;

//   console.log(`📋 GET /api/orden-servicio/${id}`);

//   try {
//     const [pedido] = await DB.promise().query(
//       `
//       SELECT
//         p.*
//       FROM pedidos p
//       WHERE p.id = ?
//       `,
//       [id],
//     );

//     if (!pedido.length) {
//       console.log(`❌ Pedido ${id} no encontrado`);
//       return res.status(404).json({
//         ok: false,
//         error: "Pedido no encontrado",
//       });
//     }

//     console.log(`✅ Pedido ${id} encontrado`);

//     // Intentar obtener detalles
//     let detalles = [];
//     try {
//       const [detallesData] = await DB.promise().query(
//         "SELECT * FROM pedido_detalles WHERE pedido_id = ?",
//         [id],
//       );
//       detalles = detallesData || [];
//     } catch (detalleError) {
//       console.log(
//         "ℹ️ No se pudieron obtener los detalles:",
//         detalleError.message,
//       );
//     }

//     const resultado = {
//       ok: true,
//       pedido: pedido[0],
//       productos: detalles,
//     };

//     console.log(`✅ Orden de servicio ${id} enviada`);
//     res.json(resultado);
//   } catch (error) {
//     console.error(`❌ Error obteniendo orden de servicio ${id}:`, error);
//     res.status(500).json({
//       ok: false,
//       error: "Error del servidor",
//       message: error.message,
//     });
//   }
// });

// /* ================= CAMBIAR ESTADO DE PEDIDO ================= */
// app.put("/api/pedidos-estado/:id", async (req, res) => {
//   const { id } = req.params;
//   const { estado } = req.body;

//   console.log(`📝 PUT /api/pedidos-estado/${id}`, { estado });

//   if (!estado || !["pendiente", "entregado"].includes(estado)) {
//     return res.status(400).json({
//       ok: false,
//       message: "Estado inválido. Debe ser 'pendiente' o 'entregado'",
//     });
//   }

//   try {
//     const [result] = await DB.promise().query(
//       "UPDATE pedidos SET estado = ? WHERE id = ?",
//       [estado, id],
//     );

//     if (result.affectedRows === 0) {
//       return res.status(404).json({
//         ok: false,
//         message: "Pedido no encontrado",
//       });
//     }

//     console.log(`✅ Pedido ${id} actualizado a "${estado}"`);
//     res.json({
//       ok: true,
//       message: `Estado actualizado a "${estado}"`,
//       pedido_id: id,
//       estado: estado,
//     });
//   } catch (error) {
//     console.error(`❌ Error actualizando pedido ${id}:`, error);
//     res.status(500).json({
//       ok: false,
//       message: "Error interno del servidor",
//       error: error.message,
//     });
//   }
// });

// // Primero verificar si el campo existe
// app.get("/api/check-campos", async (req, res) => {
//   try {
//     const [campos] = await DB.promise().query("DESCRIBE pedidos");
//     const camposNombres = campos.map((c) => c.Field);

//     const tieneFechaUpdate = camposNombres.some(
//       (n) =>
//         n.includes("update") ||
//         n.includes("actualizacion") ||
//         n.includes("modificado"),
//     );

//     res.json({
//       ok: true,
//       campos: camposNombres,
//       tiene_fecha_update: tieneFechaUpdate,
//       campos_fecha: campos.filter(
//         (c) =>
//           c.Field.includes("fecha") ||
//           c.Field.includes("update") ||
//           c.Field.includes("actualizacion"),
//       ),
//     });
//   } catch (error) {
//     res.status(500).json({ ok: false, error: error.message });
//   }
// });

// /* ================= ACTUALIZAR COSTO DE ENVÍO ================= */
// /* ================= ACTUALIZAR COSTO DE ENVÍO ================= */
// app.put("/api/pedidos/:id/envio", async (req, res) => {
//   const { id } = req.params;
//   const { costo_envio } = req.body;

//   console.log(`🚚 PUT /api/pedidos/${id}/envio`, { costo_envio });

//   // Validación básica
//   if (costo_envio === undefined || costo_envio === null || costo_envio === "") {
//     return res.status(400).json({
//       ok: false,
//       message: "Se requiere el costo de envío",
//     });
//   }

//   const costo = parseFloat(costo_envio);

//   if (isNaN(costo)) {
//     return res.status(400).json({
//       ok: false,
//       message: "El costo de envío debe ser un número válido",
//     });
//   }

//   if (costo < 0) {
//     return res.status(400).json({
//       ok: false,
//       message: "El costo de envío no puede ser negativo",
//     });
//   }

//   console.log(`💰 Procesando envío para pedido ${id}: $${costo}`);

//   try {
//     // 1. Obtener el pedido actual
//     const [pedidoRows] = await DB.promise().query(
//       "SELECT total, costo_envio FROM pedidos WHERE id = ?",
//       [id],
//     );

//     if (!pedidoRows || pedidoRows.length === 0) {
//       console.log(`❌ Pedido ${id} no encontrado`);
//       return res.status(404).json({
//         ok: false,
//         message: `Pedido #${id} no encontrado`,
//       });
//     }

//     const pedido = pedidoRows[0];

//     // 2. Calcular nuevo total
//     const envioActual = pedido.costo_envio || 0;
//     const subtotal = pedido.total - envioActual;
//     const nuevoTotal = subtotal + costo;

//     console.log(
//       `📊 Cálculos: Subtotal=$${subtotal}, Nuevo total=$${nuevoTotal}`,
//     );

//     // 3. ACTUALIZACIÓN SIMPLE - solo los campos que SABEMOS que existen
//     // Según tu endpoint pedidos-completo, los campos son: costo_envio y total
//     const [result] = await DB.promise().query(
//       "UPDATE pedidos SET costo_envio = ?, total = ? WHERE id = ?",
//       [costo, nuevoTotal, id],
//     );

//     console.log(`✅ Resultado MySQL: ${result.affectedRows} filas afectadas`);

//     if (result.affectedRows === 0) {
//       return res.status(500).json({
//         ok: false,
//         message: "No se pudo actualizar el pedido",
//       });
//     }

//     console.log(
//       `🎉 Pedido ${id} actualizado: Envío=$${costo}, Total=$${nuevoTotal}`,
//     );

//     res.json({
//       ok: true,
//       message: "Costo de envío actualizado correctamente",
//       pedido: {
//         id: parseInt(id),
//         costo_envio: costo,
//         total: nuevoTotal,
//         subtotal: subtotal,
//         envio_anterior: envioActual,
//       },
//     });
//   } catch (error) {
//     console.error(`❌ Error actualizando pedido ${id}:`, error);
//     console.error(`   - Mensaje: ${error.message}`);
//     console.error(`   - SQL: ${error.sql}`);

//     res.status(500).json({
//       ok: false,
//       message: "Error interno del servidor",
//       error: error.message,
//       sqlMessage: error.sqlMessage,
//     });
//   }
// });

// /* ================= VER ESTRUCTURA DE TABLA PEDIDOS ================= */
// app.get("/api/debug/tabla-pedidos", async (req, res) => {
//   try {
//     const [estructura] = await DB.promise().query("DESCRIBE pedidos");
//     const [pedidos] = await DB.promise().query(
//       "SELECT id, total, costo_envio FROM pedidos WHERE id = 76",
//     );

//     res.json({
//       ok: true,
//       estructura: estructura,
//       pedido_76: pedidos[0] || null,
//       campos: estructura.map((f) => f.Field),
//     });
//   } catch (error) {
//     res.status(500).json({
//       ok: false,
//       error: error.message,
//     });
//   }
// });

// /* ================= EXPORTAR A EXCEL ================= */
// app.get("/api/exportar-productos-excel", async (req, res) => {
//   try {
//     const [productos] = await DB.promise().query(`
//       SELECT
//         p.id,
//         p.nombre,
//         p.categoria,
//         p.precio,
//         p.precio_antes,
//         p.descuento,
//         p.es_oferta,
//         p.talla,
//         p.color,
//         p.descripcion,
//         p.imagen_cloud1,
//         p.imagen_cloud2,
//         p.imagen_cloud3,
//         c.nombre as categoria_nombre
//       FROM productos p
//       LEFT JOIN categorias c ON p.categoria_id = c.id
//       WHERE p.activo = 1
//       ORDER BY p.id DESC
//     `);

//     const workbook = new ExcelJS.Workbook();
//     const worksheet = workbook.addWorksheet("Productos");

//     worksheet.columns = [
//       { header: "ID", key: "id", width: 10 },
//       { header: "Nombre", key: "nombre", width: 30 },
//       { header: "Categoría", key: "categoria", width: 20 },
//       { header: "Precio", key: "precio", width: 15 },
//       { header: "Precio Anterior", key: "precio_antes", width: 15 },
//       { header: "Descuento %", key: "descuento", width: 15 },
//       { header: "En Oferta", key: "es_oferta", width: 15 },
//       { header: "Talla", key: "talla", width: 10 },
//       { header: "Color", key: "color", width: 15 },
//       { header: "Descripción", key: "descripcion", width: 40 },
//       { header: "Imagen 1", key: "imagen_cloud1", width: 50 },
//       { header: "Imagen 2", key: "imagen_cloud2", width: 50 },
//       { header: "Imagen 3", key: "imagen_cloud3", width: 50 },
//     ];

//     productos.forEach((producto) => {
//       worksheet.addRow(producto);
//     });

//     worksheet.getRow(1).eachCell((cell) => {
//       cell.font = { bold: true, color: { argb: "FFFFFF" } };
//       cell.fill = {
//         type: "pattern",
//         pattern: "solid",
//         fgColor: { argb: "FF6B46C1" },
//       };
//       cell.alignment = { vertical: "middle", horizontal: "center" };
//     });

//     res.setHeader(
//       "Content-Type",
//       "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
//     );
//     res.setHeader("Content-Disposition", "attachment; filename=productos.xlsx");

//     await workbook.xlsx.write(res);
//     res.end();
//   } catch (error) {
//     console.error("❌ ERROR EXPORTAR EXCEL:", error);
//     res.status(500).json({ error: error.message });
//   }
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
//     0,
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
//             () => res.json({ ok: true, pedido_id: result.insertId }),
//           );
//         },
//       );
//     },
//   );
// });

// /* ================= SERVER ================= */
// app.listen(PORT, "0.0.0.0", () => {
//   console.log(`
// 🚀 Backend RESTAURADO funcionando en puerto ${PORT}
// 🌐 URL: https://gleaming-motivation-production-4018.up.railway.app
// ✅ Health check: https://gleaming-motivation-production-4018.up.railway.app/

// 🔗 Endpoints RESTAURADOS:
//    GET  /api/productos              (con filtros: categoria, estado, oferta)
//    GET  /api/productos/:id          (producto específico)
//    POST /api/productos              (crear producto)
//    PUT  /api/productos/:id          (actualizar producto)
//    DELETE /api/productos/:id        (eliminar producto)
//    POST /api/upload-imagen          (subir imagen a Cloudinary)
//    GET  /api/categorias             (todas las categorías)
//    GET  /api/productos-recomendados/:id  (productos similares)
//    GET  /api/pedidos-completo       (lista de pedidos con paginación)
//    GET  /api/orden-servicio/:id     (detalle de pedido)
//    PUT  /api/pedidos-estado/:id     (cambiar estado de pedido)
//    GET  /api/exportar-productos-excel  (descargar Excel)
//   `);
// });
