export default function SobreNosotros() {
  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-5xl mx-auto px-6 py-14 text-gray-700">
        {/* Header */}
        <div className="mb-10 border-b border-red-100 pb-6">
          <h1 className="text-4xl font-extrabold text-gray-900">
            Sobre <span className="text-red-600">Nosotros</span>
          </h1>

          <p className="mt-3 text-sm text-gray-500">
            Última actualización: {new Date().toLocaleDateString("es-CO")}
          </p>
        </div>

        {/* Contenido */}
        <section className="space-y-8 leading-relaxed">
          <p className="text-base">
            <strong className="text-gray-900">Punto G</strong> es una empresa
            con más de <strong>5 años de experiencia en el mercado</strong>,
            especializada en la venta de productos sexuales, enfocada en el
            bienestar, el placer y la confianza de nuestros clientes.
          </p>

          <p className="text-base">
            Desde nuestros inicios, trabajamos con el compromiso de ofrecer
            productos de alta calidad, atención profesional y un entorno seguro
            y respetuoso, rompiendo tabúes y promoviendo una sexualidad sana,
            informada y responsable.
          </p>

          <div>
            <h2 className="text-xl font-semibold text-gray-900 border-l-4 border-red-600 pl-3 mb-3">
              Nuestra experiencia
            </h2>
            <p>
              Durante estos años, hemos consolidado nuestra presencia en el
              mercado gracias a la confianza de nuestros clientes, la constante
              actualización de nuestro catálogo y la mejora continua de nuestros
              procesos de venta y atención.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-900 border-l-4 border-red-600 pl-3 mb-3">
              Nuestra misión
            </h2>
            <p>
              Brindar productos sexuales seguros y de calidad, acompañados de
              una atención cercana, discreta y profesional, que contribuya al
              bienestar personal y de pareja de nuestros clientes.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-900 border-l-4 border-red-600 pl-3 mb-3">
              Nuestra visión
            </h2>
            <p>
              Ser una empresa referente en el sector de productos sexuales,
              reconocida por su responsabilidad, confidencialidad, innovación y
              excelencia en el servicio al cliente.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-900 border-l-4 border-red-600 pl-3 mb-3">
              Nuestros valores
            </h2>
            <ul className="list-disc pl-8 space-y-2">
              <li>Respeto y confidencialidad</li>
              <li>Calidad y seguridad en los productos</li>
              <li>Atención profesional y cercana</li>
              <li>Responsabilidad y ética comercial</li>
              <li>Compromiso con nuestros clientes</li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-900 border-l-4 border-red-600 pl-3 mb-3">
              Privacidad y discreción
            </h2>
            <p>
              En <strong>Punto G</strong>, la privacidad es fundamental. Todos
              nuestros procesos de venta, pago y envío están diseñados para
              garantizar total confidencialidad y seguridad en cada compra.
            </p>
          </div>

          {/* Contacto */}
          <div className="bg-gray-50 border border-red-100 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Contáctanos
            </h2>
            <p className="text-sm">
              Si deseas más información sobre nuestra empresa o nuestros
              productos, puedes escribirnos a:
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
