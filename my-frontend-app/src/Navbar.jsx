import React, { useState } from "react";
import "./index.css";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="navbar">
      {/* <a href="/" className="logo">Sendyy</a> */}
      <button className="menu-toggle" onClick={toggleMenu}>
        ☰
      </button>
      <ul className={isMenuOpen ? "nav-links show" : "nav-links"}>
        <li><a href="#home">Home</a></li>
        <li><a href="#about">About</a></li>
        <li><a href="#home">Services</a></li>
      </ul>
    </nav>
  );
};

export default Navbar;
