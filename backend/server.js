// import express from "express";
// import { createConnection } from "mysql";
// import cors from "cors";
// import ExcelJS from "exceljs";

// const app = express();
// const PORT = 3002;

// // CORS
// app.use(
//   cors({
//     origin: "http://localhost:5173",
//     credentials: true,
//   })
// );

// // Middleware JSON
// app.use(express.json());

// // Conexión DB
// const DB = createConnection({
//   host: "localhost",
//   user: "root",
//   password: "",
//   database: "tienda",
// });

// DB.connect((err) => {
//   if (err) throw err;
//   console.log("Conexión exitosa a MySQL");
// });

// // ────────────────────────────────────────────
// // GET PRODUCTOS
// // ────────────────────────────────────────────
// app.get("/api/productos", (req, res) => {
//   const SQL = "SELECT * FROM productos";
//   DB.query(SQL, (err, result) => {
//     if (err) return res.status(500).json({ error: "Error en la consulta" });
//     res.json(result);
//   });
// });

// // ────────────────────────────────────────────
// // GUARDAR CARRITO
// // ────────────────────────────────────────────
// app.post("/api/guardar-carrito", (req, res) => {
//   const carrito = req.body;

//   if (!carrito || !Array.isArray(carrito)) {
//     return res.status(400).json({ error: "Carrito inválido" });
//   }

//   console.log("🛒 Carrito recibido:", carrito);

//   res.json({ mensaje: "Carrito guardado exitosamente" });
// });

// // ────────────────────────────────────────────
// // GUARDAR PEDIDO COMPLETO
// // ────────────────────────────────────────────
// app.post("/api/enviar-formulario", (req, res) => {
//   const { nombre, email, direccion, ciudad, telefono, carrito } = req.body;

//   if (!nombre || !email || !direccion || !ciudad || !telefono) {
//     return res.status(400).json({ error: "Faltan datos del formulario" });
//   }

//   if (!carrito || carrito.length === 0) {
//     return res.status(400).json({ error: "El carrito está vacío" });
//   }

//   const total = carrito.reduce(
//     (sum, item) => sum + item.precio * item.quantity,
//     0
//   );

//   const INSERT_PEDIDO = `
//     INSERT INTO pedidos (nombre, email, direccion, ciudad, telefono, total)
//     VALUES (?, ?, ?, ?, ?, ?)
//   `;

//   DB.query(
//     INSERT_PEDIDO,
//     [nombre, email, direccion, ciudad, telefono, total],
//     (err, result) => {
//       if (err)
//         return res.status(500).json({ error: "Error al guardar pedido" });

//       const pedidoId = result.insertId;

//       const INSERT_DETALLE = `
//         INSERT INTO pedido_detalles (pedido_id, producto_id, nombre, precio, cantidad, subtotal)
//         VALUES ?
//       `;

//       const detalles = carrito.map((item) => [
//         pedidoId,
//         item.id,
//         item.nombre,
//         item.precio,
//         item.quantity,
//         item.precio * item.quantity,
//       ]);

//       DB.query(INSERT_DETALLE, [detalles], (err) => {
//         if (err)
//           return res.status(500).json({ error: "Error al guardar detalles" });

//         res.json({
//           mensaje: "Pedido registrado correctamente ✔",
//           pedidoId,
//         });
//       });
//     }
//   );
// });

// // ────────────────────────────────────────────
// // EXPORTAR PEDIDOS A EXCEL
// // ────────────────────────────────────────────
// app.get("/api/exportar-pedidos", (req, res) => {
//   const SQL = "SELECT * FROM pedidos";

//   DB.query(SQL, async (err, pedidos) => {
//     if (err) return res.status(500).json({ error: "Error al obtener pedidos" });

//     const workbook = new ExcelJS.Workbook();
//     const sheet = workbook.addWorksheet("Pedidos");

//     sheet.columns = [
//       { header: "ID", key: "id", width: 10 },
//       { header: "Nombre", key: "nombre", width: 25 },
//       { header: "Email", key: "email", width: 25 },
//       { header: "Direccion", key: "direccion", width: 25 },
//       { header: "Ciudad", key: "ciudad", width: 20 },
//       { header: "Telefono", key: "telefono", width: 20 },
//       { header: "Total", key: "total", width: 12 },
//       { header: "Fecha", key: "fecha", width: 20 },
//     ];

//     pedidos.forEach((p) => sheet.addRow(p));

//     res.setHeader(
//       "Content-Type",
//       "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
//     );
//     res.setHeader("Content-Disposition", "attachment; filename=pedidos.xlsx");

//     await workbook.xlsx.write(res);
//     res.end();
//   });
// });

