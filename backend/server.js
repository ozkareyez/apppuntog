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
      "SELECT * FROM contacto ORDER BY id DESC"
    );
    res.json(rows);
  } catch (error) {
    console.error("Error obteniendo contactos:", error);
    res.status(500).json({ error: "Error del servidor" });
  }
});

/* ================= ELIMINAR CONTACTO ================= */
app.delete("/api/admin/contacto/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await DB.promise().query("DELETE FROM contacto WHERE id = ?", [id]);
    res.json({ ok: true });
  } catch (error) {
    console.error("Error eliminando contacto:", error);
    res.status(500).json({ error: "Error del servidor" });
  }
});

/* ================= PEDIDOS ================= */
app.post("/api/enviar-formulario", (req, res) => {
  const { nombre, email, direccion, ciudad, telefono, carrito } = req.body;
  if (!carrito?.length) return res.status(400).json({ error: "Carrito vacío" });

  const total = carrito.reduce((s, i) => s + i.precio * (i.quantity || 1), 0);

  DB.query(
    `INSERT INTO pedidos
  (nombre,email,direccion,telefono,departamento_id,ciudad_id,total,estado)
  VALUES (?,?,?,?,?,?,?,'pendiente')`,
    [nombre, email, direccion, telefono, departamento_id, ciudad_id, total],
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
/* EXCEL COMPLETO */

app.get("/api/exportar-pedidos-completo", (req, res) => {
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet("Pedidos");

<<<<<<< HEAD
  ws.columns = [
    { header: "Pedido ID", key: "pedido_id", width: 10 },
    { header: "Fecha", key: "fecha", width: 15 },
    { header: "Cliente", key: "cliente", width: 25 },
    { header: "Email", key: "email", width: 30 },
    { header: "Dirección", key: "direccion", width: 30 },
    { header: "Ciudad", key: "ciudad", width: 15 },
    { header: "Teléfono", key: "telefono", width: 15 },
    { header: "Producto ID", key: "producto_id", width: 12 },
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
    d.producto_id,
    pr.nombre AS producto,
    d.precio,
    d.cantidad,
    d.subtotal
  FROM pedidos p
  JOIN pedido_detalles d ON d.pedido_id = p.id
  JOIN productos pr ON pr.id = d.producto_id
  ORDER BY p.id DESC
`;
=======
    const sql = `
      SELECT 
        p.id AS pedido_id,
        p.fecha,
        p.nombre AS cliente,
        p.email,
        p.direccion,
        p.ciudad,
        p.telefono,
        d.producto_id,
        pr.nombre AS producto,
        d.precio,
        d.cantidad,
        (d.precio * d.cantidad) AS subtotal
      FROM pedidos p
      JOIN pedidos_detalle d ON d.pedido_id = p.id
      JOIN productos pr ON pr.id = d.producto_id
      ORDER BY p.id DESC
    `;

    DB.query(sql, (err, rows) => {
      if (err) {
        console.error("Error Excel:", err);
        return res.status(500).json({ error: "Error generando Excel" });
      }
>>>>>>> parent of 2b5e156 (exel de nuevo)

  DB.query(sql, async (err, rows) => {
    if (err) {
      console.error("Error Excel:", err);
      return res.status(500).json({ error: "Error generando Excel" });
    }

    console.log("Filas exportadas:", rows.length); // 👈 CLAVE

<<<<<<< HEAD
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
=======
      wb.xlsx.write(res).then(() => res.end());
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error interno" });
  }
>>>>>>> parent of 2b5e156 (exel de nuevo)
});

/* ================= UBICACIONES ================= */

// DEPARTAMENTOS
app.get("/api/departamentos", (req, res) => {
  DB.query(
    "SELECT id, nombre FROM departamentos ORDER BY nombre",
    (err, rows) => {
      if (err) {
        console.error("Error departamentos:", err);
        return res.status(500).json({ error: "Error cargando departamentos" });
      }
      res.json(rows);
    }
  );
});

// CIUDADES POR DEPARTAMENTO
app.get("/api/ciudades/:departamentoId", (req, res) => {
  const { departamentoId } = req.params;

  DB.query(
    "SELECT id, nombre FROM ciudades WHERE departamento_id = ? ORDER BY nombre",
    [departamentoId],
    (err, rows) => {
      if (err) {
        console.error("Error ciudades:", err);
        return res.status(500).json({ error: "Error cargando ciudades" });
      }
      res.json(rows);
    }
  );
});

/* ================= SERVER ================= */
app.listen(PORT, "0.0.0.0", () => console.log("🚀 Backend funcionando"));
