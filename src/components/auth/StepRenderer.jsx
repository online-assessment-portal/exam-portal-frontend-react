import React from 'react';
import { motion } from 'framer-motion';
import SignIn from './SignIn';
import SignUp1 from './SignUp1';
import SignUp2 from './SignUp2';
import Profile from './Profile';

const variants = {
  enter: (direction) => ({
    x: direction > 0 ? '100%' : '-100%',
    position: 'absolute',
    opacity: 1,
  }),
  center: {
    x: 0,
    position: 'absolute',
  },
  exit: (direction) => ({
    x: direction > 0 ? '-100%' : '100%',
    position: 'absolute',
    opacity: 1,
  }),
};

const transition = {
  x: { type: 'spring', stiffness: 300, damping: 30 },
  opacity: { duration: 0.2 },
};

const StepRenderer = ({
  mode,
  step,
  direction,
  commonProps,
  setExamCompState,
  isHome,
  googleLogo,
  userInfo,
  nextStep,
}) => {
  const renderContent = () => {
    if (mode === 'signIn') {
      return (
        <SignIn
          {...commonProps}
          setExamCompState={setExamCompState}
          isHome={isHome}
          googleLogo={googleLogo}
        />
      );
    }

    if (mode === 'signUp') {
      return (
        <>
          {step === 0 && (
            <SignUp1
              {...commonProps}
              isReset={false}
              setStep={nextStep}
              googleLogo={googleLogo}
            />
          )}
          {step === 1 && (
            <SignUp2
              {...commonProps}
              isReset={false}
              setExamCompState={setExamCompState}
              isHome={isHome}
            />
          )}
        </>
      );
    }

    if (mode === 'reset') {
      return (
        <>
          {step === 0 && (
            <SignUp1 {...commonProps} isReset={true} googleLogo={googleLogo} />
          )}
          {step === 1 && (
            <SignUp2
              {...commonProps}
              isReset={true}
              setExamCompState={setExamCompState}
              isHome={isHome}
            />
          )}
        </>
      );
    }

    if (mode === 'profile') {
      return (
        <Profile
          {...commonProps}
          setExamCompState={setExamCompState}
          userInfo={userInfo}
          isHome={isHome}
        />
      );
    }
  };

  return (
    <motion.div
      custom={direction}
      variants={variants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={transition}
      className="absolute inset-0 flex flex-col items-center px-6"
    >
      {renderContent()}
    </motion.div>
  );
};

export default StepRenderer;
