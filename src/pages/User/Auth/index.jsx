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
import { storeError, notify } from '../../../lib';
import { AnimatePresence } from 'framer-motion';
import { Link } from 'react-router';
import { useStepNavigation } from '../../../hooks/auth/useStepNavigation';
import StepRenderer from '../../../components/auth/StepRenderer';

const AuthPage = ({ userInfo: propUserInfo, isHome, setExamCompState }) => {
  const { mode, step, direction, nextStep, prevStep, changeMode } =
    useStepNavigation();
  const [userInfo, setUserInfo] = useState({});
  const msgHolder = useRef(null);

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
      msgHolder,
      token: userInfo.token,
    }),
    [toggleShowHide, changeMode, setUserInfo, userInfo.token]
  );

  useEffect(() => {
    const info =
      propUserInfo ||
      JSON.parse(document.getElementById('userInfo')?.innerText || '{}');
    setUserInfo(info);

    if (info.ds) {
      notify(
        msgHolder,
        's',
        '<h3>Candidate Verified</h3>Manual Verification Skipped.<br>you just need to fill these 2 fields.',
        10000
      );
      changeMode('profile');
    } else if (info.loggedIn) {
      changeMode('profile');
    }

    if (isHome) {
      const errorHandler = (err) => storeError(err, info.token);
      window.addEventListener('error', errorHandler);
      return () => window.removeEventListener('error', errorHandler);
    }
  }, [propUserInfo, isHome]);

  return (
    <main id="AuthPage">
      <div id="msgHolder" ref={msgHolder} />
      <div style={{ position: 'absolute', top: 0, left: 0, zIndex: 999999 }}>
        <button onClick={() => changeMode('signUp')}> SU </button>
        <button onClick={() => changeMode('reset')}> Reset </button>
        <button onClick={nextStep}> {'>'} </button>
        <button onClick={prevStep}> {'<'} </button>
      </div>
      {/* <CSSTransition in appear timeout={250} classNames="fade"> */}
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
