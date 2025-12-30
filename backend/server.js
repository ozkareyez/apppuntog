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

// 🔥 HACER PUBLICAS LAS IMÁGENES ojo si algo borar esto

app.use("/images", express.static(path.join(__dirname, "public/images")));

/* ================= STATIC ================= */
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

/* ================= UPLOAD IMAGEN - CLOUDINARY ================= */
app.post("/api/upload-imagen", upload.single("imagen"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        ok: false,
        message: "No se subió imagen",
      });
    }

    const b64 = req.file.buffer.toString("base64");
    const dataURI = `data:${req.file.mimetype};base64,${b64}`;

    const result = await cloudinary.uploader.upload(dataURI, {
      folder: "punto-g-productos",
    });

    console.log("✅ Imagen subida:", result.secure_url);

    res.json({
      ok: true,
      url: result.secure_url,
      filename: result.public_id,
    });
  } catch (error) {
    console.error("❌ Cloudinary error FULL:", error);

    res.status(500).json({
      ok: false,
      message: error.message || "Error al subir imagen",
    });
  }
});

/* ================= DEPARTAMENTOS ================= */
app.get("/api/departamentos", (_, res) => {
  DB.query("SELECT id, nombre FROM departamentos", (err, rows) => {
    if (err) return res.status(500).json(err);
    res.json(rows);
  });
});

/* ================= CIUDADES ================= */
app.get("/api/ciudades", (req, res) => {
  const { departamento_id } = req.query;
  if (!departamento_id) return res.json([]);

  DB.query(
    "SELECT id, nombre FROM ciudades WHERE departamento_id = ? ORDER BY nombre",
    [departamento_id],
    (err, rows) => {
      if (err) return res.status(500).json([]);
      res.json(rows);
    }
  );
});

/* ================= CATEGORIAS ================= */
app.get("/api/categorias", (req, res) => {
  DB.query("SELECT * FROM categorias", (err, rows) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Error al obtener categorías" });
    }

    res.json(rows);
  });
});

/* ================= PRODUCTOS ================= */
app.get("/api/productos", (req, res) => {
  const { categoria, es_oferta, limit } = req.query;

  let query = "SELECT p.* FROM productos p";
  const params = [];
  const conditions = [];

  if (categoria && categoria !== "todas") {
    query += " INNER JOIN categorias c ON p.categoria_id = c.id";
    conditions.push("c.slug = ?");
    params.push(categoria);
  }

  if (es_oferta === "true") {
    conditions.push("p.es_oferta = 1");
  }

  if (conditions.length > 0) {
    query += " WHERE " + conditions.join(" AND ");
  }

  query += " ORDER BY p.id DESC";

  if (limit) {
    query += " LIMIT ?";
    params.push(parseInt(limit));
  }

  console.log("🔍 Query:", query);
  console.log("📊 Params:", params);

  DB.query(query, params, (err, results) => {
    if (err) {
      console.error("❌ Error en productos:", err);
      return res.status(500).json({ error: err.message });
    }

    const productos = results.map((p) => ({
      ...p,
      precio: parseFloat(p.precio) || 0,
      precio_antes: p.precio_antes ? parseFloat(p.precio_antes) : null,
      descuento: p.descuento ? parseInt(p.descuento) : 0,
      es_oferta: Boolean(p.es_oferta),
    }));

    console.log(`✅ ${productos.length} productos encontrados`);
    res.json(productos);
  });
});

/* ================= PRODUCTO INDIVIDUAL ================= */
app.get("/api/productos/:id", (req, res) => {
  DB.query(
    "SELECT * FROM productos WHERE id = ?",
    [req.params.id],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      if (!rows.length) return res.status(404).json({ error: "No encontrado" });

      const p = rows[0];
      res.json({
        ...p,
        precio: Number(p.precio),
        precio_antes: p.precio_antes ? Number(p.precio_antes) : null,
        descuento: p.descuento ? Number(p.descuento) : 0,
        es_oferta: Boolean(p.es_oferta),
      });
    }
  );
});

