import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { Bell, Volume2 } from "lucide-react";

const API = "https://gleaming-motivation-production-4018.up.railway.app";

export default function PedidosAdmin() {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [estadoFiltro, setEstadoFiltro] = useState("todos");
  const [paginaActual, setPaginaActual] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);

  // Estados para notificaciones
  const [nuevosPedidos, setNuevosPedidos] = useState([]);
  const [ultimoPedidoId, setUltimoPedidoId] = useState(null);
  const [mostrarNotificacion, setMostrarNotificacion] = useState(false);
  const [sonidoActivo, setSonidoActivo] = useState(true);
  const [contadorNuevos, setContadorNuevos] = useState(0);

  const audioRef = useRef(null);
  const notificationSound = "/sounds/notification.mp3"; // Necesitarás agregar este archivo

  // Cargar pedidos iniciales
  const cargarPedidos = async (page = 1) => {
    setLoading(true);
    try {
      const query = new URLSearchParams({
        page,
        estado: estadoFiltro,
        search: busqueda,
      });

      const res = await fetch(
        `${API}/api/pedidos-completo?${query.toString()}`
      );

      if (!res.ok) throw new Error();

      const data = await res.json();
      if (!data.ok) throw new Error();

      let resultados = data.results;

      if (estadoFiltro !== "todos") {
        resultados = resultados.filter((p) => p.estado === estadoFiltro);
      }

      setPedidos(resultados);
      setPaginaActual(data.page);
      setTotalPaginas(data.totalPages);

      // Guardar el ID del último pedido para comparaciones futuras
      if (resultados.length > 0) {
        const maxId = Math.max(...resultados.map((p) => p.id));
        if (!ultimoPedidoId || maxId > ultimoPedidoId) {
          setUltimoPedidoId(maxId);
        }
      }
    } catch (err) {
      console.error(err);
      setError("No se pudieron cargar los pedidos");
    } finally {
      setLoading(false);
    }
  };

  // Función para detectar nuevos pedidos
  const verificarNuevosPedidos = async () => {
    try {
      const res = await fetch(
        `${API}/api/pedidos-completo?limit=10&order=desc`
      );

      if (!res.ok) return;

      const data = await res.json();
      if (!data.ok || !data.results) return;

      const nuevos = data.results.filter((pedido) => {
        // Filtrar solo pedidos más recientes que el último conocido
        return (
          (!ultimoPedidoId || pedido.id > ultimoPedidoId) &&
          pedido.estado === "pendiente"
        );
      });

      if (nuevos.length > 0) {
        // Actualizar último ID
        const maxId = Math.max(...nuevos.map((p) => p.id));
        setUltimoPedidoId(maxId);

        // Agregar a la lista de nuevos pedidos
        setNuevosPedidos((prev) => {
          const nuevosIds = nuevos.map((p) => p.id);
          const filtrados = prev.filter((p) => !nuevosIds.includes(p.id));
          return [...nuevos, ...filtrados].slice(0, 5); // Mantener solo últimos 5
        });

        // Mostrar notificación
        setMostrarNotificacion(true);
        setContadorNuevos((prev) => prev + nuevos.length);

        // Reproducir sonido si está activo
        if (sonidoActivo && audioRef.current) {
          try {
            audioRef.current.currentTime = 0;
            audioRef.current
              .play()
              .catch((e) => console.log("Error reproduciendo sonido:", e));
          } catch (error) {
            console.log("Error con audio:", error);
          }
        }

        // Ocultar notificación después de 5 segundos
        setTimeout(() => {
          setMostrarNotificacion(false);
        }, 5000);
      }
    } catch (error) {
      console.log("Error verificando nuevos pedidos:", error);
    }
  };

  // Efecto para cargar pedidos iniciales
  useEffect(() => {
    cargarPedidos(paginaActual);

    // Configurar intervalo para verificar nuevos pedidos cada 10 segundos
    const interval = setInterval(verificarNuevosPedidos, 10000);

    // Verificar inmediatamente
    setTimeout(verificarNuevosPedidos, 2000);

    return () => clearInterval(interval);
  }, [paginaActual, estadoFiltro]);

  // Efecto para limpiar contador cuando se visitan los pedidos
  useEffect(() => {
    if (pedidos.length > 0) {
      setContadorNuevos(0);
    }
  }, [pedidos]);

  const cambiarEstado = async (id) => {
    try {
      const res = await fetch(`${API}/api/pedidos-estado/${id}`, {
        method: "PUT",
      });

      if (!res.ok) throw new Error();
      cargarPedidos(paginaActual);
    } catch {
      alert("Error cambiando el estado");
    }
  };

  const limpiarNotificaciones = () => {
    setNuevosPedidos([]);
    setMostrarNotificacion(false);
    setContadorNuevos(0);
  };

  // Audio fallback si no hay archivo
  const playFallbackSound = () => {
    const audioContext = new (window.AudioContext ||
      window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = 800;
    oscillator.type = "sine";

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(
      0.01,
      audioContext.currentTime + 0.5
    );

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white to-red-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-red-800 font-medium">Cargando pedidos...</p>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white to-red-50">
        <div className="bg-white p-8 rounded-2xl shadow-lg border border-red-200 max-w-md text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl text-red-600">!</span>
          </div>
          <p className="text-red-600 font-bold text-lg mb-2">Error</p>
          <p className="text-gray-600">{error}</p>
          <button
            onClick={() => cargarPedidos(1)}
            className="mt-6 bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-all font-medium"
          >
            Reintentar
          </button>
        </div>
      </div>
    );

  const renderPaginas = () => {
    const paginas = [];
    const maxVisible = 5;
    let start = Math.max(1, paginaActual - Math.floor(maxVisible / 2));
    let end = Math.min(totalPaginas, start + maxVisible - 1);

    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }

    if (start > 1) {
      paginas.push(
        <button
          key={1}
          onClick={() => setPaginaActual(1)}
          className="px-4 py-2 border border-red-200 rounded-lg text-red-700 hover:bg-red-50 transition-colors"
        >
          1
        </button>
      );
      if (start > 2) {
        paginas.push(
          <span key="dots-start" className="px-2 text-red-400">
            ...
          </span>
        );
      }
    }

    for (let i = start; i <= end; i++) {
      paginas.push(
        <button
          key={i}
          onClick={() => setPaginaActual(i)}
          className={`px-4 py-2 rounded-lg transition-all font-medium ${
            i === paginaActual
              ? "bg-red-600 text-white shadow-md"
              : "border border-red-200 text-red-700 hover:bg-red-50"
          }`}
        >
          {i}
        </button>
      );
    }

    if (end < totalPaginas) {
      if (end < totalPaginas - 1) {
        paginas.push(
          <span key="dots-end" className="px-2 text-red-400">
            ...
          </span>
        );
      }
      paginas.push(
        <button
          key={totalPaginas}
          onClick={() => setPaginaActual(totalPaginas)}
          className="px-4 py-2 border border-red-200 rounded-lg text-red-700 hover:bg-red-50 transition-colors"
        >
          {totalPaginas}
        </button>
      );
    }

    return paginas;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-red-50 p-4 md:p-8">
      {/* Elemento de audio oculto */}
      <audio
        ref={audioRef}
        preload="auto"
        onError={() => {
          console.log("Error cargando sonido, usando fallback");
        }}
      >
        <source src={notificationSound} type="audio/mpeg" />
        <source src="/sounds/notification.ogg" type="audio/ogg" />
        <source src="/sounds/notification.wav" type="audio/wav" />
      </audio>

      {/* Notificación flotante estilo Shopify */}
      {mostrarNotificacion && (
        <div className="fixed top-4 right-4 z-50 animate-fade-in-up">
          <div className="bg-white rounded-xl shadow-2xl border border-green-200 overflow-hidden max-w-sm">
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                    <Bell className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-lg">
                      ¡Nuevo Pedido!
                    </h3>
                    <p className="text-white/90 text-sm">
                      {nuevosPedidos.length}{" "}
                      {nuevosPedidos.length === 1
                        ? "pedido nuevo"
                        : "pedidos nuevos"}
                    </p>
                  </div>
                </div>
                <button
                  onClick={limpiarNotificaciones}
                  className="text-white/80 hover:text-white"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-4 max-h-64 overflow-y-auto">
              {nuevosPedidos.slice(0, 3).map((pedido, index) => (
                <div
                  key={pedido.id}
                  className={`p-3 rounded-lg mb-2 ${
                    index % 2 === 0 ? "bg-green-50" : "bg-white"
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-gray-800">
                        #{pedido.id} - {pedido.nombre}
                      </p>
                      <p className="text-sm text-gray-600">
                        ${Number(pedido.total).toLocaleString()} •{" "}
                        {pedido.ciudad_nombre}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date().toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                    <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                      NUEVO
                    </span>
                  </div>
                </div>
              ))}

              {nuevosPedidos.length > 3 && (
                <div className="text-center pt-2">
                  <p className="text-sm text-gray-500">
                    +{nuevosPedidos.length - 3} más...
                  </p>
                </div>
              )}

              <button
                onClick={() => {
                  cargarPedidos(1);
                  limpiarNotificaciones();
                }}
                className="w-full mt-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white py-2.5 rounded-lg font-medium hover:from-green-700 hover:to-emerald-700 transition-all"
              >
                Ver todos los pedidos
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Botón de notificaciones en esquina */}
      <div className="fixed bottom-6 right-6 z-40">
        <div className="flex flex-col items-end gap-2">
          {contadorNuevos > 0 && (
            <div className="animate-pulse">
              <div className="bg-red-600 text-white text-xs font-bold rounded-full px-3 py-1 shadow-lg">
                {contadorNuevos} nuevo{contadorNuevos !== 1 ? "s" : ""}
              </div>
            </div>
          )}

          <div className="flex items-center gap-2 bg-white rounded-full shadow-lg p-2">
            <button
              onClick={() => setSonidoActivo(!sonidoActivo)}
              className={`p-2 rounded-full ${
                sonidoActivo
                  ? "bg-green-100 text-green-600"
                  : "bg-gray-100 text-gray-400"
              }`}
              title={sonidoActivo ? "Sonido activado" : "Sonido desactivado"}
            >
              <Volume2 className="w-5 h-5" />
            </button>

            <button
              onClick={verificarNuevosPedidos}
              className="relative p-2 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-full hover:from-red-700 hover:to-red-800 transition-all"
              title="Verificar nuevos pedidos"
            >
              <Bell className="w-5 h-5" />
              {contadorNuevos > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-white text-red-600 text-xs font-bold rounded-full flex items-center justify-center">
                  {contadorNuevos}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Header con fondo blanco y acentos rojos */}
      <div className="bg-white rounded-2xl shadow-lg border border-red-100 p-6 mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-xl">📦</span>
              </div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-red-700 to-red-600 bg-clip-text text-transparent">
                  Gestión de Pedidos
                </h1>
                {contadorNuevos > 0 && (
                  <span className="bg-gradient-to-r from-red-600 to-red-700 text-white text-sm font-bold px-3 py-1 rounded-full animate-pulse">
                    {contadorNuevos} NUEVO{contadorNuevos !== 1 ? "S" : ""}
                  </span>
                )}
              </div>
            </div>
            <p className="text-gray-500 text-sm">
              Administra y monitorea todos los pedidos del sistema
              {sonidoActivo && " 🔊 Notificaciones activadas"}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar cliente o teléfono..."
                value={busqueda}
                onChange={(e) => {
                  setBusqueda(e.target.value);
                  setPaginaActual(1);
                }}
                className="w-full sm:w-64 pl-10 pr-4 py-3 border border-red-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
              />
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-red-400">
                🔍
              </div>
            </div>

            <select
              value={estadoFiltro}
              onChange={(e) => {
                setEstadoFiltro(e.target.value);
                setPaginaActual(1);
              }}
              className="px-4 py-3 border border-red-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white text-gray-700 transition-all"
            >
              <option value="todos" className="text-gray-700">
                Todos los estados
              </option>
              <option value="pendiente" className="text-amber-600">
                Pendientes
              </option>
              <option value="entregado" className="text-green-600">
                Entregados
              </option>
            </select>
          </div>
        </div>
      </div>

      {/* Resto del componente sigue igual... */}
      {/* Tarjeta de estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-2xl shadow border border-red-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Pedidos</p>
              <p className="text-3xl font-bold text-gray-800">
                {pedidos.length > 0
                  ? pedidos[0].total_count || pedidos.length
                  : 0}
              </p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
              <span className="text-red-600 text-2xl">📊</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow border border-red-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Pendientes</p>
              <p className="text-3xl font-bold text-amber-600">
                {pedidos.filter((p) => p.estado === "pendiente").length}
              </p>
            </div>
            <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
              <span className="text-amber-600 text-2xl">⏳</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow border border-red-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Entregados</p>
              <p className="text-3xl font-bold text-green-600">
                {pedidos.filter((p) => p.estado === "entregado").length}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <span className="text-green-600 text-2xl">✅</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabla de pedidos */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-red-100 mb-8">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-red-600 to-red-700">
              <tr>
                <th className="py-4 px-6 text-left text-white font-semibold">
                  ID Pedido
                </th>
                <th className="py-4 px-6 text-left text-white font-semibold">
                  Cliente
                </th>
                <th className="py-4 px-6 text-left text-white font-semibold">
                  Contacto
                </th>
                <th className="py-4 px-6 text-left text-white font-semibold">
                  Ubicación
                </th>
                <th className="py-4 px-6 text-left text-white font-semibold">
                  Total
                </th>
                <th className="py-4 px-6 text-left text-white font-semibold">
                  Estado
                </th>
                <th className="py-4 px-6 text-left text-white font-semibold">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {pedidos.map((p) => (
                <tr
                  key={p.id}
                  className={`border-b border-red-50 hover:bg-red-50 transition-colors group ${
                    nuevosPedidos.some((np) => np.id === p.id)
                      ? "bg-gradient-to-r from-green-50/50 to-emerald-50/50 animate-pulse-border"
                      : ""
                  }`}
                >
                  <td className="py-4 px-6">
                    <span className="inline-block bg-red-100 text-red-700 px-3 py-1 rounded-lg font-mono font-semibold text-sm">
                      #{p.id}
                    </span>
                    {nuevosPedidos.some((np) => np.id === p.id) && (
                      <span className="ml-2 inline-block bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs px-2 py-0.5 rounded-full">
                        NUEVO
                      </span>
                    )}
                  </td>
                  <td className="py-4 px-6">
                    <div>
                      <p className="font-medium text-gray-800">{p.nombre}</p>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <p className="text-gray-600">{p.telefono}</p>
                  </td>
                  <td className="py-4 px-6">
                    <div className="max-w-xs">
                      <p className="text-gray-800 font-medium">{p.direccion}</p>
                      <p className="text-sm text-gray-500">
                        {p.ciudad_nombre}, {p.departamento_nombre}
                      </p>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className="text-xl font-bold bg-gradient-to-r from-red-700 to-red-600 bg-clip-text text-transparent">
                      ${Number(p.total).toLocaleString()}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <span
                      className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${
                        p.estado === "pendiente"
                          ? "bg-amber-100 text-amber-800"
                          : "bg-green-100 text-green-800"
                      }`}
                    >
                      {p.estado === "pendiente" ? "⏳ " : "✅ "}
                      {p.estado.charAt(0).toUpperCase() + p.estado.slice(1)}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => cambiarEstado(p.id)}
                        className="px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:from-red-700 hover:to-red-800 transition-all font-medium shadow-sm hover:shadow-md"
                      >
                        Cambiar Estado
                      </button>
                      <Link
                        to={`/admin/orden-servicio/${p.id}`}
                        className="px-4 py-2 border border-red-600 text-red-600 rounded-lg hover:bg-red-50 transition-colors text-center font-medium"
                      >
                        Ver Detalles
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Paginación */}
      {totalPaginas > 1 && (
        <div className="bg-white rounded-2xl shadow border border-red-100 p-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-sm text-gray-600">
              Mostrando página{" "}
              <span className="font-semibold text-red-600">{paginaActual}</span>{" "}
              de{" "}
              <span className="font-semibold text-red-600">{totalPaginas}</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                disabled={paginaActual === 1}
                onClick={() => setPaginaActual((p) => p - 1)}
                className="px-4 py-2 border border-red-200 rounded-lg text-red-700 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                <span>←</span> Anterior
              </button>

              <div className="flex items-center gap-2">{renderPaginas()}</div>

              <button
                disabled={paginaActual === totalPaginas}
                onClick={() => setPaginaActual((p) => p + 1)}
                className="px-4 py-2 border border-red-200 rounded-lg text-red-700 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                Siguiente <span>→</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sin resultados */}
      {pedidos.length === 0 && !loading && (
        <div className="bg-white rounded-2xl shadow border border-red-100 p-12 text-center">
          <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl text-red-400">📭</span>
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">
            No hay pedidos
          </h3>
          <p className="text-gray-500 mb-6">
            No se encontraron pedidos con los filtros seleccionados
          </p>
          <button
            onClick={() => {
              setEstadoFiltro("todos");
              setBusqueda("");
              setPaginaActual(1);
            }}
            className="px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:from-red-700 hover:to-red-800 transition-all font-medium inline-flex items-center gap-2"
          >
            <span>↻</span> Ver todos los pedidos
          </button>
        </div>
      )}

      {/* Estilos CSS para animaciones */}
      <style>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes pulse-border {
          0%, 100% {
            border-left: 4px solid transparent;
          }
          50% {
            border-left: 4px solid #10b981;
          }
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 0.3s ease-out;
        }
        
        .animate-pulse-border {
          animation: pulse-border 2s infinite;
        }
        
        /* Sonido de notificación CSS fallback */
        @keyframes sound-wave {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
        
        .sound-active {
          animation: sound-wave 0.5s ease-in-out;
        }
      `}</style>
    </div>
  );
}

//

// import { useEffect, useState } from "react";
// import { Link } from "react-router-dom";

// const API = "https://gleaming-motivation-production-4018.up.railway.app";

// export default function PedidosAdmin() {
//   const [pedidos, setPedidos] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");
//   const [busqueda, setBusqueda] = useState("");

//   // filtros
//   const [estadoFiltro, setEstadoFiltro] = useState("todos");

//   // 🔥 paginación REAL
//   const [paginaActual, setPaginaActual] = useState(1);
//   const [totalPaginas, setTotalPaginas] = useState(1);

//   const cargarPedidos = async (page = 1) => {
//     setLoading(true);
//     try {
//       const query = new URLSearchParams({
//         page,
//         estado: estadoFiltro,
//         search: busqueda,
//       });

//       const res = await fetch(
//         `${API}/api/pedidos-completo?${query.toString()}`
//       );

//       if (!res.ok) throw new Error();

//       const data = await res.json();
//       if (!data.ok) throw new Error();

//       let resultados = data.results;

//       // 🔹 filtro estado en frontend
//       if (estadoFiltro !== "todos") {
//         resultados = resultados.filter((p) => p.estado === estadoFiltro);
//       }

//       setPedidos(resultados);
//       setPaginaActual(data.page);
//       setTotalPaginas(data.totalPages);
//     } catch (err) {
//       console.error(err);
//       setError("No se pudieron cargar los pedidos");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     cargarPedidos(paginaActual);
//   }, [paginaActual, estadoFiltro]);

//   const cambiarEstado = async (id) => {
//     try {
//       const res = await fetch(`${API}/api/pedidos-estado/${id}`, {
//         method: "PUT",
//       });

//       if (!res.ok) throw new Error();

//       cargarPedidos(paginaActual);
//     } catch {
//       alert("Error cambiando el estado");
//     }
//   };

//   if (loading)
//     return (
//       <p className="text-center text-gray-500 mt-10">Cargando pedidos...</p>
//     );

//   if (error) return <p className="text-center text-red-600 mt-10">{error}</p>;

//   const renderPaginas = () => {
//     const paginas = [];
//     for (let i = 1; i <= totalPaginas; i++) {
//       paginas.push(
//         <button
//           key={i}
//           onClick={() => setPaginaActual(i)}
//           className={`px-3 py-1 rounded border text-sm ${
//             i === paginaActual
//               ? "bg-red-600 text-white"
//               : "bg-white hover:bg-gray-100"
//           }`}
//         >
//           {i}
//         </button>
//       );
//     }
//     return paginas;
//   };

//   return (
//     <div className="p-6 bg-gray-100 min-h-full">
//       {/* HEADER */}
//       <div className="mb-6 flex flex-col md:flex-row md:justify-between gap-4">
//         <div>
//           <h1 className="text-3xl font-bold text-gray-800">📦 Pedidos</h1>
//           <p className="text-gray-500 text-sm">Gestión de pedidos realizados</p>
//         </div>

//         <input
//           type="text"
//           placeholder="Buscar nombre o teléfono..."
//           value={busqueda}
//           onChange={(e) => {
//             setBusqueda(e.target.value);
//             setPaginaActual(1);
//           }}
//           className="border rounded-lg px-4 py-2 text-sm w-full md:w-64"
//         />

//         {/* FILTRO */}
//         <select
//           value={estadoFiltro}
//           onChange={(e) => {
//             setEstadoFiltro(e.target.value);
//             setPaginaActual(1);
//           }}
//           className="border rounded-lg px-4 py-2 text-sm"
//         >
//           <option value="todos">Todos</option>
//           <option value="pendiente">Pendientes</option>
//           <option value="entregado">Entregados</option>
//         </select>
//       </div>

//       {/* TABLA */}
//       <div className="bg-white rounded-xl shadow overflow-x-auto">
//         <table className="w-full text-sm">
//           <thead className="bg-red-50 text-red-700">
//             <tr>
//               <th className="p-3">ID</th>
//               <th>Cliente</th>
//               <th>Teléfono</th>
//               <th>Dirección</th>
//               <th>Depto</th>
//               <th>Ciudad</th>
//               <th>Total</th>
//               <th>Estado</th>
//               <th>Acciones</th>
//             </tr>
//           </thead>

//           <tbody>
//             {pedidos.map((p) => (
//               <tr key={p.id} className="border-t">
//                 <td className="p-3 font-semibold">{p.id}</td>
//                 <td>{p.nombre}</td>
//                 <td>{p.telefono}</td>
//                 <td className="truncate max-w-xs">{p.direccion}</td>
//                 <td>{p.departamento_nombre}</td>
//                 <td>{p.ciudad_nombre}</td>
//                 <td className="font-bold text-red-600">
//                   ${Number(p.total).toLocaleString()}
//                 </td>
//                 <td>
//                   <span
//                     className={`px-3 py-1 rounded-full text-xs ${
//                       p.estado === "pendiente"
//                         ? "bg-yellow-100 text-yellow-800"
//                         : "bg-green-100 text-green-800"
//                     }`}
//                   >
//                     {p.estado}
//                   </span>
//                 </td>
//                 <td className="flex flex-col gap-2 p-3">
//                   <button
//                     onClick={() => cambiarEstado(p.id)}
//                     className="text-xs bg-red-600 text-white rounded px-3 py-1"
//                   >
//                     Cambiar estado
//                   </button>

//                   <Link
//                     to={`/admin/orden-servicio/${p.id}`}
//                     className="text-red-600 text-xs underline text-center"
//                   >
//                     Ver orden
//                   </Link>
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>

//       {/* PAGINACIÓN */}
//       <div className="flex justify-center items-center gap-2 mt-6 flex-wrap">
//         <button
//           disabled={paginaActual === 1}
//           onClick={() => setPaginaActual((p) => p - 1)}
//           className="px-3 py-1 border rounded disabled:opacity-50"
//         >
//           ◀
//         </button>

//         {renderPaginas()}

//         <button
//           disabled={paginaActual === totalPaginas}
//           onClick={() => setPaginaActual((p) => p + 1)}
//           className="px-3 py-1 border rounded disabled:opacity-50"
//         >
//           ▶
//         </button>
//       </div>
//     </div>
//   );
// }