// // ────────────────────────────────────────────
// // INICIAR SERVIDOR
// // ────────────────────────────────────────────
// app.listen(PORT, () => {
//   console.log(`Servidor escuchando en http://localhost:${PORT}`);
// });

// /***********************************************final de execl */

// app.get("/api/exportar-pedidos-completo", (req, res) => {
//   const SQL = `
//       SELECT
//         p.id AS pedido_id,
//         p.fecha,
//         p.nombre AS cliente_nombre,
//         p.email,
//         p.direccion,
//         p.ciudad,
//         p.telefono,
//         d.producto_id,
//         d.nombre AS producto_nombre,
//         d.precio,
//         d.cantidad,
//         d.subtotal
//       FROM pedidos p
//       INNER JOIN pedido_detalles d
//         ON p.id = d.pedido_id
//       ORDER BY p.id ASC;
//     `;

//   DB.query(SQL, async (err, rows) => {
//     if (err) {
//       console.log("Error consultando pedidos completos:", err);
//       return res.status(500).json({ error: "Error obteniendo datos" });
//     }

//     const workbook = new ExcelJS.Workbook();
//     const sheet = workbook.addWorksheet("PedidosCompletos");

//     // 📌 Configuración de columnas
//     sheet.columns = [
//       { header: "Pedido ID", key: "pedido_id", width: 12 },
//       { header: "Fecha", key: "fecha", width: 20 },
//       { header: "Cliente", key: "cliente_nombre", width: 25 },
//       { header: "Email", key: "email", width: 25 },
//       { header: "Dirección", key: "direccion", width: 25 },
//       { header: "Ciudad", key: "ciudad", width: 15 },
//       { header: "Teléfono", key: "telefono", width: 18 },
//       { header: "Producto ID", key: "producto_id", width: 12 },
//       { header: "Producto", key: "producto_nombre", width: 25 },
//       { header: "Precio", key: "precio", width: 12 },
//       { header: "Cantidad", key: "cantidad", width: 12 },
//       { header: "Subtotal", key: "subtotal", width: 12 },
//     ];

//     // 🧊 Congelar encabezado
//     sheet.views = [{ state: "frozen", ySplit: 1 }];

//     // 🟦 Estilo del encabezado
//     sheet.getRow(1).eachCell((cell) => {
//       cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
//       cell.fill = {
//         type: "pattern",
//         pattern: "solid",
//         fgColor: { argb: "FF1F4E78" }, // azul elegante
//       };
//       cell.alignment = { vertical: "middle", horizontal: "center" };
//       cell.border = {
//         top: { style: "thin" },
//         left: { style: "thin" },
//         bottom: { style: "thin" },
//         right: { style: "thin" },
//       };
//     });

//     // 📌 Agregar filas
//     rows.forEach((row, index) => {
//       const addedRow = sheet.addRow(row);

//       // Alternancia de color estilo tabla
//       const fillColor = index % 2 === 0 ? "FFF3F3F3" : "FFFFFFFF";

//       addedRow.eachCell((cell) => {
//         cell.fill = {
//           type: "pattern",
//           pattern: "solid",
//           fgColor: { argb: fillColor },
//         };

//         cell.border = {
//           top: { style: "thin" },
//           left: { style: "thin" },
//           bottom: { style: "thin" },
//           right: { style: "thin" },
//         };
//       });
//     });

//     // 📌 Activar autofiltro
//     sheet.autoFilter = {
//       from: "A1",
//       to: "L1",
//     };

//     // Enviar archivo
//     res.setHeader(
//       "Content-Type",
//       "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
//     );
//     res.setHeader(
//       "Content-Disposition",
//       "attachment; filename=pedidos_completo.xlsx"
//     );

//     await workbook.xlsx.write(res);
//     res.end();
//   });
// });

// // ────────────────────────────────────────────
// // FORMULARIO DE CONCTACTO
// // ────────────────────────────────────────────
// // Ruta para guardar el contacto

// app.post("/api/contacto", (req, res) => {
//   const { nombre, email, mensaje } = req.body;

//   // Validación
//   if (!nombre || !email || !mensaje) {
//     return res.status(400).json({ error: "Todos los campos son obligatorios" });
//   }

//   // Insert en la tabla contacto
//   const sql = "INSERT INTO contacto (nombre, email, mensaje) VALUES (?, ?, ?)";

//   DB.query(sql, [nombre, email, mensaje], (err, result) => {
//     if (err) {
//       console.error("❌ Error al guardar mensaje en DB:", err);
//       return res.status(500).json({ error: "Error al guardar mensaje en DB" });
//     }

//     console.log("✅ Mensaje guardado con ID:", result.insertId);
//     res.json({
//       message: "Mensaje guardado correctamente",
//       id: result.insertId,
//     });
//   });
// });

