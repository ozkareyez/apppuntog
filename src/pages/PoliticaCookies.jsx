// src/pages/PoliticaCookies.jsx
import { Helmet } from "react-helmet-async";

export default function PoliticaCookies() {
  const lastUpdated = new Date().toLocaleDateString("es-CO");
  const lastUpdatedISO = new Date().toISOString();

  return (
    <div className="bg-white min-h-screen">
      <Helmet>
        <title>Política de Cookies | Punto G Sex Shop Colombia</title>
        <meta
          name="description"
          content="Política de cookies de Punto G. Conoce qué son las cookies, cómo las utilizamos para mejorar tu experiencia y cómo configurarlas en tu navegador. Información actualizada para Colombia."
        />
        <link
          rel="canonical"
          href="https://puntogsexshop.com/politica-cookies"
        />
        <meta name="robots" content="index, follow" />

        {/* Open Graph - SIN IMAGEN */}
        <meta
          property="og:title"
          content="Política de Cookies | Punto G Sex Shop Colombia"
        />
        <meta
          property="og:description"
          content="Conoce nuestra política de cookies: qué son, cómo las usamos y cómo gestionarlas desde tu navegador."
        />
        <meta
          property="og:url"
          content="https://puntogsexshop.com/politica-cookies"
        />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Punto G Sex Shop" />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary" />
        <meta
          name="twitter:title"
          content="Política de Cookies | Punto G Sex Shop Colombia"
        />
        <meta
          name="twitter:description"
          content="Información sobre el uso de cookies en nuestro sitio web."
        />

        {/* Meta de actualización */}
        <meta property="article:modified_time" content={lastUpdatedISO} />
      </Helmet>

      <div className="max-w-5xl mx-auto px-6 py-14 text-gray-700">
        {/* Header */}
        <div className="mb-10 border-b border-red-100 pb-6">
          <h1 className="text-4xl font-extrabold text-gray-900">
            Política de <span className="text-red-600">Cookies</span>
          </h1>
          <p className="mt-3 text-sm text-gray-500">
            Última actualización: {lastUpdated}
          </p>
        </div>

        {/* Contenido */}
        <section className="space-y-8 leading-relaxed">
          {/* Introducción */}
          <div className="bg-orange-50 border-l-4 border-orange-500 p-4">
            <p className="text-base italic text-gray-700">
              En <strong className="text-gray-900">Punto G</strong>, valoramos
              tu privacidad. Esta política explica qué son las cookies, cómo las
              utilizamos y las opciones que tienes para gestionarlas.
            </p>
          </div>

          {/* ¿Qué son las cookies? */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 border-l-4 border-red-600 pl-3 mb-3">
              1. ¿Qué son las cookies?
            </h2>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="flex items-start">
                <span className="text-2xl mr-3">🍪</span>
                <span>
                  Las cookies son pequeños archivos de texto que se almacenan en
                  tu dispositivo (computador, tablet o smartphone) cuando
                  visitas nuestro sitio web. Permiten recordar tus preferencias
                  y mejorar tu experiencia de navegación.
                </span>
              </p>
            </div>
          </div>

          {/* Tipos de cookies que utilizamos */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 border-l-4 border-red-600 pl-3 mb-3">
              2. Tipos de cookies que utilizamos
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold text-blue-700 mb-2">
                  📊 Cookies técnicas
                </h3>
                <p className="text-sm">
                  Necesarias para el funcionamiento básico del sitio. Permiten
                  la navegación y el acceso a áreas seguras.
                </p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-semibold text-green-700 mb-2">
                  ⚙️ Cookies de personalización
                </h3>
                <p className="text-sm">
                  Recuerdan tus preferencias (idioma, moneda, etc.) para
                  facilitar tu visita.
                </p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <h3 className="font-semibold text-purple-700 mb-2">
                  📈 Cookies analíticas
                </h3>
                <p className="text-sm">
                  Nos ayudan a entender cómo interactúas con el sitio para
                  mejorar su rendimiento.
                </p>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg">
                <h3 className="font-semibold text-yellow-700 mb-2">
                  🎯 Cookies de marketing
                </h3>
                <p className="text-sm">
                  Utilizadas para mostrarte contenido relevante y medir la
                  efectividad de nuestras campañas.
                </p>
              </div>
            </div>
          </div>

          {/* ¿Para qué usamos las cookies? */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 border-l-4 border-red-600 pl-3 mb-3">
              3. ¿Para qué usamos las cookies?
            </h2>
            <ul className="list-disc pl-8 space-y-2">
              <li>
                <strong>Mejorar la experiencia del usuario</strong> - Recordando
                tus preferencias
              </li>
              <li>
                <strong>Analizar el tráfico del sitio</strong> - Para entender
                qué contenido es más popular
              </li>
              <li>
                <strong>Personalizar contenido</strong> - Mostrando información
                relevante para ti
              </li>
              <li>
                <strong>Optimizar el rendimiento</strong> - Identificando y
                solucionando errores
              </li>
            </ul>
          </div>

          {/* Gestión de cookies */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 border-l-4 border-red-600 pl-3 mb-3">
              4. Cómo gestionar las cookies
            </h2>
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <p className="font-medium text-orange-800 mb-2">
                Tienes el control:
              </p>
              <p>
                Puedes aceptar, rechazar o eliminar las cookies desde la
                configuración de tu navegador. A continuación, te indicamos cómo
                hacerlo en los navegadores más comunes:
              </p>

              <div className="mt-4 space-y-2">
                <p>
                  <strong className="text-gray-900">🔵 Google Chrome:</strong>{" "}
                  Configuración → Privacidad y seguridad → Cookies
                </p>
                <p>
                  <strong className="text-gray-900">🟠 Mozilla Firefox:</strong>{" "}
                  Opciones → Privacidad y seguridad → Cookies
                </p>
                <p>
                  <strong className="text-gray-900">🟡 Safari:</strong>{" "}
                  Preferencias → Privacidad → Cookies
                </p>
                <p>
                  <strong className="text-gray-900">🟢 Microsoft Edge:</strong>{" "}
                  Configuración → Privacidad → Cookies
                </p>
              </div>

              <p className="mt-4 text-sm">
                <span className="font-medium">Nota:</span> Si decides bloquear
                las cookies, algunas funciones del sitio podrían no funcionar
                correctamente.
              </p>
            </div>
          </div>

          {/* Cookies de terceros */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 border-l-4 border-red-600 pl-3 mb-3">
              5. Cookies de terceros
            </h2>
            <p>
              En nuestro sitio podemos utilizar servicios de terceros (como
              Google Analytics) que también pueden instalar cookies para
              analizar el tráfico y el comportamiento de los usuarios. Estos
              terceros tienen sus propias políticas de privacidad y cookies.
            </p>
          </div>

          {/* Cambios en la política */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 border-l-4 border-red-600 pl-3 mb-3">
              6. Cambios en la política de cookies
            </h2>
            <p>
              Podemos actualizar esta política periódicamente. Te recomendamos
              revisarla cada cierto tiempo para estar informado de cómo
              protegemos tu privacidad. La fecha de la última actualización
              aparece al inicio de esta página.
            </p>
          </div>

          {/* Contacto */}
          <div className="bg-gray-50 border border-red-100 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-3 flex items-center">
              <span className="mr-2">📧</span> 7. Contacto
            </h2>
            <p className="text-sm mb-3">
              Si tienes preguntas sobre nuestra política de cookies, escríbenos
              a:
            </p>
            <div className="bg-white p-3 rounded border border-gray-200">
              <p className="font-semibold text-red-600 text-base">
                puntogsexshop2024@hotmail.com
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
