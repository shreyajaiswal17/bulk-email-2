// import React, { useState } from "react";
// import "./index.css";

// const Navbar = () => {
//   const [isMenuOpen, setIsMenuOpen] = useState(false);

//   const toggleMenu = () => {
//     setIsMenuOpen(!isMenuOpen);
//   };

//   return (
//     <nav className="navbar">
      
//       <button className="menu-toggle" onClick={toggleMenu}>
//         ☰
//       </button>
//       <ul className={isMenuOpen ? "nav-links show" : "nav-links"}>
//         <li><a href="#home">Home</a></li>
//         <li><a href="#about">About</a></li>
//         <li><a href="#home">Services</a></li>
//       </ul>
//     </nav>
//   );
// };

// export default Navbar;

import React, { useState } from "react";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="bg-blue-600 text-white shadow-md">
      <div className="container mx-auto flex justify-between items-center px-4 py-3">
        {/* Logo */}
        <a href="/" className="text-2xl font-bold">
          MegaMailer
        </a>

        {/* Menu Toggle Button (for mobile view) */}
        <button
          className="block lg:hidden text-white text-3xl focus:outline-none"
          onClick={toggleMenu}
        >
          ☰
        </button>

        {/* Navigation Links */}
        <ul
          className={`lg:flex lg:items-center lg:space-x-6 ${
            isMenuOpen
              ? "block mt-3 space-y-3"
              : "hidden"
          }`}
        >
          <li>
            <a
              href="#home"
              className="block text-white hover:text-gray-200 transition duration-200"
            >
              Home
            </a>
          </li>
          <li>
            <a
              href="#about"
              className="block text-white hover:text-gray-200 transition duration-200"
            >
              About
            </a>
          </li>
          <li>
            <a
              href="#services"
              className="block text-white hover:text-gray-200 transition duration-200"
            >
              Services
            </a>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