// server.js
// server.js
import express from "express";
import { createConnection } from "mysql";
import cors from "cors";
import ExcelJS from "exceljs";

const app = express();
const PORT = 3002;

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());

// --- Conexión MySQL ---
const DB = createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "tienda",
});

DB.connect((err) => {
  if (err) {
    console.error("Error conectando MySQL:", err);
    process.exit(1);
  }
  console.log("Conexión exitosa a MySQL ✔");
});

// ---------------------------
// GET productos
// ---------------------------
app.get("/api/productos", (req, res) => {
  DB.query("SELECT * FROM productos", (err, rows) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Error cargando productos" });
    }
    res.json(rows);
  });
});

// ---------------------------
// POST enviar-formulario (guardar pedido + detalles)
// ---------------------------
app.post("/api/enviar-formulario", (req, res) => {
  const { nombre, email, direccion, ciudad, telefono, carrito } = req.body;
  if (!nombre || !email || !direccion || !ciudad || !telefono)
    return res.status(400).json({ error: "Faltan datos del cliente" });

  if (!carrito || !Array.isArray(carrito) || carrito.length === 0)
    return res.status(400).json({ error: "Carrito vacío" });

  const total = carrito.reduce(
    (sum, it) => sum + (it.precio || 0) * (it.quantity || it.cantidad || 0),
    0
  );

  const INSERT_PEDIDO = `INSERT INTO pedidos (nombre, email, direccion, ciudad, telefono, total, estado) VALUES (?, ?, ?, ?, ?, ?, 'pendiente')`;

  DB.query(
    INSERT_PEDIDO,
    [nombre, email, direccion, ciudad, telefono, total],
    (err, result) => {
      if (err) {
        console.error("Error insert pedido:", err);
        return res.status(500).json({ error: "Error guardando pedido" });
      }

      const pedidoId = result.insertId;
      const INSERT_DETALLE = `INSERT INTO pedido_detalles (pedido_id, producto_id, nombre, precio, cantidad, subtotal) VALUES ?`;

      const detalles = carrito.map((item) => [
        pedidoId,
        item.id,
        item.nombre,
        item.precio,
        item.quantity || item.cantidad || 1,
        (item.precio || 0) * (item.quantity || item.cantidad || 1),
      ]);

      DB.query(INSERT_DETALLE, [detalles], (err2) => {
        if (err2) {
          console.error("Error insert detalles:", err2);
          return res.status(500).json({ error: "Error guardando detalles" });
        }
        res.json({ mensaje: "Pedido registrado ✔", pedidoId });
      });
    }
  );
});

// ---------------------------
// LISTAR PEDIDOS: filtros (inicio/fin), búsqueda, paginación
// GET /api/pedidos-completo?page=1&search=xxx&inicio=YYYY-MM-DD&fin=YYYY-MM-DD
// ---------------------------
app.get("/api/pedidos-completo", (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = 10;
  const offset = (page - 1) * limit;
  const { inicio, fin, search } = req.query;

  let where = "WHERE 1=1";
  const params = [];

  if (inicio && fin) {
    where += " AND DATE(fecha) BETWEEN ? AND ?";
    params.push(inicio, fin);
  } else if (inicio) {
    where += " AND DATE(fecha) >= ?";
    params.push(inicio);
  } else if (fin) {
    where += " AND DATE(fecha) <= ?";
    params.push(fin);
  }

  if (search) {
    where += " AND (nombre LIKE ? OR telefono LIKE ?)";
    params.push(`%${search}%`, `%${search}%`);
  }

  const sqlCount = `SELECT COUNT(*) AS total FROM pedidos ${where}`;
  const sqlData = `
    SELECT id, nombre, email, direccion, ciudad, telefono, total, fecha, estado
    FROM pedidos
    ${where}
    ORDER BY fecha DESC
    LIMIT ? OFFSET ?
  `;

  DB.query(sqlCount, params, (err, countRows) => {
    if (err) {
      console.error("Error count:", err);
      return res.status(500).json({ error: "Error contando pedidos" });
    }
    const total = countRows[0].total || 0;
    const totalPages = Math.max(1, Math.ceil(total / limit));

    const paramsForData = params.slice();
    paramsForData.push(limit, offset);

    DB.query(sqlData, paramsForData, (err2, rows) => {
      if (err2) {
        console.error("Error data:", err2);
        return res.status(500).json({ error: "Error obteniendo pedidos" });
      }
      res.json({
        results: rows,
        totalPages,
        page,
        total,
      });
    });
  });
});

