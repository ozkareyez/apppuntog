// import { useState, useEffect } from "react";
// import {
//   ShoppingCart,
//   Plus,
//   Minus,
//   Trash2,
//   X,
//   MailPlus,
//   Link,
// } from "lucide-react";
// import { FloatingWhatsApp } from "react-floating-whatsapp";
// import Header from "../Header";
// import MainCTA from "../../MainCTA";
// import { API_URL } from "@/config";

// // const API_URL = "https://gleaming-motivation-production-4018.up.railway.app";

// const Cards = () => {
//   /************************************ */
//   const [formData, setFormData] = useState({
//     nombre: "",
//     email: "",
//     direccion: "",
//     ciudad: "",
//     departamento: "",
//     telefono: "",
//   });

//   /********************************************** */

//   const [cart, setCart] = useState([]);
//   const [productos, setProductos] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [showCart, setShowCart] = useState(false);
//   const [mostrarFormulario, setMostrarFormulario] = useState(false);
//   const [departamentos, setDepartamentos] = useState([]);
//   const [ciudades, setCiudades] = useState([]);

//   const [departamentoId, setDepartamentoId] = useState("");
//   const [ciudadId, setCiudadId] = useState("");

//   useEffect(() => {
//     fetch(`${API_URL}/api/departamentos`)
//       .then((res) => res.json())
//       .then((data) => setDepartamentos(data))
//       .catch((err) => console.error(err));
//   }, []);

//   useEffect(() => {
//     if (!departamentoId) return;

//     fetch(`${API_URL}/api/ciudades/${departamentoId}`)
//       .then((res) => res.json())
//       .then((data) => setCiudades(data))
//       .catch((err) => console.error(err));
//   }, [departamentoId]);

//   const fetchProductos = async () => {
//     try {
//       setLoading(true);

//       const response = await fetch(`${API_URL}/api/productos`);

//       if (!response.ok) {
//         throw new Error("Error al obtener datos del servidor");
//       }

//       const data = await response.json();
//       setProductos(data);
//       setError(null);
//     } catch (error) {
//       console.error("Error al obtener los productos:", error);
//       setError(error.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchProductos();
//   }, []);

//   const addToCart = (producto) => {
//     const existingItem = cart.find((item) => item.id === producto.id);

//     if (existingItem) {
//       setCart(
//         cart.map((item) =>
//           item.id === producto.id
//             ? { ...item, quantity: item.quantity + 1 }
//             : item
//         )
//       );
//     } else {
//       setCart([...cart, { ...producto, quantity: 1 }]);
//     }
//   };

//   const increaseQuantity = (id) => {
//     setCart(
//       cart.map((item) =>
//         item.id === id ? { ...item, quantity: item.quantity + 1 } : item
//       )
//     );
//   };

//   const decreaseQuantity = (id) => {
//     const item = cart.find((item) => item.id === id);

//     if (item.quantity === 1) {
//       removeFromCart(id);
//     } else {
//       setCart(
//         cart.map((item) =>
//           item.id === id ? { ...item, quantity: item.quantity - 1 } : item
//         )
//       );
//     }
//   };

//   const removeFromCart = (id) => {
//     setCart(cart.filter((item) => item.id !== id));
//   };

//   const total = cart.reduce(
//     (sum, item) => sum + item.precio * item.quantity,
//     0
//   );

//   const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

//   /************************************************************* */
//   const enviarFormulario = async (e) => {
//     e.preventDefault();

//     if (cart.length === 0) {
//       alert("Tu carrito está vacío.");
//       return;
//     }

//     try {
//       const response = await fetch(`${API_URL}/api/enviar-formulario`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           nombre: formData.nombre,
//           email: formData.email,
//           telefono: formData.telefono,
//           direccion: formData.direccion,
//           departamento_id: departamentoId,
//           ciudad_id: ciudadId,
//           carrito: cart,
//         }),
//       });

//       const data = await response.json();
//       console.log("Respuesta del servidor:", data);

//       alert("Pedido enviado correctamente ✔");

