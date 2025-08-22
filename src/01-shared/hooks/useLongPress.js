import { useRef, useEffect, useCallback } from 'react';

const useLongPress = (callback, { delay = 500 } = {}) => {
  const timeout = useRef();
  const target = useRef();

  const start = useCallback(
    (event) => {
      if (event.touches && event.touches.length > 1) return; // Ignore multi-touch
      event.persist(); // Persist the event for async access

      timeout.current = setTimeout(() => {
        callback(event);
      }, delay);
    },
    [callback, delay]
  );

  const clear = useCallback(() => {
    clearTimeout(timeout.current);
  }, []);

  useEffect(() => {
    const targetElement = target.current;
    if (!targetElement) return;

    targetElement.addEventListener('touchstart', start);
    targetElement.addEventListener('touchend', clear);
    targetElement.addEventListener('touchcancel', clear);

    return () => {
      targetElement.removeEventListener('touchstart', start);
      targetElement.removeEventListener('touchend', clear);
      targetElement.removeEventListener('touchcancel', clear);
    };
  }, [start, clear]);

  return {
    ref: target
    // Add onMouseDown, onMouseUp, onMouseLeave for desktop hover simulation if needed later
    // For now, focusing on touch events for mobile long press
  };
};

export default useLongPress;