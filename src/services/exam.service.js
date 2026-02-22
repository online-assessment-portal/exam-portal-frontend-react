import http, { handleApiError } from './http';

export const fetchTestInfo = async (passcode) => {
  try {
    const routePath = '/cand/examInfo';
    const { data } = await http.get(routePath, {
      params: { passcode },
    });
    return data;
  } catch (error) {
    handleApiError(error);
  }
};
