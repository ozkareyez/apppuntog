import { Helmet } from "react-helmet-async";

// Podrías mover este objeto a otro archivo (ej. content/sobreNosotros.js)
const pageContent = {
  title: "Sobre Nosotros",
  highlightedWord: "Nosotros",
  lastUpdated: new Date().toLocaleDateString("es-CO"),
  lastUpdatedISO: new Date().toISOString(),
  description:
    "Conoce Punto G, empresa con más de 5 años de experiencia en productos sexuales. Comprometidos con tu bienestar, privacidad y una sexualidad sana y responsable.",
  ogDescription:
    "Empresa con más de 5 años de experiencia en productos sexuales. Discreción, calidad y atención profesional en Colombia.",
  paragraphs: [
    "<strong className='text-gray-900'>Punto G</strong> es una empresa con más de <strong>5 años de experiencia en el mercado</strong>, especializada en la venta de productos sexuales, enfocada en el bienestar, el placer y la confianza de nuestros clientes.",
    "Desde nuestros inicios, trabajamos con el compromiso de ofrecer productos de alta calidad, atención profesional y un entorno seguro y respetuoso, rompiendo tabúes y promoviendo una sexualidad sana, informada y responsable.",
  ],
  sections: [
    {
      title: "Nuestra experiencia",
      content:
        "Durante estos años, hemos consolidado nuestra presencia en el mercado gracias a la confianza de nuestros clientes, la constante actualización de nuestro catálogo y la mejora continua de nuestros procesos de venta y atención.",
    },
    {
      title: "Nuestra misión",
      content:
        "Brindar productos sexuales seguros y de calidad, acompañados de una atención cercana, discreta y profesional, que contribuya al bienestar personal y de pareja de nuestros clientes.",
    },
    {
      title: "Nuestra visión",
      content:
        "Ser una empresa referente en el sector de productos sexuales, reconocida por su responsabilidad, confidencialidad, innovación y excelencia en el servicio al cliente.",
    },
    {
      title: "Nuestros valores",
      content: [
        "Respeto y confidencialidad",
        "Calidad y seguridad en los productos",
        "Atención profesional y cercana",
        "Responsabilidad y ética comercial",
        "Compromiso con nuestros clientes",
      ],
      isList: true,
    },
    {
      title: "Privacidad y discreción",
      content:
        "En <strong>Punto G</strong>, la privacidad es fundamental. Todos nuestros procesos de venta, pago y envío están diseñados para garantizar total confidencialidad y seguridad en cada compra.",
    },
  ],
  contact: {
    title: "Contáctanos",
    text: "Si deseas más información sobre nuestra empresa o nuestros productos, puedes escribirnos a:",
    email: "puntogsexshop2024@hotmail.com",
  },
};

export default function SobreNosotros() {
  // Función para renderizar contenido que podría tener HTML
  const renderContent = (content) => {
    return <span dangerouslySetInnerHTML={{ __html: content }} />;
  };

  return (
    <div className="bg-white min-h-screen">
      <Helmet>
        <title>Nosotros | Punto G Sex Shop Colombia</title>
        <meta name="description" content={pageContent.description} />
        <link rel="canonical" href="https://puntogsexshop.com/nosotros" />
        <meta name="robots" content="index, follow" />
        {/* Open Graph */}
        <meta
          property="og:title"
          content="Nosotros | Punto G Sex Shop Colombia"
        />
        <meta property="og:description" content={pageContent.ogDescription} />
        <meta property="og:url" content="https://puntogsexshop.com/nosotros" />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Punto G Sex Shop" />
        {/* ¡IMPORTANTE! Añade tu imagen OG aquí */}
        <meta
          property="og:image"
          content="https://puntogsexshop.com/og-image-default.jpg"
        />
        <meta
          property="og:image:alt"
          content="Punto G Sex Shop Colombia - Sobre Nosotros"
        />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        {/* Meta de actualización */}
        <meta
          property="article:modified_time"
          content={pageContent.lastUpdatedISO}
        />
      </Helmet>

      <div className="max-w-5xl mx-auto px-6 py-14 text-gray-700">
        {/* Header */}
        <div className="mb-10 border-b border-red-100 pb-6">
          <h1 className="text-4xl font-extrabold text-gray-900">
            {pageContent.title.split(pageContent.highlightedWord)[0]}
            <span className="text-red-600">{pageContent.highlightedWord}</span>
          </h1>
          <p className="mt-3 text-sm text-gray-500">
            Última actualización: {pageContent.lastUpdated}
          </p>
        </div>

        {/* Contenido */}
        <section className="space-y-8 leading-relaxed">
          {pageContent.paragraphs.map((para, index) => (
            <p
              key={index}
              className="text-base"
              dangerouslySetInnerHTML={{ __html: para }}
            />
          ))}

          {pageContent.sections.map((section, index) => (
            <div key={index}>
              <h2 className="text-xl font-semibold text-gray-900 border-l-4 border-red-600 pl-3 mb-3">
                {section.title}
              </h2>
              {section.isList ? (
                <ul className="list-disc pl-8 space-y-2">
                  {section.content.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              ) : (
                <p dangerouslySetInnerHTML={{ __html: section.content }} />
              )}
            </div>
          ))}

          {/* Contacto */}
          <div className="bg-gray-50 border border-red-100 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              {pageContent.contact.title}
            </h2>
            <p className="text-sm">
              {pageContent.contact.text}
              <br />
              <span className="font-semibold text-red-600">
                {pageContent.contact.email}
              </span>
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
