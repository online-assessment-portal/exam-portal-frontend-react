import { useCallback, useEffect, useMemo, useState } from 'react';
import { Eye, EyeOff, User, Key } from 'lucide-react';
import { SYSTEM_MESSAGES } from '../../constants/messages';
import { EMAIL_REGEX } from '../../constants/validation';
import googleLogo from '../../google-logo.png';
import { notifications } from '../../lib';
import { signIn } from '../../services/auth.service';
import Button from '../ui/Button';
import Message from '../ui/Message';
import { useAuth } from '../../hooks';
import { useLocation, useNavigate } from 'react-router';

const SignIn = ({ changeMode, isHome }) => {
  // State initialization
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Hooks
  const { login } = useAuth();

  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/profile';

  // Form validation
  const isFormValid = useMemo(() => {
    const { email, password } = formData;
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

    if (!trimmedEmail || !trimmedPassword) return false;

    const isValidEmail = EMAIL_REGEX.test(trimmedEmail);
    const isValidUsername =
      trimmedEmail.length >= 6 && trimmedEmail.length <= 15;
    const isValidPassword =
      trimmedPassword.length >= 6 && trimmedPassword.length <= 16;

    return (isValidEmail || isValidUsername) && isValidPassword;
  }, [formData]);

  // Event handlers
  const handleInputChange = useCallback(
    (e) => {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));
      if (message.text) setMessage({ type: '', text: '' });
    },
    [message.text]
  );

  const togglePasswordVisibility = useCallback(() => {
    setShowPassword((prev) => !prev);
  }, []);

  const processSuccessfulLogin = useCallback(
    (userInfo) => {
      try {
        notifications.auth.loginSuccess();
        login(userInfo);

        if (!isHome && (!userInfo.email || !userInfo.name)) {
          notifications.exam.basicProfileRequired();
        }

        // redirect back to where user came from
        navigate(from, { replace: true });
      } catch (error) {
        console.error('Login processing error:', error);
        setMessage({
          type: 'error',
          text: 'Login successful but navigation failed. Please refresh the page.',
        });
      }
    },
    [login, isHome, navigate, from]
  );

  const handleSignIn = useCallback(
    async (event) => {
      event.preventDefault();
      if (!isFormValid) return;

      setLoading(true);
      setMessage({ type: '', text: '' });

      try {
        const { success, message, data } = await signIn(
          formData.email.trim(),
          formData.password.trim()
        );

        if (success && data?.userInfo) {
          processSuccessfulLogin(data.userInfo);
        } else {
          setMessage({
            type: 'error',
            text: message || SYSTEM_MESSAGES.UNKNOWN_ERROR,
          });
        }
      } catch (error) {
        setMessage({
          type: 'error',
          text: error?.message || SYSTEM_MESSAGES.UNKNOWN_ERROR,
        });
      } finally {
        setLoading(false);
      }
    },
    [formData, isFormValid, processSuccessfulLogin]
  );

  const handleGoogleLogin = useCallback(() => {
    const googleUrl = import.meta.env.VITE_GOOGLE_LOGIN_AUTH_URL;

    if (!googleUrl) {
      setMessage({
        type: 'error',
        text: 'Google login is currently unavailable',
      });
      return;
    }

    try {
      const currentPath = window.location.pathname;
      if (currentPath) {
        sessionStorage.setItem('authRedirect', currentPath);
      }
      window.location.replace(googleUrl);
    } catch (error) {
      console.error('Google login error:', error);
      setMessage({
        type: 'error',
        text: 'Unable to initiate Google login',
      });
    }
  }, []);

  // Effects
  useEffect(() => {
    document.title = 'Sign In';
  }, []);

  // Render
  return (
    <>
      <h2 className="mt-6">Welcome Back</h2>

      {/* Sign In Form */}
      <form
        method="post"
        onSubmit={handleSignIn}
        noValidate
        className="w-full mt-4"
      >
        <div className="field mt-2 mx-4">
          <label htmlFor="email" className="sr-only">
            Username or Email
          </label>
          <User className="floatter" size={16} aria-hidden="true" />
          <input
            id="email"
            type="text"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="Enter Username or Email"
            minLength={3}
            maxLength={60}
            autoComplete="username"
            disabled={loading}
          />
        </div>

        <div className="field mt-2 mx-4">
          <label htmlFor="password" className="sr-only">
            Password
          </label>
          <Key className="floatter" size={16} aria-hidden="true" />
          <input
            id="password"
            type={showPassword ? 'text' : 'password'}
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            autoComplete="current-password"
            placeholder="Enter your password"
            minLength={6}
            maxLength={16}
            disabled={loading}
          />
          <button
            type="button"
            id="eyeBtn"
            onClick={togglePasswordVisibility}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            disabled={loading}
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>

        {message.text && <Message type={message.type} message={message.text} />}

        <div className="flex justify-center mt-4">
          <Button
            type="submit"
            variant="primary"
            size="md"
            isLoading={loading}
            loadingText="Signing In..."
            disabled={!isFormValid || loading}
            className="btnPrimary"
          >
            Sign In
          </Button>
        </div>
      </form>

      {/* Forgot Password Link */}
      <div className="w-full mt-6 mr-6">
        <button
          className="blueLinkBtn float-right"
          type="button"
          onClick={() => changeMode('reset')}
          disabled={loading}
        >
          Forgot password?
        </button>
      </div>

      {/* Google Login Section */}
      <div className="w-full mt-12">
        <h5 className="othOptHead">
          <span>OR</span>
        </h5>
        <div className="flex justify-center mt-5">
          <button
            className="gLogin"
            type="button"
            disabled={loading}
            onClick={handleGoogleLogin}
            aria-label="Sign in with Google"
          >
            <img src={googleLogo} alt="" aria-hidden="true" />
            <p>Continue with Google</p>
          </button>
        </div>
      </div>

      {/* Sign Up Link */}
      <div className="w-full mt-12 pb-12">
        <h3 className="othOptHead">
          <span>Don't have an account?</span>
        </h3>
        <div className="flex justify-center mt-5">
          <button
            className="blueLinkBtn"
            type="button"
            onClick={() => changeMode('signUp')}
            disabled={loading}
          >
            Create your account
          </button>
        </div>
      </div>
    </>
  );
};

SignIn.displayName = 'SignIn';

export default SignIn;
