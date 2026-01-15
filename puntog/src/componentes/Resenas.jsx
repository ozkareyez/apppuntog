import { useState, useEffect } from "react";
import {
  Star,
  StarHalf,
  MessageCircle,
  ThumbsUp,
  User,
  CheckCircle,
  Shield,
  Truck,
  Package,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Resenas() {
  const [reviews, setReviews] = useState([]);
  const [filter, setFilter] = useState("all");
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newReview, setNewReview] = useState({
    nombre: "",
    rating: 5,
    comentario: "",
    producto: "",
  });

  // Datos de reseñas de ejemplo (en producción vendrían de tu API)
  const initialReviews = [
    {
      id: 1,
      nombre: "María G.",
      rating: 5,
      fecha: "2024-03-15",
      comentario:
        "Excelente producto, calidad premium y entrega súper discreta. Volveré a comprar sin duda.",
      producto: "Masajeador Premium",
      verificado: true,
      likes: 24,
      respuesta:
        "¡Gracias por tu confianza María! Nos alegra que estés satisfecha con tu compra.",
      destacado: true,
    },
    {
      id: 2,
      nombre: "Carlos R.",
      rating: 4,
      fecha: "2024-03-10",
      comentario:
        "Buen producto, llegó rápido. El embalaje era completamente privado como prometen.",
      producto: "Aceite Sensual",
      verificado: true,
      likes: 18,
      destacado: false,
    },
    {
      id: 3,
      nombre: "Ana M.",
      rating: 5,
      fecha: "2024-03-05",
      comentario:
        "La atención al cliente es excepcional. Me asesoraron perfectamente y el producto superó expectativas.",
      producto: "Kit Iniciación",
      verificado: true,
      likes: 32,
      respuesta:
        "Nos encanta leer comentarios como el tuyo, Ana. ¡Disfruta tu experiencia!",
      destacado: true,
    },
    {
      id: 4,
      nombre: "Javier L.",
      rating: 5,
      fecha: "2024-02-28",
      comentario:
        "Discreción 100% garantizada. Producto de alta calidad y envío rápido. Muy recomendado.",
      producto: "Vibrador Silencioso",
      verificado: true,
      likes: 29,
      destacado: false,
    },
    {
      id: 5,
      nombre: "Sofía P.",
      rating: 4,
      fecha: "2024-02-20",
      comentario:
        "Buen servicio, aunque el envío tardó un poco más de lo esperado. El producto funciona perfectamente.",
      producto: "Juego de Ataduras",
      verificado: false,
      likes: 15,
      destacado: false,
    },
    {
      id: 6,
      nombre: "Luis M.",
      rating: 5,
      fecha: "2024-02-15",
      comentario:
        "La mejor compra que he hecho. Calidad, privacidad y atención excelentes. 10/10",
      producto: "Set Erótico",
      verificado: true,
      likes: 41,
      respuesta:
        "¡Muchas gracias Luis! Nos enorgullece ofrecerte la mejor experiencia.",
      destacado: true,
    },
  ];

  useEffect(() => {
    setReviews(initialReviews);
  }, []);

  // Calcular estadísticas
  const stats = {
    total: reviews.length,
    promedio:
      reviews.reduce((acc, rev) => acc + rev.rating, 0) / reviews.length,
    cincoEstrellas: reviews.filter((rev) => rev.rating === 5).length,
    verificadoCount: reviews.filter((rev) => rev.verificado).length,
  };

  const filteredReviews =
    filter === "all"
      ? reviews
      : filter === "destacadas"
      ? reviews.filter((rev) => rev.destacado)
      : reviews.filter((rev) => rev.rating === parseInt(filter));

  const handleSubmitReview = (e) => {
    e.preventDefault();
    const reviewToAdd = {
      id: reviews.length + 1,
      nombre: newReview.nombre || "Cliente Anónimo",
      rating: newReview.rating,
      fecha: new Date().toISOString().split("T")[0],
      comentario: newReview.comentario,
      producto: newReview.producto || "Producto en general",
      verificado: false,
      likes: 0,
      destacado: false,
    };

    setReviews([reviewToAdd, ...reviews]);
    setNewReview({ nombre: "", rating: 5, comentario: "", producto: "" });
    setShowReviewForm(false);

    // En producción, aquí enviarías los datos a tu API
    console.log("Reseña enviada:", reviewToAdd);
  };

  const renderStars = (rating) => {
    return (
      <div className="flex items-center gap-0.5">
        {[...Array(5)].map((_, i) => {
          const starValue = i + 1;
          if (rating >= starValue) {
            return (
              <Star key={i} className="w-4 h-4 fill-red-500 text-red-500" />
            );
          } else if (rating >= starValue - 0.5) {
            return (
              <StarHalf key={i} className="w-4 h-4 fill-red-500 text-red-500" />
            );
          }
          return <Star key={i} className="w-4 h-4 text-gray-300" />;
        })}
      </div>
    );
  };

  return (
    <section className="py-16 bg-gradient-to-b from-white via-red-50/20 to-white">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header con estadísticas */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-red-50 px-4 py-2 rounded-full mb-4">
            <MessageCircle className="w-5 h-5 text-red-600" />
            <span className="text-sm font-medium text-red-700">
              RESEÑAS VERIFICADAS
            </span>
          </div>

          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Lo que dicen nuestros clientes
          </h2>

          <p className="text-gray-600 max-w-2xl mx-auto mb-8">
            Miles de clientes confían en Punto G para sus experiencias íntimas.
            Descubre por qué somos la elección preferida.
          </p>

          {/* Estadísticas destacadas */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto mb-12">
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-red-100">
              <div className="flex items-center justify-center gap-2 mb-2">
                {renderStars(stats.promedio)}
              </div>
              <p className="text-3xl font-bold text-gray-900">
                {stats.promedio.toFixed(1)}
              </p>
              <p className="text-sm text-gray-600">Puntuación promedio</p>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg border border-red-100">
              <div className="flex items-center justify-center gap-2 mb-2">
                <MessageCircle className="w-6 h-6 text-red-600" />
              </div>
              <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
              <p className="text-sm text-gray-600">Reseñas verificadas</p>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg border border-red-100">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Star className="w-6 h-6 fill-red-500 text-red-500" />
              </div>
              <p className="text-3xl font-bold text-gray-900">
                {stats.cincoEstrellas}
              </p>
              <p className="text-sm text-gray-600">5 estrellas</p>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg border border-red-100">
              <div className="flex items-center justify-center gap-2 mb-2">
                <CheckCircle className="w-6 h-6 text-red-600" />
              </div>
              <p className="text-3xl font-bold text-gray-900">
                {stats.verificadoCount}
              </p>
              <p className="text-sm text-gray-600">Clientes verificados</p>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="flex flex-wrap gap-3 justify-center mb-8">
          <button
            onClick={() => setFilter("all")}
            className={`px-5 py-2.5 rounded-full font-medium transition-all ${
              filter === "all"
                ? "bg-red-600 text-white shadow-lg"
                : "bg-white text-gray-700 hover:bg-red-50 border border-red-100"
            }`}
          >
            Todas las reseñas
          </button>
          <button
            onClick={() => setFilter("5")}
            className={`px-5 py-2.5 rounded-full font-medium transition-all ${
              filter === "5"
                ? "bg-red-600 text-white shadow-lg"
                : "bg-white text-gray-700 hover:bg-red-50 border border-red-100"
            }`}
          >
            ⭐⭐⭐⭐⭐ 5 estrellas
          </button>
          <button
            onClick={() => setFilter("destacadas")}
            className={`px-5 py-2.5 rounded-full font-medium transition-all ${
              filter === "destacadas"
                ? "bg-red-600 text-white shadow-lg"
                : "bg-white text-gray-700 hover:bg-red-50 border border-red-100"
            }`}
          >
            Reseñas destacadas
          </button>
        </div>

        {/* Grid de reseñas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <AnimatePresence>
            {filteredReviews.map((review) => (
              <motion.div
                key={review.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className={`bg-white rounded-2xl overflow-hidden border ${
                  review.destacado
                    ? "border-red-300 shadow-xl"
                    : "border-red-100 shadow-lg"
                } hover:shadow-2xl transition-all duration-300`}
              >
                {review.destacado && (
                  <div className="bg-gradient-to-r from-red-600 to-red-500 text-white px-4 py-2 text-sm font-medium text-center">
                    ⭐ RESEÑA DESTACADA
                  </div>
                )}

                <div className="p-6">
                  {/* Header de la reseña */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-100 to-red-50 flex items-center justify-center">
                        <User className="w-5 h-5 text-red-600" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-gray-900">
                            {review.nombre}
                          </p>
                          {review.verificado && (
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          )}
                        </div>
                        <p className="text-sm text-gray-500">{review.fecha}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      {renderStars(review.rating)}
                      <p className="text-xs text-gray-500 mt-1">
                        {review.producto}
                      </p>
                    </div>
                  </div>

                  {/* Comentario */}
                  <p className="text-gray-700 mb-4 leading-relaxed">
                    {review.comentario}
                  </p>

                  {/* Respuesta del negocio */}
                  {review.respuesta && (
                    <div className="mt-4 p-4 bg-red-50 rounded-xl border-l-4 border-red-500">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center">
                          <MessageCircle className="w-3 h-3 text-red-600" />
                        </div>
                        <span className="font-medium text-red-700">
                          Respuesta de Punto G
                        </span>
                      </div>
                      <p className="text-sm text-gray-700">
                        {review.respuesta}
                      </p>
                    </div>
                  )}

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-4 mt-4 border-t border-gray-100">
                    <button className="flex items-center gap-2 text-gray-600 hover:text-red-600 transition-colors">
                      <ThumbsUp className="w-4 h-4" />
                      <span className="text-sm">Útil ({review.likes})</span>
                    </button>

                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Shield className="w-3 h-3" />
                        <span>Compra verificada</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Truck className="w-3 h-3" />
                        <span>Envío discreto</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* CTA y Formulario */}
        <div className="text-center">
          <div className="bg-gradient-to-r from-red-50 via-white to-red-50 rounded-3xl p-8 border border-red-100 mb-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              ¿Ya compraste en Punto G?
            </h3>
            <p className="text-gray-600 mb-6 max-w-xl mx-auto">
              Comparte tu experiencia y ayuda a otros clientes a tomar la mejor
              decisión. Tu privacidad está garantizada.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => setShowReviewForm(true)}
                className="px-8 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white font-semibold rounded-xl hover:from-red-700 hover:to-red-800 transition-all shadow-lg hover:shadow-xl"
              >
                Escribir una reseña
              </button>

              <button className="px-8 py-3 bg-white text-gray-700 font-semibold rounded-xl hover:bg-red-50 transition-all border border-red-200">
                Ver todas las reseñas
              </button>
            </div>
          </div>

          {/* Beneficios destacados */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="flex flex-col items-center text-center p-6">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-red-600" />
              </div>
              <h4 className="font-bold text-gray-900 mb-2">
                Reseñas verificadas
              </h4>
              <p className="text-sm text-gray-600">
                Solo reseñas de compras reales verificadas
              </p>
            </div>

            <div className="flex flex-col items-center text-center p-6">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-4">
                <Package className="w-6 h-6 text-red-600" />
              </div>
              <h4 className="font-bold text-gray-900 mb-2">Privacidad total</h4>
              <p className="text-sm text-gray-600">
                Nombres modificados para proteger tu identidad
              </p>
            </div>

            <div className="flex flex-col items-center text-center p-6">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-4">
                <MessageCircle className="w-6 h-6 text-red-600" />
              </div>
              <h4 className="font-bold text-gray-900 mb-2">
                Respuesta garantizada
              </h4>
              <p className="text-sm text-gray-600">
                Respondemos a todas las reseñas en 24h
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Modal para nueva reseña */}
      <AnimatePresence>
        {showReviewForm && (
          <>
            <div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
              onClick={() => setShowReviewForm(false)}
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="fixed inset-x-4 top-4 md:inset-0 md:flex md:items-center md:justify-center z-50"
            >
              <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="bg-gradient-to-r from-red-600 to-red-700 p-6 text-white rounded-t-3xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-2xl font-bold">Escribe tu reseña</h3>
                      <p className="text-white/90 mt-1">
                        Tu opinión nos ayuda a mejorar
                      </p>
                    </div>
                    <button
                      onClick={() => setShowReviewForm(false)}
                      className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 transition-colors flex items-center justify-center"
                    >
                      ✕
                    </button>
                  </div>
                </div>

                <form onSubmit={handleSubmitReview} className="p-6">
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tu nombre (opcional)
                      </label>
                      <input
                        type="text"
                        value={newReview.nombre}
                        onChange={(e) =>
                          setNewReview({ ...newReview, nombre: e.target.value })
                        }
                        className="w-full px-4 py-3 border border-red-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        placeholder="Puedes usar un seudónimo"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Producto (opcional)
                      </label>
                      <input
                        type="text"
                        value={newReview.producto}
                        onChange={(e) =>
                          setNewReview({
                            ...newReview,
                            producto: e.target.value,
                          })
                        }
                        className="w-full px-4 py-3 border border-red-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        placeholder="¿Qué producto compraste?"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Calificación
                      </label>
                      <div className="flex items-center gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() =>
                              setNewReview({ ...newReview, rating: star })
                            }
                            className="text-2xl focus:outline-none"
                          >
                            {star <= newReview.rating ? "⭐" : "☆"}
                          </button>
                        ))}
                        <span className="ml-2 text-gray-700 font-medium">
                          {newReview.rating} estrellas
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tu experiencia
                      </label>
                      <textarea
                        value={newReview.comentario}
                        onChange={(e) =>
                          setNewReview({
                            ...newReview,
                            comentario: e.target.value,
                          })
                        }
                        className="w-full px-4 py-3 border border-red-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent h-32"
                        placeholder="Comparte tu experiencia con el producto, envío, atención al cliente..."
                        required
                      />
                    </div>

                    <div className="bg-red-50 p-4 rounded-xl">
                      <div className="flex items-start gap-3">
                        <Shield className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-medium text-red-700">
                            Tu privacidad es importante
                          </p>
                          <p className="text-sm text-gray-600 mt-1">
                            Los nombres se muestran modificados. Nunca
                            compartiremos tu información personal.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => setShowReviewForm(false)}
                        className="flex-1 px-6 py-3 border border-red-200 text-gray-700 font-medium rounded-xl hover:bg-red-50 transition-colors"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        className="flex-1 px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white font-medium rounded-xl hover:from-red-700 hover:to-red-800 transition-all shadow-lg"
                      >
                        Publicar reseña
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </section>
  );
}
