// src/componentes/Navbar/Navbar.jsx

// import logo from "../../assets/logo.png"; // Asegúrate que el archivo esté en src/assets/logo.png

const Navbar = () => {
  return (
    <nav className="w-full bg-white shadow-md flex items-center justify-between px-6 py-4">
      {/* Logo */}
      <div className="flex items-center">
        {/* <img src={logo} alt="Logo" className="h-10 w-auto mr-3" /> */}
        <span className="text-xl font-bold text-gray-800">PuntoG</span>
      </div>

      {/* Menú */}
      <ul className="flex space-x-6">
        <li>
          <a href="/" className="text-gray-700 hover:text-blue-600">
            Inicio
          </a>
        </li>
        <li>
          <a href="/productos" className="text-gray-700 hover:text-blue-600">
            Productos
          </a>
        </li>
        <li>
          <a href="/contacto" className="text-gray-700 hover:text-blue-600">
            Contacto
          </a>
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;
