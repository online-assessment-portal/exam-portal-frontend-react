const Spinner = ({ size = 20, className = '', ariaLabel = 'Loading...' }) => {
  return (
    <div
      className={`inline-block animate-spin rounded-full ${className}`}
      style={{ width: `${size}px`, height: `${size}px` }}
      role="status"
      aria-label={ariaLabel}
    >
      <span className="sr-only">{ariaLabel}</span>
    </div>
  );
};

export default Spinner;
