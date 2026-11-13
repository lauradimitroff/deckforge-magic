"use client";

import { useEffect, useRef, useState } from "react";

/** Petit message temporaire en bas de l'écran. */
export function useToast(duration = 1800) {
  const [message, setMessage] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);
  return {
    message,
    show: (msg: string) => {
      setMessage(msg);
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setMessage(null), duration);
    },
  };
}
