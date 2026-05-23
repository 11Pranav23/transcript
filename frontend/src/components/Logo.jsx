import React from 'react';

const Logo = ({ className = "w-10 h-10" }) => {
  return (
    <div className={`relative ${className} flex items-center justify-center`}>
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        <defs>
          <linearGradient id="rainbow-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FF0000" />
            <stop offset="20%" stopColor="#FF7F00" />
            <stop offset="40%" stopColor="#FFFF00" />
            <stop offset="60%" stopColor="#00FF00" />
            <stop offset="80%" stopColor="#0000FF" />
            <stop offset="100%" stopColor="#4B0082" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        
        {/* Abstract Colorful Swirl/Wave inspired by user image */}
        <path
          d="M20,50 C20,20 80,20 80,50 C80,80 20,80 20,50"
          stroke="url(#rainbow-grad)"
          strokeWidth="8"
          strokeLinecap="round"
          fill="none"
          filter="url(#glow)"
        />
        <path
          d="M30,50 C30,30 70,30 70,50 C70,70 30,70 30,50"
          stroke="url(#rainbow-grad)"
          strokeWidth="4"
          strokeLinecap="round"
          fill="none"
          opacity="0.6"
        />
        <path
          d="M10,60 C40,40 60,80 90,60"
          stroke="url(#rainbow-grad)"
          strokeWidth="6"
          strokeLinecap="round"
          fill="none"
          strokeDasharray="2 4"
        />
      </svg>
    </div>
  );
};

export default Logo;
