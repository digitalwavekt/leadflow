import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api",
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const authStorage = localStorage.getItem("leadflow-auth");

      if (authStorage) {
        try {
          const parsed = JSON.parse(authStorage);
          const token = parsed?.state?.token;

          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
          }
        } catch {
          console.error("Token parse failed");
        }
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("leadflow-auth");
        window.location.href = "/auth/login";
      }
    }

    return Promise.reject(error);
  }
);

type ApiData = Record<string, unknown>;
type ApiParams = Record<string, unknown>;

export const authAPI = {
  login: (data: ApiData) => api.post("/auth/login", data),
  register: (data: ApiData) => api.post("/auth/register", data),
  getProfile: () => api.get("/auth/me"),
};

export const leadsAPI = {
  getAll: (params?: ApiParams) => api.get("/leads", { params }),
  getById: (id: string) => api.get(`/leads/${id}`),
  submitLead: (data: ApiData) => api.post("/leads/create", data),
  lockLead: (leadId: string) => api.post("/leads/lock", { leadId }),
  purchaseLead: (leadId: string) => api.post("/leads/purchase", { leadId }),
};

export const usersAPI = {
  getCredits: () => api.get("/users/credits"),
  getTransactions: () => api.get("/users/transactions"),
  getPurchasedLeads: () => api.get("/users/purchased-leads"),
  getAnalytics: () => api.get("/users/analytics"),
  updateProfile: (data: ApiData) => api.patch("/users/profile", data),
};

export const paymentsAPI = {
  createOrder: (data: ApiData) => api.post("/payments/create-order", data),
  verifyPayment: (data: ApiData) => api.post("/payments/verify", data),
};

export const adminAPI = {
  getDashboard: () => api.get("/admin/dashboard"),
  getLeads: (params?: ApiParams) => api.get("/admin/leads", { params }),
  getUsers: (params?: ApiParams) => api.get("/admin/users", { params }),
  getTransactions: (params?: ApiParams) =>
    api.get("/admin/transactions", { params }),
  getSettings: () => api.get('/admin/settings'),
  updateSettings: (data: ApiData) => api.patch('/admin/settings', data),


  verifyLead: (id: string, quality: string) =>
    api.patch(`/admin/leads/${id}/verify`, { quality }),
  rejectLead: (id: string, reason?: string) =>
    api.patch(`/admin/leads/${id}/reject`, { reason }),
  toggleUserActive: (id: string) =>
    api.patch(`/admin/users/${id}/toggle-active`),
};

export const notificationAPI = {
  getNotifications: async () => {
    const res = await api.get("/notifications");
    return res.data;
  },

  markAsRead: async (id: string) => {
    const res = await api.put(`/notifications/${id}/read`);
    return res.data;
  },

  markAllAsRead: async () => {
    const res = await api.put("/notifications/read-all");
    return res.data;
  },

  deleteNotification: async (id: string) => {
    const res = await api.delete(`/notifications/${id}`);
    return res.data;
  },

  createTestNotification: async () => {
    const res = await api.post("/notifications/test");
    return res.data;
  },
};
export { api };
export default api;