/* ================= CREAR PRODUCTO ================= */
app.post("/api/productos", (req, res) => {
  const {
    categoria = null, // ✅ Valor por defecto NULL
    nombre,
    talla = null, // ✅ Valor por defecto NULL
    color = null, // ✅ Valor por defecto NULL
    precio,
    imagen,
    categoria_id,
    precio_antes = null,
    descuento = null,
    es_oferta = 0,
    descripcion = null,
  } = req.body;

  // Validación solo de campos realmente obligatorios
  if (!nombre || !precio || !imagen || !categoria_id) {
    return res.status(400).json({
      ok: false,
      message:
        "Faltan campos obligatorios: nombre, precio, imagen, categoria_id",
    });
  }

  DB.query(
    `INSERT INTO productos
    (categoria, nombre, talla, color, precio, imagen, categoria_id,
     precio_antes, descuento, es_oferta, descripcion)
    VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
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
    ],
    (err, result) => {
      if (err) {
        console.error("❌ Error MySQL:", err);
        return res.status(500).json({
          ok: false,
          message: err.sqlMessage || err.message,
        });
      }

      res.status(201).json({
        ok: true,
        producto_id: result.insertId,
      });
    }
  );
});
/* ================= FORMULARIO CLIENTE ================= */
app.post("/api/enviar-formulario", (req, res) => {
  const {
    nombre,
    email = null,
    telefono,
    direccion,
    departamento_id,
    ciudad_id,
    carrito,
    costo_envio = 0,
  } = req.body;

  if (!nombre || !telefono || !direccion || !departamento_id || !ciudad_id) {
    return res.status(400).json({ ok: false });
  }

  if (!Array.isArray(carrito) || !carrito.length) {
    return res.status(400).json({ ok: false });
  }

  const subtotal = carrito.reduce(
    (s, p) => s + Number(p.precio) * Number(p.cantidad),
    0
  );

  const total = subtotal + Number(costo_envio);

  DB.query(
    `
    SELECT d.nombre AS departamento, c.nombre AS ciudad
    FROM departamentos d
    JOIN ciudades c ON c.id = ?
    WHERE d.id = ?
    `,
    [ciudad_id, departamento_id],
    (err, rows) => {
      if (err || !rows.length) return res.status(500).json({ ok: false });

      const { departamento, ciudad } = rows[0];

      DB.query(
        `
        INSERT INTO pedidos
        (
          nombre, email, telefono, direccion,
          departamento, departamento_id,
          ciudad, ciudad_id,
          total, costo_envio, estado
        )
        VALUES (?,?,?,?,?,?,?,?,?,?,'pendiente')
        `,
        [
          nombre,
          email,
          telefono,
          direccion,
          departamento,
          departamento_id,
          ciudad,
          ciudad_id,
          total,
          costo_envio,
        ],
        (err2, result) => {
          if (err2) return res.status(500).json({ ok: false });

          const detalles = carrito.map((p) => [
            result.insertId,
            p.id,
            p.nombre,
            Number(p.precio),
            Number(p.cantidad),
            Number(p.precio) * Number(p.cantidad),
          ]);

          DB.query(
            `
            INSERT INTO pedido_detalles
            (pedido_id,producto_id,nombre,precio,cantidad,subtotal)
            VALUES ?
            `,
            [detalles],
            () => res.json({ ok: true, pedido_id: result.insertId })
          );
        }
      );
    }
  );
});

/* ================= ADMIN PEDIDOS ================= */
app.get("/api/pedidos-completo", (req, res) => {
  try {
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = 10;
    const offset = (page - 1) * limit;

    const { search, inicio, fin, estado } = req.query;

    let where = "WHERE 1=1";
    const params = [];

    if (search) {
      where += `
        AND (
          p.nombre LIKE ?
          OR CAST(p.telefono AS CHAR) LIKE ?
        )
      `;
      params.push(`%${search}%`, `%${search}%`);
    }

    if (inicio) {
      where += " AND DATE(p.fecha) >= ?";
      params.push(inicio);
    }

    if (fin) {
      where += " AND DATE(p.fecha) <= ?";
      params.push(fin);
    }

    if (estado && estado !== "todos") {
      where += " AND p.estado = ?";
      params.push(estado);
    }

    DB.query(
      `SELECT COUNT(*) AS total FROM pedidos p ${where}`,
      params,
      (errCount, countRows) => {
        if (errCount) {
          console.error("❌ Error COUNT:", errCount);
          return res.status(500).json({ ok: false });
        }

        const total = countRows[0].total;

        DB.query(
          `
          SELECT
            p.id,
            p.nombre,
            p.telefono,
            p.direccion,
            d.nombre AS departamento_nombre,
            c.nombre AS ciudad_nombre,
            p.total,
            p.costo_envio,
            p.estado,
            p.fecha
          FROM pedidos p
          LEFT JOIN departamentos d ON p.departamento_id = d.id
          LEFT JOIN ciudades c ON p.ciudad_id = c.id
          ${where}
          ORDER BY p.id DESC
          LIMIT ? OFFSET ?
          `,
          [...params, limit, offset],
          (errRows, rows) => {
            if (errRows) {
              console.error("❌ Error pedidos:", errRows);
              return res.status(500).json({ ok: false });
            }

            res.json({
              ok: true,
              results: rows,
              total,
              totalPages: Math.ceil(total / limit),
              page,
            });
          }
        );
      }
    );
  } catch (error) {
    console.error("🔥 Error general:", error);
    res.status(500).json({ ok: false });
  }
});

app.get("/api/orden-servicio/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const [pedido] = await DB.promise().query(
      `
      SELECT
        p.*,
        d.nombre AS departamento_nombre,
        c.nombre AS ciudad_nombre
      FROM pedidos p
      LEFT JOIN departamentos d ON p.departamento = d.id
      LEFT JOIN ciudades c ON p.ciudad = c.id
      WHERE p.id = ?
      `,
      [id]
    );

    if (!pedido.length) {
      return res.status(404).json({ error: "Pedido no encontrado" });
    }

    const [detalle] = await DB.promise().query(
      "SELECT * FROM pedido_detalles WHERE pedido_id = ?",
      [id]
    );

    res.json({
      pedido: pedido[0],
      productos: detalle,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error del servidor" });
  }
});

/* ================= CONTACTO - GUARDAR ================= */
app.post("/api/contacto", (req, res) => {
  console.log("📩 BODY:", req.body);

  const { nombre, email, mensaje } = req.body;

  if (!nombre || !email || !mensaje) {
    return res.status(400).json({
      ok: false,
      message: "Todos los campos son obligatorios",
    });
  }

  DB.query(
    "INSERT INTO contacto (nombre, email, mensaje) VALUES (?,?,?)",
    [nombre, email, mensaje],
    (err, result) => {
      if (err) {
        console.error("❌ MYSQL ERROR:", err);
        return res.status(500).json({
          ok: false,
          error: err.message,
        });
      }

      res.status(201).json({
        ok: true,
        id: result.insertId,
      });
    }
  );
});

/* ================= CONTACTO - ADMIN ================= */

app.get("/api/admin/contacto", (req, res) => {
  DB.query(
    "SELECT id, nombre, email, mensaje, fecha FROM contacto ORDER BY fecha DESC",
    (err, rows) => {
      if (err) {
        console.error("❌ MYSQL ERROR:", err);
        return res.status(500).json({
          ok: false,
          error: err.message,
        });
      }
      res.json(rows);
    }
  );
});

app.delete("/api/admin/contacto/:id", (req, res) => {
  const { id } = req.params;

  DB.query("DELETE FROM contacto WHERE id = ?", [id], (err, result) => {
    if (err) {
      console.error("❌ MYSQL ERROR:", err);
      return res.status(500).json({ ok: false });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({
        ok: false,
        message: "Mensaje no encontrado",
      });
    }

    res.json({ ok: true });
  });
});

app.put("/api/pedidos-estado/:id", (req, res) => {
  DB.query(
    `
    UPDATE pedidos
    SET estado = IF(estado='pendiente','entregado','pendiente')
    WHERE id = ?
    `,
    [req.params.id],
    (err, result) => {
      if (err) return res.status(500).json({ ok: false });
      if (!result.affectedRows) return res.status(404).json({ ok: false });
      res.json({ ok: true });
    }
  );
});

app.delete("/api/pedidos/:id", (req, res) => {
  DB.query("DELETE FROM pedidos WHERE id = ?", [req.params.id], () =>
    res.json({ ok: true })
  );
});

/* ================= EXCEL ================= */
app.get("/api/exportar-pedidos-completo", async (req, res) => {
  try {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Pedidos");

    worksheet.columns = [
      { header: "ID", key: "id", width: 8 },
      { header: "Cliente", key: "nombre", width: 25 },
      { header: "Teléfono", key: "telefono", width: 15 },
      { header: "Dirección", key: "direccion", width: 30 },
      { header: "Departamento", key: "departamento", width: 20 },
      { header: "Ciudad", key: "ciudad", width: 20 },
      { header: "Total", key: "total", width: 12 },
      { header: "Estado", key: "estado", width: 15 },
      { header: "Fecha", key: "fecha", width: 20 },
    ];

    const [rows] = await DB.promise().query(`
      SELECT
        p.id,
        p.nombre,
        p.telefono,
        p.direccion,
        p.departamento,
        p.ciudad,
        p.total,
        p.estado,
        p.fecha
      FROM pedidos p
      ORDER BY p.id DESC
    `);

    rows.forEach((row) => worksheet.addRow(row));

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    res.setHeader("Content-Disposition", "attachment; filename=pedidos.xlsx");

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error("❌ ERROR EXPORTANDO EXCEL:", error);
    res.status(500).json({ ok: false, error: error.message });
  }
});
/**=============================DELETE DE PRODUCTOS================= */

app.delete("/api/productos/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await db.query("DELETE FROM productos WHERE id = ?", [id]);

    // 🔴 AQUÍ ESTABA EL PROBLEMA
    if (result.affectedRows === 0) {
      return res.status(404).json({
        ok: false,
        message: "No se encontró el producto",
      });
    }

    res.json({
      ok: true,
      message: "Producto eliminado correctamente",
    });
  } catch (error) {
    console.error("Error eliminando producto:", error);
    res.status(500).json({
      ok: false,
      message: "Error al eliminar producto",
    });
  }
});

/* ================= FRONTEND (VITE BUILD) ================= */

// servir frontend compilado
app.use(express.static(path.join(__dirname, "dist")));

// fallback para React Router (MUY IMPORTANTE)
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

/* ================= SERVER ================= */
app.listen(PORT, "0.0.0.0", () =>
  console.log("🚀 Backend funcionando correctamente")
);

// import express from "express";
// import mysql from "mysql2";
// import cors from "cors";
// import path from "path";
// import multer from "multer";
// import { fileURLToPath } from "url";
// import { v2 as cloudinary } from "cloudinary"; // 👈 NUEVO

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
// // 👇 NUEVO - Configurar Cloudinary
// cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//   api_key: process.env.CLOUDINARY_API_KEY,
//   api_secret: process.env.CLOUDINARY_API_SECRET,
// });

// /* ================= MULTER ================= */
// // 👇 CAMBIO - Usar memoria en lugar de disco
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
// // 👇 REEMPLAZAR ESTE ENDPOINT COMPLETO
// app.post("/api/upload-imagen", upload.single("imagen"), async (req, res) => {
//   try {
//     if (!req.file) {
//       return res.status(400).json({ ok: false, message: "No se subió imagen" });
//     }

//     // Convertir buffer a base64
//     const b64 = Buffer.from(req.file.buffer).toString("base64");
//     const dataURI = `data:${req.file.mimetype};base64,${b64}`;

//     // Subir a Cloudinary
//     const result = await cloudinary.uploader.upload(dataURI, {
//       folder: "punto-g-productos",
//       resource_type: "auto",
//       public_id: `prod-${Date.now()}`,
//     });

//     console.log("✅ Imagen subida a Cloudinary:", result.secure_url);

//     res.json({
//       ok: true,
//       filename: result.public_id,
//       url: result.secure_url, // 👈 URL completa de Cloudinary
//     });
//   } catch (error) {
//     console.error("❌ Error subiendo a Cloudinary:", error);
//     res.status(500).json({
//       ok: false,
//       message: "Error al subir imagen",
//       error: error.message,
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

//   let query = "SELECT p.* FROM productos p";
//   const params = [];
//   const conditions = [];

//   if (categoria && categoria !== "todas") {
//     query += " INNER JOIN categorias c ON p.categoria_id = c.id";
//     conditions.push("c.slug = ?");
//     params.push(categoria);
//   }

//   if (es_oferta === "true") {
//     conditions.push("p.es_oferta = 1");
//   }

//   if (conditions.length > 0) {
//     query += " WHERE " + conditions.join(" AND ");
//   }

//   query += " ORDER BY p.id DESC";

//   if (limit) {
//     query += " LIMIT ?";
//     params.push(parseInt(limit));
//   }

//   console.log("🔍 Query:", query);
//   console.log("📊 Params:", params);

//   DB.query(query, params, (err, results) => {
//     if (err) {
//       console.error("❌ Error en productos:", err);
//       return res.status(500).json({ error: err.message });
//     }

//     const productos = results.map((p) => ({
//       ...p,
//       precio: parseFloat(p.precio) || 0,
//       precio_antes: p.precio_antes ? parseFloat(p.precio_antes) : null,
//       descuento: p.descuento ? parseInt(p.descuento) : 0,
//       es_oferta: Boolean(p.es_oferta),
//     }));

//     console.log(`✅ ${productos.length} productos encontrados`);
//     res.json(productos);
//   });
// });

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
//     categoria,
//     nombre,
//     talla,
//     color,
//     precio,
//     imagen,
//     categoria_id,
//     precio_antes = null,
//     descuento = null,
//     es_oferta = 0,
//     descripcion = null,
//   } = req.body;

//   if (!nombre || !precio || !imagen || !categoria_id) {
//     return res.status(400).json({
//       ok: false,
//       message: "Campos obligatorios faltantes",
//     });
//   }

//   DB.query(
//     `
//     INSERT INTO productos
//     (categoria, nombre, talla, color, precio, imagen, categoria_id,
//      precio_antes, descuento, es_oferta, descripcion)
//     VALUES (?,?,?,?,?,?,?,?,?,?,?)
//     `,
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
//         console.error("❌ Error insert producto:", err);
//         return res.status(500).json({ ok: false });
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

//     const { search, inicio, fin } = req.query;

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
//     "INSERT INTO contactos (nombre, email, mensaje) VALUES (?,?,?)",
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
//   DB.query("SELECT * FROM contactos ORDER BY id DESC", (err, rows) => {
//     if (err) {
//       console.error(err);
//       return res.status(500).json([]);
//     }
//     res.json(rows);
//   });
// });

// app.delete("/api/admin/contacto/:id", (req, res) => {
//   DB.query("DELETE FROM contactos WHERE id = ?", [req.params.id], (err) => {
//     if (err) {
//       console.error(err);
//       return res.status(500).json({ ok: false });
//     }
//     res.json({ ok: true });
//   });
// });

// /* ================= SERVER ================= */
// app.listen(PORT, "0.0.0.0", () =>
//   console.log("🚀 Backend funcionando correctamente")
// );

// // import express from "express";
// // import mysql from "mysql2";
// // import cors from "cors";
// // import path from "path";
// // import multer from "multer";
// // import { fileURLToPath } from "url";

// // /* ================= APP ================= */
// // const app = express();
// // const PORT = process.env.PORT || 3002;

// // /* ================= MIDDLEWARE ================= */
// // app.use(cors({ origin: "*", methods: ["GET", "POST", "PUT", "DELETE"] }));
// // app.use(express.json());
// // app.use(express.urlencoded({ extended: true }));

// // /* ================= PATH ================= */
// // const __filename = fileURLToPath(import.meta.url);
// // const __dirname = path.dirname(__filename);

// // /* ================= STATIC ================= */
// // app.use("/images", express.static(path.join(__dirname, "public/images")));

// // /* ================= MYSQL ================= */
// // const DB = mysql.createPool({
// //   host: process.env.MYSQLHOST,
// //   user: process.env.MYSQLUSER,
// //   password: process.env.MYSQLPASSWORD,
// //   database: process.env.MYSQLDATABASE,
// //   port: process.env.MYSQLPORT,
// // });

// // /* ================= MULTER ================= */
// // const storage = multer.diskStorage({
// //   destination: (_, __, cb) => {
// //     cb(null, path.join(__dirname, "public/images"));
// //   },
// //   filename: (_, file, cb) => {
// //     const ext = path.extname(file.originalname);
// //     cb(null, `prod-${Date.now()}${ext}`);
// //   },
// // });

// // const upload = multer({
// //   storage,
// //   limits: { fileSize: 5 * 1024 * 1024 },
// // });

// // /* ================= ROOT ================= */
// // app.get("/", (_, res) => res.json({ ok: true }));

// // /* ================= UPLOAD IMAGEN ================= */
// // app.post("/api/upload-imagen", upload.single("imagen"), (req, res) => {
// //   if (!req.file) {
// //     return res.status(400).json({ ok: false, message: "No se subió imagen" });
// //   }

// //   res.json({
// //     ok: true,
// //     filename: req.file.filename,
// //     url: `/images/${req.file.filename}`,
// //   });
// // });

// // /* ================= DEPARTAMENTOS ================= */
// // app.get("/api/departamentos", (_, res) => {
// //   DB.query("SELECT id, nombre FROM departamentos", (err, rows) => {
// //     if (err) return res.status(500).json(err);
// //     res.json(rows);
// //   });
// // });

// // /* ================= CIUDADES ================= */
// // app.get("/api/ciudades", (req, res) => {
// //   const { departamento_id } = req.query;
// //   if (!departamento_id) return res.json([]);

// //   DB.query(
// //     "SELECT id, nombre FROM ciudades WHERE departamento_id = ? ORDER BY nombre",
// //     [departamento_id],
// //     (err, rows) => {
// //       if (err) return res.status(500).json([]);
// //       res.json(rows);
// //     }
// //   );
// // });

// // /* ================= CATEGORIAS ================= */
// // app.get("/api/categorias", (req, res) => {
// //   DB.query("SELECT * FROM categorias", (err, rows) => {
// //     if (err) {
// //       console.error(err);
// //       return res.status(500).json({ error: "Error al obtener categorías" });
// //     }

// //     res.json(rows);
// //   });
// // });

// // /* ================= PRODUCTOS ================= */
// // // backend/server.js o donde tengas tus rutas
// // app.get("/api/productos", (req, res) => {
// //   const { categoria, es_oferta, limit } = req.query;

// //   let query = "SELECT p.* FROM productos p";
// //   const params = [];
// //   const conditions = [];

// //   // ⭐ FILTRO POR CATEGORÍA (usando slug)
// //   if (categoria && categoria !== "todas") {
// //     query += " INNER JOIN categorias c ON p.categoria_id = c.id";
// //     conditions.push("c.slug = ?");
// //     params.push(categoria);
// //   }

// //   // ⭐ FILTRO POR OFERTAS
// //   if (es_oferta === "true") {
// //     conditions.push("p.es_oferta = 1"); // o = true dependiendo de tu BD
// //   }

// //   // Construir WHERE
// //   if (conditions.length > 0) {
// //     query += " WHERE " + conditions.join(" AND ");
// //   }

// //   query += " ORDER BY p.id DESC";

// //   // Límite opcional
// //   if (limit) {
// //     query += " LIMIT ?";
//     params.push(parseInt(limit));
//   }

//   console.log("🔍 Query:", query);
//   console.log("📊 Params:", params);

//   DB.query(query, params, (err, results) => {
//     if (err) {
//       console.error("❌ Error en productos:", err);
//       return res.status(500).json({ error: err.message });
//     }

//     // Normalizar datos
//     const productos = results.map((p) => ({
//       ...p,
//       precio: parseFloat(p.precio) || 0,
//       precio_antes: p.precio_antes ? parseFloat(p.precio_antes) : null,
//       descuento: p.descuento ? parseInt(p.descuento) : 0,
//       es_oferta: Boolean(p.es_oferta),
//     }));

//     console.log(`✅ ${productos.length} productos encontrados`);
//     res.json(productos);
//   });
// });

// /* ================= CATEGORIAS ================= */
// app.get("/api/categorias", (_, res) => {
//   DB.query("SELECT * FROM categorias", (err, rows) => {
//     if (err) return res.status(500).json({ error: "Error categorías" });
//     res.json(rows);
//   });
// });

// /* ================= LISTAR PRODUCTOS ================= */
// app.get("/api/productos", (_, res) => {
//   DB.query("SELECT * FROM productos ORDER BY id DESC", (err, rows) => {
//     if (err) return res.status(500).json({ error: err.message });

//     res.json(
//       rows.map((p) => ({
//         ...p,
//         precio: Number(p.precio),
//         precio_antes: p.precio_antes ? Number(p.precio_antes) : null,
//         descuento: p.descuento ? Number(p.descuento) : 0,
//         es_oferta: Boolean(p.es_oferta),
//       }))
//     );
//   });
// });

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
//     categoria,
//     nombre,
//     talla,
//     color,
//     precio,
//     imagen,
//     categoria_id,
//     precio_antes = null,
//     descuento = null,
//     es_oferta = 0,
//     descripcion = null,
//   } = req.body;

//   if (!nombre || !precio || !imagen || !categoria_id) {
//     return res.status(400).json({
//       ok: false,
//       message: "Campos obligatorios faltantes",
//     });
//   }

//   DB.query(
//     `
//     INSERT INTO productos
//     (categoria, nombre, talla, color, precio, imagen, categoria_id,
//      precio_antes, descuento, es_oferta, descripcion)
//     VALUES (?,?,?,?,?,?,?,?,?,?,?)
//     `,
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
//         console.error("❌ Error insert producto:", err);
//         return res.status(500).json({ ok: false });
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

//     const { search, inicio, fin } = req.query;

//     let where = "WHERE 1=1";
//     const params = [];

//     // 🔍 BUSCADOR
//     if (search) {
//       where += `
//         AND (
//           p.nombre LIKE ?
//           OR CAST(p.telefono AS CHAR) LIKE ?
//         )
//       `;
//       params.push(`%${search}%`, `%${search}%`);
//     }

//     // 📅 FECHAS
//     if (inicio) {
//       where += " AND DATE(p.fecha) >= ?";
//       params.push(inicio);
//     }

//     if (fin) {
//       where += " AND DATE(p.fecha) <= ?";
//       params.push(fin);
//     }

//     // 🔢 TOTAL
//     DB.query(
//       `SELECT COUNT(*) AS total FROM pedidos p ${where}`,
//       params,
//       (errCount, countRows) => {
//         if (errCount) {
//           console.error("❌ Error COUNT:", errCount);
//           return res.status(500).json({ ok: false });
//         }

//         const total = countRows[0].total;

//         // 📦 LISTADO
//         DB.query(
//           `
//           SELECT
//             p.id,
//             p.nombre,
//             p.telefono,
//             p.direccion,

//             -- 🔥 USAR IDS CORRECTOS
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

// /* ================= EXCEL ================= */
// app.get("/api/exportar-pedidos-completo", async (_, res) => {
//   try {
//     const wb = new ExcelJS.Workbook();
//     const ws = wb.addWorksheet("Pedidos");

//     ws.columns = [
//       { header: "Pedido ID", key: "pedido_id", width: 10 },
//       { header: "Fecha", key: "fecha", width: 15 },
//       { header: "Cliente", key: "cliente", width: 25 },
//       { header: "Email", key: "email", width: 30 },
//       { header: "Dirección", key: "direccion", width: 30 },
//       { header: "Ciudad", key: "ciudad", width: 15 },
//       { header: "Teléfono", key: "telefono", width: 15 },
//       { header: "Producto", key: "producto", width: 25 },
//       { header: "Precio", key: "precio", width: 12 },
//       { header: "Cantidad", key: "cantidad", width: 10 },
//       { header: "Subtotal", key: "subtotal", width: 12 },
//     ];

//     const sql = `
//       SELECT
//         p.id AS pedido_id,
//         DATE(p.fecha) AS fecha,
//         p.nombre AS cliente,
//         p.email,
//         p.direccion,
//         p.ciudad,
//         p.telefono,
//         pr.nombre AS producto,
//         d.precio,
//         d.cantidad,
//         d.subtotal
//       FROM pedidos p
//       JOIN pedido_detalles d ON d.pedido_id = p.id
//       JOIN productos pr ON pr.id = d.producto_id
//       ORDER BY p.id DESC
//     `;

//     DB.query(sql, async (err, rows) => {
//       if (err) return res.status(500).json({ error: "Error Excel" });

//       ws.addRows(rows);

//       res.setHeader(
//         "Content-Type",
//         "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
//       );
//       res.setHeader(
//         "Content-Disposition",
//         "attachment; filename=pedidos_completos.xlsx"
//       );

//       await wb.xlsx.write(res);
//       res.end();
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: "Error interno" });
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
//     "INSERT INTO contactos (nombre, email, mensaje) VALUES (?,?,?)",
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

// // listar mensajes
// app.get("/api/admin/contacto", (req, res) => {
//   DB.query("SELECT * FROM contactos ORDER BY id DESC", (err, rows) => {
//     if (err) {
//       console.error(err);
//       return res.status(500).json([]);
//     }
//     res.json(rows);
//   });
// });

// // eliminar mensaje
// app.delete("/api/admin/contacto/:id", (req, res) => {
//   DB.query("DELETE FROM contactos WHERE id = ?", [req.params.id], (err) => {
//     if (err) {
//       console.error(err);
//       return res.status(500).json({ ok: false });
//     }
//     res.json({ ok: true });
//   });
// });

// //*============orden de servicio======================*/

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

// /* ================= SERVER ================= */
// app.listen(PORT, "0.0.0.0", () =>
//   console.log("🚀 Backend funcionando correctamente")
// );

// // import express from "express";
// // import mysql from "mysql2";
// // import cors from "cors";
// // import ExcelJS from "exceljs";
// // import path from "path";
// // import { fileURLToPath } from "url";

// // /* ================= APP ================= */
// // const app = express();
// // const PORT = process.env.PORT || 3002;

// // /* ================= MIDDLEWARE ================= */
// // app.use(
// //   cors({
// //     origin: "*",
// //     methods: ["GET", "POST", "PUT", "DELETE"],
// //   })
// // );

// // app.use(express.json());
// // app.use(express.urlencoded({ extended: true }));

// // const __filename = fileURLToPath(import.meta.url);
// // const __dirname = path.dirname(__filename);

// // app.use("/images", express.static(path.join(__dirname, "public/images")));

// // /* ================= MYSQL ================= */
// // const DB = mysql.createPool({
// //   host: process.env.MYSQLHOST,
// //   user: process.env.MYSQLUSER,
// //   password: process.env.MYSQLPASSWORD,
// //   database: process.env.MYSQLDATABASE,
// //   port: process.env.MYSQLPORT,
// // });

// // /* ================= ROOT ================= */
// // app.get("/", (_, res) => res.json({ ok: true }));

// // /* ================= CATEGORIAS ================= */
// // app.get("/api/categorias", (req, res) => {
// //   DB.query("SELECT * FROM categorias", (err, rows) => {
// //     if (err) return res.status(500).json({ error: "Error categorías" });
// //     res.json(rows);
// //   });
// // });

// // /* ================= PRODUCTOS ================= */
// // app.get("/api/productos", (req, res) => {
// //   const { categoria, es_oferta, limit } = req.query;

// //   let query = "SELECT p.* FROM productos p";
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

// //   if (conditions.length) {
// //     query += " WHERE " + conditions.join(" AND ");
// //   }

// //   query += " ORDER BY p.id DESC";

// //   if (limit) {
// //     query += " LIMIT ?";
// //     params.push(parseInt(limit));
// //   }

// //   DB.query(query, params, (err, results) => {
// //     if (err) return res.status(500).json({ error: err.message });

// //     const productos = results.map((p) => ({
// //       ...p,
// //       precio: parseFloat(p.precio) || 0,
// //       precio_antes: p.precio_antes ? parseFloat(p.precio_antes) : null,
// //       descuento: p.descuento ? parseInt(p.descuento) : 0,
// //       es_oferta: Boolean(p.es_oferta),
// //     }));

// //     res.json(productos);
// //   });
// // });

// // /* ================= PRODUCTO INDIVIDUAL ================= */
// // app.get("/api/productos/:id", (req, res) => {
// //   DB.query(
// //     `
// //     SELECT p.*, c.nombre AS categoria, c.slug AS categoria_slug
// //     FROM productos p
// //     LEFT JOIN categorias c ON p.categoria_id = c.id
// //     WHERE p.id = ?
// //     `,
// //     [req.params.id],
// //     (err, rows) => {
// //       if (err) return res.status(500).json({ error: err.message });
// //       if (!rows.length) return res.status(404).json({ error: "No encontrado" });

// //       const p = rows[0];
// //       res.json({
// //         ...p,
// //         precio: parseFloat(p.precio) || 0,
// //         precio_antes: p.precio_antes ? parseFloat(p.precio_antes) : null,
// //         descuento: p.descuento ? parseInt(p.descuento) : 0,
// //         es_oferta: Boolean(p.es_oferta),
// //       });
// //     }
// //   );
// // });

// // /* ================= DEPARTAMENTOS ================= */
// // app.get("/api/departamentos", (_, res) => {
// //   DB.query("SELECT id, nombre FROM departamentos", (err, rows) => {
// //     if (err) return res.status(500).json(err);
// //     res.json(rows);
// //   });
// // });

// // /* ================= CIUDADES ================= */
// // app.get("/api/ciudades", (req, res) => {
// //   const { departamento_id } = req.query;
// //   if (!departamento_id) return res.json([]);

// //   DB.query(
// //     "SELECT id, nombre FROM ciudades WHERE departamento_id = ? ORDER BY nombre",
// //     [departamento_id],
// //     (err, rows) => {
// //       if (err) return res.status(500).json([]);
// //       res.json(rows);
// //     }
// //   );
// // });

// // /* ================= NUEVO ENDPOINT ADMIN ================= */
// // /* ================= CREAR PRODUCTO ================= */
// // app.post("/api/productos", (req, res) => {
// //   const {
// //     categoria,
// //     nombre,
// //     talla,
// //     color,
// //     precio,
// //     imagen,
// //     categoria_id,
// //     precio_antes = null,
// //     descuento = null,
// //     es_oferta = 0,
// //     descripcion = null,
//   } = req.body;

//   /* ================= VALIDACIONES ================= */
//   if (!categoria || !talla || !color || !precio || !imagen) {
//     return res.status(400).json({
//       ok: false,
//       error: "Campos obligatorios incompletos",
//     });
//   }

//   /* ================= INSERT ================= */
//   DB.query(
//     `
//     INSERT INTO productos
//     (
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
//       descripcion
//     )
//     VALUES (?,?,?,?,?,?,?,?,?,?,?)
//     `,
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
//       es_oferta ? descuento : null,
//       descripcion,
//     ],
//     (err, result) => {
//       if (err) {
//         console.error("❌ Error insert producto:", err);
//         return res.status(500).json({ ok: false });
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

// /* ================= SERVER ================= */
// app.listen(PORT, "0.0.0.0", () =>
//   console.log("🚀 Backend funcionando correctamente")
// );

// import express from "express";
// import mysql from "mysql2";
// import cors from "cors";
// import ExcelJS from "exceljs";
// import path from "path";
// import { fileURLToPath } from "url";

// /* ================= APP ================= */
// const app = express();
// const PORT = process.env.PORT || 3002;

// /* ================= MIDDLEWARE ================= */
// // app.use(cors({ origin: true }));
// // app.use(express.json());

// app.use(
//   cors({
//     origin: "*",
//     methods: ["GET", "POST", "PUT", "DELETE"],
//   })
// );
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

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

// /* ================= ROOT ================= */
// app.get("/", (_, res) => res.json({ ok: true }));

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
// // backend/server.js o donde tengas tus rutas
// app.get("/api/productos", (req, res) => {
//   const { categoria, es_oferta, limit } = req.query;

//   let query = "SELECT p.* FROM productos p";
//   const params = [];
//   const conditions = [];

//   // ⭐ FILTRO POR CATEGORÍA (usando slug)
//   if (categoria && categoria !== "todas") {
//     query += " INNER JOIN categorias c ON p.categoria_id = c.id";
//     conditions.push("c.slug = ?");
//     params.push(categoria);
//   }

//   // ⭐ FILTRO POR OFERTAS
//   if (es_oferta === "true") {
//     conditions.push("p.es_oferta = 1"); // o = true dependiendo de tu BD
//   }

//   // Construir WHERE
//   if (conditions.length > 0) {
//     query += " WHERE " + conditions.join(" AND ");
//   }

//   query += " ORDER BY p.id DESC";

//   // Límite opcional
//   if (limit) {
//     query += " LIMIT ?";
//     params.push(parseInt(limit));
//   }

//   console.log("🔍 Query:", query);
//   console.log("📊 Params:", params);

//   DB.query(query, params, (err, results) => {
//     if (err) {
//       console.error("❌ Error en productos:", err);
//       return res.status(500).json({ error: err.message });
//     }

//     // Normalizar datos
//     const productos = results.map((p) => ({
//       ...p,
//       precio: parseFloat(p.precio) || 0,
//       precio_antes: p.precio_antes ? parseFloat(p.precio_antes) : null,
//       descuento: p.descuento ? parseInt(p.descuento) : 0,
//       es_oferta: Boolean(p.es_oferta),
//     }));

//     console.log(`✅ ${productos.length} productos encontrados`);
//     res.json(productos);
//   });
// });

// /* ================= PRODUCTO INDIVIDUAL ================= */
// app.get("/api/productos/:id", (req, res) => {
//   const { id } = req.params;

//   const query = `
//     SELECT p.*, c.nombre as categoria, c.slug as categoria_slug
//     FROM productos p
//     LEFT JOIN categorias c ON p.categoria_id = c.id
//     WHERE p.id = ?
//   `;

//   DB.query(query, [id], (err, results) => {
//     if (err) {
//       console.error("❌ Error obteniendo producto:", err);
//       return res.status(500).json({ error: err.message });
//     }

//     if (results.length === 0) {
//       return res.status(404).json({ error: "Producto no encontrado" });
//     }

//     const producto = {
//       ...results[0],
//       precio: parseFloat(results[0].precio) || 0,
//       precio_antes: results[0].precio_antes
//         ? parseFloat(results[0].precio_antes)
//         : null,
//       descuento: results[0].descuento ? parseInt(results[0].descuento) : 0,
//       es_oferta: Boolean(results[0].es_oferta),
//     };

//     res.json(producto);
//   });
// });

// /* ================= DEPARTAMENTOS ================= */
// app.get("/api/departamentos", (req, res) => {
//   DB.query("SELECT id, nombre FROM departamentos", (err, rows) => {
//     if (err) {
//       console.error("ERROR departamentos:", err);
//       return res.status(500).json(err);
//     }
//     res.json(rows);
//   });
// });
// /* ================= CIUDADES ================= */
// app.get("/api/ciudades", (req, res) => {
//   const { departamento_id } = req.query;

//   if (!departamento_id) {
//     return res.status(400).json([]);
//   }

//   DB.query(
//     "SELECT id, nombre FROM ciudades WHERE departamento_id = ? ORDER BY nombre",
//     [departamento_id],
//     (err, results) => {
//       if (err) {
//         console.error("❌ Error obteniendo ciudades:", err);
//         return res.status(500).json([]);
//       }

//       res.json(results);
//     }
//   );
// });

// /* ================= ENVIAR FORMULARIO ================= */

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

//   /* ================= VALIDACIONES ================= */
//   if (!nombre || !telefono || !direccion || !departamento_id || !ciudad_id) {
//     return res.status(400).json({ ok: false, error: "Datos incompletos" });
//   }

//   if (!Array.isArray(carrito) || carrito.length === 0) {
//     return res.status(400).json({ ok: false, error: "Carrito vacío" });
//   }

//   /* ================= CALCULAR SUBTOTAL ================= */
//   const subtotal = carrito.reduce(
//     (s, p) => s + Number(p.precio) * Number(p.cantidad),
//     0
//   );

//   const envio = Number(costo_envio) || 0;
//   const total = subtotal + envio;

//   /* ================= OBTENER NOMBRES ================= */
//   DB.query(
//     `
//     SELECT
//       d.nombre AS departamento,
//       c.nombre AS ciudad
//     FROM departamentos d
//     JOIN ciudades c ON c.id = ?
//     WHERE d.id = ?
//     `,
//     [ciudad_id, departamento_id],
//     (err, rows) => {
//       if (err || rows.length === 0) {
//         console.error("❌ Error obteniendo ciudad/depto:", err);
//         return res.status(500).json({ ok: false });
//       }

//       const { departamento, ciudad } = rows[0];

//       /* ================= INSERT PEDIDO ================= */
//       DB.query(
//         `
//         INSERT INTO pedidos
//         (
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
//           estado
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
//           envio,
//         ],
//         (err2, result) => {
//           if (err2) {
//             console.error("❌ Error creando pedido:", err2);
//             return res.status(500).json({ ok: false });
//           }

//           /* ================= DETALLES ================= */
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
//             (err3) => {
//               if (err3) {
//                 console.error("❌ Error detalles:", err3);
//                 return res.status(500).json({ ok: false });
//               }

//               res.json({
//                 ok: true,
//                 pedido_id: result.insertId,
//               });
//             }
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

//     const { search, inicio, fin } = req.query;

//     let where = "WHERE 1=1";
//     const params = [];

//     // 🔍 BUSCADOR
//     if (search) {
//       where += `
//         AND (
//           p.nombre LIKE ?
//           OR CAST(p.telefono AS CHAR) LIKE ?
//         )
//       `;
//       params.push(`%${search}%`, `%${search}%`);
//     }

//     // 📅 FECHAS
//     if (inicio) {
//       where += " AND DATE(p.fecha) >= ?";
//       params.push(inicio);
//     }

//     if (fin) {
//       where += " AND DATE(p.fecha) <= ?";
//       params.push(fin);
//     }

//     // 🔢 TOTAL
//     DB.query(
//       `SELECT COUNT(*) AS total FROM pedidos p ${where}`,
//       params,
//       (errCount, countRows) => {
//         if (errCount) {
//           console.error("❌ Error COUNT:", errCount);
//           return res.status(500).json({ ok: false });
//         }

//         const total = countRows[0].total;

//         // 📦 LISTADO
//         DB.query(
//           `
//           SELECT
//             p.id,
//             p.nombre,
//             p.telefono,
//             p.direccion,

//             -- 🔥 USAR IDS CORRECTOS
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

// /*=================== PEDIDOS DETALLE ================= */

// app.get("/api/pedidos-detalle/:id", (req, res) => {
//   DB.query(
//     `
//     SELECT nombre AS producto, precio, cantidad, subtotal
//     FROM pedido_detalles
//     WHERE pedido_id = ?
//     `,
//     [req.params.id],
//     (_, rows) => res.json(rows)
//   );
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
// app.get("/api/exportar-pedidos-completo", async (_, res) => {
//   try {
//     const wb = new ExcelJS.Workbook();
//     const ws = wb.addWorksheet("Pedidos");

//     ws.columns = [
//       { header: "Pedido ID", key: "pedido_id", width: 10 },
//       { header: "Fecha", key: "fecha", width: 15 },
//       { header: "Cliente", key: "cliente", width: 25 },
//       { header: "Email", key: "email", width: 30 },
//       { header: "Dirección", key: "direccion", width: 30 },
//       { header: "Ciudad", key: "ciudad", width: 15 },
//       { header: "Teléfono", key: "telefono", width: 15 },
//       { header: "Producto", key: "producto", width: 25 },
//       { header: "Precio", key: "precio", width: 12 },
//       { header: "Cantidad", key: "cantidad", width: 10 },
//       { header: "Subtotal", key: "subtotal", width: 12 },
//     ];

//     const sql = `
//       SELECT
//         p.id AS pedido_id,
//         DATE(p.fecha) AS fecha,
//         p.nombre AS cliente,
//         p.email,
//         p.direccion,
//         p.ciudad,
//         p.telefono,
//         pr.nombre AS producto,
//         d.precio,
//         d.cantidad,
//         d.subtotal
//       FROM pedidos p
//       JOIN pedido_detalles d ON d.pedido_id = p.id
//       JOIN productos pr ON pr.id = d.producto_id
//       ORDER BY p.id DESC
//     `;

//     DB.query(sql, async (err, rows) => {
//       if (err) return res.status(500).json({ error: "Error Excel" });

//       ws.addRows(rows);

//       res.setHeader(
//         "Content-Type",
//         "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
//       );
//       res.setHeader(
//         "Content-Disposition",
//         "attachment; filename=pedidos_completos.xlsx"
//       );

//       await wb.xlsx.write(res);
//       res.end();
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: "Error interno" });
//   }
// });
// /*============orden de servicio======================*/

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

// /* ================= SERVER ================= */
// app.listen(PORT, "0.0.0.0", () =>
//   console.log("🚀 Backend funcionando en Railway")
// );
