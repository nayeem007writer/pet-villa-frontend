import axios from "axios";
import { getAuthToken } from "../utils/auth";

const API = axios.create({
  baseURL: "http://[::1]:3000/api/v1",
});

// Attach token to every request
API.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const login = async (data) => {
  const response = await API.post("/auth/login", data);
  return response.data;
};

export const register = async (data) => {
  const response = await API.post("/auth/register", data);
  return response.data;
};
