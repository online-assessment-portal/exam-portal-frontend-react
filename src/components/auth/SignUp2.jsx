import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Eye, EyeOff, Key, Check, Circle, X } from 'lucide-react';
import { SYSTEM_MESSAGES } from '../../constants/messages';
import { complete } from '../../services/auth.service';
import { PASSWORD_REGEX } from '../../constants/validation';
import Button from '../ui/Button';
import Message from '../ui/Message';
import { notifications } from '../../lib';
import { useAuth } from '../../hooks';
import { useLocation, useNavigate } from 'react-router';

const SignUp2 = ({ isReset, otpVerifyToken, isHome }) => {
  // State initialization
  const [formData, setFormData] = useState({ password: '', agree: false });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const formRef = useRef(null);

  // Hooks
  const { login } = useAuth();

  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/profile';

  // Password validation
  const passwordValidation = useMemo(() => {
    const pswd = formData.password.trim();
    return {
      length: PASSWORD_REGEX.length.test(pswd),
      uppercase: PASSWORD_REGEX.uppercase.test(pswd),
      lowercase: PASSWORD_REGEX.lowercase.test(pswd),
      number: PASSWORD_REGEX.number.test(pswd),
      special: PASSWORD_REGEX.special.test(pswd),
      hasWhitespace: PASSWORD_REGEX.whitespace.test(pswd),
      hasTab: PASSWORD_REGEX.tab.test(pswd),
    };
  }, [formData.password]);

  const isPasswordValid = useMemo(() => {
    const {
      length,
      uppercase,
      lowercase,
      number,
      special,
      hasWhitespace,
      hasTab,
    } = passwordValidation;
    return (
      length &&
      uppercase &&
      lowercase &&
      number &&
      special &&
      !hasWhitespace &&
      !hasTab
    );
  }, [passwordValidation]);

  const isFormValid = useMemo(() => {
    return (
      formData.password.trim() && isPasswordValid && (isReset || formData.agree)
    );
  }, [formData.password, formData.agree, isPasswordValid, isReset]);

  // Event handlers
  const handleInputChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    setMessage({ type: '', text: '' });

    if (name === 'agree' && checked && formRef.current) {
      setTimeout(() => {
        formRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
      }, 100);
    }
  }, []);

  const togglePasswordVisibility = useCallback(() => {
    setShowPassword((prev) => !prev);
  }, []);

  const processSuccessfulCompletion = useCallback(
    (userInfo) => {
      try {
        if (isReset) {
          notifications.auth.resetPasswordSuccess();
        } else {
          notifications.auth.signupSuccess();
        }

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
    [isReset, login, isHome, navigate, from]
  );

  const handleCompletion = useCallback(
    async (event) => {
      event.preventDefault();
      if (!isFormValid) return;

      if (passwordValidation.hasWhitespace || passwordValidation.hasTab) {
        setMessage({
          type: 'error',
          text: 'Password cannot contain spaces or tab characters.',
        });
        return;
      }

      if (!isPasswordValid) {
        setMessage({
          type: 'error',
          text: 'Password does not meet all security requirements.',
        });
        return;
      }

      setLoading(true);
      setMessage({ type: '', text: '' });

      try {
        if (!otpVerifyToken) {
          throw new Error(
            'Verification token not found. Please restart the signup process.'
          );
        }

        const { success, message, data } = await complete(
          formData.password.trim(),
          otpVerifyToken,
          isReset
        );

        if (success && data?.userInfo) {
          processSuccessfulCompletion(data.userInfo);
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
    [
      formData.password,
      otpVerifyToken,
      isReset,
      isFormValid,
      passwordValidation,
      isPasswordValid,
      processSuccessfulCompletion,
    ]
  );

  // Effects
  useEffect(() => {
    document.title = isReset ? 'Create New Password' : 'Secure Your Account';
  }, [isReset]);

  // Render
  return (
    <>
      <h2 className="mt-6">
        {isReset ? 'Create New Password' : 'Secure Your Account'}
      </h2>

      {/* Password Creation Form */}
      <form
        ref={formRef}
        method="post"
        onSubmit={handleCompletion}
        noValidate
        className="w-full mt-4"
      >
        {/* Success Message */}
        <Message
          type="success"
          message="Email verification completed successfully."
          dismissible={false}
        />

        {/* Info Message */}
        <Message
          type="info"
          message={
            isReset
              ? "Choose a strong password that you'll remember but others can't guess."
              : 'Create a secure password to protect your account. Follow the requirements listed below.'
          }
          dismissible={false}
        />

        {/* Password Field */}
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
            placeholder="Enter your password"
            minLength={6}
            maxLength={16}
            autoComplete="new-password"
            disabled={loading}
            required
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

        {/* Password Requirements */}
        <div className="mt-3 mx-4 space-y-1">
          {[
            { key: 'length', text: '6-16 characters' },
            { key: 'uppercase', text: 'One uppercase letter (A-Z)' },
            { key: 'lowercase', text: 'One lowercase letter (a-z)' },
            { key: 'number', text: 'One number (0-9)' },
            { key: 'special', text: 'One special character (@#$%&*)' },
          ].map(({ key, text }) => (
            <div
              key={key}
              className={`flex items-center gap-2 text-sm transition-colors ${
                passwordValidation[key] ? 'text-green-600' : 'text-gray-500'
              }`}
            >
              <span className="w-4 flex justify-center">
                {passwordValidation[key] ? (
                  <Check size={14} />
                ) : (
                  <Circle size={14} />
                )}
              </span>
              <span>{text}</span>
            </div>
          ))}
          {(passwordValidation.hasWhitespace || passwordValidation.hasTab) && (
            <div className="flex items-center gap-2 text-sm text-red-600">
              <span className="w-4 flex justify-center">
                <X size={14} />
              </span>
              <span>No spaces or tabs allowed</span>
            </div>
          )}
        </div>

        {/* Error Message */}
        {message.text && <Message type={message.type} message={message.text} />}

        {/* Terms Agreement (Sign Up Only) */}
        {!isReset && (
          <div className="mt-6 mx-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                name="agree"
                id="terms"
                checked={formData.agree}
                onChange={handleInputChange}
                disabled={loading}
                className="mt-1 w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded transition-colors"
                required
              />
              <label
                htmlFor="terms"
                className="text-sm text-gray-700 leading-relaxed cursor-pointer select-none"
              >
                By creating an account, I acknowledge that I have read and agree
                to the{' '}
                <a
                  href="/terms"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 underline font-medium transition-colors"
                >
                  Terms of Service
                </a>{' '}
                and{' '}
                <a
                  href="/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 underline font-medium transition-colors"
                >
                  Privacy Policy
                </a>
                .
              </label>
            </div>
            {!formData.agree && formData.password && isPasswordValid && (
              <div className="mt-2 text-xs text-amber-600 flex items-center gap-1">
                <span>⚠</span>
                <span>Please accept the terms to continue</span>
              </div>
            )}
          </div>
        )}

        {/* Submit Button */}
        <div className="flex justify-center mt-6 pb-12">
          <Button
            type="submit"
            variant="primary"
            size="md"
            isLoading={loading}
            loadingText={
              isReset ? 'Updating password...' : 'Creating account...'
            }
            disabled={!isFormValid || loading}
            className="btnPrimary"
          >
            {isReset ? 'Update Password' : 'Create Account'}
          </Button>
        </div>
      </form>
    </>
  );
};

SignUp2.displayName = 'SignUp2';

export default SignUp2;
