import React from 'react';

export const LoadingSpinner = () => (
  <div className="flex items-center justify-center">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
  </div>
);

export const ErrorMessage = ({ message }) => (
  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
    <p className="font-semibold">Error</p>
    <p className="text-sm">{message}</p>
  </div>
);

export const SuccessMessage = ({ message }) => (
  <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
    <p className="font-semibold">Success</p>
    <p className="text-sm">{message}</p>
  </div>
);

export const Card = ({ children, className = '' }) => (
  <div className={`bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-xl p-6 ${className}`}>
    {children}
  </div>
);

export const Button = ({ children, className = '', ...props }) => (
  <button
    className={`px-4 py-2 rounded-lg font-semibold transition-all duration-300 ${className}`}
    {...props}
  >
    {children}
  </button>
);

export const PrimaryButton = (props) => (
  <Button
    className="bg-gradient-to-r from-primary to-secondary text-white hover:shadow-lg transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
    {...props}
  />
);

export const SecondaryButton = (props) => (
  <Button
    className="bg-slate-700 text-slate-300 hover:bg-slate-600 disabled:opacity-50"
    {...props}
  />
);
