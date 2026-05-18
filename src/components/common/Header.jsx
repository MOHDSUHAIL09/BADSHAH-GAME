import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on window resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768 && isMenuOpen) {
        setIsMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isMenuOpen]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <header className={`header ${isScrolled ? 'scrolled' : ''}`}>
      <div className="container">
        <div className="header-wrapper">
          {/* Logo */}
          <div className="logo">
            <a href="/">
              <span className="logo-icon">🎮</span>
              <span className="logo-text">Game<span>Zone</span></span>
            </a>
          </div>

          {/* Desktop Navigation */}
          <nav className={`nav-menu ${isMenuOpen ? 'active' : ''}`}>
            <ul className="nav-links">
              <li><a href="/" onClick={closeMenu}>Home</a></li>
              <li><a href="/game" onClick={closeMenu}>Games</a></li>
              <li><a href="/about" onClick={closeMenu}>About</a></li>
              <li><a href="/contact" onClick={closeMenu}>Contact</a></li>
            </ul>

            {/* Auth Buttons - Mobile */}
            <div className="auth-buttons-mobile">
              <button onClick={() => { navigate('/login'); closeMenu(); }}>
                Login
              </button>
              <button onClick={() => { navigate('/signup'); closeMenu(); }}>
                Sign Up
              </button>
            </div>
          </nav>

          {/* Desktop Auth Buttons */}
          <div className="auth-buttons desktop">
            <button className="btn-login" onClick={() => navigate('/login')}>
              Login
            </button>
            <button className="btn-signup" onClick={() => navigate('/signup')}>
              Sign Up
            </button>
          </div>

          {/* Mobile Menu Toggle */}
          <button 
            className={`mobile-toggle ${isMenuOpen ? 'active' : ''}`} 
            onClick={toggleMenu}
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;