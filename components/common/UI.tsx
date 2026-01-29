
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  isLoading, 
  className = '', 
  ...props 
}) => {
  const baseStyles = "px-4 py-2 rounded-lg font-medium transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2";
  const variants = {
    primary: "bg-primary text-dark hover:bg-sky-400 active:scale-95",
    secondary: "bg-gray-100 text-gray-800 hover:bg-gray-200",
    danger: "bg-red-500 text-white hover:bg-red-600",
    ghost: "bg-transparent text-gray-600 hover:bg-gray-100"
  };

  return (
    <button className={`${baseStyles} ${variants[variant]} ${className}`} disabled={isLoading || props.disabled} {...props}>
      {isLoading ? (
        <span className="w-5 h-5 border-2 border-dark border-t-transparent rounded-full animate-spin"></span>
      ) : children}
    </button>
  );
};

export const Card: React.FC<{ children: React.ReactNode; title?: string; className?: string }> = ({ 
  children, title, className = '' 
}) => (
  <div className={`bg-white rounded-xl shadow-sm border border-gray-100 p-6 ${className}`}>
    {title && <h3 className="text-lg font-semibold mb-4 text-gray-800">{title}</h3>}
    {children}
  </div>
);

export const Badge: React.FC<{ children: React.ReactNode; color?: string }> = ({ 
  children, color = 'bg-blue-100 text-blue-800' 
}) => (
  <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${color}`}>
    {children}
  </span>
);

export const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { label?: string; error?: string }> = ({ 
  label, error, className = '', ...props 
}) => (
  <div className="w-full">
    {label && <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}
    <input 
      className={`w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-primary outline-none transition-all ${error ? 'border-red-500' : 'border-gray-200'} ${className}`}
      {...props}
    />
    {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
  </div>
);

export const Select: React.FC<React.SelectHTMLAttributes<HTMLSelectElement> & { label?: string; options: string[] }> = ({ 
  label, options, className = '', ...props 
}) => (
  <div className="w-full">
    {label && <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}
    <select 
      className={`w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-primary outline-none bg-white ${className}`}
      {...props}
    >
      {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
    </select>
  </div>
);

export const Modal: React.FC<{ isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode }> = ({ 
  isOpen, onClose, title, children 
}) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold">{title}</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">✕</button>
        </div>
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
};
