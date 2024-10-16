import { useRef, useState, useCallback } from "react";

// Ease-in-out timing function
const easeInOut = (t: number): number => {
  return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
};

const useAnimate = (
  initialValue: number
): [
  number,
  (startValue: number, targetValue: number, duration: number) => void,
  (value: number) => void
] => {
  const [value, setValue] = useState(initialValue);
  const startTimeRef = useRef<number | null>(null);
  const currentStartValueRef = useRef<number | null>(null);
  const currentTargetRef = useRef<number | null>(null);

  const animate = useCallback(
    (startValue: number, targetValue: number, duration: number) => {
      currentStartValueRef.current = startValue;
      currentTargetRef.current = targetValue;
      startTimeRef.current = null; // Reset start time for each animation

      const animationFrame = (timestamp: number) => {
        if (startTimeRef.current === null) startTimeRef.current = timestamp;

        const elapsed = timestamp - (startTimeRef.current || 0);
        const progress = Math.min(elapsed / duration, 1);
        const easedProgress = easeInOut(progress);

        // Calculate the current value
        const currentValue =
          currentStartValueRef.current! +
          (currentTargetRef.current! - currentStartValueRef.current!) *
            easedProgress;
        setValue(currentValue);

        // Continue animation if not yet finished
        if (progress < 1) {
          requestAnimationFrame(animationFrame);
        }
      };

      // Start the animation
      requestAnimationFrame(animationFrame);
    },
    [initialValue]
  );

  const setImmediateValue = useCallback((value: number) => {
    currentTargetRef.current = value;
    setValue(value);
    startTimeRef.current = null; // Reset for immediate value set
  }, []);

  return [value, animate, setImmediateValue];
};

export default useAnimate;
