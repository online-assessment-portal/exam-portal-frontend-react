import { useState } from 'react';

export const useStepNavigation = () => {
  const [mode, setMode] = useState('signIn');
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);

  const nextStep = () => {
    setDirection(1);
    setStep((s) => s + 1);
  };

  const prevStep = () => {
    setDirection(-1);
    setStep((s) => s - 1);
  };

  const changeMode = (newMode) => {
    setDirection(1);
    setMode(newMode);
    setStep(0);
  };

  return { mode, step, direction, nextStep, prevStep, changeMode };
};
