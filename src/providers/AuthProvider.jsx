import PropTypes from 'prop-types';
import { useEffect, useRef, useState } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { getCurrentUser } from '../services/auth.service';

const AuthProvider = ({ children }) => {
  const initialized = useRef(false);
  const [userInfo, setUserInfo] = useState({});
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const login = (user) => {
    setUserInfo(user);
    setIsAuthenticated(true);
  };

  const logout = () => {
    setUserInfo({});
    setIsAuthenticated(false);
  };

  const updateUserInfo = (updates) => {
    setUserInfo((prev) => ({ ...prev, ...updates }));
  };

  const value = {
    userInfo,
    setUserInfo,
    updateUserInfo,
    isAuthenticated,
    isLoading,
    login,
    logout,
  };

  useEffect(() => {
    if (initialized.current) return;

    const initializeAuth = async () => {
      try {
        const {
          success,
          message,
          data: { userInfo },
        } = await getCurrentUser();
        if (success) {
          setUserInfo(userInfo);
          setIsAuthenticated(true);
        } else {
          console.warn('User Not Logged In:', message);
        }
      } catch (error) {
        console.warn('Auth initialization failed:', error);
        setUserInfo({});
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
    initialized.current = true;
  }, []);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export default AuthProvider;
