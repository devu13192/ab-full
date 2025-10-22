import React, { useContext, useEffect, useRef, useState } from 'react'
import { NavLink, useNavigate, Link, useLocation } from "react-router-dom"
import "./ProfessionalNavbar.css"
import { UserAuth } from '../../context/AuthContext'
import { 
    Home, 
    Info, 
    ContactMail, 
    Assessment, 
    Person, 
    Logout,
    Menu,
    Close
} from '@mui/icons-material'

const ProfessionalNavbar = () => {
  const { user, logout } = UserAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const menuRef = useRef(null)

  const displayName = user?.displayName || user?.email?.split('@')[0] || 'User';
  const avatarUrl = user?.photoURL;

  const handleToggleMenu = () => setMenuOpen(prev => !prev);
  const handleToggleMobileMenu = () => setMobileMenuOpen(prev => !prev);
  
  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
      setMenuOpen(false);
      setMobileMenuOpen(false);
    } catch (e) {
      console.log(e);
    }
  };

  const handleNavClick = () => {
    setMobileMenuOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const isAuthenticated = !!user;
  const isLandingPage = location.pathname === '/';
  const isLoginPage = location.pathname === '/login';
  const isMarketingPage = ['/', '/about', '/contact', '/home', '/evaluation', '/notice', '/chat'].includes(location.pathname);

  return (
    <nav className={`professional-navbar ${isMarketingPage ? 'landing-theme' : ''}`}>
      <div className="navbar-container">
        {/* Logo Section */}
        <div className="navbar-brand">
          <Link to={isAuthenticated ? "/home" : "/"} className="logo-link">
            <div className="logo-icon">
              <Assessment />
            </div>
            <span className="logo-text">EIRA</span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <div className="navbar-nav desktop-nav">
          <ul className="nav-list">
            <li className="nav-item">
              <NavLink 
                to={isAuthenticated ? "/home" : "/"} 
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                onClick={handleNavClick}
              >
                <Home />
                <span>Home</span>
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink 
                to="/about" 
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                onClick={handleNavClick}
              >
                <Info />
                <span>About</span>
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink 
                to="/contact" 
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                onClick={handleNavClick}
              >
                <ContactMail />
                <span>Contact</span>
              </NavLink>
            </li>
            {isAuthenticated && (
              <li className="nav-item">
                <NavLink 
                  to="/evaluation" 
                  className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                  onClick={handleNavClick}
                >
                  <Assessment />
                  <span>Evaluation</span>
                </NavLink>
              </li>
            )}
            {isAuthenticated && (
              <li className="nav-item">
                <NavLink 
                  to="/notice" 
                  className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                  onClick={handleNavClick}
                >
                  <span role="img" aria-label="notice">📢</span>
                  <span>Notice</span>
                </NavLink>
              </li>
            )}
            {isAuthenticated && (
              <li className="nav-item">
                <NavLink 
                  to="/chat" 
                  className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                  onClick={handleNavClick}
                >
                  <span role="img" aria-label="chat">💬</span>
                  <span>Chat</span>
                </NavLink>
              </li>
            )}
          </ul>
        </div>

        {/* User Section */}
        <div className="navbar-user">
          {isAuthenticated ? (
            <div className="user-menu" ref={menuRef}>
              <button 
                className="user-button" 
                onClick={handleToggleMenu} 
                aria-haspopup="true" 
                aria-expanded={menuOpen}
              >
                {avatarUrl ? (
                  <img className="user-avatar" src={avatarUrl} alt={displayName} />
                ) : (
                  <div className="user-avatar user-avatar-fallback">
                    {displayName.charAt(0).toUpperCase()}
                  </div>
                )}
                <span className="user-name">{displayName}</span>
                <span className="user-caret">▾</span>
              </button>
              {menuOpen && (
                <div className="user-dropdown" role="menu">
                  <button 
                    className="dropdown-item" 
                    onClick={() => { 
                      setMenuOpen(false); 
                      navigate('/profile') 
                    }}
                  >
                    <Person />
                    <span>Profile</span>
                  </button>
                  <button 
                    className="dropdown-item danger" 
                    onClick={handleLogout}
                  >
                    <Logout />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="auth-buttons">
              <Link to="/login" className="btn-login">
                Login
              </Link>
            </div>
          )}

          {/* Mobile Menu Toggle */}
          <button 
            className="mobile-menu-toggle"
            onClick={handleToggleMobileMenu}
            aria-label="Toggle mobile menu"
          >
            {mobileMenuOpen ? <Close /> : <Menu />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="mobile-nav">
          <div className="mobile-nav-content">
            <ul className="mobile-nav-list">
              <li className="mobile-nav-item">
                <NavLink 
                  to={isAuthenticated ? "/home" : "/"} 
                  className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`}
                  onClick={handleNavClick}
                >
                  <Home />
                  <span>Home</span>
                </NavLink>
              </li>
              <li className="mobile-nav-item">
                <NavLink 
                  to="/about" 
                  className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`}
                  onClick={handleNavClick}
                >
                  <Info />
                  <span>About</span>
                </NavLink>
              </li>
              <li className="mobile-nav-item">
                <NavLink 
                  to="/contact" 
                  className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`}
                  onClick={handleNavClick}
                >
                  <ContactMail />
                  <span>Contact</span>
                </NavLink>
              </li>
              {isAuthenticated && (
                <>
                  <li className="mobile-nav-item">
                    <NavLink 
                      to="/evaluation" 
                      className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`}
                      onClick={handleNavClick}
                    >
                      <Assessment />
                      <span>Evaluation</span>
                    </NavLink>
                  </li>
                  <li className="mobile-nav-item">
                    <NavLink 
                      to="/profile" 
                      className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`}
                      onClick={handleNavClick}
                    >
                      <Person />
                      <span>Profile</span>
                    </NavLink>
                  </li>
                  <li className="mobile-nav-item">
                    <button 
                      className="mobile-nav-link danger" 
                      onClick={handleLogout}
                    >
                      <Logout />
                      <span>Logout</span>
                    </button>
                  </li>
                </>
              )}
              {!isAuthenticated && (
                <li className="mobile-nav-item">
                  <Link 
                    to="/login" 
                    className="mobile-nav-link"
                    onClick={handleNavClick}
                  >
                    <Person />
                    <span>Login</span>
                  </Link>
                </li>
              )}
            </ul>
          </div>
        </div>
      )}
    </nav>
  )
}

export default ProfessionalNavbar
