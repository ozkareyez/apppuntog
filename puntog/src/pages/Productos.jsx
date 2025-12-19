import { API_URL } from "@/config";

const Productos = () => {
  /* ===================== FETCH PRODUCTOS ===================== */
  useEffect(() => {
    fetch(`${API_URL}/api/productos`)
      .then((res) => res.json())
      .then(setProductos)
      .catch(() => setError("Error al cargar productos"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-7xl mx-auto p-4">
      <h1 className="text-4xl text-center text-pink-400 mb-6">
        Nuestros Productos
      </h1>

      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
        {productos.map((producto) => (
          <div
            key={producto.id}
            className="group bg-[#1f1f1f] border border-white/10 rounded-2xl overflow-hidden
              transition hover:border-pink-400 hover:shadow-lg hover:shadow-pink-500/20"
          >
            <div className="relative w-full h-48 sm:h-64 lg:h-72 overflow-hidden">
              <img
                src={producto.imagen}
                alt={producto.nombre}
                onError={handleImgError}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
            </div>

            <div className="p-3 sm:p-5 text-center">
              <h3 className="text-white text-sm sm:text-base font-semibold line-clamp-2">
                {producto.nombre}
              </h3>

              <p className="text-pink-400 text-lg sm:text-xl font-bold mt-1 sm:mt-2">
                ${producto.precio}
              </p>

              <button
                onClick={() => addToCart(producto)}
                className="mt-3 w-full py-2 rounded-xl bg-white text-black font-semibold
                  hover:bg-pink-500 hover:text-white transition flex items-center justify-center gap-2"
              >
                <ShoppingCart size={16} />
                Agregar
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Productos;
