import { Suspense } from 'react';
import { Toaster } from 'react-hot-toast';
import { Route, Routes } from 'react-router';
import LoadingPage from './components/LoadingPage';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { useAuth } from './hooks';
import { routes } from './routes';

function App() {
  const { isLoading } = useAuth();

  if (isLoading) {
    return <LoadingPage />;
  }

  return (
    <>
      <Suspense fallback={<LoadingPage />}>
        <Routes>
          {routes.map(
            ({ path, element: Component, props, name, isProtected }) => {
              const ElementComponent = Component;
              return (
                <Route
                  key={name}
                  path={path}
                  element={
                    isProtected ? (
                      <ProtectedRoute>
                        <ElementComponent {...(props || {})} />
                      </ProtectedRoute>
                    ) : (
                      <ElementComponent {...(props || {})} />
                    )
                  }
                />
              );
            }
          )}
        </Routes>
      </Suspense>
      <Toaster position="top-right" />
    </>
  );
}

export default App;