//       enviarWhatsApp(); // ←← ABRIR WHATSAPP AUTOMÁTICAMENTE

//       // Limpiar formulario
//       setFormData({
//         nombre: "",
//         email: "",
//         direccion: "",
//         ciudad: "",
//         departamento: "",
//         telefono: "",
//       });

//       setCart([]);
//       setMostrarFormulario(false);
//     } catch (error) {
//       console.error("Error al enviar formulario:", error);
//       alert("Hubo un error al enviar los datos.");
//     }
//   };

//   /******************************************** */
//   const enviarWhatsApp = () => {
//     const numero = "573147041149"; // tu número sin + ni espacios

//     // Armar mensaje del cliente
//     const datosCliente = `
// 🧑 Cliente:
// - Nombre: ${formData.nombre}
// - Email: ${formData.email}
// - Dirección: ${formData.direccion}
// -Departamento: ${formData.departamento}
// - Ciudad: ${formData.ciudad}
// - Teléfono: ${formData.telefono}
// `;

//     // Armar mensaje del carrito
//     const productosTexto = cart
//       .map(
//         (item) =>
//           `• ${item.nombre} x${item.quantity} = $${(
//             item.precio * item.quantity
//           ).toFixed(2)}`
//       )
//       .join("\n");

//     const totalPedido = total.toFixed(2);

//     const mensaje = encodeURIComponent(`
// 📦 *Nuevo Pedido desde la tienda PuntoG*

// ${datosCliente}

// 🛒 *Productos:*
// ${productosTexto}

// 💰 *Total:* $${totalPedido}

// Gracias por su compra!
//   `);

//     const url = `https://wa.me/${numero}?text=${mensaje}`;
//     window.open(url, "_blank");
//   };

//   /****** */

//   const handleImgError = (e) => {
//     e.target.onerror = null; // 🔒 evita loop infinito
//     e.target.src = "/imagenes/no-image.png";
//   };

//   return (
//     <div className="min-h-screen bg-[#22222280]">
//       {/* Header con ícono del carrito */}
//       <Header
//         totalItems={totalItems}
//         onCartClick={() => setShowCart(!showCart)}
//       />

//       {/* <MainCTA /> */}

//       {/* <div className="sticky top-0 z-50 bg-transparent border-b border-[#ffffff40]"> */}
//       <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
//         {/* <img className="size-30" src="./public/imagenes/logo (3).png" alt="" /> */}

//         <FloatingWhatsApp
//           phoneNumber="+573147041149"
//           accountName="Punto G"
//           statusMessage="tienda on line"
//           chatMessage="Buen dia somos PuntoG en que te puedo ayudar!!"
//           avatar="/imagenes/logo.png"
//         />
//       </div>
//       {/* </div> */}

//       {/* Dropdown del Carrito */}
//       {showCart && (
//         <>
//           {/* Overlay */}
//           <div
//             className="fixed inset-0 bg-black bg-opacity-50 z-40"
//             onClick={() => setShowCart(false)}
//           ></div>

//           {/* Panel del carrito */}
//           <div className="fixed top-0 right-0 h-full w-full md:w-96 bg-white shadow-2xl z-50 transform transition-transform">
//             <div className="flex flex-col h-full">
//               {/* Header del carrito */}
//               <div className="flex justify-between items-center p-4 border-b">
//                 <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
//                   <ShoppingCart size={24} />
//                   Carrito de Compras
//                 </h2>
//                 <button
//                   onClick={() => setShowCart(false)}
//                   className="p-2 hover:bg-gray-100 rounded-full"
//                 >
//                   <X size={24} />
//                 </button>
//               </div>

//               {/* Contenido del carrito */}
//               <div className="flex-1 overflow-y-auto p-4">
//                 {cart.length === 0 ? (
//                   <p className="text-gray-500 text-center py-8">
//                     El carrito está vacío. ¡Agrega algunos productos!
//                   </p>
//                 ) : (
//                   <div className="space-y-4">
//                     {cart.map((item) => (
//                       <div
//                         key={item.id}
//                         className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
//                       >
//                         <img
//                           src={item.imagen}
//                           alt={item.nombre}
//                           className="w-16 h-16 object-cover rounded"
//                           onError={handleImgError}
//                         />

