import axios from "axios";

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:5000/api",
  withCredentials: true, // rất quan trọng: cho phép gửi/nhận cookies (refresh token)
});

// Add token to all requests if exists
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: khi 401 -> try refresh and retry once
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      try {
        const r = await api.post("/auth/refresh"); // cookie sent automatically because withCredentials=true
        const newAccess = r.data.accessToken;
        if (newAccess) {
          localStorage.setItem("token", newAccess);
          api.defaults.headers.common["Authorization"] = `Bearer ${newAccess}`;
          original.headers["Authorization"] = `Bearer ${newAccess}`;
          return api(original);
        }
      } catch (err) {
        // refresh failed: clear auth and redirect to login
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/login";
        return Promise.reject(err);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
