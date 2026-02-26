// src/pages/PoliticaPrivacidad.jsx
import { Helmet } from "react-helmet-async";

export default function PoliticaPrivacidad() {
  const lastUpdated = new Date().toLocaleDateString("es-CO");
  const lastUpdatedISO = new Date().toISOString();

  return (
    <div className="bg-white min-h-screen">
      <Helmet>
        <title>Política de Privacidad | Punto G Sex Shop Colombia</title>
        <meta
          name="description"
          content="Política de privacidad de Punto G. Conoce cómo protegemos tus datos personales según la Ley 1581 de 2012 y el Decreto 1377 de 2013 en Colombia. Información sobre cookies y derechos del titular."
        />
        <link
          rel="canonical"
          href="https://puntogsexshop.com/politica-privacidad"
        />
        <meta name="robots" content="index, follow" />

        {/* Open Graph - SIN IMAGEN */}
        <meta
          property="og:title"
          content="Política de Privacidad | Punto G Sex Shop Colombia"
        />
        <meta
          property="og:description"
          content="Política de privacidad según Ley 1581 de 2012. Protección de datos personales, cookies y derechos del titular en Colombia."
        />
        <meta
          property="og:url"
          content="https://puntogsexshop.com/politica-privacidad"
        />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Punto G Sex Shop" />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary" />
        <meta
          name="twitter:title"
          content="Política de Privacidad | Punto G Sex Shop Colombia"
        />
        <meta
          name="twitter:description"
          content="Conoce cómo protegemos tus datos personales según la legislación colombiana."
        />

        {/* Meta de actualización */}
        <meta property="article:modified_time" content={lastUpdatedISO} />
      </Helmet>

      <div className="max-w-5xl mx-auto px-6 py-14 text-gray-700">
        {/* Header */}
        <div className="mb-10 border-b border-red-100 pb-6">
          <h1 className="text-4xl font-extrabold text-gray-900">
            Política de <span className="text-red-600">Privacidad</span>
          </h1>
          <p className="mt-3 text-sm text-gray-500">
            Última actualización: {lastUpdated}
          </p>
        </div>

        {/* Contenido */}
        <section className="space-y-8 leading-relaxed">
          {/* Introducción con marco legal */}
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
            <p className="text-base italic text-gray-700">
              En <strong className="text-gray-900">Punto G</strong>, la
              privacidad de nuestros usuarios es una prioridad. Esta Política de
              Privacidad describe cómo recopilamos, usamos y protegemos su
              información personal conforme a la{" "}
              <strong>Ley 1581 de 2012</strong> y el{" "}
              <strong>Decreto 1377 de 2013</strong> de la República de Colombia.
            </p>
          </div>

          {/* Información que recopilamos */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 border-l-4 border-red-600 pl-3 mb-3">
              1. Información que recopilamos
            </h2>
            <div className="bg-gray-50 p-4 rounded-lg">
              <ul className="list-disc pl-8 space-y-2">
                <li>
                  <span className="font-medium">Nombre y apellido</span> - Para
                  identificar y contactar al cliente
                </li>
                <li>
                  <span className="font-medium">Correo electrónico</span> - Para
                  enviar confirmaciones y actualizaciones
                </li>
                <li>
                  <span className="font-medium">Número de teléfono</span> - Para
                  coordinar entregas
                </li>
                <li>
                  <span className="font-medium">Dirección de envío</span> - Para
                  despachar los pedidos
                </li>
                <li>
                  <span className="font-medium">
                    Información relacionada con pedidos
                  </span>{" "}
                  - Historial de compras y preferencias
                </li>
              </ul>
            </div>
          </div>

          {/* Uso de la información */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 border-l-4 border-red-600 pl-3 mb-3">
              2. Uso de la información
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-green-50 p-3 rounded-lg">
                <p className="font-semibold text-green-700">📦 Procesamiento</p>
                <p className="text-sm">Gestionar pedidos y envíos</p>
              </div>
              <div className="bg-green-50 p-3 rounded-lg">
                <p className="font-semibold text-green-700">📞 Atención</p>
                <p className="text-sm">Responder solicitudes y consultas</p>
              </div>
              <div className="bg-green-50 p-3 rounded-lg">
                <p className="font-semibold text-green-700">⚙️ Mejora</p>
                <p className="text-sm">Optimizar la experiencia del usuario</p>
              </div>
              <div className="bg-green-50 p-3 rounded-lg">
                <p className="font-semibold text-green-700">⚖️ Legal</p>
                <p className="text-sm">Cumplir obligaciones normativas</p>
              </div>
            </div>
          </div>

          {/* Protección de la información */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 border-l-4 border-red-600 pl-3 mb-3">
              3. Protección de la información
            </h2>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="flex items-start">
                <span className="text-yellow-600 mr-2">🔒</span>
                <span>
                  Implementamos medidas de seguridad técnicas y organizativas
                  para proteger los datos personales. Sin embargo, ningún
                  sistema es completamente seguro.
                </span>
              </p>
            </div>
          </div>

          {/* Cookies */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 border-l-4 border-red-600 pl-3 mb-3">
              4. Cookies
            </h2>
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <p className="flex items-start">
                <span className="text-orange-600 mr-2">🍪</span>
                <span>
                  Utilizamos cookies para mejorar la experiencia del usuario.
                  Puedes configurarlas o deshabilitarlas desde tu navegador.
                </span>
              </p>
            </div>
          </div>

          {/* Derechos del titular */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 border-l-4 border-red-600 pl-3 mb-3">
              5. Derechos del titular
            </h2>
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <p className="font-medium text-purple-800 mb-2">
                Tienes derecho a:
              </p>
              <ul className="list-disc pl-8 space-y-1">
                <li>
                  <strong>Conocer</strong> tus datos personales
                </li>
                <li>
                  <strong>Actualizar</strong> tu información
                </li>
                <li>
                  <strong>Rectificar</strong> datos incorrectos
                </li>
                <li>
                  <strong>Solicitar la eliminación</strong> de tus datos
                </li>
                <li>
                  <strong>Presentar quejas</strong> ante la Superintendencia de
                  Industria y Comercio (SIC)
                </li>
              </ul>
            </div>
          </div>

          {/* Contacto */}
          <div className="bg-gray-50 border border-red-100 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-3 flex items-center">
              <span className="mr-2">📧</span> 6. Contacto para datos personales
            </h2>
            <p className="text-sm mb-2">
              Para ejercer tus derechos o resolver dudas sobre esta política,
              puedes escribirnos a:
            </p>
            <div className="bg-white p-3 rounded border border-gray-200">
              <p className="font-semibold text-red-600 text-base">
                puntogsexshop2024@hotmail.com
              </p>
            </div>
            <p className="text-xs text-gray-500 mt-3">
              Responderemos tu solicitud en un máximo de 10 días hábiles,
              conforme a la ley.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
