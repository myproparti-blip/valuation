import React from 'react';
import { useSelector } from 'react-redux';

const GlobalLoader = () => {
  const { isLoading, message } = useSelector((state) => state.loader);

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 bg-gradient-to-b from-slate-950/70 via-slate-900/60 to-slate-950/70 backdrop-blur-lg flex items-center justify-center z-50 p-4">
      <style>
        {`
          @keyframes shimmer {
            0%, 100% { opacity: 0.5; }
            50% { opacity: 1; }
          }
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-8px); }
          }
          @keyframes pulse-ring {
            0% { 
              box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.7);
            }
            50% {
              box-shadow: 0 0 0 10px rgba(59, 130, 246, 0);
            }
            100% {
              box-shadow: 0 0 0 0 rgba(59, 130, 246, 0);
            }
          }
          @keyframes gradient-shift {
            0%, 100% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
          }
          .loader-spinner {
            animation: pulse-ring 2s infinite;
          }
          .loading-text {
            animation: float 2.5s ease-in-out infinite;
          }
        `}
      </style>

      <div className="flex flex-col items-center gap-8 max-w-md">
        {/* Premium Loader Card */}
        <div className="relative">
          {/* Glow background */}
          <div className="absolute -inset-4 bg-gradient-to-r from-blue-600/30 via-blue-500/20 to-cyan-500/30 rounded-3xl blur-2xl opacity-60"></div>

          {/* Main card */}
          <div className="relative bg-white/10 backdrop-blur-2xl border border-white/20 rounded-3xl p-12 shadow-2xl">
            {/* Spinner container */}
            <div className="flex justify-center items-center mb-8">
              <div className="relative w-20 h-20">
                {/* Outer glow */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 opacity-20 blur-lg"></div>

                {/* Main spinner - premium circular indicator */}
                <svg
                  className="w-20 h-20"
                  viewBox="0 0 100 100"
                  style={{
                    animation: 'rotate 3s linear infinite',
                  }}
                >
                  <defs>
                    <linearGradient id="premiumGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#3b82f6" stopOpacity="1" />
                      <stop offset="50%" stopColor="#06b6d4" stopOpacity="0.8" />
                      <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.6" />
                    </linearGradient>
                  </defs>

                  {/* Background circle */}
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="rgba(255, 255, 255, 0.1)"
                    strokeWidth="2"
                  />

                  {/* Animated gradient circle */}
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="url(#premiumGradient)"
                    strokeWidth="3"
                    strokeDasharray="125 220"
                    strokeLinecap="round"
                    style={{
                      animation: 'pulse 2s ease-in-out infinite',
                      filter: 'drop-shadow(0 0 8px rgba(59, 130, 246, 0.5))',
                    }}
                  />
                </svg>

                {/* Center indicator dot */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-2 h-2 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full loader-spinner"></div>
                </div>
              </div>
            </div>

            {/* Text content */}
            <div className="text-center space-y-3">
              <h3 className="text-white font-semibold text-lg tracking-wide">
                {message || 'Processing'}
              </h3>

              {/* Animated progress bars */}
              <div className="space-y-2 pt-2">
                <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 via-cyan-400 to-blue-500"
                    style={{
                      animation: 'gradient-shift 2s ease infinite',
                      backgroundSize: '200% 100%',
                      width: '100%',
                    }}
                  ></div>
                </div>
              </div>

              {/* Status text */}
              <p className="text-xs text-white/60 font-medium tracking-widest uppercase">
                Please wait
              </p>
            </div>
          </div>
        </div>

        {/* Footer message */}
        <div className="text-center">
          <p className="text-white/50 text-sm font-light">
            Secure processing in progress
          </p>
        </div>
      </div>

      <style>
        {`
          @keyframes rotate {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          @keyframes pulse {
            0%, 100% { stroke-dasharray: 125 220; }
            50% { stroke-dasharray: 220 220; }
          }
        `}
      </style>
    </div>
  );
};

export default GlobalLoader;
