import { useEffect, useState } from "react";
import {
  Trash2,
  Edit,
  Loader2,
  Save,
  RefreshCw,
  Search,
  AlertCircle,
  CheckCircle,
} from "lucide-react";

const API_URL = "https://gleaming-motivation-production-4018.up.railway.app";

export default function EliminarProducto() {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editando, setEditando] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [error, setError] = useState("");
  const [debugInfo, setDebugInfo] = useState("");

  // Cargar productos
  useEffect(() => {
    cargarProductos();
  }, []);

  const cargarProductos = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await fetch(`${API_URL}/api/productos`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const data = await response.json();
      setProductos(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error cargando:", error);
      setError("Error al cargar productos");
    } finally {
      setLoading(false);
    }
  };

  // Múltiples métodos para guardar
  const intentarGuardar = async (producto) => {
    setDebugInfo(`Intentando guardar producto ${producto.id}...`);

    // Método 1: PUT normal
    try {
      setDebugInfo("Método 1: PUT estándar");
      const response = await fetch(`${API_URL}/api/productos/${producto.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: producto.nombre || "",
          precio: parseInt(producto.precio) || 0,
          estado: producto.estado === 0 ? 0 : 1,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        return { success: true, data, method: "PUT estándar" };
      }
    } catch (error) {
      console.log("Método 1 falló:", error.message);
    }

    // Método 2: POST en lugar de PUT (algunos servidores prefieren POST)
    try {
      setDebugInfo("Método 2: POST con _method=PUT");
      const response = await fetch(`${API_URL}/api/productos/${producto.id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-HTTP-Method-Override": "PUT", // Header alternativo
        },
        body: JSON.stringify({
          nombre: producto.nombre || "",
          precio: parseInt(producto.precio) || 0,
          estado: producto.estado === 0 ? 0 : 1,
          _method: "PUT", // Parámetro común para override
        }),
      });

      if (response.ok) {
        const data = await response.json();
        return { success: true, data, method: "POST con override" };
      }
    } catch (error) {
      console.log("Método 2 falló:", error.message);
    }

    // Método 3: PATCH (algunas APIs usan PATCH para actualizaciones parciales)
    try {
      setDebugInfo("Método 3: PATCH");
      const response = await fetch(`${API_URL}/api/productos/${producto.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: producto.nombre || "",
          precio: parseInt(producto.precio) || 0,
          estado: producto.estado === 0 ? 0 : 1,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        return { success: true, data, method: "PATCH" };
      }
    } catch (error) {
      console.log("Método 3 falló:", error.message);
    }

    // Método 4: XMLHttpRequest (a veces funciona cuando fetch no)
    try {
      setDebugInfo("Método 4: XMLHttpRequest");
      return await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("PUT", `${API_URL}/api/productos/${producto.id}`);
        xhr.setRequestHeader("Content-Type", "application/json");

        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const data = JSON.parse(xhr.responseText);
              resolve({ success: true, data, method: "XMLHttpRequest" });
            } catch {
              resolve({
                success: true,
                data: xhr.responseText,
                method: "XMLHttpRequest",
              });
            }
          } else {
            reject(new Error(`HTTP ${xhr.status}`));
          }
        };

        xhr.onerror = () => reject(new Error("XHR Error"));
        xhr.timeout = 10000;

        xhr.send(
          JSON.stringify({
            nombre: producto.nombre || "",
            precio: parseInt(producto.precio) || 0,
            estado: producto.estado === 0 ? 0 : 1,
          }),
        );
      });
    } catch (error) {
      console.log("Método 4 falló:", error.message);
      return { success: false, error: "Todos los métodos fallaron" };
    }
  };

  const guardarCambios = async () => {
    if (!editando) return;

    setCargando(true);
    setError("");

    try {
      const resultado = await intentarGuardar(editando);

      if (resultado.success) {
        setProductos((prev) =>
          prev.map((p) => (p.id === editando.id ? { ...p, ...editando } : p)),
        );
        setEditando(null);
        setDebugInfo(`✅ Guardado con éxito usando: ${resultado.method}`);
        setTimeout(() => setDebugInfo(""), 3000);
      } else {
        setError("No se pudo guardar. Verifica la consola para más detalles.");
      }
    } catch (error) {
      console.error("Error final:", error);
      setError(`Error: ${error.message}`);
    } finally {
      setCargando(false);
    }
  };

  // Eliminar producto
  const eliminarProducto = async (id) => {
    if (!confirm("¿Eliminar este producto?")) return;

    try {
      const response = await fetch(`${API_URL}/api/productos/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setProductos((prev) => prev.filter((p) => p.id !== id));
        alert("Producto eliminado");
      }
    } catch (error) {
      console.error("Error eliminando:", error);
      alert("Error al eliminar");
    }
  };

  // Filtrar productos
  const productosFiltrados = productos.filter(
    (p) =>
      p.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
      p.descripcion?.toLowerCase().includes(busqueda.toLowerCase()),
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Productos</h1>
              <p className="text-sm text-gray-600">
                {productos.length} productos • {productosFiltrados.length}{" "}
                filtrados
              </p>
            </div>
            <button
              onClick={cargarProductos}
              className="flex items-center gap-2 px-4 py-2 bg-white border rounded-lg hover:bg-gray-50"
            >
              <RefreshCw size={16} />
              Recargar
            </button>
          </div>

          {/* Debug info */}
          {debugInfo && (
            <div className="mb-3 p-3 bg-blue-100 text-blue-800 rounded-lg text-sm">
              {debugInfo}
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-800 rounded-lg flex items-center gap-2">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          {/* Búsqueda */}
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar productos..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Lista de productos */}
        <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
          {productosFiltrados.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              {productos.length === 0
                ? "No hay productos cargados"
                : "No hay resultados"}
            </div>
          ) : (
            <div className="divide-y">
              {productosFiltrados.map((producto) => (
                <div key={producto.id} className="p-4 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      {/* Imagen */}
                      <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                        {producto.imagenes?.[0] ? (
                          <img
                            src={producto.imagenes[0]}
                            alt={producto.nombre}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            📦
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div>
                        <h3 className="font-bold text-gray-900">
                          {producto.nombre}
                        </h3>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="font-bold text-gray-900">
                            ${producto.precio?.toLocaleString()}
                          </span>
                          <span
                            className={`px-2 py-1 rounded text-xs font-medium ${
                              producto.estado === 0
                                ? "bg-red-100 text-red-800"
                                : "bg-green-100 text-green-800"
                            }`}
                          >
                            {producto.estado === 0 ? "Agotado" : "Disponible"}
                          </span>
                          {producto.es_oferta && (
                            <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded text-xs">
                              Oferta
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-gray-600 mt-2">
                          ID: {producto.id} •{" "}
                          {producto.categoria || "Sin categoría"}
                        </div>
                      </div>
                    </div>

                    {/* Botones */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditando(producto)}
                        className="px-3 py-1 bg-blue-50 text-blue-700 rounded hover:bg-blue-100 text-sm"
                      >
                        <Edit size={14} className="inline mr-1" />
                        Editar
                      </button>
                      <button
                        onClick={() => eliminarProducto(producto.id)}
                        className="px-3 py-1 bg-red-50 text-red-700 rounded hover:bg-red-100 text-sm"
                      >
                        <Trash2 size={14} className="inline mr-1" />
                        Eliminar
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal de edición */}
        {editando && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg w-full max-w-md shadow-xl">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold">Editar Producto</h2>
                  <button
                    onClick={() => setEditando(null)}
                    className="p-2 hover:bg-gray-100 rounded"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Nombre
                    </label>
                    <input
                      type="text"
                      value={editando.nombre || ""}
                      onChange={(e) =>
                        setEditando({ ...editando, nombre: e.target.value })
                      }
                      className="w-full px-3 py-2 border rounded"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Precio
                    </label>
                    <input
                      type="number"
                      value={editando.precio || ""}
                      onChange={(e) =>
                        setEditando({ ...editando, precio: e.target.value })
                      }
                      className="w-full px-3 py-2 border rounded"
                    />
                  </div>

                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={editando.estado === 0}
                        onChange={(e) =>
                          setEditando({
                            ...editando,
                            estado: e.target.checked ? 0 : 1,
                          })
                        }
                        className="w-4 h-4"
                      />
                      <span className="text-sm">Producto agotado</span>
                    </label>

                    <div
                      className={`flex items-center gap-1 px-2 py-1 rounded ${
                        editando.estado === 0
                          ? "bg-red-100 text-red-800"
                          : "bg-green-100 text-green-800"
                      }`}
                    >
                      {editando.estado === 0 ? (
                        <>
                          <span className="text-xs">●</span>
                          <span className="text-xs font-medium">AGOTADO</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle size={12} />
                          <span className="text-xs font-medium">
                            DISPONIBLE
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => setEditando(null)}
                    className="flex-1 py-2 border rounded hover:bg-gray-50"
                    disabled={cargando}
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={guardarCambios}
                    disabled={cargando}
                    className="flex-1 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {cargando ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        Guardar Cambios
                      </>
                    )}
                  </button>
                </div>

                {/* Info de debug */}
                <div className="mt-4 p-3 bg-gray-50 rounded border text-xs">
                  <p className="font-medium mb-1">Info de depuración:</p>
                  <p>Producto ID: {editando.id}</p>
                  <p>
                    Endpoint: {API_URL}/api/productos/{editando.id}
                  </p>
                  <p className="text-gray-600 mt-1">
                    El componente intentará varios métodos (PUT, POST, PATCH,
                    XHR)
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
