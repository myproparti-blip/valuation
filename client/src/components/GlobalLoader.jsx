import React from 'react';
import { useSelector } from 'react-redux';
import { FaSpinner } from 'react-icons/fa';

const GlobalLoader = () => {
  const { isLoading, message } = useSelector((state) => state.loader);

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-6 sm:p-8 shadow-2xl flex flex-col items-center gap-4 sm:gap-6 max-w-sm mx-auto border border-slate-100">
        <div className="relative">
          <div className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-slate-200 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-transparent border-t-blue-600 border-r-purple-600 rounded-full animate-spin"></div>
          <div className="absolute inset-2 flex items-center justify-center text-blue-600">
            <FaSpinner className="h-5 w-5 sm:h-7 sm:w-7 animate-spin" />
          </div>
        </div>
        <div className="text-center space-y-1">
          <p className="text-center text-foreground font-semibold text-sm sm:text-base bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            {message || 'Loading...'}
          </p>
          <p className="text-xs text-muted-foreground animate-pulse">Please wait</p>
        </div>
      </div>
    </div>
  );
};

export default GlobalLoader;
