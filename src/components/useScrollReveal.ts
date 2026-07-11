"use client";

import { useEffect, useRef, useState } from "react";

// Fires `true` once the element enters the viewport, then stays true —
// used to trigger the line-draw / underline / fade-rise CSS animations
// exactly when the editorial section scrolls into view.
export function useScrollReveal<T extends HTMLElement>(threshold = 0.25) {
  const ref = useRef<T | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect(); // animate once, not every scroll pass
        }
      },
      { threshold }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return { ref, visible };
}