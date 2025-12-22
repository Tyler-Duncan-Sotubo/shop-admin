import Axios from "axios";
import { isAxiosError } from "axios";

const axiosInstance = Axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_URL,
  withCredentials: true, // Ensures cookies are sent with requests
});

export { axiosInstance, isAxiosError };
