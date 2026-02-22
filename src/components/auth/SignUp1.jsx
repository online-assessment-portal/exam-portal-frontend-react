import { useCallback, useEffect, useMemo, useState } from 'react';
import { Eye, EyeOff, User, Unlock } from 'lucide-react';
import { sendOTP, verifyOTP } from '../../services/auth.service';
import { EMAIL_REGEX } from '../../constants/validation';
import Button from '../ui/Button';
import Message from '../ui/Message';
import googleLogo from '../../google-logo.png';
import { SYSTEM_MESSAGES } from '../../constants/messages';
import { notifications } from '../../lib';

const OTP_LENGTH = 6;

const SignUp1 = ({ setOtpVerifyToken, isReset, nextStep, changeMode }) => {
  // State initialization
  const [formData, setFormData] = useState({ email: '', otp: '' });
  const [showOtp, setShowOtp] = useState(false);
  const [loading, setLoading] = useState({ send: false, verify: false });
  const [otpSent, setOtpSent] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '', step: '' });

  // Form validation
  const isEmailValid = useMemo(
    () => formData.email.trim() && EMAIL_REGEX.test(formData.email),
    [formData.email]
  );

  const isOtpValid = useMemo(
    () => formData.otp.length === OTP_LENGTH && /^\d+$/.test(formData.otp),
    [formData.otp]
  );

  const isProcessing = useMemo(
    () => loading.send || loading.verify,
    [loading.send, loading.verify]
  );

  // Event handlers
  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }, []);

  const toggleOtpVisibility = useCallback(() => {
    setShowOtp((prev) => !prev);
  }, []);

  const handleSendOtp = useCallback(
    async (event) => {
      event.preventDefault();
      if (!isEmailValid) return;

      setLoading((prev) => ({ ...prev, send: true }));
      setMessage({ type: '', text: '', step: '' });

      try {
        const { success, message } = await sendOTP(formData.email, isReset);

        setMessage({
          type: success ? 'success' : 'error',
          text:
            message ||
            (success ? 'OTP sent successfully' : SYSTEM_MESSAGES.UNKNOWN_ERROR),
          step: 'send',
        });

        if (success) setOtpSent(true);
      } catch (error) {
        setMessage({
          type: 'error',
          text: error?.message || SYSTEM_MESSAGES.UNKNOWN_ERROR,
          step: 'send',
        });
      } finally {
        setLoading((prev) => ({ ...prev, send: false }));
      }
    },
    [formData.email, isReset, isEmailValid]
  );

  const handleVerifyOtp = useCallback(
    async (event) => {
      event.preventDefault();
      if (!isOtpValid) return;

      setLoading((prev) => ({ ...prev, verify: true }));
      setMessage({ type: '', text: '', step: '' });

      try {
        const {
          success,
          message,
          data: { verifyToken },
        } = await verifyOTP(formData.email, parseInt(formData.otp), isReset);

        if (success && verifyToken) {
          notifications.successCustom('OTP Verified Successfully');
          nextStep();
          console.log({ verifyToken });
          setOtpVerifyToken(verifyToken);
        } else {
          setMessage({
            type: 'error',
            text: message || SYSTEM_MESSAGES.UNKNOWN_ERROR,
            step: 'verify',
          });
        }
      } catch (error) {
        setMessage({
          type: 'error',
          text: error?.message || SYSTEM_MESSAGES.UNKNOWN_ERROR,
          step: 'verify',
        });
      } finally {
        setLoading((prev) => ({ ...prev, verify: false }));
      }
    },
    [
      formData.email,
      formData.otp,
      isReset,
      nextStep,
      isOtpValid,
      setOtpVerifyToken,
    ]
  );

  const handleGoogleLogin = useCallback(() => {
    const googleUrl = import.meta.env.VITE_GOOGLE_LOGIN_AUTH_URL;

    if (!googleUrl) {
      setMessage({
        type: 'error',
        text: 'Google login is currently unavailable',
        step: 'google',
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
        step: 'google',
      });
    }
  }, []);

  // Effects
  useEffect(() => {
    document.title = isReset ? 'Reset Password' : 'Sign-Up';
  }, [isReset]);

  // Render
  return (
    <>
      <h2 className="mt-6">
        {isReset ? 'Reset Your Password' : 'Join Us Today'}
      </h2>

      {/* Email Form */}
      <form
        method="post"
        onSubmit={handleSendOtp}
        noValidate
        className="w-full mt-4"
      >
        <div className="field mt-2 mx-4">
          <label
            htmlFor={isReset ? 'email-reset' : 'email-register'}
            className="sr-only"
          >
            Email
          </label>
          <User className="floatter" size={16} aria-hidden="true" />
          <input
            id={isReset ? 'email-reset' : 'email-register'}
            type={isReset ? 'text' : 'email'}
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder={
              isReset ? 'Enter your Username or Email' : 'Enter your Email'
            }
            maxLength={60}
            autoComplete={isReset ? 'username' : 'email'}
            disabled={isProcessing}
            required
          />
        </div>
        <div className="flex justify-center mt-3">
          <Button
            type="submit"
            variant="primary"
            size="md"
            isLoading={loading.send}
            loadingText={otpSent ? 'Resending...' : 'Sending...'}
            disabled={!isEmailValid || isProcessing}
            className="btnPrimary"
          >
            {otpSent ? 'Resend OTP' : 'Send OTP'}
          </Button>
        </div>
      </form>

      {/* Info Message */}
      {!otpSent && (
        <Message
          type="info"
          message="We'll send a 6-digit verification code to your email address."
          dismissible={false}
        />
      )}

      {/* Send OTP Message */}
      {message.step === 'send' && message.text && (
        <Message type={message.type} message={message.text} />
      )}

      {/* OTP Verification Form */}
      {otpSent && (
        <form
          method="post"
          onSubmit={handleVerifyOtp}
          noValidate
          className="w-full mt-4"
        >
          <div className="field mt-2 mx-4">
            <label htmlFor="otp" className="sr-only">
              OTP
            </label>
            <Unlock className="floatter" size={16} aria-hidden="true" />
            <input
              id="otp"
              type={showOtp ? 'text' : 'password'}
              name="otp"
              value={formData.otp}
              onChange={handleInputChange}
              placeholder="Enter verification code"
              minLength={6}
              maxLength={6}
              autoComplete="one-time-code"
              disabled={isProcessing}
              required
            />
            <button
              type="button"
              id="eyeBtn"
              onClick={toggleOtpVisibility}
              aria-label={
                showOtp ? 'Hide verification code' : 'Show verification code'
              }
              disabled={isProcessing}
            >
              {showOtp ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          <div className="flex justify-center mt-3">
            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={loading.verify}
              loadingText="Verifying..."
              disabled={!isOtpValid || isProcessing}
              className="btnPrimary"
            >
              Verify Code
            </Button>
          </div>
        </form>
      )}

      {/* Verification Messages */}
      {(message.step === 'verify' || message.step === 'google') &&
        message.text && <Message type={message.type} message={message.text} />}

      {/* Google Login Section */}
      <div className="w-full mt-12">
        <h5 className="othOptHead">
          <span>{isReset ? 'Often forget Password ?' : 'OR'}</span>
        </h5>
        <div className="flex justify-center mt-5">
          <button
            className="gLogin"
            type="button"
            disabled={isProcessing}
            onClick={handleGoogleLogin}
            aria-label={
              isReset ? 'Reset password with Google' : 'Sign up with Google'
            }
          >
            <img src={googleLogo} alt="" aria-hidden="true" />
            <p>{isReset ? 'Use Sign-In' : 'Sign-Up'} with Google</p>
          </button>
        </div>
      </div>

      {/* Sign In Link */}
      <div className="w-full mt-12 pb-12">
        <h3 className="othOptHead">
          <span>
            {isReset ? 'Give your memory a Try' : 'Already Have an Account ?'}
          </span>
        </h3>
        <div className="flex justify-center mt-5">
          <button
            className="blueLinkBtn"
            type="button"
            disabled={isProcessing}
            onClick={() => changeMode('signIn')}
          >
            &nbsp;&nbsp;Sign In&nbsp;&nbsp;
          </button>
        </div>
      </div>
    </>
  );
};

SignUp1.displayName = 'SignUp1';

export default SignUp1;
