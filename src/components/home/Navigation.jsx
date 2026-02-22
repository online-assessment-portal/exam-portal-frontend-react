import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import logo from '../../assets/favicon/favicon-32x32.png';
import { useAuth } from '../../hooks';
import { notifications } from '../../lib';
import { SYSTEM_MESSAGES } from '../../constants/messages';
import { signOut } from '../../services/auth.service';

const Navigation = () => {
  const [loading, setLoading] = useState(false);
  const { isAuthenticated, logout } = useAuth();
  const navLinks = useRef();
  const navigate = useNavigate();

  const toggleNavBar = (event) => {
    const target = event.target;
    const style = navLinks.current.style;
    if (style.display === 'flex') {
      setTimeout(() => {
        style.display = 'none';
      }, 280);
      style.animationName = 'fadeOutUp';
      target.className = 'fa fa-bars';
    } else {
      style.display = 'flex';
      style.animationName = 'fadeInDown';
      target.className = 'fa fa-times';
    }
  };

  useEffect(() => {
    const isMobile =
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      );
    if (isMobile) {
      const navBar = document.getElementsByTagName('nav')[0];
      setTimeout(() => {
        navLinks.current.style.top = navBar.offsetHeight + 2 + 'px';
      }, 1000);
    }
  }, []);

  const handleLogout = useCallback(async () => {
    setLoading(true);

    try {
      const { success, message } = await signOut();

      if (success) {
        logout();
        notifications.auth.logoutSuccess();
      } else {
        notifications.errorCustom(message || SYSTEM_MESSAGES.UNKNOWN_ERROR);
      }
    } catch (error) {
      notifications.errorCustom(
        error?.message || SYSTEM_MESSAGES.UNKNOWN_ERROR
      );
    } finally {
      setLoading(false);
    }
  }, [logout]);

  return (
    <nav id="homeNav">
      <div>
        <img id="brand-logo" src={logo} alt="logo" />
        <h1 id="brand-text">Shred Test</h1>
      </div>
      <ul ref={navLinks} id="homeNav-links">
        <li>
          <a href="#features">Features</a>
        </li>
        <li>
          <a href="#whyus">Why Us?</a>
        </li>
        <li>
          <a href="#pricing">Pricing</a>
        </li>
        <li>
          <a href="#contact">Contact</a>
        </li>
        <li>
          <Link to="/assessment">ExamPage</Link>
        </li>
        <li>
          <button
            type="button"
            onClick={isAuthenticated ? handleLogout : () => navigate('/auth')}
            disabled={loading}
          >
            {isAuthenticated ? 'Log-out' : 'Sign-In'}
          </button>
        </li>
      </ul>
      <i className="fa fa-bars" aria-hidden="true" onClick={toggleNavBar}></i>
    </nav>
  );
};

export default Navigation;
