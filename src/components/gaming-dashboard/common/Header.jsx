import React, { useState, useEffect } from 'react';
import { IoMdLogOut, IoMdNotifications, IoMdPerson, IoMdHelp, IoMdLock, IoMdMenu, IoMdClose } from 'react-icons/io';
import { MdMessage, MdDashboard, MdShare, MdPeople, MdAccountBalanceWallet } from 'react-icons/md';
import { Link, useNavigate } from 'react-router-dom';

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeMenu, setActiveMenu] = useState('Dashboard');
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [mobileProfileDropdownOpen, setMobileProfileDropdownOpen] = useState(false); // Separate state for mobile
  const [notificationDropdownOpen, setNotificationDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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

  // Close mobile menu when window resizes to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768 && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [mobileMenuOpen]);

  const menuItems = ['Dashboard', 'Referral Team', 'Add Funds'];

  // User data (you can replace with your actual user context)
  const userName = "John Doe";
  const userEmail = "john.doe@example.com";
  const loginid = "JOHN123";
  const userProfileImage = "https://bootstrapdemos.adminmart.com/modernize/dist/assets/images/profile/user-1.jpg";

  const handleLogout = () => {
    console.log('Logout clicked');
    navigate('/');
    setMobileMenuOpen(false);
    setMobileProfileDropdownOpen(false);
  };

  return (
    <>
      {/* Main Header */}
      <div 
        className={`header01 ${isScrolled ? 'scrolled01' : ''}`}
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 1000,
          transition: 'all 0.3s ease',
          background: isScrolled ,
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
        }}
      >
        <div className="container">
          <div className="d-flex justify-content-between align-items-center px-3 py-2">
            {/* Logo */}
            <div 
              className="text-logo fw-bold fs-3"
              style={{ 
                color: '#ffffff', 
                cursor: 'pointer',
                background: 'linear-gradient(135deg, #fff 0%, #ccc 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
              onClick={() => navigate('/')}
            >
              BADSHAH
            </div>

            {/* Desktop Navigation Menu */}
            <ul 
              className="d-none d-md-flex gap-2 mb-0"
              style={{
                listStyle: 'none',
                margin: 0,
                padding: 0,
              }}
            >
              {menuItems.map((item) => (
                <li key={item}>
                  <button
                    onClick={() => setActiveMenu(item)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: activeMenu === item ? '#ffffff' : 'rgba(255,255,255,0.7)',
                      fontSize: '15px',
                      fontWeight: activeMenu === item ? '600' : '400',
                      padding: '8px 20px',
                      borderRadius: '30px',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      position: 'relative',
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.color = '#ffffff';
                    }}
                    onMouseLeave={(e) => {
                      if (activeMenu !== item) {
                        e.target.style.color = 'rgba(255,255,255,0.7)';
                      }
                    }}
                  >
                    {item}
                    {activeMenu === item && (
                      <span
                        style={{
                          position: 'absolute',
                          bottom: '-2px',
                          left: '50%',
                          transform: 'translateX(-50%)',
                          width: '40px',
                          height: '2px',
                          backgroundColor: '#ffffff',
                          borderRadius: '2px',
                        }}
                      />
                    )}
                  </button>
                </li>
              ))}
            </ul>
            
            {/* Right Side Buttons */}
            <div className="d-flex gap-2 align-items-center">
              {/* Mobile Menu Button */}
              <button 
                className="d-md-none btn"
                style={{
                  background: 'rgba(255,255,255,0.1)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '30px',
                  padding: '8px 12px',
                  color: '#ffffff',
                }}
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <IoMdClose size={20} /> : <IoMdMenu size={20} />}
              </button>

              {/* Notification Dropdown */}
              <div className="position-relative">
                <button 
                  className="btn position-relative d-flex align-items-center gap-1"
                  style={{
                    background: 'rgba(255,255,255,0.1)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    color: '#ffffff',
                    borderRadius: '30px',
                    padding: '8px 12px',
                    transition: 'all 0.3s ease',
                  }}
                  onClick={() => setNotificationDropdownOpen(!notificationDropdownOpen)}
                >
                  <IoMdNotifications size={18} />
                  <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style={{ fontSize: '10px' }}>
                    3
                  </span>
                </button>

                {/* Notification Dropdown Menu */}
                {notificationDropdownOpen && (
                  <>
                    <div 
                      className="position-fixed inset-0" 
                      style={{ top: 0, left: 0, right: 0, bottom: 0, zIndex: 999 }}
                      onClick={() => setNotificationDropdownOpen(false)}
                    />
                    <div 
                      className="dropdown-menu show"
                      style={{
                        position: 'absolute',
                        top: '100%',
                        right: 0,
                        width: '320px',
                        marginTop: '10px',
                        background: 'rgba(0,0,0,0.95)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '12px',
                        boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
                        zIndex: 1000,
                      }}
                    >
                      <div className="py-3 px-4 border-bottom" style={{ borderBottomColor: 'rgba(255,255,255,0.1)' }}>
                        <h5 className="mb-0" style={{ color: '#ffffff', fontSize: '16px', fontWeight: '600' }}>Notifications</h5>
                      </div>
                      <div className="message-body">
                        <div className="py-3 px-4 d-flex align-items-center" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                          <span className="d-flex align-items-center justify-content-center rounded-1 p-2" style={{ background: 'rgba(255,255,255,0.1)' }}>
                            <MdMessage color="#ffffff" size={18} />
                          </span>
                          <div className="w-100 ps-3">
                            <h6 className="mb-1" style={{ color: '#ffffff', fontSize: '13px', fontWeight: '500' }}>New message received</h6>
                            <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px' }}>2 min ago</span>
                          </div>
                        </div>
                        <div className="py-3 px-4 d-flex align-items-center">
                          <span className="d-flex align-items-center justify-content-center rounded-1 p-2" style={{ background: 'rgba(255,255,255,0.1)' }}>
                            <IoMdNotifications color="#ffffff" size={18} />
                          </span>
                          <div className="w-100 ps-3">
                            <h6 className="mb-1" style={{ color: '#ffffff', fontSize: '13px', fontWeight: '500' }}>Welcome to BADSHAH!</h6>
                            <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px' }}>1 hour ago</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Profile Dropdown - Desktop */}
              <div className="position-relative d-none d-md-block">
                <button 
                  className="btn d-flex align-items-center gap-2"
                  style={{
                    background: 'rgba(255,255,255,0.1)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '30px',
                    padding: '5px 12px 5px 8px',
                    transition: 'all 0.3s ease',
                  }}
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                >
                  <img
                    src={userProfileImage}
                    className="rounded-circle"
                    width="30"
                    height="30"
                    alt="profile"
                    style={{ objectFit: 'cover' }}
                  />
                  <span style={{ color: '#ffffff', fontSize: '14px', fontWeight: '500' }}>{userName.split(' ')[0]}</span>
                </button>

                {/* Profile Dropdown Menu */}
                {profileDropdownOpen && (
                  <>
                    <div 
                      className="position-fixed inset-0" 
                      style={{ top: 0, left: 0, right: 0, bottom: 0, zIndex: 999 }}
                      onClick={() => setProfileDropdownOpen(false)}
                    />
                    <div 
                      className="dropdown-menu show"
                      style={{
                        position: 'absolute',
                        top: '100%',
                        right: 0,
                        width: '340px',
                        marginTop: '10px',
                        background: 'rgb(23, 53, 32)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '12px',
                        boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
                        zIndex: 1000,
                      }}
                    >
                      {/* User Info Section */}
                      <div className="d-flex align-items-center p-4 border-bottom" style={{ borderBottomColor: 'rgba(209, 32, 32, 0.1)' }}>
                        <img
                          src={userProfileImage}
                          className="rounded-circle"
                          width="60"
                          height="60"
                          alt="profile"
                          style={{ objectFit: 'cover' }}
                        />
                        <div className="ms-3">
                          <h5 className="mb-1" style={{ color: '#ffffff', fontSize: '16px', fontWeight: '600' }}>{userName}</h5>
                          {loginid && (
                            <span className="mb-1 d-block" style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px' }}>Login Id: {loginid}</span>
                          )}
                          <p className="mb-0 d-flex align-items-center gap-2" style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px' }}>
                            <MdMessage size={12} />
                            <span>{userEmail}</span>
                          </p>
                        </div>
                      </div>
                      
                      {/* Menu Items */}
                      <div className="py-2">
                        <Link to="/dashboard/profile" className="d-flex align-items-center px-4 py-2" style={{ textDecoration: 'none', color: 'rgba(255,255,255,0.8)', transition: 'all 0.3s ease' }} onClick={() => setProfileDropdownOpen(false)}>
                          <span className="d-flex align-items-center justify-content-center rounded-1 p-2 me-3" style={{ background: 'rgba(182, 182, 182, 0.1)', width: '35px', height: '35px' }}>
                            <IoMdPerson size={18} />
                          </span>
                          <div>
                            <h6 className="mb-0" style={{ fontSize: '16px', fontWeight: '500' }}>My Profile</h6>
                            <span className="mt-1 d-block" style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>Update profile</span>
                          </div>
                        </Link>

                        <Link to="/dashboard/changepassword" className="d-flex align-items-center px-4 py-2" style={{ textDecoration: 'none', color: 'rgba(255,255,255,0.8)', transition: 'all 0.3s ease' }} onClick={() => setProfileDropdownOpen(false)}>
                          <span className="d-flex align-items-center justify-content-center rounded-1 p-2 me-3" style={{ background: 'rgba(255,255,255,0.1)', width: '35px', height: '35px' }}>
                            <IoMdLock size={18} />
                          </span>
                          <div>
                            <h6 className="mb-0" style={{ fontSize: '16px', fontWeight: '500' }}>Change Password</h6>
                            <span className="mt-1 d-block" style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>Forget password</span>
                          </div>
                        </Link>

                        <Link to="/dashboard/support" className="d-flex align-items-center px-4 py-2" style={{ textDecoration: 'none', color: 'rgba(255,255,255,0.8)', transition: 'all 0.3s ease' }} onClick={() => setProfileDropdownOpen(false)}>
                          <span className="d-flex align-items-center justify-content-center rounded-1 p-2 me-3" style={{ background: 'rgba(255,255,255,0.1)', width: '35px', height: '35px' }}>
                            <IoMdHelp size={18} />
                          </span>
                          <div>
                            <h6 className="mb-0" style={{ fontSize: '14px', fontWeight: '500' }}>Support</h6>
                            <span className="mt-1 d-block" style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>Get help & support</span>
                          </div>
                        </Link>
                      </div>
                      
                      {/* Logout Button */}
                      <div className="p-3">
                        <button 
                          className="btn w-100 d-flex align-items-center justify-content-center gap-2"
                          style={{
                            background: 'rgba(220, 53, 69, 0.2)',
                            border: '1px solid rgba(220, 53, 69, 0.3)',
                            color: 'rgb(255, 255, 255)',
                            borderRadius: '10px',
                            padding: '8px',
                            transition: 'all 0.3s ease',
                          }}
                          onClick={handleLogout}
                        >
                          <IoMdLogOut size={18} />
                          <span>Logout</span>
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Mobile Profile Dropdown - FIXED VERSION */}
              <div className="position-relative d-md-none">
                <button 
                  className="btn"
                  style={{
                    background: 'rgba(255,255,255,0.1)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '30px',
                    padding: '5px 8px',
                  }}
                  onClick={() => setMobileProfileDropdownOpen(!mobileProfileDropdownOpen)}
                >
                  <img
                    src={userProfileImage}
                    className="rounded-circle"
                    width="28"
                    height="28"
                    alt="profile"
                    style={{ objectFit: 'cover' }}
                  />
                </button>

                {/* Mobile Profile Dropdown Menu */}
                {mobileProfileDropdownOpen && (
                  <>
                    <div 
                      className="position-fixed"
                      style={{ top: 0, left: 0, right: 0, bottom: 0, zIndex: 999 }}
                      onClick={() => setMobileProfileDropdownOpen(false)}
                    />
                    <div 
                      className="dropdown-menu show"
                      style={{
                        position: 'absolute',
                        top: '100%',
                        right: 0,
                        width: '280px',
                        marginTop: '10px',
                        background: 'rgb(23, 53, 32)',
                        borderRadius: '12px',
                        border: '1px solid rgba(255,255,255,0.1)',
                        boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
                        zIndex: 1000,
                      }}
                    >
                      {/* User Info Section */}
                      <div className="d-flex align-items-center p-3 border-bottom" style={{ borderBottomColor: 'rgba(255,255,255,0.1)' }}>
                        <img
                          src={userProfileImage}
                          className="rounded-circle"
                          width="50"
                          height="50"
                          alt="profile"
                          style={{ objectFit: 'cover' }}
                        />
                        <div className="ms-3">
                          <h6 className="mb-0" style={{ color: '#ffffff', fontSize: '14px', fontWeight: '600' }}>{userName}</h6>
                          {loginid && (
                            <span className="d-block" style={{ color: 'rgba(255,255,255,0.6)', fontSize: '11px' }}>ID: {loginid}</span>
                          )}
                        </div>
                      </div>
                      
                      {/* Menu Items */}
                      <div className="py-2">
                        <Link to="/dashboard/profile" className="d-flex align-items-center px-3 py-2" style={{ textDecoration: 'none', color: 'rgba(255,255,255,0.8)' }} onClick={() => setMobileProfileDropdownOpen(false)}>
                          <IoMdPerson size={18} className="me-3" />
                          <span>My Profile</span>
                        </Link>
                        <Link to="/dashboard/changepassword" className="d-flex align-items-center px-3 py-2" style={{ textDecoration: 'none', color: 'rgba(255,255,255,0.8)' }} onClick={() => setMobileProfileDropdownOpen(false)}>
                          <IoMdLock size={18} className="me-3" />
                          <span>Change Password</span>
                        </Link>
                        <Link to="/dashboard/support" className="d-flex align-items-center px-3 py-2" style={{ textDecoration: 'none', color: 'rgba(255,255,255,0.8)' }} onClick={() => setMobileProfileDropdownOpen(false)}>
                          <IoMdHelp size={18} className="me-3" />
                          <span>Support</span>
                        </Link>
                      </div>
                      
                      {/* Logout Button */}
                      <div className="p-3 border-top" style={{ borderTopColor: 'rgba(255,255,255,0.1)' }}>
                        <button 
                          className="btn w-100 d-flex align-items-center justify-content-center gap-2"
                          style={{
                            background: 'rgba(220, 53, 69, 0.2)',
                            border: '1px solid rgba(220, 53, 69, 0.3)',
                            color: '#ffffff',
                            borderRadius: '8px',
                            padding: '8px',
                          }}
                          onClick={handleLogout}
                        >
                          <IoMdLogOut size={18} />
                          <span>Logout</span>
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <>
          <div 
            className="position-fixed"
            style={{
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0,0,0,0.7)',
              zIndex: 1001,
            }}
            onClick={() => setMobileMenuOpen(false)}
          />
          <div 
            className="position-fixed"
            style={{
              top: 0,
              left: 0,
              bottom: 0,
              width: '280px',
              background: 'rgba(0,0,0,0.98)',
              backdropFilter: 'blur(10px)',
              zIndex: 1002,
              transform: mobileMenuOpen ? 'translateX(0)' : 'translateX(-100%)',
              transition: 'transform 0.3s ease',
              borderRight: '1px solid rgba(255,255,255,0.1)',
              overflowY: 'auto',
            }}
          >
            {/* Mobile Menu Header */}
            <div className="d-flex align-items-center p-3 border-bottom" style={{ borderBottomColor: 'rgba(255,255,255,0.1)' }}>
              <img
                src={userProfileImage}
                className="rounded-circle"
                width="50"
                height="50"
                alt="profile"
                style={{ objectFit: 'cover' }}
              />
              <div className="ms-3">
                <h6 className="mb-0" style={{ color: '#ffffff', fontSize: '16px' }}>{userName}</h6>
              </div>
            </div>

            {/* Mobile Menu Items */}
            <div className="py-2">
              {menuItems.map((item) => (
                <button
                  key={item}
                  onClick={() => {
                    setActiveMenu(item);
                    setMobileMenuOpen(false);
                    navigate(`/${item.toLowerCase().replace(' ', '')}`);
                  }}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    background: activeMenu === item ? 'rgba(255,255,255,0.1)' : 'transparent',
                    border: 'none',
                    color: activeMenu === item ? '#ffffff' : 'rgba(255,255,255,0.8)',
                    padding: '12px 20px',
                    fontSize: '15px',
                    fontWeight: activeMenu === item ? '600' : '400',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                  }}
                >
                  {item === 'Dashboard' && <MdDashboard className="me-3" size={18} />}
                  {item === 'Referral Team' && <MdPeople className="me-3" size={18} />}
                  {item === 'Add Funds' && <MdAccountBalanceWallet className="me-3" size={18} />}
                  {item}
                </button>
              ))}
            </div>  

            {/* Mobile Logout Button */}
            <div className="p-3 border-top mt-auto" style={{ borderTopColor: 'rgba(255,255,255,0.1)', position: 'absolute', bottom: 0, left: 0, right: 0 }}>
              <button 
                className="btn w-100 d-flex align-items-center justify-content-center gap-2"
                style={{
                  background: 'rgba(220,53,69,0.2)',
                  border: '1px solid rgba(220,53,69,0.3)',
                  color: '#ffffff',
                  borderRadius: '30px',
                  padding: '10px',
                }}
                onClick={handleLogout}
              >
                <IoMdLogOut size={18} />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default Header;