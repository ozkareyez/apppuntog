import express from "express";
import mysql from "mysql2";
import cors from "cors";
import ExcelJS from "exceljs";
import path from "path";
import { fileURLToPath } from "url";

/* ================= APP ================= */
const app = express();
const PORT = process.env.PORT || 3002;

/* ================= MIDDLEWARE ================= */
// app.use(cors({ origin: true }));
// app.use(express.json());

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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

/* ================= ROOT ================= */
app.get("/", (_, res) => res.json({ ok: true }));

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
// backend/server.js o donde tengas tus rutas
app.get("/api/productos", (req, res) => {
  const { categoria, es_oferta, limit } = req.query;

  let query = "SELECT p.* FROM productos p";
  const params = [];
  const conditions = [];

  // ⭐ FILTRO POR CATEGORÍA (usando slug)
  if (categoria && categoria !== "todas") {
    query += " INNER JOIN categorias c ON p.categoria_id = c.id";
    conditions.push("c.slug = ?");
    params.push(categoria);
  }

  // ⭐ FILTRO POR OFERTAS
  if (es_oferta === "true") {
    conditions.push("p.es_oferta = 1"); // o = true dependiendo de tu BD
  }

  // Construir WHERE
  if (conditions.length > 0) {
    query += " WHERE " + conditions.join(" AND ");
  }

  query += " ORDER BY p.id DESC";

  // Límite opcional
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

    // Normalizar datos
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
  const { id } = req.params;

  const query = `
    SELECT p.*, c.nombre as categoria, c.slug as categoria_slug
    FROM productos p
    LEFT JOIN categorias c ON p.categoria_id = c.id
    WHERE p.id = ?
  `;

  DB.query(query, [id], (err, results) => {
    if (err) {
      console.error("❌ Error obteniendo producto:", err);
      return res.status(500).json({ error: err.message });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }

    const producto = {
      ...results[0],
      precio: parseFloat(results[0].precio) || 0,
      precio_antes: results[0].precio_antes
        ? parseFloat(results[0].precio_antes)
        : null,
      descuento: results[0].descuento ? parseInt(results[0].descuento) : 0,
      es_oferta: Boolean(results[0].es_oferta),
    };

    res.json(producto);
  });
});

/* ================= DEPARTAMENTOS ================= */
app.get("/api/departamentos", (req, res) => {
  DB.query("SELECT id, nombre FROM departamentos", (err, rows) => {
    if (err) {
      console.error("ERROR departamentos:", err);
      return res.status(500).json(err);
    }
    res.json(rows);
  });
});

/* ================= CIUDADES ================= */
app.get("/api/ciudades", (req, res) => {
  const { departamento_id } = req.query;

  if (!departamento_id) {
    return res.status(400).json({ error: "departamento_id requerido" });
  }

  DB.query(
    "SELECT id, nombre FROM ciudades WHERE departamento_id = ?",
    [departamento_id],
    (err, rows) => {
      if (err) {
        console.error("ERROR ciudades:", err);
        return res.status(500).json(err);
      }
      res.json(rows);
    }
  );
});

/* ================= CONTACTO ================= */
app.post("/api/contacto", async (req, res) => {
  const { nombre, email, mensaje } = req.body;

  if (!nombre || !email || !mensaje) {
    return res.status(400).json({ error: "Datos incompletos" });
  }

  try {
    const [result] = await DB.promise().query(
      "INSERT INTO contacto (nombre, email, mensaje) VALUES (?, ?, ?)",
      [nombre, email, mensaje]
    );

    res.json({ ok: true, id: result.insertId });
  } catch (error) {
    console.error("Error guardando contacto:", error);
    res.status(500).json({ error: "Error del servidor" });
  }
});

/* ================= ADMIN CONTACTOS ================= */
app.get("/api/admin/contacto", async (_, res) => {
  try {
    const [rows] = await DB.promise().query(
      "SELECT * FROM contacto ORDER BY id DESC"
    );
    res.json(rows);
  } catch (error) {
    console.error("Error obteniendo contactos:", error);
    res.status(500).json({ error: "Error del servidor" });
  }
});

app.delete("/api/admin/contacto/:id", async (req, res) => {
  try {
    await DB.promise().query("DELETE FROM contacto WHERE id = ?", [
      req.params.id,
    ]);
    res.json({ ok: true });
  } catch (error) {
    console.error("Error eliminando contacto:", error);
    res.status(500).json({ error: "Error del servidor" });
  }
});

