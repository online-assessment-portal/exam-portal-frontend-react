import React, { Suspense, useState, useEffect } from 'react';

const DelayedSuspense = ({ children, fallback }) => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShow(true), 200);
    return () => clearTimeout(timer);
  }, []);

  return <Suspense fallback={show ? fallback : null}>{children}</Suspense>;
};

export default DelayedSuspense;
