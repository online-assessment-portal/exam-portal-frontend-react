// Global API delay configuration
const API_DELAY = parseInt(import.meta.env.VITE_API_DELAY) || 0;

/**
 * Adds artificial delay to API calls for testing/demo purposes
 * @param {number} customDelay - Optional custom delay in milliseconds
 * @returns {Promise} - Promise that resolves after the delay
 */
export const apiDelay = (customDelay = API_DELAY) => {
  if (customDelay <= 0) return Promise.resolve();
  return new Promise(resolve => setTimeout(resolve, customDelay));
};

export default apiDelay;