import React, { useState, useEffect } from 'react';
import { IoMdLogOut } from 'react-icons/io';
import { MdMessage } from 'react-icons/md';

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);

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

  return (

    <div 
      className={`header01 ${isScrolled ? 'scrolled01' : ''}`}
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        transition: 'background 0.3s ease, box-shadow 0.3s ease',
      }}
    >
      <div className="container">
        <div className=" d-flex justify-content-between align-items-center px-3 py-3">
          {/* Logo - fixed white color, no change */}
          <div 
            className="text-logo fw-bold fs-4"
          >
            BADSHAH
          </div>

         {/* <ul>
          <li>home</li>
          <li>team</li>
          <li></li>
         </ul>
           */}
          <div className="d-flex gap-2">
            {/* Notification Button - fixed style, no color change */}
            <button 
              className="btn position-relative d-flex align-items-center gap-1"
              style={{
                background: 'rgba(255,255,255,0.15)',
                border: '1px solid rgba(255,255,255,0.3)',
                color: '#ffffff',
                borderRadius: '30px',
                padding: '5px 12px'
              }}
              onClick={() => console.log('Notifications')}
            >
              <MdMessage />
              <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                3
              </span>
            </button>
            
            {/* Logout Button - fixed style */}
            <button 
              className="btn d-flex align-items-center gap-1"
              style={{
                background: 'rgba(255,255,255,0.15)',
                border: '1px solid rgba(255,255,255,0.3)',
                color: '#ffffff',
                borderRadius: '30px',
                padding: '5px 12px'
              }}
              onClick={() => console.log('Logout')}
            >
              <IoMdLogOut />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;