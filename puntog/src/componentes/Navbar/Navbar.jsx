import React from "react";
import logo from "../../assets/logo.png";

const Navbar = () => {
  return (
    <nav className="w-full h-20 flex items-center border-b border-white/20 px-6 bg-black">
      <img src={logo} alt="Punto G" className="h-12 object-contain" />
    </nav>
  );
};

export default Navbar;
