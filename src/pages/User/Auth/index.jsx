import { AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import logo from '../../../assets/favicon/favicon-32x32.png';
import StepRenderer from '../../../components/auth/StepRenderer';
import { useAuth } from '../../../hooks';
import { useStepNavigation } from '../../../hooks/auth/useStepNavigation';
import { storeError } from '../../../lib';
import '../../../styles/components/allBtns.css';
import '../../../styles/pages/auth.css';

const AuthPage = ({ isHome }) => {
  const { mode, step, direction, nextStep, changeMode, prevStep } =
    useStepNavigation();

  const { userInfo, isAuthenticated } = useAuth();

  const navigate = useNavigate();

  const [otpVerifyToken, setOtpVerifyToken] = useState('');
  const isDev = import.meta.env.DEV;

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/profile');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (isHome && userInfo.token) {
      const errorHandler = (err) => storeError(err, userInfo.token);
      window.addEventListener('error', errorHandler);
      return () => window.removeEventListener('error', errorHandler);
    }
  }, [isHome, userInfo.token]);

  return (
    <main id="loginComp">
      <div id="loginCont" className="flex flex-col">
        <div className="sticky top-0 bg-white z-10 pt-6">
          <Link to={'/'} id="branding">
            <img src={logo} alt="Shred Test Logo" />
            <h1>Shred Test</h1>
          </Link>
        </div>
        <div className="relative w-full flex-1" id="containerLSR">
          <AnimatePresence custom={direction} initial={false} mode="sync">
            <StepRenderer
              key={`${mode}-${step}`}
              mode={mode}
              step={step}
              direction={direction}
              nextStep={nextStep}
              changeMode={changeMode}
              isHome={isHome}
              otpVerifyToken={otpVerifyToken}
              setOtpVerifyToken={setOtpVerifyToken}
            />
          </AnimatePresence>
        </div>
        {isDev && (
          <div className="fixed bottom-4 left-4 flex flex-col gap-2 z-50">
            <div className="bg-black/80 text-white px-3 py-2 rounded-lg text-xs font-mono">
              {mode} - Step {step}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => changeMode('signIn')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs transition-colors"
              >
                SignIn
              </button>
              <button
                onClick={() => changeMode('signUp')}
                className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-xs transition-colors"
              >
                SignUp
              </button>
              <button
                onClick={() => changeMode('reset')}
                className="bg-orange-600 hover:bg-orange-700 text-white px-3 py-1 rounded text-xs transition-colors"
              >
                Reset
              </button>
            </div>
            <div className="flex gap-2">
              <button
                onClick={prevStep}
                className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded text-xs transition-colors"
              >
                ← Prev
              </button>
              <button
                onClick={nextStep}
                className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded text-xs transition-colors"
              >
                Next →
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
};

export default AuthPage;