//                         <div className="flex-1">
//                           <h4 className="font-semibold text-sm text-gray-800">
//                             {item.nombre}
//                           </h4>
//                           <p className="text-indigo-600 font-bold text-sm">
//                             ${item.precio.toFixed(2)}
//                           </p>
//                         </div>

//                         <div className="flex flex-col items-end gap-2">
//                           <div className="flex items-center gap-1">
//                             <button
//                               onClick={() => decreaseQuantity(item.id)}
//                               className="bg-gray-200 hover:bg-gray-300 p-1 rounded"
//                             >
//                               <Minus size={14} />
//                             </button>

//                             <span className="w-8 text-center font-semibold text-sm">
//                               {item.quantity}
//                             </span>

//                             <button
//                               onClick={() => increaseQuantity(item.id)}
//                               className="bg-gray-200 hover:bg-gray-300 p-1 rounded"
//                             >
//                               <Plus size={14} />
//                             </button>
//                           </div>

//                           <button
//                             onClick={() => removeFromCart(item.id)}
//                             className="bg-red-500 hover:bg-red-600 text-white p-1 rounded"
//                           >
//                             <Trash2 size={14} />
//                           </button>

//                           <p className="font-bold text-gray-800 text-sm">
//                             ${(item.precio * item.quantity).toFixed(2)}
//                           </p>
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 )}
//               </div>

//               {/* Footer con total */}
//               {cart.length > 0 && (
//                 <div className="border-t p-4 bg-gray-50">
//                   <div className="flex justify-between items-center text-lg font-bold mb-4">
//                     <span>Total:</span>
//                     <span className="text-indigo-600">${total.toFixed(2)}</span>
//                   </div>
//                   <div>
//                     {!mostrarFormulario ? (
//                       <button
//                         onClick={() => {
//                           setMostrarFormulario(true);
//                         }}
//                         className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition"
//                       >
//                         Confirmar Entrega
//                       </button>
//                     ) : (
//                       <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md mx-auto relative">
//                         {/* Cerrar */}
//                         <button
//                           onClick={() => setMostrarFormulario(false)}
//                           className="absolute top-3 right-3 text-gray-500 hover:text-red-500"
//                         >
//                           <X />
//                         </button>

//                         <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">
//                           🚚 Datos de Envío
//                         </h2>

//                         <form onSubmit={enviarFormulario} className="space-y-4">
//                           {/* Nombre */}
//                           <div>
//                             <label className="block text-sm font-semibold text-gray-700 mb-1">
//                               Nombre completo
//                             </label>
//                             <input
//                               type="text"
//                               required
//                               value={formData.nombre}
//                               onChange={(e) =>
//                                 setFormData({
//                                   ...formData,
//                                   nombre: e.target.value,
//                                 })
//                               }
//                               className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:outline-none"
//                               placeholder="Ej: Juan Pérez"
//                             />
//                           </div>

//                           {/* Email */}
//                           <div>
//                             <label className="block text-sm font-semibold text-gray-700 mb-1">
//                               Correo electrónico
//                             </label>
//                             <input
//                               type="email"
//                               required
//                               value={formData.email}
//                               onChange={(e) =>
//                                 setFormData({
//                                   ...formData,
//                                   email: e.target.value,
//                                 })
//                               }
//                               className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:outline-none"
//                               placeholder="correo@email.com"
//                             />
//                           </div>

//                           {/* Departamento */}
//                           <div>
//                             <label className="block text-sm font-semibold text-gray-700 mb-1">
//                               Departamento
//                             </label>
//                             <select
//                               value={departamentoId}
//                               required
//                               onChange={(e) => {
//                                 const id = e.target.value;
//                                 const depto = departamentos.find(
//                                   (d) => d.id == id
//                                 );

