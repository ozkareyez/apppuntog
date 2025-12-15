import express from "express";
import mysql from "mysql2";
import cors from "cors";
import ExcelJS from "exceljs";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const PORT = process.env.PORT || 3002;

/* ================= MIDDLEWARE ================= */
app.use(cors({ origin: true }));
app.use(express.json());

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

/* ================= PRODUCTOS ================= */
app.get("/api/productos", (req, res) => {
  const baseUrl = `${req.protocol}://${req.headers.host}`;

  DB.query("SELECT * FROM productos", (err, rows) => {
    if (err) return res.status(500).json(err);

    res.json(
      rows.map((p) => ({
        ...p,
        imagen: p.imagen?.startsWith("http")
          ? p.imagen
          : `${baseUrl}/images/${p.imagen}`,
      }))
    );
  });
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
app.get("/api/admin/contacto", async (req, res) => {
  try {
    const [rows] = await DB.promise().query(
      "SELECT * FROM contacto ORDER BY creado_en DESC"
    );
    res.json(rows);
  } catch (error) {
    console.error("Error obteniendo contactos:", error);
    res.status(500).json({ error: "Error del servidor" });
  }
});

/* ================= PEDIDOS ================= */
app.post("/api/enviar-formulario", (req, res) => {
  const { nombre, email, direccion, ciudad, telefono, carrito } = req.body;
  if (!carrito?.length) return res.status(400).json({ error: "Carrito vacío" });

  const total = carrito.reduce((s, i) => s + i.precio * (i.quantity || 1), 0);

  DB.query(
    `INSERT INTO pedidos (nombre,email,direccion,ciudad,telefono,total,estado)
     VALUES (?,?,?,?,?,?,'pendiente')`,
    [nombre, email, direccion, ciudad, telefono, total],
    (err, r) => {
      if (err) return res.status(500).json(err);

      const detalles = carrito.map((i) => [
        r.insertId,
        i.id,
        i.nombre,
        i.precio,
        i.quantity,
        i.precio * i.quantity,
      ]);

      DB.query(
        `INSERT INTO pedido_detalles
        (pedido_id,producto_id,nombre,precio,cantidad,subtotal)
        VALUES ?`,
        [detalles],
        () => res.json({ ok: true })
      );
    }
  );
});

/* ================= ADMIN ================= */

/* LISTADO */
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
      if (errCount) {
        console.error(errCount);
        return res.status(500).json({ ok: false });
      }

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
          if (errRows) {
            console.error(errRows);
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
});

/* DETALLE */
app.get("/api/pedidos-detalle/:id", (req, res) => {
  DB.query(
    "SELECT nombre producto,precio,cantidad,subtotal FROM pedido_detalles WHERE pedido_id=?",
    [req.params.id],
    (_, rows) => res.json(rows)
  );
});

/* CAMBIAR ESTADO */

app.put("/api/pedidos-estado/:id", (req, res) => {
  const { id } = req.params;

  DB.query(
    `
    UPDATE pedidos 
    SET estado = IF(estado = 'pendiente', 'entregado', 'pendiente') 
    WHERE id = ?
    `,
    [id],
    (err, result) => {
      if (err) {
        console.error("Error actualizando pedido:", err);
        return res.status(500).json({
          ok: false,
          error: "Error actualizando el estado",
        });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({
          ok: false,
          error: "Pedido no encontrado",
        });
      }

      res.json({
        ok: true,
        message: "Estado del pedido actualizado",
      });
    }
  );
});

/* ELIMINAR */
app.delete("/api/pedidos/:id", (req, res) => {
  DB.query("DELETE FROM pedidos WHERE id=?", [req.params.id], () =>
    res.json({ ok: true })
  );
});

/* EXCEL */
app.get("/api/exportar-pedidos-completo", async (_, res) => {
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet("Pedidos");

  ws.columns = [
    { header: "ID", key: "id" },
    { header: "Cliente", key: "nombre" },
    { header: "Teléfono", key: "telefono" },
    { header: "Total", key: "total" },
    { header: "Estado", key: "estado" },
    { header: "Fecha", key: "fecha" },
  ];

  DB.query("SELECT * FROM pedidos", (_, rows) => {
    ws.addRows(rows);
    res.setHeader("Content-Disposition", "attachment; filename=pedidos.xlsx");
    wb.xlsx.write(res).then(() => res.end());
  });
});

/* ================= SERVER ================= */
app.listen(PORT, "0.0.0.0", () => console.log("🚀 Backend funcionando"));
