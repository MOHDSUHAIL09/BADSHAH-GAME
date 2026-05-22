import React, { useState, useEffect } from 'react';
import { IoMdLogOut, IoMdNotifications, IoMdPerson, IoMdHelp, IoMdLock, IoMdMenu, IoMdClose } from 'react-icons/io';
import { MdMessage, MdDashboard, MdPeople, MdAccountBalanceWallet } from 'react-icons/md';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useUser } from '../../../context/UserContext';
import toast from 'react-hot-toast';
import { GiCash } from 'react-icons/gi';

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeMenu, setActiveMenu] = useState('Dashboard');
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [mobileProfileDropdownOpen, setMobileProfileDropdownOpen] = useState(false);
  const [notificationDropdownOpen, setNotificationDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get user data from context
  const { user, userData, logoutUser } = useUser();

  // Menu items with their paths
  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: <MdDashboard size={18} /> },
    { name: 'Referral Team', path: '/dashboard/referral', icon: <MdPeople size={18} /> },
    { name: 'Add Funds', path: '/dashboard/addfund', icon: <MdAccountBalanceWallet size={18} /> },
    {name: 'PayOut',path: '/dashboard/withdraw',icon: <GiCash size={18} /> }
    
  ];

  // User data from API response
  const userName = user?.profilename || user?.name || 'User';
  const userEmail = user?.email || '';
  const loginid = user?.loginid || user?.loginId || '';
  
  // Wallet balance from userData
  const currentBalance = userData?.currentamt || userData?.currentAmount || user?.totalamt || 0;
  
  // Default profile image
  const userProfileImage = "https://bootstrapdemos.adminmart.com/modernize/dist/assets/images/profile/user-1.jpg";

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Set active menu based on current path
  useEffect(() => {
    const currentPath = location.pathname;
    const activeItem = menuItems.find(item => currentPath === item.path);
    if (activeItem) {
      setActiveMenu(activeItem.name);
    }
  }, [location.pathname]);

  // Close mobile menu on resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768 && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [mobileMenuOpen]);

  // ✅ Static notifications (NO API CALL)
  useEffect(() => {
    setNotifications([
      { id: 1, message: 'Welcome to Badshah Game!', isRead: false, time: 'Just now', createdAt: new Date().toISOString() }
    ]);
    setUnreadCount(1);
  }, []);

  // ✅ Mark notification as read (local only)
  const markNotificationAsRead = (notificationId) => {
    setNotifications(prev => 
      prev.map(n => 
        n.id === notificationId ? { ...n, isRead: true } : n
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
    toast.success('Notification marked as read');
  };

  // ✅ Mark all notifications as read (local only)
  const markAllNotificationsAsRead = () => {
    setNotifications(prev => 
      prev.map(n => ({ ...n, isRead: true }))
    );
    setUnreadCount(0);
    toast.success('All notifications marked as read');
  };

  const handleLogout = () => {
    logoutUser();
    toast.success('Logged out successfully');
    navigate('/');
    setMobileMenuOpen(false);
    setMobileProfileDropdownOpen(false);
    setProfileDropdownOpen(false);
  };

  const handleNavigation = (path, menuName) => {
    setActiveMenu(menuName);
    navigate(path);
    setMobileMenuOpen(false);
  };

  // Format time function
  const formatTime = (timeStr) => {
    if (!timeStr) return '';
    try {
      const date = new Date(timeStr);
      const now = new Date();
      const diffMs = now - date;
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);
      
      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins} min ago`;
      if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    } catch {
      return timeStr;
    }
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
                cursor: 'pointer',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
              onClick={() => handleNavigation('/dashboard', 'Dashboard')}
            >
              BADSHAH
            </div>

            {/* Desktop Navigation */}
            <ul className="d-none d-md-flex gap-2 mb-0" style={{ listStyle: 'none', margin: 0, padding: 0 }}>
              {menuItems.map((item) => (
                <li key={item.name}>
                  <button
                    onClick={() => handleNavigation(item.path, item.name)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: activeMenu === item.name ? '#ffffff' : 'rgba(255,255,255,0.7)',
                      fontSize: '15px',
                      fontWeight: activeMenu === item.name ? '600' : '400',
                      padding: '8px 20px',
                      borderRadius: '30px',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      position: 'relative',
                    }}
                  >
                    {item.name}
                    {activeMenu === item.name && (
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

              {/* Notification Dropdown - Static Data (No API) */}
              <div className="position-relative">
                <button 
                  className="btn position-relative d-flex align-items-center gap-1"
                  style={{
                    background: 'rgba(255,255,255,0.1)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    color: '#ffffff',
                    borderRadius: '30px',
                    padding: '8px 12px',
                  }}
                  onClick={() => setNotificationDropdownOpen(!notificationDropdownOpen)}
                >
                  <IoMdNotifications size={18} />
                  {unreadCount > 0 && (
                    <span className="position-absolute start-100 translate-middle badge rounded-pill bg-danger" style={{ fontSize: '10px', marginLeft: "-6px", marginTop: "3px" }}>
                      {unreadCount}
                    </span>
                  )}
                </button>

                {notificationDropdownOpen && (
                  <>
                    <div className="position-fixed" style={{ top: 0, left: 0, right: 0, bottom: 0, zIndex: 999 }} onClick={() => setNotificationDropdownOpen(false)} />
                    <div className="dropdown-menu show" style={{
                      position: 'absolute',
                      top: '100%',
                      right: 0,
                      width: '320px',
                      marginTop: '10px',
                      background: 'rgba(0,0,0,0.95)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '12px',
                      zIndex: 1000,
                      maxHeight: '400px',
                      overflowY: 'auto',
                    }}>
                      <div className="py-3 px-4 border-bottom d-flex justify-content-between align-items-center" style={{ borderBottomColor: 'rgba(255,255,255,0.1)' }}>
                        <h5 className="mb-0" style={{ color: '#ffffff', fontSize: '16px', fontWeight: '600' }}>Notifications</h5>
                        {unreadCount > 0 && (
                          <button 
                            onClick={markAllNotificationsAsRead}
                            style={{
                              background: 'transparent',
                              border: 'none',
                              color: '#4caf50',
                              fontSize: '12px',
                              cursor: 'pointer'
                            }}
                          >
                            Mark all read
                          </button>
                        )}
                      </div>
                      <div className="message-body">
                        {notifications.length > 0 ? (
                          notifications.map((notification) => (
                            <div 
                              key={notification.id} 
                              className="py-3 px-4 d-flex align-items-start" 
                              style={{ 
                                borderBottom: '1px solid rgba(255,255,255,0.05)',
                                background: notification.isRead ? 'transparent' : 'rgba(76, 175, 80, 0.1)',
                                cursor: !notification.isRead ? 'pointer' : 'default'
                              }}
                              onClick={() => {
                                if (!notification.isRead) {
                                  markNotificationAsRead(notification.id);
                                }
                              }}
                            >
                              <span className="d-flex align-items-center justify-content-center rounded-1 p-2" style={{ background: 'rgba(255,255,255,0.1)', minWidth: '35px' }}>
                                <MdMessage color="#ffffff" size={18} />
                              </span>
                              <div className="w-100 ps-3">
                                <h6 className="mb-1" style={{ color: '#ffffff', fontSize: '13px', fontWeight: notification.isRead ? '400' : '600' }}>
                                  {notification.message}
                                </h6>
                                <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px' }}>
                                  {formatTime(notification.time || notification.createdAt)}
                                </span>
                              </div>
                              {!notification.isRead && (
                                <span style={{ width: '8px', height: '8px', background: '#4caf50', borderRadius: '50%', marginTop: '8px' }}></span>
                              )}
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-5">
                            <p style={{ color: 'rgba(255,255,255,0.6)' }}>No notifications</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Desktop Profile Dropdown */}
              <div className="position-relative d-none d-md-block">
                <button 
                  className="btn d-flex align-items-center gap-2"
                  style={{
                    background: 'rgba(255,255,255,0.1)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '30px',
                    padding: '5px 12px 5px 8px',
                  }}
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                >
                  <img src={userProfileImage} className="rounded-circle" width="30" height="30" alt="profile" style={{ objectFit: 'cover' }} />
                  <span style={{ color: '#ffffff', fontSize: '14px', fontWeight: '500' }}>{userName.split(' ')[0]}</span>
                </button>

                {profileDropdownOpen && (
                  <>
                    <div className="position-fixed" style={{ top: 0, left: 0, right: 0, bottom: 0, zIndex: 999 }} onClick={() => setProfileDropdownOpen(false)} />
                    <div className="dropdown-menu show" style={{
                      position: 'absolute',
                      top: '100%',
                      right: 0,
                      width: '340px',
                      marginTop: '10px',
                      background: 'rgb(23, 53, 32)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '12px',
                      zIndex: 1000,
                    }}>
                      <div className="d-flex align-items-center p-4 border-bottom" style={{ borderBottomColor: 'rgba(255,255,255,0.1)' }}>
                        <img src={userProfileImage} className="rounded-circle" width="60" height="60" alt="profile" style={{ objectFit: 'cover' }} />
                        <div className="ms-3">
                          <h5 className="mb-1" style={{ color: '#ffffff', fontSize: '16px', fontWeight: '600' }}>{userName}</h5>
                          {loginid && <span className="mb-1 d-block" style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px' }}>Login ID: {loginid}</span>}
                          {userEmail && (
                            <p className="mb-0 d-flex align-items-center gap-2" style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px' }}>
                              <MdMessage size={12} />
                              <span>{userEmail}</span>
                            </p>
                          )}     
                        </div>
                      </div>
                      
                      <div className="py-2">
                        <Link to="/dashboard/profile" className="d-flex align-items-center px-4 py-2" style={{ textDecoration: 'none', color: 'rgba(255,255,255,0.8)' }} onClick={() => setProfileDropdownOpen(false)}>
                          <span className="d-flex align-items-center justify-content-center rounded-1 p-2 me-3" style={{ background: 'rgba(255,255,255,0.1)', width: '35px', height: '35px' }}>
                            <IoMdPerson size={18} />
                          </span>
                          <div>
                            <h6 className="mb-0" style={{ fontSize: '16px', fontWeight: '500' }}>My Profile</h6>
                            <span className="mt-1 d-block" style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>View and edit profile</span>
                          </div>
                        </Link>

                        <Link to="/dashboard/changepassword" className="d-flex align-items-center px-4 py-2" style={{ textDecoration: 'none', color: 'rgba(255,255,255,0.8)' }} onClick={() => setProfileDropdownOpen(false)}>
                          <span className="d-flex align-items-center justify-content-center rounded-1 p-2 me-3" style={{ background: 'rgba(255,255,255,0.1)', width: '35px', height: '35px' }}>
                            <IoMdLock size={18} />
                          </span>
                          <div>
                            <h6 className="mb-0" style={{ fontSize: '16px', fontWeight: '500' }}>Change Password</h6>
                            <span className="mt-1 d-block" style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>Update your password</span>
                          </div>
                        </Link>

                        <Link to="/dashboard/support" className="d-flex align-items-center px-4 py-2" style={{ textDecoration: 'none', color: 'rgba(255,255,255,0.8)' }} onClick={() => setProfileDropdownOpen(false)}>
                          <span className="d-flex align-items-center justify-content-center rounded-1 p-2 me-3" style={{ background: 'rgba(255,255,255,0.1)', width: '35px', height: '35px' }}>
                            <IoMdHelp size={18} />
                          </span>
                          <div>
                            <h6 className="mb-0" style={{ fontSize: '14px', fontWeight: '500' }}>Support</h6>
                            <span className="mt-1 d-block" style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>24/7 customer support</span>
                          </div>
                        </Link>

                        {/* Wallet Balance */}
                        <div className="d-flex align-items-center px-4 py-2 mt-2">
                          <span className="d-flex align-items-center justify-content-center rounded-1 p-2 me-3" style={{ background: 'rgba(76, 175, 80, 0.2)', width: '35px', height: '35px' }}>
                            <MdAccountBalanceWallet size={18} color="#4caf50" />
                          </span>
                          <div>
                            <h6 className="mb-0" style={{ fontSize: '14px', fontWeight: '500', color: '#ffffff' }}>Wallet Balance</h6>
                            <span className="mt-1 d-block" style={{ fontSize: '18px', fontWeight: 'bold', color: '#4caf50' }}>
                              ₹{currentBalance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-3">
                        <button className="btn w-100 d-flex align-items-center justify-content-center gap-2" style={{ background: 'rgba(220, 53, 69, 0.2)', border: '1px solid rgba(220, 53, 69, 0.3)', color: '#ffffff', borderRadius: '10px', padding: '8px' }} onClick={handleLogout}>
                          <IoMdLogOut size={18} />
                          <span>Logout</span>
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Mobile Profile Button */}
              <div className="position-relative d-md-none">
                <button className="btn" style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '30px', padding: '5px 8px' }} onClick={() => setMobileProfileDropdownOpen(!mobileProfileDropdownOpen)}>
                  <img src={userProfileImage} className="rounded-circle" width="28" height="28" alt="profile" style={{ objectFit: 'cover' }} />
                </button>

                {mobileProfileDropdownOpen && (
                  <>
                    <div className="position-fixed" style={{ top: 0, left: 0, right: 0, bottom: 0, zIndex: 999 }} onClick={() => setMobileProfileDropdownOpen(false)} />
                    <div className="dropdown-menu show" style={{ position: 'absolute', top: '100%', right: 0, width: '280px', marginTop: '10px', background: 'rgb(23, 53, 32)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', zIndex: 1000 }}>
                      <div className="d-flex align-items-center p-3 border-bottom" style={{ borderBottomColor: 'rgba(255,255,255,0.1)' }}>
                        <img src={userProfileImage} className="rounded-circle" width="50" height="50" alt="profile" style={{ objectFit: 'cover' }} />
                        <div className="ms-3">
                          <h6 className="mb-0" style={{ color: '#ffffff', fontSize: '14px', fontWeight: '600' }}>{userName}</h6>
                          {loginid && <span className="d-block" style={{ color: 'rgba(255,255,255,0.6)', fontSize: '11px' }}>ID: {loginid}</span>}
                          <span className="d-block mt-1" style={{ color: '#4caf50', fontSize: '14px', fontWeight: 'bold' }}>
                            ₹{currentBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                      </div>
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
                      <div className="p-3 border-top" style={{ borderTopColor: 'rgba(255,255,255,0.1)' }}>
                        <button className="btn w-100 d-flex align-items-center justify-content-center gap-2" style={{ background: 'rgba(220, 53, 69, 0.2)', border: '1px solid rgba(220, 53, 69, 0.3)', color: '#ffffff', borderRadius: '8px', padding: '8px' }} onClick={handleLogout}>
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

      {/* Mobile Menu Sidebar */}
      {mobileMenuOpen && (
        <>
          <div className="position-fixed" style={{ top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1001 }} onClick={() => setMobileMenuOpen(false)} />
          <div className="position-fixed" style={{ top: 0, left: 0, bottom: 0, width: '280px', background: 'rgba(0,0,0,0.98)', backdropFilter: 'blur(10px)', zIndex: 1002, transform: mobileMenuOpen ? 'translateX(0)' : 'translateX(-100%)', transition: 'transform 0.3s ease', borderRight: '1px solid rgba(255,255,255,0.1)', overflowY: 'auto' }}>
            <div className="d-flex align-items-center p-3 border-bottom" style={{ borderBottomColor: 'rgba(255,255,255,0.1)' }}>
              <img src={userProfileImage} className="rounded-circle" width="50" height="50" alt="profile" style={{ objectFit: 'cover' }} />
              <div className="ms-3">
                <h6 className="mb-0" style={{ color: '#ffffff', fontSize: '16px' }}>{userName}</h6>
                <span className="d-block mt-1" style={{ color: '#4caf50', fontSize: '14px', fontWeight: 'bold' }}>
                  ₹{currentBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            <div className="py-2">
              {menuItems.map((item) => (
                <button
                  key={item.name}
                  onClick={() => handleNavigation(item.path, item.name)}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    background: activeMenu === item.name ? 'rgba(255,255,255,0.1)' : 'transparent',
                    border: 'none',
                    color: activeMenu === item.name ? '#ffffff' : 'rgba(255,255,255,0.8)',
                    padding: '12px 20px',
                    fontSize: '15px',
                    fontWeight: activeMenu === item.name ? '600' : '400',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  {item.icon}
                  <span className="ms-3">{item.name}</span>
                </button>
              ))}
            </div>  

            <div className="p-3 border-top mt-auto" style={{ borderTopColor: 'rgba(255,255,255,0.1)', position: 'absolute', bottom: 0, left: 0, right: 0 }}>
              <button className="btn w-100 d-flex align-items-center justify-content-center gap-2" style={{ background: 'rgba(220,53,69,0.2)', border: '1px solid rgba(220,53,69,0.3)', color: '#ffffff', borderRadius: '30px', padding: '10px' }} onClick={handleLogout}>
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