//                                 setDepartamentoId(id);
//                                 setCiudadId("");
//                                 setCiudades([]);
//                                 setFormData({
//                                   ...formData,
//                                   departamento: depto?.nombre || "",
//                                   ciudad: "",
//                                 });
//                               }}
//                               className="w-full border rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-green-500 focus:outline-none"
//                             >
//                               <option value="">Seleccione departamento</option>
//                               {departamentos.map((d) => (
//                                 <option key={d.id} value={d.id}>
//                                   {d.nombre}
//                                 </option>
//                               ))}
//                             </select>
//                           </div>

//                           {/* Ciudad */}
//                           <div>
//                             <label className="block text-sm font-semibold text-gray-700 mb-1">
//                               Ciudad
//                             </label>
//                             <select
//                               value={ciudadId}
//                               required
//                               disabled={!ciudades.length}
//                               onChange={(e) => {
//                                 const id = e.target.value;
//                                 const ciudadSeleccionada = ciudades.find(
//                                   (c) => c.id == id
//                                 );

//                                 setCiudadId(id);
//                                 setFormData({
//                                   ...formData,
//                                   ciudad: ciudadSeleccionada?.nombre || "",
//                                 });
//                               }}
//                               className="w-full border rounded-lg px-3 py-2 bg-white disabled:bg-gray-100 focus:ring-2 focus:ring-green-500 focus:outline-none"
//                             >
//                               <option value="">Seleccione ciudad</option>
//                               {ciudades.map((c) => (
//                                 <option key={c.id} value={c.id}>
//                                   {c.nombre}
//                                 </option>
//                               ))}
//                             </select>
//                           </div>

//                           {/* Dirección */}
//                           <div>
//                             <label className="block text-sm font-semibold text-gray-700 mb-1">
//                               Dirección de entrega
//                             </label>
//                             <input
//                               type="text"
//                               required
//                               value={formData.direccion}
//                               onChange={(e) =>
//                                 setFormData({
//                                   ...formData,
//                                   direccion: e.target.value,
//                                 })
//                               }
//                               className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:outline-none"
//                               placeholder="Calle 10 #20-30"
//                             />
//                           </div>

//                           {/* Teléfono */}
//                           <div>
//                             <label className="block text-sm font-semibold text-gray-700 mb-1">
//                               Teléfono
//                             </label>
//                             <input
//                               type="tel"
//                               required
//                               value={formData.telefono}
//                               onChange={(e) =>
//                                 setFormData({
//                                   ...formData,
//                                   telefono: e.target.value,
//                                 })
//                               }
//                               className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:outline-none"
//                               placeholder="3001234567"
//                             />
//                           </div>

//                           {/* Botón */}
//                           <button
//                             type="submit"
//                             className="w-full mt-4 bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg transition"
//                           >
//                             Confirmar Pedido ✅
//                           </button>
//                         </form>
//                       </div>
//                     )}
//                   </div>
//                 </div>
//               )}
//             </div>
//           </div>
//         </>
//       )}

//       {/* Productos */}
//       <div className="max-w-7xl mx-auto p-4">
//         {loading && (
//           <p className="text-white text-center">Cargando productos...</p>
//         )}

//         {error && <p className="text-red-500 text-center">Error: {error}</p>}

//         {!loading && !error && productos.length === 0 && (
//           <p className="text-white text-center">No hay productos disponibles</p>
//         )}

//         <h1 className="text-4xl m-4 p-2 mb-6 text-center text-pink-400 font-semibold">
//           Nuestros Productos
//         </h1>

//         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
//           {productos.map((producto) => (
//             <div
//               key={producto.id}
//               className="
//         group bg-[#1f1f1f]
//         border border-white/10
//         rounded-2xl
//         overflow-hidden
//         transition
//         hover:border-pink-400
//         hover:shadow-lg hover:shadow-pink-500/20
//       "
//             >
//               {/* IMAGEN */}
//               <div className="relative w-full h-72 sm:h-64 overflow-hidden">
//                 <img
//                   src={producto.imagen}
//                   alt={producto.nombre}
//                   loading="lazy"
//                   onError={handleImgError}
//                   className="
//             w-full h-full object-cover
//             transition-transform duration-300
//             group-hover:scale-105
//           "
//                 />

