"use client";

import { useCallback, useEffect, useState } from "react";

export function useLocalStorage<T>(key: string, defaultValue: T) {
  const [value, setValue] = useState<T>(defaultValue);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(key);
      if (raw !== null) {
        setValue(JSON.parse(raw) as T);
      }
    } catch {
      // ignore parse / unavailable
    }
    setReady(true);
  }, [key]);

  useEffect(() => {
    if (!ready) return;
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // ignore quota errors
    }
  }, [key, value, ready]);

  const reset = useCallback(() => {
    setValue(defaultValue);
  }, [key, defaultValue]);

  return { value, setValue, reset, ready } as const;
}
