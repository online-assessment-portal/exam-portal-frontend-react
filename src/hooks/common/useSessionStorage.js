import { useEffect, useState } from 'react';

function useSessionStorage(key, initialValue = null) {
  const [state, setState] = useState(() => {
    if (typeof window === 'undefined' || !window.sessionStorage) {
      return initialValue;
    }
    try {
      const item = sessionStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn(`Error reading sessionStorage key "${key}":`, error);
      return initialValue;
    }
  });

  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === key && e.storageArea === sessionStorage) {
        try {
          const newValue = e.newValue ? JSON.parse(e.newValue) : initialValue;
          setState(newValue);
        } catch (error) {
          console.warn(`Error parsing storage change for key "${key}":`, error);
          setState(initialValue);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [key, initialValue]);

  const setValue = (value) => {
    try {
      const valueToStore = value instanceof Function ? value(state) : value;
      setState(valueToStore);
      sessionStorage.setItem(key, JSON.stringify(valueToStore));
      window.dispatchEvent(new StorageEvent('storage', {
        key,
        newValue: JSON.stringify(valueToStore),
        storageArea: sessionStorage
      }));
    } catch (error) {
      console.warn(`Error setting sessionStorage key "${key}":`, error);
    }
  };

  const removeValue = () => {
    try {
      sessionStorage.removeItem(key);
      setState(initialValue);
    } catch (error) {
      console.warn(`Error removing sessionStorage key "${key}":`, error);
    }
  };

  return [state, setValue, removeValue];
}

export default useSessionStorage;
