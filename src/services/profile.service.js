import http, { handleApiError } from './http';

export const getProfile = async () => {
  try {
    const routePath = '/profile';
    const { data } = await http.get(routePath);
    return data;
  } catch (error) {
    handleApiError(error);
  }
};

export const updateProfile = async (payload) => {
  try {
    const routePath = '/profile';
    const { data } = await http.patch(routePath, payload);
    return data;
  } catch (error) {
    handleApiError(error);
  }
};
