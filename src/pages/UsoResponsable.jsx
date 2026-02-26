// src/pages/UsoResponsable.jsx
import { Helmet } from "react-helmet-async";

export default function UsoResponsable() {
  const lastUpdated = new Date().toLocaleDateString("es-CO");
  const lastUpdatedISO = new Date().toISOString();

  return (
    <div className="bg-white min-h-screen">
      <Helmet>
        <title>Uso Responsable +18 | Punto G Sex Shop Colombia</title>
        <meta
          name="description"
          content="Política de uso responsable en Punto G. Sitio exclusivo para mayores de 18 años. Recomendaciones para el uso seguro de productos íntimos y límites de responsabilidad."
        />
        <link
          rel="canonical"
          href="https://puntogsexshop.com/uso-responsable"
        />
        <meta name="robots" content="index, follow" />

        {/* Open Graph - SIN IMAGEN */}
        <meta
          property="og:title"
          content="Uso Responsable +18 | Punto G Sex Shop Colombia"
        />
        <meta
          property="og:description"
          content="Sitio exclusivo para mayores de 18 años. Información sobre uso responsable de productos íntimos."
        />
        <meta
          property="og:url"
          content="https://puntogsexshop.com/uso-responsable"
        />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Punto G Sex Shop" />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary" />
        <meta
          name="twitter:title"
          content="Uso Responsable +18 | Punto G Sex Shop Colombia"
        />
        <meta
          name="twitter:description"
          content="Política de uso responsable y verificación de edad +18."
        />

        {/* Meta de actualización */}
        <meta property="article:modified_time" content={lastUpdatedISO} />
      </Helmet>

      <div className="max-w-5xl mx-auto px-6 py-14 text-gray-700">
        {/* Header */}
        <div className="mb-10 border-b border-red-100 pb-6">
          <h1 className="text-4xl font-extrabold text-gray-900">
            Uso Responsable <span className="text-red-600">+18</span>
          </h1>
          <p className="mt-3 text-sm text-gray-500">
            Última actualización: {lastUpdated}
          </p>
        </div>

        {/* Contenido */}
        <section className="space-y-8 leading-relaxed">
          {/* Advertencia principal +18 */}
          <div className="bg-red-50 border-2 border-red-600 rounded-lg p-6 text-center">
            <div className="text-6xl mb-4">🔞</div>
            <h2 className="text-2xl font-bold text-red-700 mb-2">
              ADVERTENCIA: CONTENIDO PARA MAYORES DE 18 AÑOS
            </h2>
            <p className="text-lg font-medium text-gray-800">
              Este sitio está dirigido exclusivamente a personas mayores de
              edad.
            </p>
          </div>

          {/* Verificación de edad */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 border-l-4 border-red-600 pl-3 mb-3">
              1. Verificación de edad
            </h2>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="flex items-start">
                <span className="text-red-500 mr-2 font-bold">✓</span>
                <span>
                  Al acceder y utilizar este sitio web, declaras y garantizas
                  que eres
                  <strong className="text-red-600"> mayor de 18 años</strong> de
                  edad.
                </span>
              </p>
              <p className="flex items-start mt-2">
                <span className="text-red-500 mr-2 font-bold">✓</span>
                <span>
                  Si eres menor de edad, no estás autorizado para acceder a este
                  sitio ni realizar compras en él.
                </span>
              </p>
            </div>
          </div>

          {/* Uso responsable de productos */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 border-l-4 border-red-600 pl-3 mb-3">
              2. Uso responsable de productos
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-semibold text-green-700 mb-2">
                  ✅ Recomendaciones
                </h3>
                <ul className="list-disc pl-5 text-sm space-y-1">
                  <li>Leer las instrucciones del fabricante</li>
                  <li>Limpiar los productos antes y después de usar</li>
                  <li>Usar lubricantes compatibles con el material</li>
                  <li>Revisar el producto antes de cada uso</li>
                </ul>
              </div>
              <div className="bg-red-50 p-4 rounded-lg">
                <h3 className="font-semibold text-red-700 mb-2">
                  ❌ No recomendado
                </h3>
                <ul className="list-disc pl-5 text-sm space-y-1">
                  <li>Compartir productos sin protección</li>
                  <li>Usar productos dañados o rotos</li>
                  <li>Ignorar señales de dolor o molestia</li>
                  <li>Usar productos para fines no indicados</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Límite de responsabilidad */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 border-l-4 border-red-600 pl-3 mb-3">
              3. Límite de responsabilidad
            </h2>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="font-medium text-yellow-800 mb-2">⚠️ Importante:</p>
              <p>
                <strong className="text-gray-900">Punto G</strong> no se hace
                responsable por:
              </p>
              <ul className="list-disc pl-8 mt-2 space-y-1">
                <li>El uso indebido de los productos adquiridos</li>
                <li>Daños derivados del incumplimiento de instrucciones</li>
                <li>Reacciones alérgicas no reportadas por el fabricante</li>
                <li>Uso de productos por menores de edad</li>
              </ul>
            </div>
          </div>

          {/* Recomendaciones de seguridad */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 border-l-4 border-red-600 pl-3 mb-3">
              4. Recomendaciones de seguridad
            </h2>
            <div className="bg-blue-50 p-4 rounded-lg">
              <ul className="space-y-3">
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">🔵</span>
                  <span>
                    <strong>Materiales:</strong> Verifica la compatibilidad de
                    materiales (silicone, ABS, vidrio) con lubricantes.
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">🔵</span>
                  <span>
                    <strong>Limpieza:</strong> Usa limpiadores específicos para
                    productos íntimos o agua tibia con jabón neutro.
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">🔵</span>
                  <span>
                    <strong>Almacenamiento:</strong> Guarda los productos en
                    lugares frescos y secos, lejos de la luz solar directa.
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">🔵</span>
                  <span>
                    <strong>Baterías:</strong> Si tu producto usa baterías,
                    retíralas cuando no lo uses por períodos prolongados.
                  </span>
                </li>
              </ul>
            </div>
          </div>

          {/* Consentimiento */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 border-l-4 border-red-600 pl-3 mb-3">
              5. Consentimiento
            </h2>
            <p>Al continuar navegando en nuestro sitio, confirmas que:</p>
            <ul className="list-disc pl-8 mt-2 space-y-1">
              <li>Eres mayor de 18 años</li>
              <li>Aceptas usar los productos de manera responsable</li>
              <li>
                Entiendes los riesgos asociados al uso de productos íntimos
              </li>
              <li>Liberas a Punto G de responsabilidad por mal uso</li>
            </ul>
          </div>

          {/* Contacto */}
          <div className="bg-gray-50 border border-red-100 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-3 flex items-center">
              <span className="mr-2">📧</span> 6. Contacto
            </h2>
            <p className="text-sm mb-3">
              Si tienes dudas sobre el uso responsable de nuestros productos,
              escríbenos a:
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
