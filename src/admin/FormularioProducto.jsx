import { useState, useRef, useEffect } from "react";
import {
  Upload,
  X,
  Image as ImageIcon,
  Save,
  Trash2,
  AlertCircle,
  Tag,
  Percent,
  DollarSign,
  Package,
  Type,
  Palette,
  Ruler,
  FileText,
  Check,
} from "lucide-react";

const API_URL = "https://gleaming-motivation-production-4018.up.railway.app";

const initialState = {
  categoria: "",
  nombre: "",
  talla: "",
  color: "",
  precio: "",
  categoria_id: "",
  precio_antes: "",
  descuento: "",
  es_oferta: 0,
  descripcion: "",
};

export default function FormularioProducto() {
  const [form, setForm] = useState(initialState);
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [previews, setPreviews] = useState([]);
  const [subiendoImagenes, setSubiendoImagenes] = useState(false);
  const [uploadedImages, setUploadedImages] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const fileInputRef = useRef(null);
  const [loadingCategorias, setLoadingCategorias] = useState(false);

  // Cargar categorías al montar el componente
  useEffect(() => {
    cargarCategorias();
  }, []);

  const cargarCategorias = async () => {
    try {
      setLoadingCategorias(true);
      const res = await fetch(`${API_URL}/api/categorias`);
      if (!res.ok) throw new Error("Error al cargar categorías");

      const data = await res.json();
      setCategorias(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error cargando categorías:", error);
      setMensaje("❌ Error al cargar categorías");
    } finally {
      setLoadingCategorias(false);
    }
  };

  /* ================= INPUTS ================= */
  const handleChange = (e) => {
    const { name, value, type } = e.target;
    const checked = e.target.checked;

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (checked ? 1 : 0) : value,
    }));

    // Si cambia la categoría, buscar el ID automáticamente
    if (name === "categoria") {
      const categoriaSeleccionada = categorias.find(
        (cat) =>
          cat.nombre.toLowerCase() === value.toLowerCase() ||
          cat.slug === value.toLowerCase(),
      );
      if (categoriaSeleccionada) {
        setForm((prev) => ({
          ...prev,
          categoria_id: categoriaSeleccionada.id.toString(),
        }));
      }
    }
  };

  /* ================= SELECCIÓN DE IMÁGENES ================= */
  const handleFileSelect = (files) => {
    const filesArray = Array.from(files);

    // Validar cantidad máxima
    const remainingSlots = 3 - selectedFiles.length;
    if (remainingSlots === 0) {
      alert("Ya has seleccionado el máximo de 3 imágenes");
      return;
    }

    const filesToAdd = filesArray.slice(0, remainingSlots);

    // Validar tipos de archivo
    const invalidFiles = filesToAdd.filter(
      (file) => !file.type.startsWith("image/"),
    );
    if (invalidFiles.length > 0) {
      alert("Solo se permiten archivos de imagen (JPG, PNG, GIF, WebP)");
      return;
    }

    // Validar tamaño (5MB)
    const maxSize = 5 * 1024 * 1024;
    const oversizedFiles = filesToAdd.filter((file) => file.size > maxSize);
    if (oversizedFiles.length > 0) {
      alert("Algunas imágenes superan el tamaño máximo de 5MB");
      return;
    }

    // Crear previews
    const newPreviews = filesToAdd.map((file) => URL.createObjectURL(file));

    // Actualizar estados
    setSelectedFiles((prev) => [...prev, ...filesToAdd]);
    setPreviews((prev) => [...prev, ...newPreviews]);
  };

  /* ================= SUBIR IMÁGENES A CLOUDINARY ================= */
  const subirImagenesACloudinary = async () => {
    if (selectedFiles.length === 0) return [];

    setSubiendoImagenes(true);
    const nuevasImagenesSubidas = [];

    try {
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        const formData = new FormData();
        formData.append("imagen", file);

        console.log(`📤 Subiendo imagen ${i + 1}/${selectedFiles.length}...`);

        const res = await fetch(`${API_URL}/api/upload-imagen`, {
          method: "POST",
          body: formData,
        });

        if (!res.ok) {
          throw new Error(`Error ${res.status} al subir imagen ${i + 1}`);
        }

        const data = await res.json();

        if (!data.ok) {
          throw new Error(data.message || "Error del servidor");
        }

        console.log(`✅ Imagen ${i + 1} subida:`, data);
        nuevasImagenesSubidas.push({
          url: data.url,
          public_id: data.public_id,
          filename: data.filename,
        });

        // Pequeña pausa entre subidas
        if (i < selectedFiles.length - 1) {
          await new Promise((resolve) => setTimeout(resolve, 500));
        }
      }

      // Agregar nuevas imágenes a las ya subidas
      setUploadedImages((prev) => [...prev, ...nuevasImagenesSubidas]);

      // Limpiar archivos seleccionados después de subir
      setSelectedFiles([]);

      return nuevasImagenesSubidas;
    } catch (error) {
      console.error("❌ Error subiendo imágenes:", error);
      alert(`Error: ${error.message}`);
      return [];
    } finally {
      setSubiendoImagenes(false);
    }
  };

  /* ================= ELIMINAR IMAGEN ================= */
  const removeImage = async (index, isUploaded = false) => {
    if (isUploaded) {
      // Eliminar imagen ya subida a Cloudinary
      const imagen = uploadedImages[index];

      if (imagen.public_id) {
        try {
          // Opcional: eliminar de Cloudinary también
          const res = await fetch(`${API_URL}/api/eliminar-imagen-cloudinary`, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ public_id: imagen.public_id }),
          });

          if (res.ok) {
            console.log(
              `🗑️ Imagen eliminada de Cloudinary: ${imagen.public_id}`,
            );
          }
        } catch (error) {
          console.error("Error eliminando de Cloudinary:", error);
          // Continuamos aunque falle la eliminación de Cloudinary
        }
      }

      // Eliminar del estado
      const newUploadedImages = uploadedImages.filter((_, i) => i !== index);
      setUploadedImages(newUploadedImages);

      // Eliminar preview
      URL.revokeObjectURL(previews[index]);
      setPreviews((prev) => prev.filter((_, i) => i !== index));
    } else {
      // Eliminar imagen seleccionada pero no subida
      const newSelectedFiles = selectedFiles.filter((_, i) => i !== index);
      setSelectedFiles(newSelectedFiles);

      // Revocar URL de preview
      URL.revokeObjectURL(previews[index]);
      setPreviews((prev) => prev.filter((_, i) => i !== index));
    }
  };

  /* ================= VALIDACIÓN ================= */
  const validarFormulario = () => {
    if (uploadedImages.length === 0 && selectedFiles.length === 0) {
      return "Debes subir al menos una imagen";
    }

    if (!form.nombre.trim()) {
      return "El nombre del producto es requerido";
    }

    if (!form.precio || parseFloat(form.precio) <= 0) {
      return "El precio debe ser mayor a 0";
    }

    if (!form.categoria_id) {
      return "Debes seleccionar una categoría válida";
    }

    return null;
  };

  /* ================= SUBMIT ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validar
    const error = validarFormulario();
    if (error) {
      setMensaje(`❌ ${error}`);
      return;
    }

    setLoading(true);
    setMensaje("");

    try {
      // 1. Primero subir las imágenes seleccionadas (si hay)
      let todasLasImagenes = [...uploadedImages];
      if (selectedFiles.length > 0) {
        const nuevasImagenes = await subirImagenesACloudinary();
        todasLasImagenes = [...todasLasImagenes, ...nuevasImagenes];
      }

      if (todasLasImagenes.length === 0) {
        throw new Error("No se pudieron subir las imágenes");
      }

      // 2. Preparar datos para enviar al backend
      const productoData = {
        categoria: form.categoria || null,
        nombre: form.nombre,
        talla: form.talla || null,
        color: form.color || null,
        precio: parseFloat(form.precio),
        categoria_id: parseInt(form.categoria_id),
        precio_antes: form.precio_antes ? parseFloat(form.precio_antes) : null,
        descuento: form.descuento ? parseInt(form.descuento) : null,
        es_oferta: form.es_oferta,
        descripcion: form.descripcion || null,
        imagenes: todasLasImagenes.map((img) => img.url), // Solo las URLs
      };

      console.log("📤 Enviando producto:", productoData);

      // 3. Enviar al backend
      const res = await fetch(`${API_URL}/api/productos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(productoData),
      });

      const data = await res.json();
      console.log("📥 Respuesta:", data);

      if (!res.ok || !data.ok) {
        throw new Error(data.message || `Error ${res.status}`);
      }

      // 4. Éxito
      setMensaje(`✅ Producto creado exitosamente! ID: ${data.producto_id}`);

      // Resetear formulario después de 3 segundos
      setTimeout(() => {
        handleClearForm();
      }, 3000);
    } catch (error) {
      console.error("❌ Error:", error);
      setMensaje(`❌ ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  /* ================= CALCULAR DESCUENTO AUTOMÁTICO ================= */
  useEffect(() => {
    if (form.precio && form.precio_antes) {
      const precioActual = parseFloat(form.precio);
      const precioAnterior = parseFloat(form.precio_antes);

      if (precioAnterior > precioActual) {
        const descuento = Math.round(
          ((precioAnterior - precioActual) / precioAnterior) * 100,
        );
        setForm((prev) => ({ ...prev, descuento: descuento.toString() }));
      }
    }
  }, [form.precio, form.precio_antes]);

  /* ================= DRAG & DROP ================= */
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files);
    }
  };

  /* ================= LIMPIAR FORMULARIO ================= */
  const handleClearForm = () => {
    // Revocar todas las URLs de preview
    previews.forEach((preview) => URL.revokeObjectURL(preview));

    setForm(initialState);
    setPreviews([]);
    setUploadedImages([]);
    setSelectedFiles([]);
    setMensaje("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  /* ================= ESTADÍSTICAS DE IMÁGENES ================= */
  const stats = {
    total: uploadedImages.length + selectedFiles.length,
    subidas: uploadedImages.length,
    pendientes: selectedFiles.length,
    disponibles: 3 - (uploadedImages.length + selectedFiles.length),
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* HEADER */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-3 bg-white px-6 py-3 rounded-full shadow-sm mb-4">
            <Package className="w-6 h-6 text-blue-600" />
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
              Nuevo Producto
            </h1>
          </div>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Agrega un nuevo producto a tu tienda. Puedes subir hasta 3 imágenes
            y marcar como oferta.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* SECCIÓN 1: IMÁGENES */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200">
            <div className="p-6 md:p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <ImageIcon className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">
                      Imágenes del Producto
                    </h3>
                    <p className="text-gray-600 text-sm">
                      Arrastra o selecciona hasta 3 imágenes
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-sm font-medium px-3 py-1 bg-blue-100 text-blue-800 rounded-full">
                    {stats.total} / 3
                  </div>
                  {stats.subidas > 0 && (
                    <div className="text-sm px-3 py-1 bg-green-100 text-green-800 rounded-full flex items-center gap-1">
                      <Check className="w-3 h-3" />
                      {stats.subidas} subidas
                    </div>
                  )}
                </div>
              </div>

              {/* ÁREA DE UPLOAD */}
              <div
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`
                  relative border-3 border-dashed rounded-xl transition-all duration-300
                  ${
                    stats.disponibles > 0
                      ? "border-blue-400 bg-blue-50 hover:border-blue-500 hover:bg-blue-100"
                      : "border-gray-300 bg-gray-50 hover:border-gray-400"
                  }
                  p-8 cursor-pointer group
                `}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => handleFileSelect(e.target.files)}
                  className="hidden"
                  disabled={stats.disponibles === 0 || subiendoImagenes}
                />

                <div className="flex flex-col items-center justify-center py-8">
                  <div className="w-20 h-20 mb-4 rounded-full bg-white border-2 border-blue-200 flex items-center justify-center group-hover:border-blue-300 transition-colors duration-300">
                    <Upload className="w-8 h-8 text-blue-500" />
                  </div>

                  <h4 className="text-lg font-medium text-gray-800 mb-2">
                    {stats.disponibles > 0
                      ? "Haz clic o arrastra imágenes aquí"
                      : "Límite máximo alcanzado"}
                  </h4>

                  <p className="text-gray-600 text-center max-w-md mb-6">
                    {stats.disponibles > 0
                      ? `Puedes agregar ${stats.disponibles} imagen(es) más. Formatos: JPG, PNG, WebP. Max 5MB c/u`
                      : "Ya has seleccionado el máximo de 3 imágenes"}
                  </p>

                  {stats.disponibles > 0 && (
                    <button
                      type="button"
                      className="px-5 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 
                        text-white font-medium rounded-lg hover:from-blue-600 
                        hover:to-blue-700 transition-all duration-300 shadow-sm 
                        hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={subiendoImagenes}
                    >
                      {subiendoImagenes
                        ? "Procesando..."
                        : "Seleccionar imágenes"}
                    </button>
                  )}
                </div>

                {subiendoImagenes && (
                  <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center rounded-xl">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                      <p className="text-gray-700 font-medium">
                        Subiendo imágenes...
                      </p>
                      <p className="text-gray-600 text-sm mt-2">
                        Por favor espera
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* PREVIEW DE IMÁGENES */}
              {previews.length > 0 && (
                <div className="mt-8">
                  <h4 className="text-lg font-medium text-gray-800 mb-4">
                    Vista previa de imágenes
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {previews.map((preview, index) => {
                      const isUploaded = index < uploadedImages.length;

                      return (
                        <div
                          key={index}
                          className="relative group rounded-lg overflow-hidden border border-gray-200 bg-white shadow-sm"
                        >
                          <div className="aspect-square overflow-hidden bg-gray-100">
                            <img
                              src={preview}
                              alt={`Preview ${index + 1}`}
                              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                          </div>

                          {/* INDICADORES */}
                          {index === 0 && (
                            <div className="absolute top-2 left-2 px-2 py-1 bg-blue-600 text-white text-xs font-medium rounded">
                              Principal
                            </div>
                          )}

                          <div className="absolute top-2 right-2 flex gap-2">
                            {isUploaded && (
                              <div className="px-2 py-1 bg-green-500 text-white text-xs font-medium rounded flex items-center gap-1">
                                <Check className="w-3 h-3" />
                                Subida
                              </div>
                            )}

                            <button
                              type="button"
                              onClick={() => removeImage(index, isUploaded)}
                              className="w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-red-600 shadow-md"
                              disabled={subiendoImagenes}
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>

                          <div className="absolute bottom-2 left-2 px-2 py-1 bg-gray-800/70 text-white text-xs rounded">
                            Imagen {index + 1}
                          </div>
                        </div>
                      );
                    })}

                    {/* ESPACIOS VACÍOS */}
                    {Array.from({ length: stats.disponibles }).map(
                      (_, index) => (
                        <div
                          key={`empty-${index}`}
                          className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors duration-200"
                        >
                          <ImageIcon className="w-8 h-8 text-gray-400 mb-2" />
                          <span className="text-gray-500 text-sm">
                            Disponible
                          </span>
                        </div>
                      ),
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* SECCIÓN 2: INFORMACIÓN BÁSICA */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200">
            <div className="p-6 md:p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    Información del Producto
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Completa los detalles básicos del producto
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* NOMBRE */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Type className="inline w-4 h-4 mr-1" />
                    Nombre del producto <span className="text-red-500">*</span>
                  </label>
                  <input
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    name="nombre"
                    value={form.nombre}
                    onChange={handleChange}
                    placeholder="Ej: Conjunto de lencería elegante"
                    required
                  />
                </div>

                {/* CATEGORÍA */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Tag className="inline w-4 h-4 mr-1" />
                    Categoría <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    {loadingCategorias ? (
                      <div className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50">
                        <div className="flex items-center gap-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                          <span className="text-gray-500">
                            Cargando categorías...
                          </span>
                        </div>
                      </div>
                    ) : (
                      <>
                        <input
                          list="categorias-list"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          name="categoria"
                          value={form.categoria}
                          onChange={handleChange}
                          placeholder="Escribe o selecciona una categoría"
                          required
                        />
                        <datalist id="categorias-list">
                          {categorias.map((cat) => (
                            <option key={cat.id} value={cat.nombre} />
                          ))}
                        </datalist>
                      </>
                    )}
                  </div>
                  {form.categoria_id && (
                    <div className="mt-2 text-sm text-green-600 flex items-center gap-1">
                      <Check className="w-4 h-4" />
                      ID Categoría: {form.categoria_id}
                    </div>
                  )}
                </div>

                {/* TALLA */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Ruler className="inline w-4 h-4 mr-1" />
                    Talla
                  </label>
                  <input
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    name="talla"
                    value={form.talla}
                    onChange={handleChange}
                    placeholder="Ej: S, M, L, Única"
                  />
                </div>

                {/* COLOR */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Palette className="inline w-4 h-4 mr-1" />
                    Color
                  </label>
                  <input
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    name="color"
                    value={form.color}
                    onChange={handleChange}
                    placeholder="Ej: Rojo, Negro, Blanco"
                  />
                </div>

                {/* DESCRIPCIÓN */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descripción del producto
                  </label>
                  <textarea
                    name="descripcion"
                    value={form.descripcion}
                    onChange={handleChange}
                    placeholder="Describe las características, materiales, cuidados, etc..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 h-32 resize-none"
                    rows={4}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* SECCIÓN 3: PRECIO Y OFERTA */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200">
            <div className="p-6 md:p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    Precio y Ofertas
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Configura el precio y las promociones del producto
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* PRECIO ACTUAL */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Precio actual <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-3 text-gray-500">
                      $
                    </span>
                    <input
                      className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      type="number"
                      step="0.01"
                      min="0"
                      name="precio"
                      value={form.precio}
                      onChange={handleChange}
                      placeholder="0.00"
                      required
                    />
                  </div>
                </div>

                {/* PRECIO ANTERIOR */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Precio anterior
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-3 text-gray-500">
                      $
                    </span>
                    <input
                      className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      type="number"
                      step="0.01"
                      min="0"
                      name="precio_antes"
                      value={form.precio_antes}
                      onChange={handleChange}
                      placeholder="Precio regular"
                    />
                  </div>
                </div>

                {/* DESCUENTO */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Percent className="inline w-4 h-4 mr-1" />
                    Descuento %
                  </label>
                  <div className="relative">
                    <span className="absolute right-3 top-3 text-gray-500">
                      %
                    </span>
                    <input
                      className="w-full pr-10 pl-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      type="number"
                      min="0"
                      max="100"
                      name="descuento"
                      value={form.descuento}
                      onChange={handleChange}
                      placeholder="0"
                    />
                  </div>
                </div>
              </div>

              {/* CHECKBOX OFERTA */}
              <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                <label className="flex items-center gap-3 cursor-pointer">
                  <div className="relative">
                    <input
                      type="checkbox"
                      name="es_oferta"
                      checked={form.es_oferta === 1}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    <div
                      className={`
                      w-6 h-6 border-2 rounded flex items-center justify-center transition-all duration-200
                      ${
                        form.es_oferta === 1
                          ? "bg-gradient-to-r from-blue-600 to-indigo-600 border-blue-600"
                          : "border-gray-300 bg-white"
                      }
                    `}
                    >
                      {form.es_oferta === 1 && (
                        <Check className="w-4 h-4 text-white" />
                      )}
                    </div>
                  </div>
                  <div className="flex-1">
                    <span className="font-semibold text-gray-900">
                      Marcar como producto en oferta
                    </span>
                    <p className="text-gray-600 text-sm mt-1">
                      Este producto aparecerá en la sección de ofertas y tendrá
                      un badge especial
                    </p>
                  </div>
                  {form.es_oferta === 1 && (
                    <div className="px-3 py-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-bold rounded-full">
                      ¡OFERTA!
                    </div>
                  )}
                </label>
              </div>

              {/* RESUMEN DE PRECIO */}
              {(form.precio_antes || form.descuento) && (
                <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
                  <h4 className="font-medium text-green-800 mb-2">
                    Resumen de precio:
                  </h4>
                  <div className="flex items-center gap-4 text-sm">
                    {form.precio_antes && (
                      <div className="flex items-center gap-2">
                        <span className="text-gray-600">Precio anterior:</span>
                        <span className="line-through text-red-600 font-medium">
                          ${parseFloat(form.precio_antes).toLocaleString()}
                        </span>
                      </div>
                    )}
                    {form.descuento && (
                      <div className="flex items-center gap-2">
                        <span className="text-gray-600">Descuento:</span>
                        <span className="bg-red-100 text-red-700 px-2 py-1 rounded font-bold">
                          {form.descuento}% OFF
                        </span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 ml-auto">
                      <span className="text-gray-600">Precio final:</span>
                      <span className="text-2xl font-bold text-green-700">
                        ${parseFloat(form.precio).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* MENSAJES DE ESTADO */}
          {mensaje && (
            <div
              className={`p-4 rounded-lg flex items-center gap-3 shadow-lg ${
                mensaje.includes("✅")
                  ? "bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200"
                  : "bg-gradient-to-r from-red-50 to-pink-50 border border-red-200"
              }`}
            >
              {mensaje.includes("✅") ? (
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <Check className="w-5 h-5 text-white" />
                </div>
              ) : (
                <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <AlertCircle className="w-5 h-5 text-white" />
                </div>
              )}
              <div className="flex-1">
                <p
                  className={`font-medium ${mensaje.includes("✅") ? "text-green-800" : "text-red-800"}`}
                >
                  {mensaje}
                </p>
                {mensaje.includes("✅") && (
                  <p className="text-green-700 text-sm mt-1">
                    El producto se guardó correctamente. Puedes agregar otro
                    producto.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* BOTONES DE ACCIÓN */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              type="submit"
              disabled={loading || subiendoImagenes || stats.total === 0}
              className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 
                text-white py-4 px-8 rounded-xl font-bold text-lg
                hover:from-blue-700 hover:to-blue-800 transition-all duration-300
                disabled:opacity-50 disabled:cursor-not-allowed
                flex items-center justify-center gap-3 shadow-lg hover:shadow-xl"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                  Guardando producto...
                </>
              ) : (
                <>
                  <Save className="w-6 h-6" />
                  Guardar Producto
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleClearForm}
              className="px-8 py-4 border-2 border-gray-300 text-gray-700 
                rounded-xl font-bold text-lg hover:bg-gray-50 transition-colors 
                duration-200 flex items-center justify-center gap-3"
              disabled={subiendoImagenes}
            >
              <Trash2 className="w-6 h-6" />
              Limpiar Todo
            </button>
          </div>
        </form>

        {/* NOTAS FINALES */}
        <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-white rounded-xl border border-blue-200 flex items-center justify-center flex-shrink-0">
              <AlertCircle className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h4 className="font-bold text-blue-900 text-lg mb-3">
                Información importante sobre el formulario
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <span className="text-blue-800">
                    Los campos marcados con{" "}
                    <span className="text-red-500 font-bold">*</span> son
                    obligatorios
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <span className="text-blue-800">
                    Las imágenes se suben automáticamente a Cloudinary
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <span className="text-blue-800">
                    Máximo 3 imágenes por producto (5MB cada una)
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <span className="text-blue-800">
                    Los productos en oferta aparecen destacados
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <span className="text-blue-800">
                    El descuento se calcula automáticamente si ingresas precio
                    anterior
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <span className="text-blue-800">
                    Las imágenes se almacenan en campos separados
                    (imagen_cloud1, imagen_cloud2, imagen_cloud3)
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// import { useState, useRef } from "react";
// import {
//   Upload,
//   X,
//   Image as ImageIcon,
//   Save,
//   Trash2,
//   AlertCircle,
// } from "lucide-react";

// const API_URL = "https://gleaming-motivation-production-4018.up.railway.app";

// const initialState = {
//   categoria: "",
//   nombre: "",
//   talla: "",
//   color: "",
//   precio: "",
//   imagenes: [], // Array de URLs de Cloudinary
//   categoria_id: "",
//   precio_antes: "",
//   descuento: "",
//   es_oferta: 0,
//   descripcion: "",
// };

// export default function FormularioProducto() {
//   const [form, setForm] = useState(initialState);
//   const [loading, setLoading] = useState(false);
//   const [mensaje, setMensaje] = useState("");
//   const [previews, setPreviews] = useState([]);
//   const [subiendoImagenes, setSubiendoImagenes] = useState(false);
//   const [uploadProgress, setUploadProgress] = useState([]);
//   const fileInputRef = useRef(null);

//   /* ================= INPUTS ================= */
//   const handleChange = (e) => {
//     const { name, value, type } = e.target;
//     const checked = e.target.checked;

//     setForm((prev) => ({
//       ...prev,
//       [name]: type === "checkbox" ? (checked ? 1 : 0) : value,
//     }));
//   };

//   /* ================= SUBIR MÚLTIPLES IMÁGENES ================= */
//   const handleImageUpload = async (files) => {
//     const filesArray = Array.from(files);

//     // Validar cantidad máxima
//     const remainingSlots = 3 - form.imagenes.length; // Cambiado a 3 (máximo de Cloudinary)
//     if (remainingSlots === 0) {
//       alert("Ya has subido el máximo de 3 imágenes");
//       return;
//     }

//     const filesToUpload = filesArray.slice(0, remainingSlots);

//     if (filesToUpload.length === 0) return;

//     // Validar tipos de archivo
//     const invalidFiles = filesToUpload.filter(
//       (file) => !file.type.startsWith("image/"),
//     );
//     if (invalidFiles.length > 0) {
//       alert("Solo se permiten archivos de imagen");
//       return;
//     }

//     // Validar tamaño máximo (5MB por imagen)
//     const maxSize = 5 * 1024 * 1024; // 5MB
//     const oversizedFiles = filesToUpload.filter((file) => file.size > maxSize);
//     if (oversizedFiles.length > 0) {
//       alert("Algunas imágenes superan el tamaño máximo de 5MB");
//       return;
//     }

//     try {
//       setSubiendoImagenes(true);
//       setUploadProgress(new Array(filesToUpload.length).fill(0));

//       // Crear previews locales
//       const newPreviews = filesToUpload.map((file) =>
//         URL.createObjectURL(file),
//       );

//       // Crear FormData para múltiples imágenes
//       const formData = new FormData();
//       filesToUpload.forEach((file, index) => {
//         formData.append("imagenes", file); // Nombre importante: "imagenes" (plural)
//       });

//       console.log(
//         "📤 Enviando",
//         filesToUpload.length,
//         "imágenes al servidor...",
//       );

//       try {
//         const res = await fetch(`${API_URL}/api/upload-imagenes`, {
//           method: "POST",
//           body: formData,
//           // NOTA: No establecer Content-Type header, fetch lo hará automáticamente con FormData
//         });

//         console.log("📥 Respuesta recibida, status:", res.status);

//         if (!res.ok) {
//           const contentType = res.headers.get("content-type");
//           let errorMessage = `Error ${res.status} al subir imágenes`;

//           if (contentType && contentType.includes("application/json")) {
//             const errorData = await res.json();
//             errorMessage = errorData.message || errorMessage;
//           } else {
//             const text = await res.text();
//             console.error("❌ Respuesta no es JSON:", text.substring(0, 500));
//             errorMessage = "El servidor respondió con un error inesperado";
//           }

//           throw new Error(errorMessage);
//         }

//         const data = await res.json();
//         console.log("✅ Respuesta del servidor:", data);

//         if (!data.ok) {
//           throw new Error(data.message || "Error del servidor");
//         }

//         if (!data.imagenes || !Array.isArray(data.imagenes)) {
//           throw new Error("Formato de respuesta inválido del servidor");
//         }

//         // Obtener URLs de las imágenes subidas
//         const uploadedUrls = data.imagenes.map((img) => img.url);

//         // Actualizar estado con nuevas imágenes
//         if (uploadedUrls.length > 0) {
//           setForm((prev) => ({
//             ...prev,
//             imagenes: [...prev.imagenes, ...uploadedUrls],
//           }));
//           setPreviews((prev) => [...prev, ...newPreviews]);
//         }

//         console.log(`✅ ${uploadedUrls.length} imágenes subidas exitosamente`);
//       } catch (error) {
//         console.error("❌ Error subiendo imágenes:", error);
//         alert(`Error al subir imágenes: ${error.message}`);
//       }
//     } catch (error) {
//       console.error("❌ Error en upload:", error);
//       alert("Error al procesar las imágenes");
//     } finally {
//       setSubiendoImagenes(false);
//       setUploadProgress([]);

//       // Limpiar input
//       if (fileInputRef.current) {
//         fileInputRef.current.value = "";
//       }

//       // Limpiar previews locales después de un tiempo
//       setTimeout(() => {
//         newPreviews.forEach((url) => URL.revokeObjectURL(url));
//       }, 1000);
//     }
//   };

//   /* ================= ELIMINAR IMAGEN ================= */
//   const removeImage = (index) => {
//     // Revocar URL de preview para liberar memoria
//     URL.revokeObjectURL(previews[index]);

//     setForm((prev) => ({
//       ...prev,
//       imagenes: prev.imagenes.filter((_, i) => i !== index),
//     }));

//     setPreviews((prev) => prev.filter((_, i) => i !== index));
//   };

//   /* ================= DRAG & DROP ================= */
//   const handleDragOver = (e) => {
//     e.preventDefault();
//     e.stopPropagation();
//   };

//   const handleDrop = (e) => {
//     e.preventDefault();
//     e.stopPropagation();

//     if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
//       handleImageUpload(e.dataTransfer.files);
//     }
//   };

//   /* ================= SUBMIT ================= */
//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setMensaje("");

//     // Validaciones
//     if (form.imagenes.length === 0) {
//       setMensaje("❌ Debes subir al menos una imagen");
//       setLoading(false);
//       return;
//     }

//     if (
//       !form.nombre.trim() ||
//       !form.precio.trim() ||
//       !form.categoria_id.trim()
//     ) {
//       setMensaje("❌ Completa los campos requeridos");
//       setLoading(false);
//       return;
//     }

//     try {
//       const res = await fetch(`${API_URL}/api/productos`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           ...form,
//           // Asegurar compatibilidad con backend si espera 'imagen' singular
//           imagen: form.imagenes[0], // Primera imagen como principal
//         }),
//       });

//       const data = await res.json();

//       if (!res.ok) {
//         throw new Error(data.message || "Error al guardar producto");
//       }

//       setMensaje("✅ Producto guardado correctamente");
//       setForm(initialState);
//       setPreviews([]);

//       // Limpiar mensaje después de 5 segundos
//       setTimeout(() => setMensaje(""), 5000);
//     } catch (error) {
//       console.error("❌ Error guardando producto:", error);
//       setMensaje("❌ " + error.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   /* ================= SELECTOR DE ARCHIVOS ================= */
//   const handleFileInput = (e) => {
//     if (e.target.files && e.target.files.length > 0) {
//       handleImageUpload(e.target.files);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-8">
//       <div className="max-w-6xl mx-auto">
//         <div className="mb-8 text-center">
//           <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
//             Nuevo Producto
//           </h1>
//           <p className="text-gray-600 max-w-2xl mx-auto">
//             Completa todos los campos para agregar un nuevo producto al catálogo
//           </p>
//         </div>

//         <form
//           onSubmit={handleSubmit}
//           className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200"
//         >
//           <div className="p-6 md:p-8">
//             {/* ================= SECCIÓN IMÁGENES ================= */}
//             <div className="mb-10">
//               <div className="flex items-center justify-between mb-6">
//                 <div>
//                   <h3 className="text-xl font-semibold text-gray-900">
//                     Imágenes del producto
//                   </h3>
//                   <p className="text-gray-600 text-sm">
//                     Puedes subir hasta 4 imágenes. La primera será la principal
//                   </p>
//                 </div>
//                 <div className="text-sm font-medium px-3 py-1 bg-blue-100 text-blue-800 rounded-full">
//                   {form.imagenes.length} / 4
//                 </div>
//               </div>

//               {/* Área de upload */}
//               <div
//                 onDragOver={handleDragOver}
//                 onDrop={handleDrop}
//                 onClick={() => fileInputRef.current?.click()}
//                 className={`
//                   relative border-3 border-dashed rounded-xl transition-all duration-300
//                   ${
//                     form.imagenes.length > 0
//                       ? "border-gray-300 hover:border-gray-400"
//                       : "border-blue-400 bg-blue-50 hover:border-blue-500 hover:bg-blue-100"
//                   }
//                   p-8 cursor-pointer group
//                 `}
//               >
//                 <input
//                   ref={fileInputRef}
//                   type="file"
//                   accept="image/*"
//                   multiple
//                   onChange={handleFileInput}
//                   className="hidden"
//                   id="imagenes"
//                 />

//                 <div className="flex flex-col items-center justify-center py-6">
//                   <div
//                     className="w-16 h-16 mb-4 rounded-full bg-white border-2 border-blue-200
//                     flex items-center justify-center group-hover:border-blue-300
//                     transition-colors duration-300"
//                   >
//                     <Upload className="w-8 h-8 text-blue-500" />
//                   </div>

//                   <h4 className="text-lg font-medium text-gray-800 mb-2">
//                     {form.imagenes.length > 0
//                       ? "Haz clic para agregar más imágenes"
//                       : "Arrastra y suelta imágenes aquí"}
//                   </h4>

//                   <p className="text-gray-600 text-center max-w-md mb-4">
//                     {form.imagenes.length > 0
//                       ? `Puedes agregar ${
//                           4 - form.imagenes.length
//                         } imagen(es) más`
//                       : "Formatos: JPG, PNG, WebP. Tamaño máximo: 5MB por imagen"}
//                   </p>

//                   <button
//                     type="button"
//                     className="px-5 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600
//                       text-white font-medium rounded-lg hover:from-blue-600
//                       hover:to-blue-700 transition-all duration-300 shadow-sm
//                       hover:shadow-md"
//                   >
//                     Seleccionar archivos
//                   </button>
//                 </div>

//                 {subiendoImagenes && (
//                   <div
//                     className="absolute inset-0 bg-white/80 backdrop-blur-sm
//                     flex items-center justify-center rounded-xl"
//                   >
//                     <div className="text-center">
//                       <div
//                         className="animate-spin rounded-full h-12 w-12 border-b-2
//                         border-blue-500 mx-auto mb-4"
//                       ></div>
//                       <p className="text-gray-700 font-medium">
//                         Subiendo imágenes...
//                       </p>
//                       <p className="text-gray-600 text-sm mt-2">
//                         No cierres esta ventana
//                       </p>
//                     </div>
//                   </div>
//                 )}
//               </div>

//               {/* Grid de previews */}
//               {previews.length > 0 && (
//                 <div className="mt-8">
//                   <h4 className="text-lg font-medium text-gray-800 mb-4">
//                     Vista previa ({previews.length} imágenes)
//                   </h4>

//                   <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//                     {previews.map((preview, index) => (
//                       <div
//                         key={index}
//                         className="relative group rounded-lg overflow-hidden
//                           border border-gray-200 bg-white shadow-sm"
//                       >
//                         <div className="aspect-square overflow-hidden bg-gray-100">
//                           <img
//                             src={preview}
//                             alt={`Preview ${index + 1}`}
//                             className="w-full h-full object-cover transition-transform
//                               duration-300 group-hover:scale-105"
//                           />
//                         </div>

//                         {/* Indicador de imagen principal */}
//                         {index === 0 && (
//                           <div
//                             className="absolute top-2 left-2 px-2 py-1
//                             bg-blue-600 text-white text-xs font-medium rounded"
//                           >
//                             Principal
//                           </div>
//                         )}

//                         {/* Botón eliminar */}
//                         <button
//                           type="button"
//                           onClick={(e) => {
//                             e.stopPropagation();
//                             removeImage(index);
//                           }}
//                           className="absolute top-2 right-2 w-8 h-8 bg-red-500
//                             text-white rounded-full flex items-center justify-center
//                             opacity-0 group-hover:opacity-100 transition-all duration-300
//                             hover:bg-red-600 shadow-md"
//                         >
//                           <X className="w-4 h-4" />
//                         </button>

//                         {/* Número de imagen */}
//                         <div
//                           className="absolute bottom-2 left-2 w-6 h-6
//                           bg-gray-800/70 text-white text-xs rounded-full
//                           flex items-center justify-center font-medium"
//                         >
//                           {index + 1}
//                         </div>
//                       </div>
//                     ))}

//                     {/* Espacios vacíos */}
//                     {Array.from({ length: 4 - previews.length }).map(
//                       (_, index) => (
//                         <div
//                           key={`empty-${index}`}
//                           className="aspect-square border-2 border-dashed border-gray-300
//                           rounded-lg flex flex-col items-center justify-center
//                           bg-gray-50 hover:bg-gray-100 transition-colors duration-200"
//                         >
//                           <ImageIcon className="w-8 h-8 text-gray-400 mb-2" />
//                           <span className="text-gray-500 text-sm">
//                             Disponible
//                           </span>
//                         </div>
//                       ),
//                     )}
//                   </div>
//                 </div>
//               )}
//             </div>

//             {/* ================= INFORMACIÓN DEL PRODUCTO ================= */}
//             <div className="mb-8">
//               <h3 className="text-xl font-semibold text-gray-900 mb-6">
//                 Información del producto
//               </h3>

//               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     Categoría <span className="text-red-500">*</span>
//                   </label>
//                   <input
//                     className="w-full px-4 py-3 border border-gray-300 rounded-lg
//                       focus:ring-2 focus:ring-blue-500 focus:border-blue-500
//                       transition-all duration-200"
//                     name="categoria"
//                     value={form.categoria}
//                     onChange={handleChange}
//                     placeholder="Categoría"
//                     required
//                   />
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     Nombre del producto <span className="text-red-500">*</span>
//                   </label>
//                   <input
//                     className="w-full px-4 py-3 border border-gray-300 rounded-lg
//                       focus:ring-2 focus:ring-blue-500 focus:border-blue-500
//                       transition-all duration-200"
//                     name="nombre"
//                     value={form.nombre}
//                     onChange={handleChange}
//                     placeholder="Nombre del producto"
//                     required
//                   />
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     Talla
//                   </label>
//                   <input
//                     className="w-full px-4 py-3 border border-gray-300 rounded-lg
//                       focus:ring-2 focus:ring-blue-500 focus:border-blue-500
//                       transition-all duration-200"
//                     name="talla"
//                     value={form.talla}
//                     onChange={handleChange}
//                     placeholder="Talla"
//                   />
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     Color
//                   </label>
//                   <input
//                     className="w-full px-4 py-3 border border-gray-300 rounded-lg
//                       focus:ring-2 focus:ring-blue-500 focus:border-blue-500
//                       transition-all duration-200"
//                     name="color"
//                     value={form.color}
//                     onChange={handleChange}
//                     placeholder="Color"
//                   />
//                 </div>

//                 {/* Campos de precios */}
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     Precio <span className="text-red-500">*</span>
//                   </label>
//                   <div className="relative">
//                     <span className="absolute left-3 top-3 text-gray-500">
//                       $
//                     </span>
//                     <input
//                       className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg
//                         focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                       type="number"
//                       step="0.01"
//                       min="0"
//                       name="precio"
//                       value={form.precio}
//                       onChange={handleChange}
//                       placeholder="0.00"
//                       required
//                     />
//                   </div>
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     Precio anterior
//                   </label>
//                   <div className="relative">
//                     <span className="absolute left-3 top-3 text-gray-500">
//                       $
//                     </span>
//                     <input
//                       className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg
//                         focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                       type="number"
//                       step="0.01"
//                       min="0"
//                       name="precio_antes"
//                       value={form.precio_antes}
//                       onChange={handleChange}
//                       placeholder="Precio regular"
//                     />
//                   </div>
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     Descuento %
//                   </label>
//                   <div className="relative">
//                     <span className="absolute right-3 top-3 text-gray-500">
//                       %
//                     </span>
//                     <input
//                       className="w-full pr-10 pl-4 py-3 border border-gray-300 rounded-lg
//                         focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                       type="number"
//                       min="0"
//                       max="100"
//                       name="descuento"
//                       value={form.descuento}
//                       onChange={handleChange}
//                       placeholder="0"
//                     />
//                   </div>
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     ID Categoría <span className="text-red-500">*</span>
//                   </label>
//                   <input
//                     className="w-full px-4 py-3 border border-gray-300 rounded-lg
//                       focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                     type="number"
//                     name="categoria_id"
//                     value={form.categoria_id}
//                     onChange={handleChange}
//                     placeholder="Ej: 1, 2, 3..."
//                     required
//                   />
//                 </div>
//               </div>
//             </div>

//             {/* ================= DESCRIPCIÓN ================= */}
//             <div className="mb-8">
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Descripción del producto
//               </label>
//               <textarea
//                 name="descripcion"
//                 value={form.descripcion}
//                 onChange={handleChange}
//                 placeholder="Describe las características, beneficios y detalles del producto..."
//                 className="w-full px-4 py-3 border border-gray-300 rounded-lg
//                   focus:ring-2 focus:ring-blue-500 focus:border-blue-500
//                   transition-all duration-200 h-32 resize-none"
//                 rows={4}
//               />
//             </div>

//             {/* ================= CHECKBOX OFERTA ================= */}
//             <div className="mb-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
//               <label className="flex items-center gap-3 text-gray-700 cursor-pointer">
//                 <div className="relative">
//                   <input
//                     type="checkbox"
//                     name="es_oferta"
//                     checked={form.es_oferta === 1}
//                     onChange={handleChange}
//                     className="sr-only"
//                     id="oferta-checkbox"
//                   />
//                   <div
//                     className={`
//                     w-5 h-5 border-2 rounded flex items-center justify-center
//                     ${
//                       form.es_oferta === 1
//                         ? "bg-blue-500 border-blue-500"
//                         : "border-gray-300"
//                     }
//                   `}
//                   >
//                     {form.es_oferta === 1 && (
//                       <svg
//                         className="w-3 h-3 text-white"
//                         fill="none"
//                         viewBox="0 0 24 24"
//                         stroke="currentColor"
//                       >
//                         <path
//                           strokeLinecap="round"
//                           strokeLinejoin="round"
//                           strokeWidth={3}
//                           d="M5 13l4 4L19 7"
//                         />
//                       </svg>
//                     )}
//                   </div>
//                 </div>
//                 <span className="font-medium">
//                   Marcar como producto en oferta
//                 </span>
//               </label>
//               <p className="text-gray-600 text-sm mt-2 ml-8">
//                 Los productos en oferta aparecerán destacados en la tienda
//               </p>
//             </div>

//             {/* ================= MENSAJES ================= */}
//             {mensaje && (
//               <div
//                 className={`mb-6 p-4 rounded-lg flex items-start gap-3
//                 ${
//                   mensaje.includes("✅")
//                     ? "bg-green-50 text-green-800 border border-green-200"
//                     : "bg-red-50 text-red-800 border border-red-200"
//                 }`}
//               >
//                 {mensaje.includes("✅") ? (
//                   <svg
//                     className="w-5 h-5 mt-0.5 flex-shrink-0"
//                     fill="currentColor"
//                     viewBox="0 0 20 20"
//                   >
//                     <path
//                       fillRule="evenodd"
//                       d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
//                       clipRule="evenodd"
//                     />
//                   </svg>
//                 ) : (
//                   <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
//                 )}
//                 <span className="font-medium">{mensaje}</span>
//               </div>
//             )}

//             {/* ================= BOTONES ================= */}
//             <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
//               <button
//                 type="submit"
//                 disabled={loading || subiendoImagenes}
//                 className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700
//                   text-white py-3.5 px-6 rounded-lg font-semibold
//                   hover:from-blue-700 hover:to-blue-800 transition-all duration-300
//                   disabled:opacity-50 disabled:cursor-not-allowed
//                   flex items-center justify-center gap-3 shadow-md hover:shadow-lg"
//               >
//                 {loading ? (
//                   <>
//                     <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
//                     Guardando producto...
//                   </>
//                 ) : (
//                   <>
//                     <Save className="w-5 h-5" />
//                     Guardar producto
//                   </>
//                 )}
//               </button>

//               <button
//                 type="button"
//                 onClick={() => {
//                   setForm(initialState);
//                   setPreviews([]);
//                   setMensaje("");
//                 }}
//                 className="px-6 py-3.5 border border-gray-300 text-gray-700
//                   rounded-lg font-medium hover:bg-gray-50 transition-colors
//                   duration-200 flex items-center justify-center gap-3"
//               >
//                 <Trash2 className="w-5 h-5" />
//                 Limpiar formulario
//               </button>
//             </div>
//           </div>
//         </form>

//         {/* ================= NOTAS ================= */}
//         <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
//           <div className="flex items-start gap-3">
//             <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
//             <div>
//               <h4 className="font-medium text-blue-800 mb-2">
//                 Información importante
//               </h4>
//               <ul className="text-blue-700 text-sm space-y-1">
//                 <li>
//                   • Los campos marcados con{" "}
//                   <span className="text-red-500">*</span> son obligatorios
//                 </li>
//                 <li>• Las imágenes se suben a Cloudinary automáticamente</li>
//                 <li>
//                   • El producto se guardará en la base de datos después de
//                   enviar
//                 </li>
//                 <li>• Puedes subir hasta 4 imágenes por producto</li>
//               </ul>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }
