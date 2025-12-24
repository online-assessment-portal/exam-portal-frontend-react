import http, { handleApiError } from './http';

export const sendOTP = async (email, isReset = false) => {
  try {
    const routePath = `/auth/${isReset ? 'reset' : 'register'}/send-otp`;
    const { data } = await http.post(routePath, { email });
    return data;
  } catch (error) {
    handleApiError(error);
  }
};

export const verifyOTP = async (email, otp, isReset = false) => {
  try {
    const routePath = `/auth/${isReset ? 'reset' : 'register'}/verify-otp`;
    const { data } = await http.post(routePath, { email, otp });
    return data;
  } catch (error) {
    handleApiError(error);
  }
};

export const complete = async (password, token, isReset = false) => {
  try {
    const routePath = `/auth/${isReset ? 'reset' : 'register'}/complete`;
    const { data } = await http.post(routePath, { password, token });
    return data;
  } catch (error) {
    handleApiError(error);
  }
};

export const signIn = async (email, password) => {
  try {
    const { data } = await http.post('/auth/signin', {
      email,
      password,
    });
    return data;
  } catch (error) {
    handleApiError(error);
  }
};

export const signOut = async () => {
  try {
    const { data } = await http.post('/auth/signout');
    return data;
  } catch (error) {
    handleApiError(error);
  }
};

export const getCurrentUser = async () => {
  try {
    const { data } = await http.get('/auth/me');
    return data;
  } catch (error) {
    handleApiError(error);
  }
};
