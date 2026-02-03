// src/pages/PoliticaPrivacidad.jsx
export default function PoliticaPrivacidad() {
  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-5xl mx-auto px-6 py-14 text-gray-700">
        {/* Header */}
        <div className="mb-10 border-b border-red-100 pb-6">
          <h1 className="text-4xl font-extrabold text-gray-900">
            Política de <span className="text-red-600">Privacidad</span>
          </h1>

          <p className="mt-3 text-sm text-gray-500">
            Última actualización: {new Date().toLocaleDateString("es-CO")}
          </p>
        </div>

        {/* Contenido */}
        <section className="space-y-8 leading-relaxed">
          <p className="text-base">
            En <strong className="text-gray-900">Punto G</strong>, la privacidad
            de nuestros usuarios es una prioridad. Esta Política de Privacidad
            describe cómo recopilamos, usamos y protegemos su información
            personal conforme a la Ley 1581 de 2012 y el Decreto 1377 de 2013 de
            la República de Colombia.
          </p>

          {/* Bloque */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 border-l-4 border-red-600 pl-3 mb-3">
              1. Información que recopilamos
            </h2>
            <ul className="list-disc pl-8 space-y-2">
              <li>Nombre y apellido</li>
              <li>Correo electrónico</li>
              <li>Número de teléfono</li>
              <li>Dirección de envío</li>
              <li>Información relacionada con pedidos</li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-900 border-l-4 border-red-600 pl-3 mb-3">
              2. Uso de la información
            </h2>
            <p>
              Usamos la información para procesar pedidos, gestionar envíos,
              responder solicitudes, mejorar la experiencia del usuario y
              cumplir obligaciones legales.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-900 border-l-4 border-red-600 pl-3 mb-3">
              3. Protección de la información
            </h2>
            <p>
              Implementamos medidas de seguridad técnicas y organizativas para
              proteger los datos personales. Sin embargo, ningún sistema es
              completamente seguro.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-900 border-l-4 border-red-600 pl-3 mb-3">
              4. Cookies
            </h2>
            <p>
              Utilizamos cookies para mejorar la experiencia del usuario. Puedes
              configurarlas o deshabilitarlas desde tu navegador.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-900 border-l-4 border-red-600 pl-3 mb-3">
              5. Derechos del titular
            </h2>
            <p>
              El usuario puede conocer, actualizar, rectificar o solicitar la
              eliminación de sus datos personales y presentar quejas ante la
              Superintendencia de Industria y Comercio (SIC).
            </p>
          </div>

          {/* Contacto */}
          <div className="bg-gray-50 border border-red-100 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              6. Contacto
            </h2>
            <p className="text-sm">
              Para cualquier solicitud relacionada con esta política puedes
              escribirnos a:
              <br />
              <span className="font-semibold text-red-600">
                puntogsexshop2024@hotmail.com
              </span>
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
