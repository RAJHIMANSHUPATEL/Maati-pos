import axios from "axios";
import { clearSession, getSession } from "../utils/session";

const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

client.interceptors.request.use((config) => {
  const session = getSession();
  if (session?.token) {
    config.headers = config.headers || {};
    config.headers.AuthToken = session.token;
  }
  return config;
});

client.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const status = error.response?.status;
    const url = String(error.config?.url || "");
    if (
      status === 401 &&
      !url.includes("/unlock") &&
      !url.includes("/tills") &&
      !url.includes("/signon")
    ) {
      clearSession();
      if (!window.location.pathname.startsWith("/lock") && window.location.pathname !== "/") {
        window.location.assign("/");
      }
    }
    return Promise.reject(error.response?.data || { message: error.message });
  }
);

export const posApi = {
  tills: () => client.get("/tills"),
  unlock: (posId, pin) => client.post("/unlock", { posId, pin }),
  signon: (staff_code, pin) => client.post("/signon", { staff_code, pin }),
  signoff: () => client.post("/signoff"),
  categories: () => client.get("/categories"),
  products: (params) => client.get("/products", { params }),
  barcode: (barcode) => client.post("/barcode", { barcode }),
  sale: (payload) => client.post("/sale", payload),
  today: () => client.get("/sales/today"),
  voidSale: (id, pin) => client.post(`/sales/${id}/void`, pin ? { pin } : {}),
  printed: (id) => client.post(`/sales/${id}/printed`),
};

export default client;
