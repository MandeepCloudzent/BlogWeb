import { Link } from 'react-router-dom';
import { FiGithub, FiTwitter, FiMail, FiHeart } from 'react-icons/fi';
import { APP_NAME } from '../../utils/constants';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <div className="footer-grid">
          <div className="footer-brand">
            <h3><span className="brand-icon">✦</span> {APP_NAME}</h3>
            <p>A modern platform for writers, thinkers, and creators to share their stories with the world.</p>
          </div>

          <div className="footer-links">
            <h4>Platform</h4>
            <Link to="/blog">Blog</Link>
            <Link to="/contact">Contact</Link>
          </div>

          <div className="footer-links">
            <h4>Account</h4>
            <Link to="/login">Log in</Link>
            <Link to="/register">Sign up</Link>
            <Link to="/profile">Profile</Link>
          </div>

          <div className="footer-links">
            <h4>Connect</h4>
            <a href="#" aria-label="Twitter"><FiTwitter /> Twitter</a>
            <a href="#" aria-label="GitHub"><FiGithub /> GitHub</a>
            <a href="mailto:hello@blogverse.com" aria-label="Email"><FiMail /> Email</a>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} {APP_NAME}. Made with <img src="./src/images/Logo.png" alt="Logo" className='brand-icon' /> All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
