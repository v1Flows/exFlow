"use client";
import { type RefObject, useLayoutEffect, useRef, useState } from "react";

interface MouseState {
  x: number | null;
  y: number | null;
  elementX: number | null;
  elementY: number | null;
  elementPositionX: number | null;
  elementPositionY: number | null;
}

// eslint-disable-next-line no-undef
export function useMouse(): [MouseState, RefObject<HTMLDivElement>] {
  const [state, setState] = useState<MouseState>({
    x: null,
    y: null,
    elementX: null,
    elementY: null,
    elementPositionX: null,
    elementPositionY: null,
  });

  // eslint-disable-next-line no-undef
  const ref = useRef<HTMLDivElement | null>(null);

  useLayoutEffect(() => {
    // eslint-disable-next-line no-undef
    const handleMouseMove = (event: MouseEvent) => {
      const newState: Partial<MouseState> = {
        x: event.pageX,
        y: event.pageY,
      };

      // eslint-disable-next-line no-undef
      if (ref.current instanceof Element) {
        const { left, top } = ref.current.getBoundingClientRect();
        // eslint-disable-next-line no-undef
        const elementPositionX = left + window.scrollX;
        // eslint-disable-next-line no-undef
        const elementPositionY = top + window.scrollY;
        const elementX = event.pageX - elementPositionX;
        const elementY = event.pageY - elementPositionY;

        newState.elementX = elementX;
        newState.elementY = elementY;
        newState.elementPositionX = elementPositionX;
        newState.elementPositionY = elementPositionY;
      }

      setState((s) => ({
        ...s,
        ...newState,
      }));
    };

    // eslint-disable-next-line no-undef
    document.addEventListener("mousemove", handleMouseMove);

    return () => {
      // eslint-disable-next-line no-undef
      document.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return [state, ref];
}
