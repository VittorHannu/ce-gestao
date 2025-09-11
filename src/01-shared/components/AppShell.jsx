import React from 'react';

const AppShell = () => {
  return (
    <div className="h-screen flex flex-col animate-pulse">
      {/* Header Placeholder */}
      <div className="fixed top-0 left-0 right-0 z-10 border-b bg-background" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
        <div className="container mx-auto flex items-center p-4 h-[69px]">
          <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>

      {/* Main Content Placeholder */}
      <div className="flex-grow flex items-center justify-center" style={{ paddingTop: '69px' }}>
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-blue-500"></div>
      </div>

      {/* Bottom Nav Placeholder */}
      <div className="fixed bottom-0 left-0 right-0 h-14 bg-background border-t" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
        <div className="container mx-auto h-full flex justify-around items-center">
          <div className="h-6 w-6 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-6 w-6 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-6 w-6 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-6 w-6 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    </div>
  );
};

export default AppShell;
