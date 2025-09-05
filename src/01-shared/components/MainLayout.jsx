import React, { useEffect, useRef, useState, useLayoutEffect } from 'react';
import { useLocation } from 'react-router-dom';
import * as Tooltip from '@radix-ui/react-tooltip';
import { cn } from '@/01-shared/utils/utils';

const MainLayout = ({ children, header, _user, headerClassName }) => {
  const scrollContainerRef = useRef(null);
  const mainRef = useRef(null);
  const headerRef = useRef(null);
  const [headerHeight, setHeaderHeight] = useState(0);
  const location = useLocation();

  useLayoutEffect(() => {
    if (headerRef.current) {
      setHeaderHeight(headerRef.current.offsetHeight);
    } else {
      setHeaderHeight(0);
    }
  }, [header, location.pathname]); // Recalculate on header content or page change

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <Tooltip.Provider>
      <div ref={scrollContainerRef} className="h-screen flex flex-col">
        {header && (
          <div
            ref={headerRef} // Attach ref to measure height
            className={cn(
              'fixed top-0 left-0 right-0 z-10 border-b bg-background',
              headerClassName
            )}
            style={{ paddingTop: 'env(safe-area-inset-top)' }}
          >
            <div className="container mx-auto flex items-center p-4">
              {header}
            </div>
          </div>
        )}
        <div className="flex flex-1">
          <main
            ref={mainRef}
            className="flex-grow px-2 overflow-y-visible max-w-screen-md mx-auto w-full"
            style={{
              paddingTop: `${headerHeight}px`,
              paddingBottom: '60px'
            }}
          >
            {children}
          </main>
        </div>
      </div>
    </Tooltip.Provider>
  );
};

export default MainLayout;