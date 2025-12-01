import axios from "axios";

const instance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE || "http://localhost:8000",
  timeout: 5000,
});

export default instance;
