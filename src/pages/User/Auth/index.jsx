import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
  useMemo,
} from 'react';
import logo from '../../../assets/favicon/favicon-32x32.png';
import googleLogo from '../../../google-logo.png';
import './styles/login.css';
import '../../../styles/components/allBtns.css';
import { storeError, notifications } from '../../../lib';
import { AnimatePresence } from 'framer-motion';
import { Link } from 'react-router';
import { useStepNavigation } from '../../../hooks/auth/useStepNavigation';
import StepRenderer from '../../../components/auth/StepRenderer';

const AuthPage = ({ userInfo: propUserInfo, isHome, setExamCompState }) => {
  const { mode, step, direction, nextStep, changeMode } = useStepNavigation();
  const [userInfo, setUserInfo] = useState({});
  const initialized = useRef(false);

  const toggleShowHide = useCallback((event) => {
    const button = event.target;
    const target = button.parentElement.previousElementSibling;
    if (target.type === 'password') {
      target.type = 'text';
      button.className = 'fa fa-eye';
    } else {
      target.type = 'password';
      button.className = 'fa fa-eye-slash';
    }
  }, []);

  const commonProps = useMemo(
    () => ({
      toggleShowHide,
      changeMode,
      setUserInfo,
      token: userInfo.token,
    }),
    [toggleShowHide, changeMode, setUserInfo, userInfo.token]
  );

  useEffect(() => {
    if (initialized.current) return;

    let info = propUserInfo;
    if (!info) {
      try {
        const userInfoElement = document.getElementById('userInfo');
        const userInfoText = userInfoElement?.innerText;
        info = userInfoText ? JSON.parse(userInfoText) : {};
      } catch (error) {
        console.warn('Failed to parse userInfo from DOM:', error);
        info = {};
      }
    }
    setUserInfo(info);

    if (info.ds) {
      notifications.exam.candidateVerified();
      changeMode('profile');
    } else if (info.loggedIn) {
      changeMode('profile');
    }

    initialized.current = true;
  }, [propUserInfo, changeMode]);

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
        <div className="sticky top-0 bg-white z-10 pt-10">
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
              commonProps={commonProps}
              setExamCompState={setExamCompState}
              isHome={isHome}
              googleLogo={googleLogo}
              userInfo={userInfo}
              nextStep={nextStep}
            />
          </AnimatePresence>
        </div>
      </div>
    </main>
  );
};

export default AuthPage;
