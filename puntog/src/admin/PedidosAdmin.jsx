import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import {
  Bell,
  Volume2,
  VolumeX,
  MessageCircle,
  CheckCircle,
  Package,
  Clock,
  CheckSquare,
  Eye,
  Truck,
  Search,
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
  const [sonidoActivo, setSonidoActivo] = useState(true);
  const [contadorNuevos, setContadorNuevos] = useState(0);
  const [enviandoWhatsApp, setEnviandoWhatsApp] = useState(false);
  const [pedidosConfirmados, setPedidosConfirmados] = useState([]);
  const [actualizandoEstados, setActualizandoEstados] = useState({});

  const audioRef = useRef(null);

  // Inicializar audio
  useEffect(() => {
    const audioContext = new (
      window.AudioContext || window.webkitAudioContext
    )();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = 800;
    oscillator.type = "sine";

    audioRef.current = { audioContext, oscillator, gainNode };

    return () => {
      if (audioContext.state !== "closed") {
        audioContext.close();
      }
    };
  }, []);

  // Cargar pedidos - VERSIÓN MEJORADA
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

      if (!data.ok) {
        throw new Error(data.message || "Error en la respuesta del servidor");
      }

      let resultados = data.results || [];
      const total = data.totalPages || 1;

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
      setError(err.message || "Error al cargar pedidos");
      setPedidos([]);
      setTotalPaginas(1);
    } finally {
      setLoading(false);
    }
  };

  // Función para reproducir sonido
  const playNotificationSound = () => {
    if (!sonidoActivo) return;

    try {
      if (
        audioRef.current &&
        audioRef.current.audioContext.state === "suspended"
      ) {
        audioRef.current.audioContext.resume();
      }

      if (audioRef.current && audioRef.current.oscillator) {
        const { audioContext } = audioRef.current;
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.value = 800;
        oscillator.type = "sine";

        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(
          0.01,
          audioContext.currentTime + 0.5,
        );

        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.5);

        oscillator.onended = () => {
          oscillator.disconnect();
          gainNode.disconnect();
        };
      }
    } catch (error) {
      console.log("Error reproduciendo sonido:", error);
    }
  };

  // WhatsApp
  const enviarMensajeWhatsApp = async (pedido) => {
    try {
      setEnviandoWhatsApp(true);

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

  // Cambiar estado de pedido - VERSIÓN MEJORADA
  const cambiarEstado = async (id, estadoActual) => {
    try {
      // Mostrar loading para este pedido específico
      setActualizandoEstados((prev) => ({ ...prev, [id]: true }));

      const nuevoEstado =
        estadoActual === "pendiente" ? "entregado" : "pendiente";

      console.log(`Cambiando pedido ${id} de ${estadoActual} a ${nuevoEstado}`);

      const response = await fetch(`${API}/api/pedidos-estado/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ estado: nuevoEstado }),
      });

      const data = await response.json();

      if (!response.ok || !data.ok) {
        throw new Error(data.message || `Error ${response.status}`);
      }

      console.log(`✅ Estado cambiado:`, data);

      // Actualizar estado local inmediatamente
      setPedidos((prev) =>
        prev.map((p) => (p.id === id ? { ...p, estado: nuevoEstado } : p)),
      );

      // También actualizar en nuevosPedidos si está allí
      setNuevosPedidos((prev) =>
        prev.map((p) => (p.id === id ? { ...p, estado: nuevoEstado } : p)),
      );

      // Mostrar mensaje de éxito
      alert(`Pedido #${id} actualizado a "${nuevoEstado}"`);
    } catch (error) {
      console.error("Error cambiando estado:", error);
      alert(`Error: ${error.message}`);
    } finally {
      // Quitar loading
      setActualizandoEstados((prev) => ({ ...prev, [id]: false }));
    }
  };

  // Verificar nuevos pedidos
  const verificarNuevosPedidos = async () => {
    try {
      const res = await fetch(`${API}/api/pedidos-completo?page=1&limit=10`);
      if (!res.ok) return;

      const data = await res.json();
      if (!data.ok) return;

      const resultados = data.results || [];

      const nuevos = resultados.filter(
        (pedido) =>
          (!ultimoPedidoId || pedido.id > ultimoPedidoId) &&
          pedido.estado === "pendiente",
      );

      if (nuevos.length > 0) {
        const maxId = Math.max(...nuevos.map((p) => p.id));
        if (!ultimoPedidoId || maxId > ultimoPedidoId) {
          setUltimoPedidoId(maxId);
        }

        setNuevosPedidos((prev) => {
          const nuevosIds = nuevos.map((p) => p.id);
          const filtrados = prev.filter((p) => !nuevosIds.includes(p.id));
          return [...nuevos, ...filtrados].slice(0, 3);
        });

        // Reproducir sonido
        playNotificationSound();

        setMostrarNotificacion(true);
        setContadorNuevos((prev) => prev + nuevos.length);

        setTimeout(() => setMostrarNotificacion(false), 5000);
      }
    } catch (error) {
      console.log("Error verificando pedidos:", error);
    }
  };

  const limpiarNotificaciones = () => {
    setNuevosPedidos([]);
    setMostrarNotificacion(false);
    setContadorNuevos(0);
  };

  // Effects
  useEffect(() => {
    cargarPedidos(paginaActual);
  }, [paginaActual, estadoFiltro, busqueda]);

  useEffect(() => {
    const interval = setInterval(verificarNuevosPedidos, 30000); // 30 segundos
    const timeout = setTimeout(verificarNuevosPedidos, 2000); // 2 segundos inicial

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [ultimoPedidoId]);

  useEffect(() => {
    if (pedidos.length > 0) setContadorNuevos(0);
  }, [pedidos]);

  // Loading
  if (loading && pedidos.length === 0) {
    return (
      <div className="min-h-screen bg-white p-4 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-gray-600 text-sm">Cargando pedidos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-3 md:p-4">
      {/* Notificación */}
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
      <div className="fixed bottom-4 right-4 z-40">
        <div className="flex flex-col items-end gap-2">
          {contadorNuevos > 0 && (
            <div className="animate-pulse">
              <div className="bg-red-500 text-white text-xs font-bold rounded-full px-3 py-1 shadow-lg">
                {contadorNuevos} nuevo{contadorNuevos !== 1 ? "s" : ""}
              </div>
            </div>
          )}

          <div className="flex items-center gap-2 bg-white rounded-full shadow-lg p-2">
            <button
              onClick={() => setSonidoActivo(!sonidoActivo)}
              className={`p-2 rounded-full ${sonidoActivo ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-400"}`}
              title={sonidoActivo ? "Sonido activado" : "Sonido desactivado"}
            >
              {sonidoActivo ? (
                <Volume2 className="w-5 h-5" />
              ) : (
                <VolumeX className="w-5 h-5" />
              )}
            </button>

            <button
              onClick={verificarNuevosPedidos}
              className="relative p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-all"
              title="Verificar nuevos pedidos"
            >
              <Bell className="w-5 h-5" />
              {contadorNuevos > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-white text-red-500 text-xs font-bold rounded-full flex items-center justify-center border border-red-200">
                  {contadorNuevos}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Pedidos</h1>
            <p className="text-gray-500 text-sm">Gestiona todos los pedidos</p>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`text-xs px-2 py-1 rounded-full ${sonidoActivo ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-500"}`}
            >
              {sonidoActivo ? "🔊 Sonido ON" : "🔇 Sonido OFF"}
            </span>
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
        {error && pedidos.length === 0 ? (
          <div className="bg-white rounded-lg p-8 text-center">
            <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-600 font-medium">Error al cargar pedidos</p>
            <p className="text-gray-500 text-sm mt-1 mb-3">{error}</p>
            <button
              onClick={() => cargarPedidos(1)}
              className="px-4 py-2 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600"
            >
              Reintentar
            </button>
          </div>
        ) : pedidos.length > 0 ? (
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

                {/* Botones */}
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

                  {/* BOTÓN QUE CAMBIA ESTADO Y SE GUARDA EN BD */}
                  <button
                    onClick={() => cambiarEstado(p.id, p.estado)}
                    disabled={actualizandoEstados[p.id]}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-1 ${
                      p.estado === "pendiente"
                        ? "bg-red-500 hover:bg-red-600 text-white"
                        : "bg-gray-500 hover:bg-gray-600 text-white"
                    } ${actualizandoEstados[p.id] ? "opacity-70" : ""}`}
                  >
                    {actualizandoEstados[p.id] ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <Truck className="w-4 h-4" />
                        <span className="hidden xs:inline">
                          {p.estado === "pendiente"
                            ? "Marcar Entregado"
                            : "Marcar Pendiente"}
                        </span>
                      </>
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

      {/* Paginación */}
      {totalPaginas > 1 && pedidos.length > 0 && (
        <div className="mt-4 bg-white rounded-lg p-3">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-sm text-gray-600">
              Página {paginaActual} de {totalPaginas}
            </div>

            <div className="flex items-center gap-2">
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