//                 {/* BADGE OPCIONAL */}
//                 <span className="absolute top-3 left-3 bg-pink-500 text-white text-xs font-bold px-3 py-1 rounded-full">
//                   Nuevo
//                 </span>
//               </div>

//               {/* INFO */}
//               <div className="p-5 flex flex-col gap-2 text-center">
//                 <h3 className="text-white font-semibold text-base line-clamp-2">
//                   {producto.nombre}
//                 </h3>

//                 <div className="flex justify-center gap-4 text-sm text-gray-400">
//                   <span>Talla: {producto.talla}</span>
//                   <span>Color: {producto.color}</span>
//                 </div>

//                 <p className="text-xl font-bold text-pink-400 mt-2">
//                   ${producto.precio}
//                 </p>

//                 {/* BOTÓN */}
//                 <button
//                   onClick={() => addToCart(producto)}
//                   className="
//             mt-3 w-full flex items-center justify-center gap-2
//             py-2 rounded-xl
//             bg-white text-black font-semibold
//             transition
//             hover:bg-pink-500 hover:text-white
//           "
//                 >
//                   <ShoppingCart size={18} />
//                   Agregar al carrito
//                 </button>
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// };

// // // export default Cards;
// // import { useState, useEffect } from "react";
// // import { ShoppingCart, Plus, Minus, Trash2, X } from "lucide-react";
// // import { FloatingWhatsApp } from "react-floating-whatsapp";
// // import Header from "../Header";
// // import Footer from "../../Foter";
// // import { API_URL } from "@/config";

// // const WHATSAPP_NUMBER = "573147041149";

// // const Cards = () => {
// //   const [formData, setFormData] = useState({
// //     nombre: "",
// //     email: "",
// //     direccion: "",
// //     telefono: "",
// //   });

// //   const [cart, setCart] = useState([]);
// //   const [productos, setProductos] = useState([]);
// //   const [loading, setLoading] = useState(true);
// //   const [error, setError] = useState(null);
// //   const [showCart, setShowCart] = useState(false);
// //   const [mostrarFormulario, setMostrarFormulario] = useState(false);

// //   const [departamentos, setDepartamentos] = useState([]);
// //   const [ciudades, setCiudades] = useState([]);
// //   const [departamentoId, setDepartamentoId] = useState("");
// //   const [ciudadId, setCiudadId] = useState("");

// //   /* ================= FETCH ================= */

// //   useEffect(() => {
// //     fetch(`${API_URL}/api/departamentos`)
// //       .then((res) => res.json())
// //       .then(setDepartamentos)
// //       .catch(console.error);
// //   }, []);

// //   useEffect(() => {
// //     if (!departamentoId) return;
// //     fetch(`${API_URL}/api/ciudades/${departamentoId}`)
// //       .then((res) => res.json())
// //       .then(setCiudades)
// //       .catch(console.error);
// //   }, [departamentoId]);

// //   useEffect(() => {
// //     fetch(`${API_URL}/api/productos`)
// //       .then((res) => res.json())
// //       .then(setProductos)
// //       .catch(() => setError("Error al cargar productos"))
// //       .finally(() => setLoading(false));
// //   }, []);

// //   /* ================= CARRITO ================= */

// //   const addToCart = (producto) => {
// //     const precio = Number(producto.precio);

// //     const existing = cart.find((p) => p.id === producto.id);

// //     if (existing) {
// //       setCart(
// //         cart.map((p) =>
// //           p.id === producto.id ? { ...p, quantity: p.quantity + 1 } : p
// //         )
// //       );
// //     } else {
// //       setCart([...cart, { ...producto, precio, quantity: 1 }]);
// //     }
// //   };

// //   const increaseQuantity = (id) => {
// //     setCart(
// //       cart.map((p) => (p.id === id ? { ...p, quantity: p.quantity + 1 } : p))
// //     );
// //   };

