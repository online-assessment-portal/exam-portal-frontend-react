import { motion } from 'framer-motion';
import SignIn from './SignIn';
import SignUp1 from './SignUp1';
import SignUp2 from './SignUp2';

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
  nextStep,
  changeMode,
  isHome,
  otpVerifyToken,
  setOtpVerifyToken,
}) => {
  const renderContent = () => {
    if (mode === 'signIn') {
      return <SignIn changeMode={changeMode} isHome={isHome} />;
    }

    if (mode === 'signUp') {
      return (
        <>
          {step === 0 && (
            <SignUp1
              nextStep={nextStep}
              changeMode={changeMode}
              setOtpVerifyToken={setOtpVerifyToken}
              isReset={false}
            />
          )}
          {step === 1 && (
            <SignUp2
              otpVerifyToken={otpVerifyToken}
              isReset={false}
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
            <SignUp1
              nextStep={nextStep}
              changeMode={changeMode}
              setOtpVerifyToken={setOtpVerifyToken}
              isReset={true}
            />
          )}
          {step === 1 && (
            <SignUp2
              otpVerifyToken={otpVerifyToken}
              isReset={true}
              isHome={isHome}
            />
          )}
        </>
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
