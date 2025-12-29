// src/pages/PoliticaPrivacidad.jsx
export default function PoliticaPrivacidad() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-10 text-gray-700">
      <h1 className="text-3xl font-bold mb-6 text-gray-900">
        Política de Privacidad
      </h1>

      <p className="mb-4 text-sm text-gray-500">
        Última actualización: {new Date().toLocaleDateString("es-CO")}
      </p>

      <section className="space-y-6 leading-relaxed">
        <p>
          En <strong>Punto G</strong>, la privacidad de nuestros usuarios es una
          prioridad. Esta Política de Privacidad describe cómo recopilamos,
          usamos y protegemos su información personal conforme a la Ley 1581 de
          2012 y el Decreto 1377 de 2013 de la República de Colombia.
        </p>

        <h2 className="text-xl font-semibold text-gray-900">
          1. Información que recopilamos
        </h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>Nombre y apellido</li>
          <li>Correo electrónico</li>
          <li>Número de teléfono</li>
          <li>Dirección de envío</li>
          <li>Información relacionada con pedidos</li>
        </ul>

        <h2 className="text-xl font-semibold text-gray-900">
          2. Uso de la información
        </h2>
        <p>
          Usamos la información para procesar pedidos, gestionar envíos,
          responder solicitudes, mejorar la experiencia del usuario y cumplir
          obligaciones legales.
        </p>

        <h2 className="text-xl font-semibold text-gray-900">
          3. Protección de la información
        </h2>
        <p>
          Implementamos medidas de seguridad técnicas y organizativas para
          proteger los datos personales. Sin embargo, ningún sistema es
          completamente seguro.
        </p>

        <h2 className="text-xl font-semibold text-gray-900">4. Cookies</h2>
        <p>
          Utilizamos cookies para mejorar la experiencia del usuario. Puedes
          configurarlas o deshabilitarlas desde tu navegador.
        </p>

        <h2 className="text-xl font-semibold text-gray-900">
          5. Derechos del titular
        </h2>
        <p>
          El usuario puede conocer, actualizar, rectificar o solicitar la
          eliminación de sus datos personales y presentar quejas ante la SIC.
        </p>

        <h2 className="text-xl font-semibold text-gray-900">6. Contacto</h2>
        <p>
          Para cualquier solicitud relacionada con esta política puedes
          escribirnos a:
          <br />
          <strong>Correo:</strong> contacto@puntog.com
        </p>
      </section>
    </div>
  );
}
