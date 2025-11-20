import React from 'react';
import { useSelector } from 'react-redux';

const GlobalLoader = () => {
  const { isLoading, message } = useSelector((state) => state.loader);

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 sm:p-8 shadow-xl flex flex-col items-center gap-3 sm:gap-4 max-w-sm mx-auto">
        <div className="w-10 h-10 sm:w-12 sm:h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-center text-foreground font-medium text-sm sm:text-base">
          {message || 'Loading...'}
        </p>
      </div>
    </div>
  );
};

export default GlobalLoader;
