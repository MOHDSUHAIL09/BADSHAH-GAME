import React, { useState, useEffect } from 'react';


const Home= () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="gaming-hero">
      {/* Animated Background */}
      <div className="hero-bg">
        <div className="gradient-orb" style={{ 
          transform: `translate(${mousePosition.x * 0.02}px, ${mousePosition.y * 0.02}px)`
        }}></div>
        <div className="gradient-orb2" style={{ 
          transform: `translate(${-mousePosition.x * 0.01}px, ${-mousePosition.y * 0.01}px)`
        }}></div>
        <div className="grid-pattern"></div>
      </div>

      {/* Floating Particles */}
      <div className="particles">
        {[...Array(20)].map((_, i) => (
          <div key={i} className="particle" style={{
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 5}s`,
            animationDuration: `${3 + Math.random() * 4}s`
          }}></div>
        ))}
      </div>

      {/* Main Content */}
      <div className="hero-content">
        <div className="container">
          {/* Badge */}
          <div className="hero-badge">
            <span className="badge-glow">🎮 NEXT-GEN GAMING</span>
          </div>

          {/* Title */}
          <h1 className="hero-title">
            <span className="title-line">LEVEL UP YOUR</span>
            <span className="title-gradient">GAMING EXPERIENCE</span>
          </h1>

          {/* Description */}
          <p className="hero-description">
            Join millions of gamers worldwide. Experience ultra-fast gameplay, 
            exclusive rewards, and a thriving community. The future of gaming is here.
          </p>

          {/* CTA Buttons */}
          <div className="hero-buttons">
            <button className="btn-primary">
              <span>PLAY NOW</span>
              <i className="fas fa-gamepad"></i>
            </button>
            <button className="btn-secondary">
              <span>WATCH TRAILER</span>
              <i className="fas fa-play"></i>
            </button>
          </div>

          {/* Stats */}
          <div className="hero-stats">
            <div className="stat-item">
              <div className="stat-number">1M+</div>
              <div className="stat-label">Active Players</div>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <div className="stat-number">500+</div>
              <div className="stat-label">Games Available</div>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <div className="stat-number">24/7</div>
              <div className="stat-label">Support</div>
            </div>
          </div>

          {/* Scroll Indicator */}
          <div className="scroll-indicator">
            <span>SCROLL DOWN</span>
            <div className="mouse">
              <div className="wheel"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Gaming Characters Floating */}
      <div className="floating-characters">
        <div className="character" style={{ animationDelay: '0s' }}>🎯</div>
        <div className="character" style={{ animationDelay: '1s' }}>🎮</div>
        <div className="character" style={{ animationDelay: '2s' }}>⚡</div>
        <div className="character" style={{ animationDelay: '0.5s' }}>🏆</div>
        <div className="character" style={{ animationDelay: '1.5s' }}>🔥</div>
      </div>
    </div>
  );
};

export default Home;