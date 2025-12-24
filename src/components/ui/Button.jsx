// src/components/ui/Button.jsx
import clsx from 'clsx';
import Spinner from './Spinner';

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  iconLeft,
  iconRight,
  loadingText,
  className,
  ...props
}) {
  const baseStyles =
    'inline-flex items-center justify-center font-medium rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-offset-2';

  const variantStyles = {
    primary:
      'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 disabled:bg-blue-400',
    secondary:
      'bg-gray-100 text-gray-800 hover:bg-gray-200 focus:ring-gray-400 disabled:bg-gray-100',
    danger:
      'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 disabled:bg-red-400',
    outline:
      'border border-gray-400 text-gray-800 hover:bg-gray-100 focus:ring-gray-400',
  };

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  const spinnerSize = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  const spinnerColors = {
    primary: 'border-white border-t-transparent',
    secondary: 'border-gray-600 border-t-transparent',
    danger: 'border-white border-t-transparent',
    outline: 'border-gray-600 border-t-transparent',
  };

  const isDisabled = isLoading || disabled;

  return (
    <button
      {...props}
      disabled={isDisabled}
      aria-disabled={isDisabled}
      aria-busy={isLoading}
      className={clsx(
        baseStyles,
        variantStyles[variant],
        sizeStyles[size],
        'disabled:opacity-90',
        className
      )}
    >
      {isLoading ? (
        <>
          <Spinner
            className={`${spinnerSize[size]} mr-2 border-2 ${spinnerColors[variant]}`}
          />
          {loadingText || 'Processing...'}
        </>
      ) : (
        <>
          {iconLeft && <span className="mr-2">{iconLeft}</span>}
          {children}
          {iconRight && <span className="ml-2">{iconRight}</span>}
        </>
      )}
    </button>
  );
}
