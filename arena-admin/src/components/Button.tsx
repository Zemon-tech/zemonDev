import type { ButtonHTMLAttributes } from 'react';
import LoadingSpinner from './LoadingSpinner';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'outline';
  size?: 'small' | 'medium' | 'large';
  isLoading?: boolean;
  loadingText?: string;
  fullWidth?: boolean;
}

const Button = ({
  children,
  variant = 'primary',
  size = 'medium',
  isLoading = false,
  loadingText,
  fullWidth = false,
  disabled,
  className = '',
  ...rest
}: ButtonProps) => {
  // Base classes
  const baseClasses = 'inline-flex items-center justify-center rounded-md font-medium focus:outline-none transition-colors';

  // Size classes
  const sizeClasses = {
    small: 'px-2.5 py-1.5 text-xs',
    medium: 'px-4 py-2 text-sm',
    large: 'px-6 py-3 text-base',
  };

  // Variant classes
  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-2 focus:ring-offset-2 focus:ring-blue-500',
    secondary: 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-2 focus:ring-offset-2 focus:ring-gray-500',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-2 focus:ring-offset-2 focus:ring-red-500',
    success: 'bg-green-600 text-white hover:bg-green-700 focus:ring-2 focus:ring-offset-2 focus:ring-green-500',
    outline: 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-offset-2 focus:ring-blue-500',
  };

  // Disabled classes
  const disabledClasses = 'opacity-50 cursor-not-allowed';

  // Full width classes
  const widthClasses = fullWidth ? 'w-full' : '';

  return (
    <button
      className={`
        ${baseClasses}
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        ${(disabled || isLoading) ? disabledClasses : ''}
        ${widthClasses}
        ${className}
      `}
      disabled={disabled || isLoading}
      {...rest}
    >
      {isLoading ? (
        <>
          <LoadingSpinner 
            size="small" 
            color={variant === 'outline' ? 'primary' : 'white'} 
            className="mr-2"
          />
          {loadingText || children}
        </>
      ) : (
        children
      )}
    </button>
  );
};

export default Button; 