// //   const decreaseQuantity = (id) => {
// //     setCart(
// //       cart.map((p) =>
// //         p.id === id && p.quantity > 1 ? { ...p, quantity: p.quantity - 1 } : p
// //       )
// //     );
// //   };

// //   const removeFromCart = (id) => {
// //     setCart(cart.filter((p) => p.id !== id));
// //   };

// //   const total = cart.reduce((sum, p) => sum + p.precio * p.quantity, 0);

// //   const totalItems = cart.reduce((sum, p) => sum + p.quantity, 0);

// //   /* ================= FORM ================= */

// //   const enviarFormulario = async (e) => {
// //     e.preventDefault();

// //     if (!cart.length) return alert("El carrito está vacío");

// //     await fetch(`${API_URL}/api/enviar-formulario`, {
// //       method: "POST",
// //       headers: { "Content-Type": "application/json" },
// //       body: JSON.stringify({
// //         ...formData,
// //         departamento_id: departamentoId,
// //         ciudad_id: ciudadId,
// //         carrito: cart,
// //       }),
// //     });

// //     enviarWhatsApp();
// //     setCart([]);
// //     setMostrarFormulario(false);
// //     setShowCart(false);
// //   };

// //   const enviarWhatsApp = () => {
// //     const depto =
// //       departamentos.find((d) => d.id == departamentoId)?.nombre || "";
// //     const ciudad = ciudades.find((c) => c.id == ciudadId)?.nombre || "";

// //     const productosTexto = cart
// //       .map(
// //         (p) =>
// //           `• ${p.nombre} x${p.quantity} = $${(p.precio * p.quantity).toFixed(
// //             0
// //           )}`
// //       )
// //       .join("\n");

// //     const mensaje = encodeURIComponent(`
// // 📦 *Nuevo Pedido PuntoG*

// // 👤 ${formData.nombre}
// // 📍 ${formData.direccion}
// // 🏙 ${ciudad}, ${depto}
// // 📞 ${formData.telefono}

// // 🛒 Productos:
// // ${productosTexto}

// // 💰 Total: $${total.toFixed(0)}
// // `);

// //     window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${mensaje}`, "_blank");
// //   };

// //   const handleImgError = (e) => {
// //     e.target.src = "/imagenes/no-image.png";
// //   };

// //   /* ================= RENDER ================= */

// //   return (
// //     <div className="min-h-screen bg-[#22222280] flex flex-col">
// //       <Header
// //         totalItems={totalItems}
// //         onCartClick={() => setShowCart(!showCart)}
// //       />

// //       <FloatingWhatsApp
// //         phoneNumber={`+${WHATSAPP_NUMBER}`}
// //         accountName="Punto G"
// //         chatMessage="Hola 👋 ¿en qué te ayudamos?"
// //         avatar="/imagenes/logo.png"
// //       />

// //       {/* PRODUCTOS */}
// //       <main className="flex-1 max-w-7xl mx-auto p-4">
// //         <h1 className="text-4xl text-center text-pink-400 mb-6">
// //           Nuestros Productos
// //         </h1>

// //         <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
// //           {productos.map((p) => (
// //             <div
// //               key={p.id}
// //               className="bg-[#1f1f1f] rounded-xl overflow-hidden border border-white/10 hover:border-pink-500 transition"
// //             >
// //               {/* IMAGEN */}
// //               <img
// //                 src={p.imagen}
// //                 onError={handleImgError}
// //                 className="w-full h-40 sm:h-52 lg:h-64 object-cover"
// //                 alt={p.nombre}
// //               />

// //               {/* INFO */}
// //               <div className="p-3 text-center">
// //                 <h3 className="text-white text-sm sm:text-base font-medium line-clamp-2">
// //                   {p.nombre}
// //                 </h3>

// //                 <p className="text-pink-400 text-lg font-bold mt-1">
// //                   ${p.precio}
// //                 </p>

