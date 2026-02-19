import http, { handleApiError } from './http';

export const sendContactRequest = async (payload) => {
  try {
    const routePath = '/guest/contact-us';
    const { data } = await http.post(routePath, payload);
    return data;
  } catch (error) {
    handleApiError(error);
  }
};
