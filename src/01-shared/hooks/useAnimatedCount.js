import { useState, useEffect, useRef } from 'react';

const useAnimatedCount = (endValue, duration = 500) => {
  const [count, setCount] = useState(endValue || 0);
  const frameRef = useRef();
  const startTimeRef = useRef();
  const startValueRef = useRef();

  useEffect(() => {
    if (endValue === count) return;

    startValueRef.current = count;
    startTimeRef.current = performance.now();

    const animate = (timestamp) => {
      const elapsedTime = timestamp - startTimeRef.current;
      const progress = Math.min(elapsedTime / duration, 1);
      const currentVal = Math.round(
        startValueRef.current + (endValue - startValueRef.current) * progress
      );
      setCount(currentVal);

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate);
      }
    };

    frameRef.current = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(frameRef.current);
  }, [endValue, duration, count]);

  return count;
};

export default useAnimatedCount;