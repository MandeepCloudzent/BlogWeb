import { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiSun, FiMoon, FiMenu, FiX, FiLogOut, FiUser, FiEdit3, FiGrid } from 'react-icons/fi';
import { ThemeContext } from '../../context/ThemeContext';
import { useAuth } from '../../hooks/useAuth';
import { APP_NAME } from '../../utils/constants';
import { useState } from 'react';
import './Navbar.css';

export default function Navbar() {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const { user, isAuthenticated, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="navbar-inner container">
        <Link to="/" className="navbar-brand">
          <span className="brand-icon"><img src="./src/images/Logo.png" alt="Logo" /></span>
          <span className="brand-text">{APP_NAME}</span>
        </Link>

        <div className={`navbar-links ${menuOpen ? 'open' : ''}`}>
          <Link to="/" className="nav-link" onClick={() => setMenuOpen(false)}>Home</Link>
          <Link to="/blog" className="nav-link" onClick={() => setMenuOpen(false)}>Blog</Link>
          <Link to="/contact" className="nav-link" onClick={() => setMenuOpen(false)}>Contact</Link>
        </div>

        <div className="navbar-actions">
          <button className="btn-icon" onClick={toggleTheme} aria-label="Toggle theme">
            {theme === 'light' ? <FiMoon size={18} /> : <FiSun size={18} />}
          </button>

          {isAuthenticated ? (
            <div className="nav-user-menu">
              <Link to="/create-post" className="btn btn-primary btn-sm">
                <FiEdit3 size={14} /> Write
              </Link>
              {user?.is_staff && (
                <Link to="/admin" className="btn-icon" title="Admin Dashboard">
                  <FiGrid size={18} />
                </Link>
              )}
              <Link to="/profile" className="btn-icon" title="Profile">
                <FiUser size={18} />
              </Link>
              <button className="btn-icon" onClick={handleLogout} title="Logout">
                <FiLogOut size={18} />
              </button>
            </div>
          ) : (
            <div className="nav-auth-buttons">
              <Link to="/login" className="btn btn-ghost btn-sm">Log in</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Sign up</Link>
            </div>
          )}

          <button className="btn-icon mobile-menu-toggle" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <FiX size={22} /> : <FiMenu size={22} />}
          </button>
        </div>
      </div>
    </nav>
  );
}
