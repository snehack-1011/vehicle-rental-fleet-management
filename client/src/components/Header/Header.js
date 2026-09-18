import React, { useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { ThemeContext } from '../../context/ThemeContext';
import './Header.css';

const Header = () => {
  const { user, logout } = useContext(AuthContext);
  const { theme, toggleTheme } = useContext(ThemeContext);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogoutClick = () => {
    logout();
    navigate('/login');
  };

  const getUserDisplayName = () => {
    if (!user) return '';
    if (user.fullName) return user.fullName;
    if (user.email) return user.email.split('@')[0];
    return user.role || 'User';
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  const displayName = getUserDisplayName();
  const initials = getInitials(displayName);

  return (
    <header className="main-header">
      <div className="header-container">
        {/* BRAND LOGO */}
        <Link to={user ? (user.role === 'CUSTOMER' ? '/customer' : user.role === 'FLEET_MANAGER' ? '/fleet' : '/admin') : '/login'} className="header-brand">
          <span className="brand-logo-icon">🚗</span>
          <div className="brand-text-group">
            <span className="brand-title">FleetConnect</span>
            <span className="brand-sub">Enterprise Management</span>
          </div>
        </Link>

        {/* NAVIGATION LINKS */}
        <nav className="header-nav flex-1">
          {!user ? (
            <div className="nav-group">
              <Link 
                to="/login" 
                className={`nav-link ${location.pathname === '/login' ? 'active' : ''}`}
              >
                Login
              </Link>
              <Link 
                to="/register" 
                className={`nav-link ${location.pathname === '/register' ? 'active' : ''}`}
              >
                Register
              </Link>
            </div>
          ) : (
            <div className="nav-group">
              {user.role === 'CUSTOMER' && (
                <>
                  <Link 
                    to="/customer" 
                    className={`nav-link ${location.pathname === '/customer' ? 'active' : ''}`}
                  >
                    🚗 Rent Vehicles
                  </Link>
                  <Link 
                    to="/profile" 
                    className={`nav-link ${location.pathname === '/profile' ? 'active' : ''}`}
                  >
                    📋 My Rentals & Account
                  </Link>
                </>
              )}

              {user.role === 'FLEET_MANAGER' && (
                <>
                  <Link 
                    to="/fleet" 
                    className={`nav-link ${location.pathname === '/fleet' ? 'active' : ''}`}
                  >
                    📊 Fleet Dashboard
                  </Link>
                  <Link 
                    to="/map" 
                    className={`nav-link ${location.pathname === '/map' ? 'active' : ''}`}
                  >
                    📍 Live Vehicle Map
                  </Link>
                </>
              )}

              {user.role === 'ADMIN' && (
                <>
                  <Link 
                    to="/admin" 
                    className={`nav-link ${location.pathname === '/admin' ? 'active' : ''}`}
                  >
                    ⚙️ Admin Dashboard
                  </Link>
                  <Link 
                    to="/map" 
                    className={`nav-link ${location.pathname === '/map' ? 'active' : ''}`}
                  >
                    📍 Live Vehicle Map
                  </Link>
                </>
              )}
            </div>
          )}
        </nav>

        {/* CONTROLS & PROFILE */}
        <div className="header-controls">
          {/* THEME TOGGLE */}
          <button 
            onClick={toggleTheme} 
            className="theme-toggle-btn"
            title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
            aria-label="Toggle theme"
          >
            {theme === 'light' ? '🌙' : '☀️'}
          </button>

          {/* USER INFO & LOGOUT */}
          {user && (
            <div className="user-profile-badge">
              <div className="avatar-circle">
                {initials}
              </div>
              <div className="user-info-text">
                <span className="user-name">{displayName}</span>
                <span className="user-role">{user.role?.replace('_', ' ')}</span>
              </div>
              <button 
                onClick={handleLogoutClick} 
                className="header-logout-btn"
                title="Log out of system"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
