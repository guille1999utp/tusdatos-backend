import { clientHTTP } from "@/api/configAxios";

const login = async (email: string, password: string): Promise<{access_token:string, user: any}> => {
  const response = await clientHTTP.post('/auth/login', { email, password });
  return response.data;
};

export const register = async (userData: {
  email: string;
  password: string;
  name: string;
}) => {
  const res = await clientHTTP.post('/auth/register', userData);
  return res.data;
};

export default { login, register };
