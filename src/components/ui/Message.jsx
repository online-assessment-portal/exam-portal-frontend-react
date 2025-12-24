import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Info, AlertTriangle, XCircle, X } from 'lucide-react';
import PropTypes from 'prop-types';

const Message = ({
  type = 'info',
  message,
  className = '',
  role,
  duration,
  dismissible = true,
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (message) {
      setIsVisible(true);

      if (duration) {
        const timer = setTimeout(() => setIsVisible(false), duration);
        return () => clearTimeout(timer);
      }
    }
  }, [message, type, duration]);

  const variants = {
    error: {
      container:
        'bg-gradient-to-r from-red-50 to-red-100 text-red-900 border-red-200',
      icon: (
        <XCircle className="h-5 w-5 text-red-600 shrink-0 drop-shadow-sm" />
      ),
      role: role || 'alert',
    },
    success: {
      container:
        'bg-gradient-to-r from-green-50 to-green-100 text-green-900 border-green-200',
      icon: (
        <CheckCircle className="h-5 w-5 text-green-600 shrink-0 drop-shadow-sm" />
      ),
      role: role || 'status',
    },
    info: {
      container:
        'bg-gradient-to-r from-blue-50 to-blue-100 text-blue-900 border-blue-200',
      icon: <Info className="h-5 w-5 text-blue-600 shrink-0 drop-shadow-sm" />,
      role: role || 'status',
    },
    warning: {
      container:
        'bg-gradient-to-r from-yellow-50 to-yellow-100 text-yellow-900 border-yellow-200',
      icon: (
        <AlertTriangle className="h-5 w-5 text-yellow-600 shrink-0 drop-shadow-sm" />
      ),
      role: role || 'alert',
    },
  };

  const variant = variants[type] || variants.info;

  const animationVariants = {
    initial: { opacity: 0, y: -8, scale: 0.95 },
    animate: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.25, ease: 'easeOut' },
    },
    exit: {
      opacity: 0,
      y: -8,
      scale: 0.95,
      transition: { duration: 0.2, ease: 'easeIn' },
    },
  };

  return (
    <AnimatePresence>
      {message && isVisible && (
        <motion.div
          initial="initial"
          animate="animate"
          exit="exit"
          variants={animationVariants}
          className={`relative flex items-start gap-2 sm:gap-3 border rounded-xl px-3 sm:px-4 py-2 sm:py-3 shadow-lg mt-4 mx-2 sm:mx-4 text-xs sm:text-sm font-medium backdrop-blur-sm ${variant.container} ${className}`}
          role={variant.role}
          aria-live={variant.role === 'alert' ? 'assertive' : 'polite'}
        >
          {variant.icon}
          <span className="flex-1">{message}</span>

          {dismissible && (
            <button
              onClick={() => setIsVisible(false)}
              type="button"
              className="absolute -top-2 -right-2 sm:-top-3 sm:-right-3 w-5 h-5 sm:w-6 sm:h-6 bg-white border border-gray-200 rounded-full flex items-center justify-center shadow-md hover:bg-gray-50 hover:border-gray-300 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-200"
              aria-label="Close"
            >
              <X className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-gray-600 hover:text-gray-800 transition-colors duration-200" />
            </button>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

Message.propTypes = {
  type: PropTypes.oneOf(['error', 'success', 'info', 'warning']),
  message: PropTypes.string,
  className: PropTypes.string,
  role: PropTypes.string,
  duration: PropTypes.number,
  dismissible: PropTypes.bool,
};

export default Message;
