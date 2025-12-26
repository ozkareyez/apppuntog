import React from "react";

// const Navbar = () => {
//   return (
//     <>
//       <nav className="h-30 border-b border-[#ffffff40] mb- shadow-neutral-400">
//         <img className="size-30 mx-8" src="public/imagenes/logo.png " alt="" />
//       </nav>
//     </>
//   );
// };

// export default Navbar;

const Navbar = () => {
  return (
    <nav className="h-24 bg-white border-b border-red-500/30 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 h-full flex items-center">
        {/* LOGO */}
        <img
          src="/imagenes/logo.png"
          alt="Punto G"
          className="h-40 object-contain"
        />
      </div>
    </nav>
  );
};

export default Navbar;
