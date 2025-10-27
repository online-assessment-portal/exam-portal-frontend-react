import React, { Suspense } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router';
import { routes } from './routes';

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<div>Loading...</div>}>
        <Routes>
          {routes.map(({ path, element: Component, props, name }) => (
            <Route
              key={name}
              path={path}
              element={<Component {...(props || {})} />}
            />
          ))}
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
