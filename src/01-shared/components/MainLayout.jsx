import React, { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import * as Tooltip from '@radix-ui/react-tooltip';

const MainLayout = ({ children, header, _user }) => {
  const scrollContainerRef = useRef(null);
  const mainRef = useRef(null);
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <Tooltip.Provider>
      <div ref={scrollContainerRef} className="h-screen flex flex-col">
        {header && (
          <div
            className="fixed top-0 left-0 right-0 z-10 border-b bg-background"
            style={{ paddingTop: 'env(safe-area-inset-top)' }}
          >
            <div className="container mx-auto flex items-center p-4 h-[60px]">
              {header}
            </div>
          </div>
        )}
        <div className="flex flex-1">
          <main
            ref={mainRef}
            className="flex-grow px-2 overflow-y-visible max-w-screen-md mx-auto w-full"
            style={{
              paddingTop: header ? 'calc(70px + env(safe-area-inset-top))' : '10px',
              paddingBottom: '15px'
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