// //                 <button
// //                   onClick={() => addToCart(p)}
// //                   className="mt-3 w-full py-2 rounded-lg bg-white text-black font-semibold text-sm
// //                      hover:bg-pink-500 hover:text-white transition flex items-center justify-center gap-2"
// //                 >
// //                   <ShoppingCart size={16} />
// //                   Agregar
// //                 </button>
// //               </div>
// //             </div>
// //           ))}
// //         </div>
// //       </main>

// //       {/* ✅ FOOTER */}
// //     </div>
// //   );
// // };

// // export default Cards;

import { useState, useEffect } from "react";
import { ShoppingCart, Plus, Minus, Trash2, X } from "lucide-react";
import { FloatingWhatsApp } from "react-floating-whatsapp";
import Header from "../Header";
import { API_URL } from "@/config";

const Cards = () => {
  /* ===================== FORM ===================== */
  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    direccion: "",
    ciudad: "",
    departamento: "",
    telefono: "",
  });

  /* ===================== STATE ===================== */
  const [cart, setCart] = useState([]);
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCart, setShowCart] = useState(false);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);

  const [departamentos, setDepartamentos] = useState([]);
  const [ciudades, setCiudades] = useState([]);
  const [departamentoId, setDepartamentoId] = useState("");
  const [ciudadId, setCiudadId] = useState("");

  /* ===================== FETCH ===================== */

  useEffect(() => {
    fetch(`${API_URL}/api/departamentos`)
      .then((res) => res.json())
      .then(setDepartamentos)
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (!departamentoId) return;
    fetch(`${API_URL}/api/ciudades/${departamentoId}`)
      .then((res) => res.json())
      .then(setCiudades)
      .catch(console.error);
  }, [departamentoId]);

  useEffect(() => {
    fetch(`${API_URL}/api/productos`)
      .then((res) => res.json())
      .then(setProductos)
      .catch(() => setError("Error al cargar productos"))
      .finally(() => setLoading(false));
  }, []);

  /* ===================== CARRITO ===================== */
  const addToCart = (producto) => {
    const existe = cart.find((p) => p.id === producto.id);
    if (existe) {
      setCart(
        cart.map((p) =>
          p.id === producto.id ? { ...p, quantity: p.quantity + 1 } : p
        )
      );
    } else {
      setCart([...cart, { ...producto, quantity: 1 }]);
    }
  };

  const increaseQuantity = (id) =>
    setCart(
      cart.map((p) => (p.id === id ? { ...p, quantity: p.quantity + 1 } : p))
    );

  const decreaseQuantity = (id) =>
    setCart(
      cart.map((p) =>
        p.id === id && p.quantity > 1 ? { ...p, quantity: p.quantity - 1 } : p
      )
    );

  const removeFromCart = (id) => setCart(cart.filter((p) => p.id !== id));

  const total = cart.reduce((sum, p) => sum + p.precio * p.quantity, 0);

  const totalItems = cart.reduce((sum, p) => sum + p.quantity, 0);

  /* ===================== FORM ===================== */
  const enviarFormulario = async (e) => {
    e.preventDefault();

    if (!cart.length) return alert("El carrito está vacío");

    await fetch(`${API_URL}/api/enviar-formulario`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...formData,
        departamento_id: departamentoId,
        ciudad_id: ciudadId,
        carrito: cart,
      }),
    });

    enviarWhatsApp();
    setCart([]);
    setMostrarFormulario(false);
    setShowCart(false);
  };

  const enviarWhatsApp = () => {
    const mensaje = encodeURIComponent(`
📦 *Nuevo Pedido PuntoG*

👤 ${formData.nombre}
📞 ${formData.telefono}
📍 ${formData.direccion}
🏙 ${formData.ciudad}, ${formData.departamento}

🛒 Productos:
${cart
  .map(
    (p) =>
      `• ${p.nombre} x${p.quantity} = $${(p.precio * p.quantity).toFixed(0)}`
  )
  .join("\n")}

💰 Total: $${total.toFixed(0)}
`);

    window.open(`https://wa.me/573147041149?text=${mensaje}`, "_blank");
  };

  const handleImgError = (e) => {
    e.target.src = "/imagenes/no-image.png";
  };

  /* ===================== RENDER ===================== */
  return (
    <div className="min-h-screen bg-[#22222280]">
      <Header totalItems={totalItems} onCartClick={() => setShowCart(true)} />

      <FloatingWhatsApp
        phoneNumber="+573147041149"
        accountName="Punto G"
        chatMessage="Hola 👋 ¿en qué te ayudamos?"
        avatar="/imagenes/logo.png"
      />

      {/* ===================== CARRITO ===================== */}
      {showCart && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setShowCart(false)}
          />

          <div className="fixed top-0 right-0 h-full w-full md:w-96 bg-white z-50 shadow-xl">
            <div className="flex justify-between p-4 border-b">
              <h2 className="font-bold text-lg flex items-center gap-2">
                <ShoppingCart /> Carrito
              </h2>
              <button onClick={() => setShowCart(false)}>
                <X />
              </button>
            </div>

            <div className="p-4 space-y-4 overflow-y-auto h-[calc(100%-160px)]">
              {cart.map((p) => (
                <div
                  key={p.id}
                  className="flex gap-3 bg-gray-100 p-3 rounded-lg"
                >
                  <img
                    src={p.imagen}
                    onError={handleImgError}
                    className="w-16 h-16 object-cover rounded"
                  />

                  <div className="flex-1">
                    <p className="font-semibold">{p.nombre}</p>
                    <p className="text-pink-500 font-bold">${p.precio}</p>
                  </div>

                  <div className="flex flex-col items-end gap-1">
                    <div className="flex gap-1">
                      <button onClick={() => decreaseQuantity(p.id)}>
                        <Minus size={14} />
                      </button>
                      <span>{p.quantity}</span>
                      <button onClick={() => increaseQuantity(p.id)}>
                        <Plus size={14} />
                      </button>
                    </div>
                    <button
                      onClick={() => removeFromCart(p.id)}
                      className="text-red-500"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {cart.length > 0 && (
              <div className="p-4 border-t">
                <p className="font-bold mb-3">Total: ${total.toFixed(0)}</p>
                <button
                  onClick={() => setMostrarFormulario(true)}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg"
                >
                  Confirmar Entrega
                </button>
              </div>
            )}
          </div>
        </>
      )}

      {/* ===================== MODAL FORM ===================== */}
      {mostrarFormulario && (
        <>
          <div className="fixed inset-0 bg-black/60 z-60" />
          <div className="fixed inset-0 z-70 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto relative">
              <button
                onClick={() => setMostrarFormulario(false)}
                className="absolute top-3 right-3"
              >
                <X />
              </button>

              <h2 className="text-2xl font-bold text-center my-6">
                🚚 Datos de Envío
              </h2>

              <form onSubmit={enviarFormulario} className="space-y-4 px-6 pb-6">
                {[
                  "nombre",
                  "email",
                  "telefono",
                  "direccion",
                  "departamento",
                  "ciudad",
                ].map((campo) => (
                  <input
                    key={campo}
                    required
                    placeholder={campo}
                    value={formData[campo]}
                    onChange={(e) =>
                      setFormData({ ...formData, [campo]: e.target.value })
                    }
                    className="w-full border px-3 py-2 rounded-lg"
                  />
                ))}

                <button
                  type="submit"
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg"
                >
                  Confirmar Pedido ✅
                </button>
              </form>
            </div>
          </div>
        </>
      )}

      {/* ===================== PRODUCTOS ===================== */}
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
              {/* IMAGEN */}
              <div className="relative w-full h-48 sm:h-64 lg:h-72 overflow-hidden">
                <img
                  src={producto.imagen}
                  alt={producto.nombre}
                  onError={handleImgError}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>

              {/* INFO */}
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
                     hover:bg-pink-500 hover:text-white transition flex items-center justify-center gap-2 text-sm sm:text-base"
                >
                  <ShoppingCart size={16} />
                  Agregar
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Cards;
