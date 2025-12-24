import { useEffect, useState } from 'react';

function useLocalStorage(key, initialValue = null) {
  const [state, setState] = useState(() => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === key && e.storageArea === localStorage) {
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
      localStorage.setItem(key, JSON.stringify(valueToStore));
      window.dispatchEvent(new StorageEvent('storage', {
        key,
        newValue: JSON.stringify(valueToStore),
        storageArea: localStorage
      }));
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error);
    }
  };

  const removeValue = () => {
    try {
      localStorage.removeItem(key);
      setState(initialValue);
    } catch (error) {
      console.warn(`Error removing localStorage key "${key}":`, error);
    }
  };

  return [state, setValue, removeValue];
}

export default useLocalStorage;
