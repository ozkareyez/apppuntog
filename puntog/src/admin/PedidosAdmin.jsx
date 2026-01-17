import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import {
  Bell,
  Volume2,
  MessageCircle,
  CheckCircle,
  Package,
  Clock,
  CheckSquare,
  Eye,
  Truck,
} from "lucide-react";

const API = "https://gleaming-motivation-production-4018.up.railway.app";

export default function PedidosAdmin() {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [estadoFiltro, setEstadoFiltro] = useState("todos");
  const [paginaActual, setPaginaActual] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);

  const [nuevosPedidos, setNuevosPedidos] = useState([]);
  const [ultimoPedidoId, setUltimoPedidoId] = useState(null);
  const [mostrarNotificacion, setMostrarNotificacion] = useState(false);
  const [sonidoActivo, setSonidoActivo] = useState(false);
  const [contadorNuevos, setContadorNuevos] = useState(0);
  const [enviandoWhatsApp, setEnviandoWhatsApp] = useState(false);
  const [pedidosConfirmados, setPedidosConfirmados] = useState([]);

  // Cargar pedidos - FUNCIÓN CORREGIDA
  const cargarPedidos = async (page = 1) => {
    setLoading(true);
    try {
      let url = `${API}/api/pedidos-completo`;
      const params = new URLSearchParams({ page: page.toString() });

      if (estadoFiltro !== "todos") params.append("estado", estadoFiltro);
      if (busqueda.trim() !== "") params.append("search", busqueda.trim());

      const res = await fetch(`${url}?${params.toString()}`);
      if (!res.ok) throw new Error(`Error HTTP: ${res.status}`);

      const data = await res.json();

      let resultados = [];
      let total = 1;

      if (data.results && Array.isArray(data.results)) {
        resultados = data.results;
        total = data.totalPages || 1;
      } else if (Array.isArray(data)) {
        resultados = data;
        total = 1;
      } else if (data.data && Array.isArray(data.data)) {
        resultados = data.data;
        total = data.last_page || 1;
      }

      if (estadoFiltro !== "todos") {
        resultados = resultados.filter((p) => p.estado === estadoFiltro);
      }

      setPedidos(resultados);
      setPaginaActual(page);
      setTotalPaginas(total);

      if (resultados.length > 0) {
        const maxId = Math.max(...resultados.map((p) => p.id));
        setUltimoPedidoId(maxId);
      }

      setError("");
    } catch (err) {
      console.error("Error cargando pedidos:", err);
      setError("Error al cargar pedidos");
      setPedidos([]);
      setTotalPaginas(1);
    } finally {
      setLoading(false);
    }
  };

  // WhatsApp
  const enviarMensajeWhatsApp = async (pedido) => {
    try {
      setEnviandoWhatsApp(true);

      // Obtener detalles del pedido
      let productosTexto = "• Productos de lencería elegante";
      try {
        const res = await fetch(`${API}/api/pedidos/${pedido.id}`);
        if (res.ok) {
          const data = await res.json();
          if (data.productos && Array.isArray(data.productos)) {
            productosTexto = data.productos
              .map(
                (p, i) =>
                  `• ${p.nombre || `Producto ${i + 1}`} - $${Number(p.precio || 0).toLocaleString()}`,
              )
              .join("\n");
          }
        }
      } catch (error) {
        console.log("Error obteniendo productos:", error);
      }

      const mensaje = `¡Hola ${pedido.nombre}! 😊

📦 Pedido #${pedido.id} recibido
💰 Total: $${Number(pedido.total || 0).toLocaleString()}
📍 ${pedido.ciudad_nombre || ""}

${productosTexto}

⏳ En preparación
📞 Pronto te contactaremos

Gracias por tu compra 💖
#PuntoG #${pedido.id}`;

      const mensajeCodificado = encodeURIComponent(mensaje);
      const telefonoLimpio = (pedido.telefono || "").replace(/\D/g, "");

      if (!telefonoLimpio) {
        alert("No hay teléfono válido");
        return;
      }

      const telefonoWhatsApp = telefonoLimpio.startsWith("57")
        ? telefonoLimpio
        : `57${telefonoLimpio}`;
      const urlWhatsApp = `https://wa.me/${telefonoWhatsApp}?text=${mensajeCodificado}`;

      window.open(urlWhatsApp, "_blank");
      setPedidosConfirmados((prev) => [...prev, pedido.id]);
    } catch (error) {
      console.error("Error WhatsApp:", error);
      alert("Error al abrir WhatsApp");
    } finally {
      setEnviandoWhatsApp(false);
    }
  };

  // Verificar nuevos pedidos
  const verificarNuevosPedidos = async () => {
    try {
      const res = await fetch(`${API}/api/pedidos-completo?limit=5&order=desc`);
      if (!res.ok) return;

      const data = await res.json();
      let resultados = [];

      if (data.results && Array.isArray(data.results))
        resultados = data.results;
      else if (Array.isArray(data)) resultados = data;
      else if (data.data && Array.isArray(data.data)) resultados = data.data;

      const nuevos = resultados.filter(
        (pedido) =>
          (!ultimoPedidoId || pedido.id > ultimoPedidoId) &&
          pedido.estado === "pendiente",
      );

      if (nuevos.length > 0) {
        const maxId = Math.max(...nuevos.map((p) => p.id));
        if (!ultimoPedidoId || maxId > ultimoPedidoId) setUltimoPedidoId(maxId);

        setNuevosPedidos((prev) => {
          const nuevosIds = nuevos.map((p) => p.id);
          const filtrados = prev.filter((p) => !nuevosIds.includes(p.id));
          return [...nuevos, ...filtrados].slice(0, 3);
        });

        setMostrarNotificacion(true);
        setContadorNuevos((prev) => prev + nuevos.length);

        setTimeout(() => setMostrarNotificacion(false), 5000);
      }
    } catch (error) {
      console.log("Error verificando pedidos:", error);
    }
  };

  // Cambiar estado
  const cambiarEstado = async (id) => {
    try {
      await fetch(`${API}/api/pedidos-estado/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estado: "entregado" }),
      });
      cargarPedidos(paginaActual);
    } catch {
      alert("Error cambiando estado");
    }
  };

  const limpiarNotificaciones = () => {
    setNuevosPedidos([]);
    setMostrarNotificacion(false);
    setContadorNuevos(0);
  };

  // Effects - CORREGIDOS
  useEffect(() => {
    cargarPedidos(paginaActual);
  }, [paginaActual, estadoFiltro, busqueda]);

  useEffect(() => {
    const interval = setInterval(verificarNuevosPedidos, 30000);
    const timeout = setTimeout(verificarNuevosPedidos, 2000);
    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [ultimoPedidoId]);

  useEffect(() => {
    if (pedidos.length > 0) setContadorNuevos(0);
  }, [pedidos]);

  // Loading
  if (loading)
    return (
      <div className="min-h-screen bg-white p-4 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-gray-600 text-sm">Cargando...</p>
        </div>
      </div>
    );

  // Error
  if (error && pedidos.length === 0)
    return (
      <div className="min-h-screen bg-white p-4 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <Package className="w-6 h-6 text-red-500" />
          </div>
          <p className="text-gray-800 font-medium mb-2">{error}</p>
          <button
            onClick={() => cargarPedidos(1)}
            className="px-4 py-2 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600"
          >
            Reintentar
          </button>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 p-3 md:p-4">
      {/* Notificación - CORREGIDO el texto "s" */}
      {mostrarNotificacion && (
        <div className="fixed top-3 right-3 left-3 md:left-auto md:w-80 z-50 animate-fade-in">
          <div className="bg-white rounded-lg shadow-lg border border-green-200 overflow-hidden">
            <div className="bg-green-500 px-4 py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-white" />
                  <p className="text-white font-medium text-sm">
                    {nuevosPedidos.length} nuevo
                    {nuevosPedidos.length !== 1 ? "s" : ""}
                  </p>
                </div>
                <button
                  onClick={limpiarNotificaciones}
                  className="text-white/80 hover:text-white text-sm"
                >
                  ✕
                </button>
              </div>
            </div>
            <div className="p-3">
              {nuevosPedidos.slice(0, 2).map((pedido) => (
                <div key={pedido.id} className="mb-2 last:mb-0">
                  <div className="flex justify-between items-center text-sm">
                    <div>
                      <p className="font-medium">#{pedido.id}</p>
                      <p className="text-gray-600 text-xs">{pedido.nombre}</p>
                    </div>
                    <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded">
                      ${Number(pedido.total || 0).toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
              <button
                onClick={() => {
                  cargarPedidos(1);
                  limpiarNotificaciones();
                }}
                className="w-full mt-2 bg-green-500 text-white text-sm py-2 rounded hover:bg-green-600"
              >
                Ver pedidos
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Botón de notificaciones móvil */}
      {contadorNuevos > 0 && (
        <div className="fixed bottom-4 right-4 z-40">
          <button
            onClick={verificarNuevosPedidos}
            className="relative bg-red-500 text-white p-3 rounded-full shadow-lg hover:bg-red-600"
          >
            <Bell className="w-5 h-5" />
            {contadorNuevos > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-white text-red-500 text-xs font-bold rounded-full flex items-center justify-center border border-red-200">
                {contadorNuevos}
              </span>
            )}
          </button>
        </div>
      )}

      {/* Header */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Pedidos</h1>
            <p className="text-gray-500 text-sm">Gestiona todos los pedidos</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSonidoActivo(!sonidoActivo)}
              className={`p-2 rounded-full ${sonidoActivo ? "text-green-500" : "text-gray-400"}`}
            >
              <Volume2 className="w-5 h-5" />
            </button>
            {contadorNuevos > 0 && (
              <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                {contadorNuevos}
              </span>
            )}
          </div>
        </div>

        {/* Filtros */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Buscar cliente o teléfono..."
              value={busqueda}
              onChange={(e) => {
                setBusqueda(e.target.value);
                setPaginaActual(1);
              }}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500"
            />
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2">
            <button
              onClick={() => setEstadoFiltro("todos")}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap ${
                estadoFiltro === "todos"
                  ? "bg-red-500 text-white"
                  : "bg-white text-gray-700 border border-gray-200"
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setEstadoFiltro("pendiente")}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap ${
                estadoFiltro === "pendiente"
                  ? "bg-amber-500 text-white"
                  : "bg-white text-gray-700 border border-gray-200"
              }`}
            >
              <Clock className="inline w-3 h-3 mr-1" />
              Pendientes
            </button>
            <button
              onClick={() => setEstadoFiltro("entregado")}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap ${
                estadoFiltro === "entregado"
                  ? "bg-green-500 text-white"
                  : "bg-white text-gray-700 border border-gray-200"
              }`}
            >
              <CheckSquare className="inline w-3 h-3 mr-1" />
              Entregados
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="bg-white rounded-lg p-3 text-center">
          <p className="text-gray-500 text-xs mb-1">Total</p>
          <p className="text-lg font-bold text-gray-900">{pedidos.length}</p>
        </div>
        <div className="bg-white rounded-lg p-3 text-center">
          <p className="text-gray-500 text-xs mb-1">Pendientes</p>
          <p className="text-lg font-bold text-amber-600">
            {pedidos.filter((p) => p.estado === "pendiente").length}
          </p>
        </div>
        <div className="bg-white rounded-lg p-3 text-center">
          <p className="text-gray-500 text-xs mb-1">Entregados</p>
          <p className="text-lg font-bold text-green-600">
            {pedidos.filter((p) => p.estado === "entregado").length}
          </p>
        </div>
      </div>

      {/* Lista de pedidos - Tarjetas */}
      <div className="space-y-3">
        {pedidos.length > 0 ? (
          pedidos.map((p) => (
            <div
              key={p.id}
              className="bg-white rounded-lg border border-gray-200 overflow-hidden"
            >
              {/* Header de la card */}
              <div className="px-4 py-3 border-b border-gray-100">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Package className="w-4 h-4 text-gray-400" />
                    <span className="font-mono font-bold text-gray-800 text-sm">
                      #{p.id}
                    </span>
                    {nuevosPedidos.some((np) => np.id === p.id) && (
                      <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full">
                        NUEVO
                      </span>
                    )}
                  </div>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      p.estado === "pendiente"
                        ? "bg-amber-100 text-amber-800"
                        : "bg-green-100 text-green-800"
                    }`}
                  >
                    {p.estado === "pendiente" ? "⏳ Pendiente" : "✅ Entregado"}
                  </span>
                </div>
              </div>

              {/* Contenido */}
              <div className="p-4">
                <div className="mb-3">
                  <h3 className="font-medium text-gray-900 mb-1">{p.nombre}</h3>
                  <div className="flex flex-wrap gap-2 text-sm text-gray-600">
                    <span>{p.telefono}</span>
                    <span>•</span>
                    <span className="truncate">{p.ciudad_nombre}</span>
                  </div>
                </div>

                <div className="flex justify-between items-center mb-3">
                  <div>
                    <p className="text-xs text-gray-500">Total</p>
                    <p className="text-lg font-bold text-red-600">
                      ${Number(p.total || 0).toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">Dirección</p>
                    <p className="text-sm text-gray-700 truncate max-w-[120px]">
                      {p.direccion || "Sin dirección"}
                    </p>
                  </div>
                </div>

                {/* Botones - En fila horizontal */}
                <div className="flex gap-2">
                  <button
                    onClick={() => enviarMensajeWhatsApp(p)}
                    disabled={
                      enviandoWhatsApp || pedidosConfirmados.includes(p.id)
                    }
                    className={`flex-1 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-1 ${
                      pedidosConfirmados.includes(p.id)
                        ? "bg-green-500 text-white"
                        : "bg-emerald-500 text-white hover:bg-emerald-600"
                    } ${enviandoWhatsApp ? "opacity-70" : ""}`}
                  >
                    {enviandoWhatsApp ? (
                      <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : pedidosConfirmados.includes(p.id) ? (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        <span className="hidden xs:inline">Confirmado</span>
                      </>
                    ) : (
                      <>
                        <MessageCircle className="w-4 h-4" />
                        <span className="hidden xs:inline">WhatsApp</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => cambiarEstado(p.id)}
                    className="flex-1 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600"
                  >
                    {p.estado === "pendiente" ? (
                      <>
                        <Truck className="inline w-4 h-4 mr-1" />
                        <span className="hidden xs:inline">Entregar</span>
                      </>
                    ) : (
                      "Pendiente"
                    )}
                  </button>

                  <Link
                    to={`/admin/orden-servicio/${p.id}`}
                    className="flex-1 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 flex items-center justify-center gap-1"
                  >
                    <Eye className="w-4 h-4" />
                    <span className="hidden xs:inline">Ver</span>
                  </Link>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white rounded-lg p-8 text-center">
            <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-600 font-medium">No hay pedidos</p>
            <p className="text-gray-500 text-sm mt-1">
              {error || "Intenta cambiar los filtros"}
            </p>
          </div>
        )}
      </div>

      {/* PAGINACIÓN - CORREGIDA */}
      {totalPaginas > 1 && pedidos.length > 0 && (
        <div className="mt-4 bg-white rounded-lg p-3">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-sm text-gray-600">
              Página {paginaActual} de {totalPaginas}
            </div>

            <div className="flex items-center gap-2">
              {/* Botón anterior */}
              <button
                disabled={paginaActual === 1}
                onClick={() => setPaginaActual((p) => Math.max(1, p - 1))}
                className={`px-3 py-1.5 border border-gray-300 rounded text-sm ${
                  paginaActual === 1
                    ? "text-gray-400 cursor-not-allowed"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                ← Anterior
              </button>

              {/* Números de página */}
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(3, totalPaginas) }, (_, i) => {
                  const page = i + 1;
                  return (
                    <button
                      key={page}
                      onClick={() => setPaginaActual(page)}
                      className={`w-8 h-8 rounded text-sm ${
                        paginaActual === page
                          ? "bg-red-500 text-white"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}
                {totalPaginas > 3 && (
                  <>
                    <span className="text-gray-400">...</span>
                    <button
                      onClick={() => setPaginaActual(totalPaginas)}
                      className={`w-8 h-8 rounded text-sm ${
                        paginaActual === totalPaginas
                          ? "bg-red-500 text-white"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      {totalPaginas}
                    </button>
                  </>
                )}
              </div>

              {/* Botón siguiente */}
              <button
                disabled={paginaActual === totalPaginas}
                onClick={() =>
                  setPaginaActual((p) => Math.min(totalPaginas, p + 1))
                }
                className={`px-3 py-1.5 border border-gray-300 rounded text-sm ${
                  paginaActual === totalPaginas
                    ? "text-gray-400 cursor-not-allowed"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                Siguiente →
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in { animation: fade-in 0.2s ease-out; }
      `}</style>
    </div>
  );
}

// Agrega el componente Search que falta
const Search = ({ className, ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

// import { useEffect, useState, useRef } from "react";
// import { Link } from "react-router-dom";
// import { Bell, Volume2, MessageCircle, CheckCircle } from "lucide-react";

// const API = "https://gleaming-motivation-production-4018.up.railway.app";

// export default function PedidosAdmin() {
//   const [pedidos, setPedidos] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");
//   const [busqueda, setBusqueda] = useState("");
//   const [estadoFiltro, setEstadoFiltro] = useState("todos");
//   const [paginaActual, setPaginaActual] = useState(1);
//   const [totalPaginas, setTotalPaginas] = useState(1);

//   // Estados para notificaciones
//   const [nuevosPedidos, setNuevosPedidos] = useState([]);
//   const [ultimoPedidoId, setUltimoPedidoId] = useState(null);
//   const [mostrarNotificacion, setMostrarNotificacion] = useState(false);
//   const [sonidoActivo, setSonidoActivo] = useState(true);
//   const [contadorNuevos, setContadorNuevos] = useState(0);
//   const [enviandoWhatsApp, setEnviandoWhatsApp] = useState(false);
//   const [pedidosConfirmados, setPedidosConfirmados] = useState([]);

//   const audioRef = useRef(null);

//   // Cargar pedidos iniciales - FUNCIÓN CORREGIDA
//   const cargarPedidos = async (page = 1) => {
//     setLoading(true);
//     try {
//       let url = `${API}/api/pedidos-completo`;
//       const params = new URLSearchParams({
//         page: page.toString(),
//       });

//       // Solo agregar filtros si no son "todos" o están vacíos
//       if (estadoFiltro !== "todos") {
//         params.append("estado", estadoFiltro);
//       }

//       if (busqueda.trim() !== "") {
//         params.append("search", busqueda.trim());
//       }

//       const res = await fetch(`${url}?${params.toString()}`);

//       if (!res.ok) throw new Error(`Error HTTP: ${res.status}`);

//       const data = await res.json();

//       // Manejar diferentes estructuras de respuesta
//       let resultados = [];
//       let total = 1;

//       if (data.results && Array.isArray(data.results)) {
//         resultados = data.results;
//         total = data.totalPages || 1;
//       } else if (Array.isArray(data)) {
//         resultados = data;
//         total = 1;
//       } else if (data.data && Array.isArray(data.data)) {
//         resultados = data.data;
//         total = data.last_page || 1;
//       }

//       // Aplicar filtro de estado si es necesario
//       if (estadoFiltro !== "todos") {
//         resultados = resultados.filter((p) => p.estado === estadoFiltro);
//       }

//       setPedidos(resultados);
//       setPaginaActual(page);
//       setTotalPaginas(total);

//       // Guardar el ID del último pedido para comparaciones futuras
//       if (resultados.length > 0) {
//         const maxId = Math.max(...resultados.map((p) => p.id));
//         setUltimoPedidoId(maxId);
//       }

//       setError(""); // Limpiar error si se cargó correctamente
//     } catch (err) {
//       console.error("Error cargando pedidos:", err);
//       setError("No se pudieron cargar los pedidos. Verifica la conexión.");
//       setPedidos([]);
//       setTotalPaginas(1);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Función para enviar mensaje de WhatsApp
//   // MODIFICA COMPLETAMENTE LA FUNCIÓN enviarMensajeWhatsApp:
//   const enviarMensajeWhatsApp = async (pedido) => {
//     try {
//       setEnviandoWhatsApp(true);

//       // Intenta obtener los detalles completos del pedido usando la misma ruta que "Ver Detalles"
//       let productosTexto = "Productos no disponibles";
//       let pedidoCompleto = pedido;

//       try {
//         // PRUEBA ESTAS RUTAS (una de ellas debería funcionar):
//         const posiblesRutas = [
//           `${API}/api/pedidos/${pedido.id}`, // Ruta común
//           `${API}/api/pedido-detalle/${pedido.id}`,
//           `${API}/api/pedidos/${pedido.id}/detalle`,
//           `${API}/api/admin/pedidos/${pedido.id}`,
//           `${API}/api/orden-servicio/${pedido.id}`, // La misma ruta que usa "Ver Detalles"
//         ];

//         let datosPedido = null;

//         // Probar cada ruta hasta encontrar una que funcione
//         for (const ruta of posiblesRutas) {
//           try {
//             console.log(`Intentando obtener productos desde: ${ruta}`);
//             const res = await fetch(ruta);
//             if (res.ok) {
//               const data = await res.json();
//               datosPedido = data;
//               console.log("Respuesta obtenida:", data);
//               break; // Salir del bucle si se obtuvo respuesta
//             }
//           } catch (error) {
//             console.log(`Error en ruta ${ruta}:`, error);
//             continue; // Intentar siguiente ruta
//           }
//         }

//         // Si encontramos datos, procesarlos
//         if (datosPedido) {
//           // Buscar productos en diferentes estructuras de respuesta
//           let productosArray = [];

//           // 1. Buscar directamente productos
//           if (datosPedido.productos && Array.isArray(datosPedido.productos)) {
//             productosArray = datosPedido.productos;
//           }
//           // 2. Buscar en data.productos
//           else if (
//             datosPedido.data &&
//             datosPedido.data.productos &&
//             Array.isArray(datosPedido.data.productos)
//           ) {
//             productosArray = datosPedido.data.productos;
//           }
//           // 3. Buscar en items
//           else if (datosPedido.items && Array.isArray(datosPedido.items)) {
//             productosArray = datosPedido.items;
//           }
//           // 4. Buscar en detalle_pedido
//           else if (
//             datosPedido.detalle_pedido &&
//             Array.isArray(datosPedido.detalle_pedido)
//           ) {
//             productosArray = datosPedido.detalle_pedido;
//           }
//           // 5. Si la respuesta ES un array de productos
//           else if (Array.isArray(datosPedido)) {
//             productosArray = datosPedido;
//           }

//           console.log("Productos encontrados:", productosArray);

//           // Formatear productos
//           if (productosArray.length > 0) {
//             productosTexto = productosArray
//               .map((producto, index) => {
//                 // Extraer nombre del producto
//                 const nombre =
//                   producto.nombre ||
//                   producto.producto_nombre ||
//                   producto.descripcion ||
//                   `Producto ${index + 1}`;

//                 // Extraer precio
//                 const precio =
//                   producto.precio ||
//                   producto.precio_unitario ||
//                   producto.precio_venta ||
//                   0;

//                 // Extraer cantidad
//                 const cantidad = producto.cantidad || producto.cant || 1;

//                 // Extraer talla si existe
//                 const talla = producto.talla
//                   ? ` (Talla: ${producto.talla})`
//                   : "";

//                 // Extraer color si existe
//                 const color = producto.color
//                   ? ` (Color: ${producto.color})`
//                   : "";

//                 return `• ${nombre}${talla}${color} - ${cantidad} x $${Number(precio).toLocaleString()}`;
//               })
//               .join("\n");

//             // Actualizar pedidoCompleto si encontramos más datos
//             if (datosPedido.nombre || datosPedido.data?.nombre) {
//               pedidoCompleto = {
//                 ...pedido,
//                 ...datosPedido,
//                 ...(datosPedido.data || {}),
//               };
//             }
//           } else {
//             productosTexto = "• Productos de lencería elegante";
//           }
//         } else {
//           console.log("No se pudo obtener información de productos");
//           productosTexto = "• Productos de lencería elegante";
//         }
//       } catch (error) {
//         console.error("Error obteniendo productos:", error);
//         productosTexto = "• Productos de lencería elegante";
//       }

//       // Crear mensaje personalizado MEJORADO
//       const mensaje = `¡Hola ${pedidoCompleto.nombre || "Cliente"}! 😊

// ¡Recibimos tu pedido en *PuntoG*! 🎉

// 📦 *Detalles del pedido:*
// - N° Pedido: #${pedidoCompleto.id}
// - Total: $${Number(pedidoCompleto.total || 0).toLocaleString()}
// - Dirección: ${pedidoCompleto.direccion || "Por confirmar"}, ${pedidoCompleto.ciudad_nombre || ""}
// - Teléfono: ${pedidoCompleto.telefono}
// ${pedidoCompleto.email ? `- Email: ${pedidoCompleto.email}` : ""}

// 🛍️ *Productos solicitados:*
// ${productosTexto}

// 📝 *Estado:* Pendiente de preparación
// 🕐 *Tiempo estimado:* 24-48 horas
// 🚚 *Método de entrega:* ${pedidoCompleto.metodo_envio || "Estándar"}

// Gracias por confiar en nosotros. Pronto nos comunicaremos contigo para coordinar el despacho.

// 💖 *PuntoG - Lencería Elegante*
// *#${pedidoCompleto.id}*`;

//       // Codificar mensaje para URL
//       const mensajeCodificado = encodeURIComponent(mensaje);

//       // Crear enlace de WhatsApp
//       const telefonoLimpio = (pedidoCompleto.telefono || "").replace(/\D/g, "");
//       if (!telefonoLimpio) {
//         alert("El pedido no tiene número de teléfono válido");
//         setEnviandoWhatsApp(false);
//         return;
//       }

//       const telefonoWhatsApp = telefonoLimpio.startsWith("57")
//         ? telefonoLimpio
//         : `57${telefonoLimpio}`;

//       const urlWhatsApp = `https://wa.me/${telefonoWhatsApp}?text=${mensajeCodificado}`;

//       // Abrir WhatsApp en nueva pestaña
//       window.open(urlWhatsApp, "_blank");

//       // Marcar como confirmado
//       setPedidosConfirmados((prev) => [...prev, pedidoCompleto.id]);
//     } catch (error) {
//       console.error("Error enviando WhatsApp:", error);
//       alert("Error al preparar WhatsApp. Por favor verifica la consola.");
//     } finally {
//       setEnviandoWhatsApp(false);
//     }
//   };

//   // Función para detectar nuevos pedidos
//   const verificarNuevosPedidos = async () => {
//     try {
//       const res = await fetch(`${API}/api/pedidos-completo?limit=5&order=desc`);

//       if (!res.ok) {
//         console.log("Error en respuesta del servidor");
//         return;
//       }

//       const data = await res.json();

//       let resultados = [];
//       if (data.results && Array.isArray(data.results)) {
//         resultados = data.results;
//       } else if (Array.isArray(data)) {
//         resultados = data;
//       } else if (data.data && Array.isArray(data.data)) {
//         resultados = data.data;
//       }

//       // Filtrar solo pedidos nuevos
//       const nuevos = resultados.filter((pedido) => {
//         return (
//           (!ultimoPedidoId || pedido.id > ultimoPedidoId) &&
//           pedido.estado === "pendiente"
//         );
//       });

//       if (nuevos.length > 0) {
//         // Actualizar último ID
//         const maxId = Math.max(...nuevos.map((p) => p.id));
//         if (!ultimoPedidoId || maxId > ultimoPedidoId) {
//           setUltimoPedidoId(maxId);
//         }

//         // Agregar a la lista de nuevos pedidos
//         setNuevosPedidos((prev) => {
//           const nuevosIds = nuevos.map((p) => p.id);
//           const filtrados = prev.filter((p) => !nuevosIds.includes(p.id));
//           return [...nuevos, ...filtrados].slice(0, 5);
//         });

//         // Mostrar notificación
//         setMostrarNotificacion(true);
//         setContadorNuevos((prev) => prev + nuevos.length);

//         // Reproducir sonido si está activo
//         if (sonidoActivo) {
//           try {
//             const audio = new Audio(
//               "https://assets.mixkit.co/sfx/preview/mixkit-alarm-digital-clock-beep-989.mp3",
//             );
//             audio.volume = 0.3;
//             audio
//               .play()
//               .catch((e) => console.log("Error reproduciendo sonido:", e));
//           } catch (error) {
//             console.log("Error con audio:", error);
//           }
//         }

//         // Ocultar notificación después de 5 segundos
//         setTimeout(() => {
//           setMostrarNotificacion(false);
//         }, 5000);
//       }
//     } catch (error) {
//       console.log("Error verificando nuevos pedidos:", error);
//     }
//   };

//   // Efecto para cargar pedidos iniciales
//   useEffect(() => {
//     cargarPedidos(paginaActual);
//   }, [paginaActual, estadoFiltro, busqueda]);

//   // Efecto para verificar nuevos pedidos periódicamente
//   useEffect(() => {
//     const interval = setInterval(verificarNuevosPedidos, 30000); // Cada 30 segundos

//     // Verificar inmediatamente después de 2 segundos
//     const timeout = setTimeout(verificarNuevosPedidos, 2000);

//     return () => {
//       clearInterval(interval);
//       clearTimeout(timeout);
//     };
//   }, [ultimoPedidoId]);

//   // Efecto para limpiar contador cuando se visitan los pedidos
//   useEffect(() => {
//     if (pedidos.length > 0) {
//       setContadorNuevos(0);
//     }
//   }, [pedidos]);

//   const cambiarEstado = async (id) => {
//     try {
//       const res = await fetch(`${API}/api/pedidos-estado/${id}`, {
//         method: "PUT",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({ estado: "entregado" }),
//       });

//       if (!res.ok) throw new Error();

//       // Recargar los pedidos
//       cargarPedidos(paginaActual);
//       alert("Estado actualizado correctamente");
//     } catch {
//       alert("Error cambiando el estado");
//     }
//   };

//   const limpiarNotificaciones = () => {
//     setNuevosPedidos([]);
//     setMostrarNotificacion(false);
//     setContadorNuevos(0);
//   };

//   const renderPaginas = () => {
//     const paginas = [];
//     const maxVisible = 5;
//     let start = Math.max(1, paginaActual - Math.floor(maxVisible / 2));
//     let end = Math.min(totalPaginas, start + maxVisible - 1);

//     if (end - start + 1 < maxVisible) {
//       start = Math.max(1, end - maxVisible + 1);
//     }

//     if (start > 1) {
//       paginas.push(
//         <button
//           key={1}
//           onClick={() => setPaginaActual(1)}
//           className="px-4 py-2 border border-red-200 rounded-lg text-red-700 hover:bg-red-50 transition-colors"
//         >
//           1
//         </button>,
//       );
//       if (start > 2) {
//         paginas.push(
//           <span key="dots-start" className="px-2 text-red-400">
//             ...
//           </span>,
//         );
//       }
//     }

//     for (let i = start; i <= end; i++) {
//       paginas.push(
//         <button
//           key={i}
//           onClick={() => setPaginaActual(i)}
//           className={`px-4 py-2 rounded-lg transition-all font-medium ${
//             i === paginaActual
//               ? "bg-red-600 text-white shadow-md"
//               : "border border-red-200 text-red-700 hover:bg-red-50"
//           }`}
//         >
//           {i}
//         </button>,
//       );
//     }

//     if (end < totalPaginas) {
//       if (end < totalPaginas - 1) {
//         paginas.push(
//           <span key="dots-end" className="px-2 text-red-400">
//             ...
//           </span>,
//         );
//       }
//       paginas.push(
//         <button
//           key={totalPaginas}
//           onClick={() => setPaginaActual(totalPaginas)}
//           className="px-4 py-2 border border-red-200 rounded-lg text-red-700 hover:bg-red-50 transition-colors"
//         >
//           {totalPaginas}
//         </button>,
//       );
//     }

//     return paginas;
//   };

//   if (loading)
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white to-red-50">
//         <div className="text-center">
//           <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
//           <p className="text-red-800 font-medium">Cargando pedidos...</p>
//         </div>
//       </div>
//     );

//   if (error && pedidos.length === 0)
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white to-red-50">
//         <div className="bg-white p-8 rounded-2xl shadow-lg border border-red-200 max-w-md text-center">
//           <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
//             <span className="text-3xl text-red-600">!</span>
//           </div>
//           <p className="text-red-600 font-bold text-lg mb-2">Error</p>
//           <p className="text-gray-600 mb-4">{error}</p>
//           <button
//             onClick={() => cargarPedidos(1)}
//             className="mt-2 bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-all font-medium"
//           >
//             Reintentar
//           </button>
//         </div>
//       </div>
//     );

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-white to-red-50 p-4 md:p-8">
//       {/* Notificación flotante */}
//       {mostrarNotificacion && (
//         <div className="fixed top-4 right-4 z-50 animate-fade-in-up">
//           <div className="bg-white rounded-xl shadow-2xl border border-green-200 overflow-hidden max-w-sm">
//             <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-4">
//               <div className="flex items-center justify-between">
//                 <div className="flex items-center gap-3">
//                   <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
//                     <Bell className="w-5 h-5 text-white" />
//                   </div>
//                   <div>
//                     <h3 className="text-white font-bold text-lg">
//                       ¡Nuevo Pedido!
//                     </h3>
//                     <p className="text-white/90 text-sm">
//                       {nuevosPedidos.length}{" "}
//                       {nuevosPedidos.length === 1
//                         ? "pedido nuevo"
//                         : "pedidos nuevos"}
//                     </p>
//                   </div>
//                 </div>
//                 <button
//                   onClick={limpiarNotificaciones}
//                   className="text-white/80 hover:text-white"
//                 >
//                   ✕
//                 </button>
//               </div>
//             </div>

//             <div className="p-4 max-h-64 overflow-y-auto">
//               {nuevosPedidos.slice(0, 3).map((pedido, index) => (
//                 <div
//                   key={pedido.id}
//                   className={`p-3 rounded-lg mb-2 ${
//                     index % 2 === 0 ? "bg-green-50" : "bg-white"
//                   }`}
//                 >
//                   <div className="flex justify-between items-start">
//                     <div>
//                       <p className="font-semibold text-gray-800">
//                         #{pedido.id} - {pedido.nombre}
//                       </p>
//                       <p className="text-sm text-gray-600">
//                         ${Number(pedido.total || 0).toLocaleString()} •{" "}
//                         {pedido.ciudad_nombre || "Sin ciudad"}
//                       </p>
//                     </div>
//                     <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
//                       NUEVO
//                     </span>
//                   </div>
//                 </div>
//               ))}

//               {nuevosPedidos.length > 3 && (
//                 <div className="text-center pt-2">
//                   <p className="text-sm text-gray-500">
//                     +{nuevosPedidos.length - 3} más...
//                   </p>
//                 </div>
//               )}

//               <button
//                 onClick={() => {
//                   cargarPedidos(1);
//                   limpiarNotificaciones();
//                 }}
//                 className="w-full mt-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white py-2.5 rounded-lg font-medium hover:from-green-700 hover:to-emerald-700 transition-all"
//               >
//                 Ver todos los pedidos
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Botón de notificaciones en esquina */}
//       <div className="fixed bottom-6 right-6 z-40">
//         <div className="flex flex-col items-end gap-2">
//           {contadorNuevos > 0 && (
//             <div className="animate-pulse">
//               <div className="bg-red-600 text-white text-xs font-bold rounded-full px-3 py-1 shadow-lg">
//                 {contadorNuevos} nuevo{contadorNuevos !== 1 ? "s" : ""}
//               </div>
//             </div>
//           )}

//           <div className="flex items-center gap-2 bg-white rounded-full shadow-lg p-2">
//             <button
//               onClick={() => setSonidoActivo(!sonidoActivo)}
//               className={`p-2 rounded-full ${
//                 sonidoActivo
//                   ? "bg-green-100 text-green-600"
//                   : "bg-gray-100 text-gray-400"
//               }`}
//               title={sonidoActivo ? "Sonido activado" : "Sonido desactivado"}
//             >
//               <Volume2 className="w-5 h-5" />
//             </button>

//             <button
//               onClick={verificarNuevosPedidos}
//               className="relative p-2 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-full hover:from-red-700 hover:to-red-800 transition-all"
//               title="Verificar nuevos pedidos"
//             >
//               <Bell className="w-5 h-5" />
//               {contadorNuevos > 0 && (
//                 <span className="absolute -top-1 -right-1 w-4 h-4 bg-white text-red-600 text-xs font-bold rounded-full flex items-center justify-center">
//                   {contadorNuevos}
//                 </span>
//               )}
//             </button>
//           </div>
//         </div>
//       </div>

//       {/* Header */}
//       <div className="bg-white rounded-2xl shadow-lg border border-red-100 p-6 mb-8">
//         <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
//           <div>
//             <div className="flex items-center gap-3 mb-2">
//               <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center">
//                 <span className="text-white text-xl">📦</span>
//               </div>
//               <div className="flex items-center gap-3">
//                 <h1 className="text-3xl font-bold bg-gradient-to-r from-red-700 to-red-600 bg-clip-text text-transparent">
//                   Gestión de Pedidos
//                 </h1>
//                 {contadorNuevos > 0 && (
//                   <span className="bg-gradient-to-r from-red-600 to-red-700 text-white text-sm font-bold px-3 py-1 rounded-full animate-pulse">
//                     {contadorNuevos} NUEVO{contadorNuevos !== 1 ? "S" : ""}
//                   </span>
//                 )}
//               </div>
//             </div>
//             <p className="text-gray-500 text-sm">
//               Administra y monitorea todos los pedidos del sistema
//               {sonidoActivo && " 🔊 Notificaciones activadas"}
//             </p>
//           </div>

//           <div className="flex flex-col sm:flex-row gap-4">
//             <div className="relative">
//               <input
//                 type="text"
//                 placeholder="Buscar cliente o teléfono..."
//                 value={busqueda}
//                 onChange={(e) => {
//                   setBusqueda(e.target.value);
//                   setPaginaActual(1);
//                 }}
//                 onKeyPress={(e) => {
//                   if (e.key === "Enter") {
//                     cargarPedidos(1);
//                   }
//                 }}
//                 className="w-full sm:w-64 pl-10 pr-4 py-3 border border-red-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
//               />
//               <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-red-400">
//                 🔍
//               </div>
//             </div>

//             <select
//               value={estadoFiltro}
//               onChange={(e) => {
//                 setEstadoFiltro(e.target.value);
//                 setPaginaActual(1);
//               }}
//               className="px-4 py-3 border border-red-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white text-gray-700 transition-all"
//             >
//               <option value="todos" className="text-gray-700">
//                 Todos los estados
//               </option>
//               <option value="pendiente" className="text-amber-600">
//                 Pendientes
//               </option>
//               <option value="entregado" className="text-green-600">
//                 Entregados
//               </option>
//             </select>
//           </div>
//         </div>
//       </div>

//       {/* Tarjeta de estadísticas */}
//       <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
//         <div className="bg-white rounded-2xl shadow border border-red-100 p-6">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-gray-500 text-sm">Total Pedidos</p>
//               <p className="text-3xl font-bold text-gray-800">
//                 {pedidos.length}
//               </p>
//             </div>
//             <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
//               <span className="text-red-600 text-2xl">📊</span>
//             </div>
//           </div>
//         </div>

//         <div className="bg-white rounded-2xl shadow border border-red-100 p-6">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-gray-500 text-sm">Pendientes</p>
//               <p className="text-3xl font-bold text-amber-600">
//                 {pedidos.filter((p) => p.estado === "pendiente").length}
//               </p>
//             </div>
//             <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
//               <span className="text-amber-600 text-2xl">⏳</span>
//             </div>
//           </div>
//         </div>

//         <div className="bg-white rounded-2xl shadow border border-red-100 p-6">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-gray-500 text-sm">Entregados</p>
//               <p className="text-3xl font-bold text-green-600">
//                 {pedidos.filter((p) => p.estado === "entregado").length}
//               </p>
//             </div>
//             <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
//               <span className="text-green-600 text-2xl">✅</span>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Tabla de pedidos */}
//       <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-red-100 mb-8">
//         <div className="overflow-x-auto">
//           <table className="w-full">
//             <thead className="bg-gradient-to-r from-red-600 to-red-700">
//               <tr>
//                 <th className="py-4 px-6 text-left text-white font-semibold">
//                   ID Pedido
//                 </th>
//                 <th className="py-4 px-6 text-left text-white font-semibold">
//                   Cliente
//                 </th>
//                 <th className="py-4 px-6 text-left text-white font-semibold">
//                   Contacto
//                 </th>
//                 <th className="py-4 px-6 text-left text-white font-semibold">
//                   Ubicación
//                 </th>
//                 <th className="py-4 px-6 text-left text-white font-semibold">
//                   Total
//                 </th>
//                 <th className="py-4 px-6 text-left text-white font-semibold">
//                   Estado
//                 </th>
//                 <th className="py-4 px-6 text-left text-white font-semibold">
//                   Acciones
//                 </th>
//               </tr>
//             </thead>
//             <tbody>
//               {pedidos.length > 0 ? (
//                 pedidos.map((p) => (
//                   <tr
//                     key={p.id}
//                     className={`border-b border-red-50 hover:bg-red-50 transition-colors group ${
//                       nuevosPedidos.some((np) => np.id === p.id)
//                         ? "bg-gradient-to-r from-green-50/50 to-emerald-50/50"
//                         : ""
//                     }`}
//                   >
//                     <td className="py-4 px-6">
//                       <span className="inline-block bg-red-100 text-red-700 px-3 py-1 rounded-lg font-mono font-semibold text-sm">
//                         #{p.id}
//                       </span>
//                       {nuevosPedidos.some((np) => np.id === p.id) && (
//                         <span className="ml-2 inline-block bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs px-2 py-0.5 rounded-full">
//                           NUEVO
//                         </span>
//                       )}
//                     </td>
//                     <td className="py-4 px-6">
//                       <div>
//                         <p className="font-medium text-gray-800">{p.nombre}</p>
//                       </div>
//                     </td>
//                     <td className="py-4 px-6">
//                       <div className="flex flex-col">
//                         <p className="text-gray-600">
//                           {p.telefono || "Sin teléfono"}
//                         </p>
//                         {p.email && (
//                           <p className="text-sm text-gray-500">{p.email}</p>
//                         )}
//                       </div>
//                     </td>
//                     <td className="py-4 px-6">
//                       <div className="max-w-xs">
//                         <p className="text-gray-800 font-medium">
//                           {p.direccion || "Sin dirección"}
//                         </p>
//                         <p className="text-sm text-gray-500">
//                           {p.ciudad_nombre || ""}, {p.departamento_nombre || ""}
//                         </p>
//                       </div>
//                     </td>
//                     <td className="py-4 px-6">
//                       <span className="text-xl font-bold bg-gradient-to-r from-red-700 to-red-600 bg-clip-text text-transparent">
//                         ${Number(p.total || 0).toLocaleString()}
//                       </span>
//                     </td>
//                     <td className="py-4 px-6">
//                       <span
//                         className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${
//                           p.estado === "pendiente"
//                             ? "bg-amber-100 text-amber-800"
//                             : "bg-green-100 text-green-800"
//                         }`}
//                       >
//                         {p.estado === "pendiente" ? "⏳ " : "✅ "}
//                         {p.estado === "pendiente" ? "PENDIENTE" : "ENTREGADO"}
//                       </span>
//                     </td>
//                     <td className="py-4 px-6">
//                       <div className="flex flex-col gap-2">
//                         <button
//                           onClick={() => enviarMensajeWhatsApp(p)}
//                           disabled={
//                             enviandoWhatsApp ||
//                             pedidosConfirmados.includes(p.id)
//                           }
//                           className={`px-4 py-2 rounded-lg font-medium flex items-center justify-center gap-2 transition-all ${
//                             pedidosConfirmados.includes(p.id)
//                               ? "bg-gradient-to-r from-green-600 to-green-700 text-white"
//                               : "bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700"
//                           } ${enviandoWhatsApp ? "opacity-70 cursor-not-allowed" : "shadow-sm hover:shadow-md"}`}
//                         >
//                           {enviandoWhatsApp ? (
//                             <>
//                               <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
//                               Enviando...
//                             </>
//                           ) : pedidosConfirmados.includes(p.id) ? (
//                             <>
//                               <CheckCircle className="w-4 h-4" />
//                               Confirmado
//                             </>
//                           ) : (
//                             <>
//                               <MessageCircle className="w-4 h-4" />
//                               Enviar WhatsApp
//                             </>
//                           )}
//                         </button>

//                         <button
//                           onClick={() => cambiarEstado(p.id)}
//                           className="px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:from-red-700 hover:to-red-800 transition-all font-medium shadow-sm hover:shadow-md"
//                         >
//                           {p.estado === "pendiente"
//                             ? "Marcar como Entregado"
//                             : "Marcar como Pendiente"}
//                         </button>
//                         <Link
//                           to={`/admin/orden-servicio/${p.id}`}
//                           className="px-4 py-2 border border-red-600 text-red-600 rounded-lg hover:bg-red-50 transition-colors text-center font-medium"
//                         >
//                           Ver Detalles
//                         </Link>
//                       </div>
//                     </td>
//                   </tr>
//                 ))
//               ) : (
//                 <tr>
//                   <td colSpan="7" className="py-8 text-center">
//                     <div className="flex flex-col items-center">
//                       <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
//                         <span className="text-2xl text-red-500">📭</span>
//                       </div>
//                       <p className="text-gray-600 font-medium">
//                         No hay pedidos
//                       </p>
//                       <p className="text-gray-500 text-sm mt-1">
//                         {error || "Intenta cambiar los filtros"}
//                       </p>
//                     </div>
//                   </td>
//                 </tr>
//               )}
//             </tbody>
//           </table>
//         </div>
//       </div>

//       {/* Paginación */}
//       {totalPaginas > 1 && pedidos.length > 0 && (
//         <div className="bg-white rounded-2xl shadow border border-red-100 p-6">
//           <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
//             <div className="text-sm text-gray-600">
//               Mostrando página{" "}
//               <span className="font-semibold text-red-600">{paginaActual}</span>{" "}
//               de{" "}
//               <span className="font-semibold text-red-600">{totalPaginas}</span>
//             </div>

//             <div className="flex items-center gap-2">
//               <button
//                 disabled={paginaActual === 1}
//                 onClick={() => setPaginaActual((p) => p - 1)}
//                 className="px-4 py-2 border border-red-200 rounded-lg text-red-700 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
//               >
//                 <span>←</span> Anterior
//               </button>

//               <div className="flex items-center gap-2">{renderPaginas()}</div>

//               <button
//                 disabled={paginaActual === totalPaginas}
//                 onClick={() => setPaginaActual((p) => p + 1)}
//                 className="px-4 py-2 border border-red-200 rounded-lg text-red-700 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
//               >
//                 Siguiente <span>→</span>
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Estilos CSS */}
//       <style>{`
//         @keyframes fade-in-up {
//           from {
//             opacity: 0;
//             transform: translateY(10px);
//           }
//           to {
//             opacity: 1;
//             transform: translateY(0);
//           }
//         }

//         .animate-fade-in-up {
//           animation: fade-in-up 0.3s ease-out;
//         }
//       `}</style>
//     </div>
//   );
// }