// ---------------------------
// OBTENER DETALLE DEL PEDIDO (productos)
// ---------------------------
app.get("/api/pedidos-detalle/:id", (req, res) => {
  const { id } = req.params;
  DB.query(
    "SELECT nombre AS producto, cantidad, precio, subtotal FROM pedido_detalles WHERE pedido_id = ?",
    [id],
    (err, rows) => {
      if (err) {
        console.error("Error detalle:", err);
        return res.status(500).json({ error: "Error obteniendo detalle" });
      }
      res.json(rows);
    }
  );
});

// ---------------------------
// ELIMINAR PEDIDO (verifica existencia, elimina detalles primero para compatibilidad)
// ---------------------------
app.delete("/api/pedidos/:id", (req, res) => {
  const { id } = req.params;
  if (!id) return res.status(400).json({ error: "ID no proporcionado" });

  DB.query("SELECT id FROM pedidos WHERE id = ?", [id], (err, sel) => {
    if (err) {
      console.error("Error select before delete:", err);
      return res.status(500).json({ error: "Error interno" });
    }
    if (sel.length === 0)
      return res.status(404).json({ error: "Pedido no existe" });

    // eliminar detalles (si el FK tiene ON DELETE CASCADE esto no es obligatorio, pero es seguro)
    DB.query(
      "DELETE FROM pedido_detalles WHERE pedido_id = ?",
      [id],
      (err2) => {
        if (err2) {
          console.error("Error borrando detalles:", err2);
          return res.status(500).json({ error: "Error eliminando detalles" });
        }

        DB.query("DELETE FROM pedidos WHERE id = ?", [id], (err3) => {
          if (err3) {
            console.error("Error borrando pedido:", err3);
            return res.status(500).json({ error: "Error eliminando pedido" });
          }
          res.json({ message: "Pedido eliminado ✔" });
        });
      }
    );
  });
});

// ---------------------------
// CAMBIAR ESTADO (toggle pendiente <-> entregado)
// ---------------------------
app.put("/api/pedidos-estado/:id", (req, res) => {
  const { id } = req.params;
  const sql =
    "UPDATE pedidos SET estado = IF(estado='entregado','pendiente','entregado') WHERE id = ?";
  DB.query(sql, [id], (err) => {
    if (err) {
      console.error("Error toggle estado:", err);
      return res.status(500).json({ error: "Error actualizando estado" });
    }
    res.json({ message: "Estado actualizado ✔" });
  });
});

// ---------------------------
// EXPORTAR PEDIDOS COMPLETOS A EXCEL
// ---------------------------
app.get("/api/exportar-pedidos-completo", (req, res) => {
  const SQL = `
    SELECT 
      p.id AS pedido_id,
      p.fecha,
      p.nombre AS cliente_nombre,
      p.email,
      p.direccion,
      p.ciudad,
      p.telefono,
      d.producto_id,
      d.nombre AS producto_nombre,
      d.precio,
      d.cantidad,
      d.subtotal
    FROM pedidos p
    INNER JOIN pedido_detalles d ON p.id = d.pedido_id
    ORDER BY p.id ASC
  `;

  DB.query(SQL, async (err, rows) => {
    if (err) {
      console.error("Error export:", err);
      return res.status(500).json({ error: "Error generando excel" });
    }

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("PedidosCompletos");
    sheet.columns = [
      { header: "Pedido ID", key: "pedido_id", width: 12 },
      { header: "Fecha", key: "fecha", width: 20 },
      { header: "Cliente", key: "cliente_nombre", width: 25 },
      { header: "Email", key: "email", width: 25 },
      { header: "Dirección", key: "direccion", width: 25 },
      { header: "Ciudad", key: "ciudad", width: 15 },
      { header: "Teléfono", key: "telefono", width: 18 },
      { header: "Producto ID", key: "producto_id", width: 12 },
      { header: "Producto", key: "producto_nombre", width: 25 },
      { header: "Precio", key: "precio", width: 12 },
      { header: "Cantidad", key: "cantidad", width: 12 },
      { header: "Subtotal", key: "subtotal", width: 12 },
    ];
    sheet.addRows(rows);

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=pedidos_completo.xlsx"
    );

    await workbook.xlsx.write(res);
    res.end();
  });
});

// ---------------------------
// CONTACTO
// ---------------------------
app.post("/api/contacto", (req, res) => {
  const { nombre, email, mensaje } = req.body;
  if (!nombre || !email || !mensaje)
    return res.status(400).json({ error: "Todos los campos son obligatorios" });
  DB.query(
    "INSERT INTO contacto (nombre, email, mensaje) VALUES (?, ?, ?)",
    [nombre, email, mensaje],
    (err, result) => {
      if (err) {
        console.error("Error contacto:", err);
        return res.status(500).json({ error: "Error guardando mensaje" });
      }
      res.json({ message: "Mensaje guardado ✔", id: result.insertId });
    }
  );
});

// ---------------------------
// Iniciar servidor
// ---------------------------
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
