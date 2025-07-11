import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/Navbar.css';

const Navbar = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.body.classList.toggle('dark-mode');
  };

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <nav className="navbar">
      <div className="logo">ProfDraftify</div>
      <div className="hamburger" onClick={toggleMenu}>
        ☰
      </div>
      <ul className={`nav-links ${isOpen ? 'open' : ''}`}>
        <li>
          <Link to="/" onClick={() => setIsOpen(false)}>Home</Link>
        </li>
        <li>
          <Link to="/generate" onClick={() => setIsOpen(false)}>Generate Mail</Link>
        </li>
        <li>
          <Link to="/check" onClick={() => setIsOpen(false)}>Check Grammar</Link>
        </li>
        <li>
          <button className="toggle-button" onClick={toggleDarkMode}>
            {isDarkMode ? '☀' : '🌙'}
          </button>
        </li>
        <li>
          <Link to="/about" onClick={() => setIsOpen(false)}>About</Link>
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;
