import toast from 'react-hot-toast';
import { AppToast } from './AppToast';

// Default error message
const DEFAULT_ERROR = 'Something went wrong. Please try again later.';

export const notifications = {
  // Basic notifications (auto-dismiss)
  success: (message, options = {}) => toast.success(message, options),
  error: (message = DEFAULT_ERROR, options = {}) =>
    toast.error(message, options),
  info: (message, options = {}) => toast(message, { icon: '💡', ...options }),
  loading: (message, options = {}) => toast.loading(message, options),

  // Custom notifications with AppToast
  successCustom: (message, options = {}) => {
    const { heading, ...toastOptions } = options;
    return toast.custom(
      (t) => (
        <AppToast t={t} type="success" heading={heading} message={message} />
      ),
      toastOptions
    );
  },

  errorCustom: (message = DEFAULT_ERROR, options = {}) => {
    const { heading, ...toastOptions } = options;
    return toast.custom(
      (t) => (
        <AppToast t={t} type="error" heading={heading} message={message} />
      ),
      toastOptions
    );
  },

  infoCustom: (message, options = {}) => {
    const { heading, ...toastOptions } = options;
    return toast.custom(
      (t) => <AppToast t={t} type="info" heading={heading} message={message} />,
      toastOptions
    );
  },

  loadingCustom: (message, options = {}) => {
    const { heading, ...toastOptions } = options;
    return toast.custom(
      (t) => (
        <AppToast t={t} type="loading" heading={heading} message={message} />
      ),
      toastOptions
    );
  },

  // Promise-based notifications
  promise: (promise, messages) =>
    toast.promise(promise, {
      loading: messages.loading || 'Loading...',
      success: messages.success || 'Success!',
      error: messages.error || DEFAULT_ERROR,
    }),

  // Auth-specific notifications
  auth: {
    loginSuccess: () =>
      notifications.successCustom('Welcome back!', {
        heading: 'Login Successful',
      }),
    loginError: (message = 'Invalid credentials') =>
      notifications.errorCustom(message, { heading: 'Login Failed' }),
    signupSuccess: () =>
      notifications.successCustom('Welcome!', {
        heading: 'Account Created',
      }),
    signupError: (message = 'Registration failed') =>
      notifications.errorCustom(message, { heading: 'Signup Failed' }),
    resetPasswordSuccess: () =>
      notifications.successCustom('Welcome!', {
        heading: 'Reset Success',
      }),
    resetPasswordError: (message = 'Reset failed') =>
      notifications.errorCustom(message, { heading: 'Reset Failed' }),
    logoutSuccess: () =>
      notifications.successCustom('See you soon!', { heading: 'Logged Out' }),
    sessionExpired: () =>
      notifications.errorCustom('Please login again.', {
        heading: 'Session Expired',
      }),
  },

  profile: {},

  // Exam-specific notifications
  exam: {
    basicProfileRequired: () =>
      notifications.successCustom('Please fill the required fields.', {
        heading: 'Basic Profile Required',
      }),
    examStarted: () =>
      notifications.successCustom('Good luck!', { heading: 'Exam Started' }),
    examSubmitted: () =>
      notifications.successCustom('Your responses have been saved.', {
        heading: 'Exam Submitted',
      }),
    timeWarning: (minutes) =>
      notifications.infoCustom(`${minutes} minutes left`, {
        heading: 'Time Warning',
      }),
    autoSaved: () =>
      notifications.infoCustom('All changes saved', {
        heading: 'Auto-saved',
      }),
  },

  serverConnectionError: () =>
    notifications.errorCustom('Check your internet', {
      heading: 'Connection Error',
    }),

  // Utility functions
  dismiss: (toastId) => toast.dismiss(toastId),
  dismissAll: () => toast.dismiss(),

  // Custom toast with JSX content
  custom: (content, options = {}) => toast.custom(content, options),
};

// Default export
export default notifications;

const normalizeLegacyMessage = (input) => {
  if (typeof input !== 'string') return input;
  return input
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/h[1-6]>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&starf;/g, '★')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .trim();
};

export const notify = (msgHolder, what, msg, time = 5000) => {
  const message = normalizeLegacyMessage(msg);
  if (what === 's') {
    return notifications.successCustom(message || 'Success', {
      duration: time,
    });
  }
  return notifications.errorCustom(message, { duration: time });
};

// ----------- Custom Notification (backup code) -------------
// let crntHide;
// function mouseHide(msgHolder, ele, tm) {
//   // Check if the Element is being removed
//   if (crntHide === ele) return false;
//   clearTimeout(tm);
//   hideMsg(msgHolder, ele);
// }
// function hideMsg(msgHolder, node) {
//   crntHide = node;
//   //
//   const style = node.style;
//   style.padding = '0.1px';
//   style.marginTop = 0;
//   style.maxHeight = 0;
//   style.minHeight = 0;
//   style.transition = 'all 200ms linear';
//   node.style.animation = 'fadeOutUp 300ms ease-out';
//   setTimeout(() => {
//     // Check id node to be removed exists in Message Holder
//     if (node.parentNode === msgHolder) msgHolder.removeChild(node);
//     node = null;
//     crntHide = null;
//   }, 295);
// }
// export const notify = (msgHolder, what, msg, time = 5000) => {
//   msgHolder = msgHolder.current;
//   if (!msgHolder) return false;
//   const ele = document.createElement('div');
//   if (what === 's') ele.className = 'msgS';
//   else ele.className = 'msgE';
//   if (msg) ele.innerHTML = `<p>${msg}</p>`;
//   else
//     ele.innerHTML =
//       "<p>Something went wrong.<br>Request couldn't be fulfilled at the moment.<br>Please retry after sometime.</p>";
//   msgHolder.appendChild(ele);
//   const timeOut = setTimeout(() => {
//     hideMsg(msgHolder, ele);
//   }, time);
//   ele.addEventListener('mouseleave', () => mouseHide(msgHolder, ele, timeOut));
//   ele.addEventListener('click', () => mouseHide(msgHolder, ele, timeOut));
// };
// ----------- Custom Notification (backup code) -------------