/* ================= PEDIDOS ================= */
app.post("/api/enviar-formulario", (req, res) => {
  const { nombre, email, telefono, direccion, departamento, ciudad, carrito } =
    req.body;

  if (!carrito?.length) {
    return res.status(400).json({ error: "Carrito vacío" });
  }

  const total = carrito.reduce((s, i) => s + i.precio * (i.quantity || 1), 0);

  DB.query(
  `
  INSERT INTO pedidos 
  (nombre,email,telefono,direccion,departamento,ciudad,total,estado)
  VALUES (?,?,?,?,?,?,?,'pendiente')
  `,
  [nombre, email, telefono, direccion, departamento, ciudad, total],
  (err, r) => {
    if (err) {
      console.error("Error creando pedido:", err);
      return res.status(500).json({ error: "Error creando pedido" });
    }

    const detalles = carrito.map((i) => [
      r.insertId,
      i.id,
      i.nombre,
      i.precio,
      i.quantity,
      i.precio * i.quantity,
    ]);

    DB.query(
      `
      INSERT INTO pedido_detalles
      (pedido_id,producto_id,nombre,precio,cantidad,subtotal)
      VALUES ?
      `,
      [detalles],
      () => res.json({ ok: true })
    );
  }
);


/* ================= ADMIN PEDIDOS ================= */
app.get("/api/pedidos-completo", (req, res) => {
  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = 10;
  const offset = (page - 1) * limit;

  const { search, inicio, fin } = req.query;

  let where = "WHERE 1=1";
  const params = [];

  if (search) {
    where += " AND (nombre LIKE ? OR telefono LIKE ?)";
    params.push(`%${search}%`, `%${search}%`);
  }

  if (inicio) {
    where += " AND DATE(fecha) >= ?";
    params.push(inicio);
  }

  if (fin) {
    where += " AND DATE(fecha) <= ?";
    params.push(fin);
  }

  DB.query(
    `SELECT COUNT(*) AS total FROM pedidos ${where}`,
    params,
    (errCount, countRows) => {
      if (errCount) return res.status(500).json({ ok: false });

      const total = countRows[0].total;

      DB.query(
        `
        SELECT * FROM pedidos
        ${where}
        ORDER BY id DESC
        LIMIT ? OFFSET ?
        `,
        [...params, limit, offset],
        (errRows, rows) => {
          if (errRows) return res.status(500).json({ ok: false });

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
});

app.get("/api/pedidos-detalle/:id", (req, res) => {
  DB.query(
    `
    SELECT nombre AS producto, precio, cantidad, subtotal
    FROM pedido_detalles
    WHERE pedido_id = ?
    `,
    [req.params.id],
    (_, rows) => res.json(rows)
  );
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
app.get("/api/exportar-pedidos-completo", async (_, res) => {
  try {
    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet("Pedidos");

    ws.columns = [
      { header: "Pedido ID", key: "pedido_id", width: 10 },
      { header: "Fecha", key: "fecha", width: 15 },
      { header: "Cliente", key: "cliente", width: 25 },
      { header: "Email", key: "email", width: 30 },
      { header: "Dirección", key: "direccion", width: 30 },
      { header: "Ciudad", key: "ciudad", width: 15 },
      { header: "Teléfono", key: "telefono", width: 15 },
      { header: "Producto", key: "producto", width: 25 },
      { header: "Precio", key: "precio", width: 12 },
      { header: "Cantidad", key: "cantidad", width: 10 },
      { header: "Subtotal", key: "subtotal", width: 12 },
    ];

    const sql = `
      SELECT 
        p.id AS pedido_id,
        DATE(p.fecha) AS fecha,
        p.nombre AS cliente,
        p.email,
        p.direccion,
        p.ciudad,
        p.telefono,
        pr.nombre AS producto,
        d.precio,
        d.cantidad,
        d.subtotal
      FROM pedidos p
      JOIN pedido_detalles d ON d.pedido_id = p.id
      JOIN productos pr ON pr.id = d.producto_id
      ORDER BY p.id DESC
    `;

    DB.query(sql, async (err, rows) => {
      if (err) return res.status(500).json({ error: "Error Excel" });

      ws.addRows(rows);

      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      res.setHeader(
        "Content-Disposition",
        "attachment; filename=pedidos_completos.xlsx"
      );

      await wb.xlsx.write(res);
      res.end();
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error interno" });
  }
});

/* ================= SERVER ================= */
app.listen(PORT, "0.0.0.0", () =>
  console.log("🚀 Backend funcionando en Railway")
);
