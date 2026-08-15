import { useState, useEffect, useRef } from "react";

/**
 * Debounced value hook - prevents excessive API calls
 * @param {*} value - The value to debounce
 * @param {number} delay - Delay in ms (default 300)
 */
export const useDebounce = (value, delay = 300) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
};

/**
 * Debounced callback hook - for handlers that need debouncing
 * @param {Function} callback - The callback to debounce
 * @param {number} delay - Delay in ms (default 300)
 */
export const useDebouncedCallback = (callback, delay = 300) => {
  const timeoutRef = useRef(null);

  const debouncedCallback = (...args) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      callback(...args);
    }, delay);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return debouncedCallback;
};

/**
 * Intersection Observer hook for infinite scroll
 * @param {Function} onIntersect - Callback when element intersects
 * @param {Object} options - IntersectionObserver options
 */
export const useIntersectionObserver = (onIntersect, options = {}) => {
  const ref = useRef(null);
  const observerRef = useRef(null);

  useEffect(() => {
    if (ref.current && onIntersect) {
      observerRef.current = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting) {
            onIntersect();
          }
        },
        { rootMargin: "300px", threshold: 0, ...options }
      );

      observerRef.current.observe(ref.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [onIntersect, options.rootMargin, options.threshold]);

  return ref;
};

/**
 * Local storage hook with SSR safety
 * @param {string} key - Storage key
 * @param {*} initialValue - Default value if key doesn't exist
 */
export const useLocalStorage = (key, initialValue) => {
  const [storedValue, setStoredValue] = useState(() => {
    if (typeof window === "undefined") return initialValue;

    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = (value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      if (typeof window !== "undefined") {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue];
};

/**
 * Previous value hook - tracks the previous render value
 * @param {*} value - Current value
 */
export const usePrevious = (value) => {
  const ref = useRef();

  useEffect(() => {
    ref.current = value;
  }, [value]);

  return ref.current;
};

/**
 * Abortable fetch hook
 */
export const useAbortFetch = () => {
  const abortControllerRef = useRef(null);

  const startFetch = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();
    return abortControllerRef.current.signal;
  };

  const cancelFetch = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  };

  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return { startFetch, cancelFetch };
};