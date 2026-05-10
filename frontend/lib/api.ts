import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api",
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

// REQUEST INTERCEPTOR
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
        } catch (e) {
          console.error("Token parse failed");
        }
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// RESPONSE INTERCEPTOR
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

/* =========================
   AUTH API
========================= */
export const authAPI = {
  login: (data) => api.post("/auth/login", data),
  register: (data) => api.post("/auth/register", data),
  // BUG FIX: backend route is /auth/me, not /users/profile
  getProfile: () => api.get("/auth/me"),
};

/* =========================
   LEADS API
========================= */
export const leadsAPI = {
  getAll: (params) => api.get("/leads", { params }),
  getById: (id) => api.get(`/leads/${id}`),
  // BUG FIX: backend route is /leads/create, not /leads
  submitLead: (data) => api.post("/leads/create", data),
  // BUG FIX: backend expects POST /leads/purchase with {leadId} in body
  lockLead: (leadId) => api.post("/leads/lock", { leadId }),
  purchaseLead: (leadId) => api.post("/leads/purchase", { leadId }),
};

/* =========================
   USERS API
========================= */
export const usersAPI = {
  getCredits: () => api.get("/users/credits"),
  getTransactions: () => api.get("/users/transactions"),
  getPurchasedLeads: () => api.get("/users/purchased-leads"),
  getAnalytics: () => api.get("/users/analytics"),
  // BUG FIX: backend uses PATCH /users/profile, not PUT
  updateProfile: (data) => api.patch("/users/profile", data),
};

/* =========================
   PAYMENTS API
========================= */
export const paymentsAPI = {
  createOrder: (data) => api.post("/payments/create-order", data),
  verifyPayment: (data) => api.post("/payments/verify", data),
};

/* =========================
   ADMIN API
========================= */
export const adminAPI = {
  getDashboard: () => api.get("/admin/dashboard"),
  getLeads: (params?) => api.get("/admin/leads", { params }),
  getUsers: (params?) => api.get("/admin/users", { params }),
  getTransactions: (params?) => api.get("/admin/transactions", { params }),
  // BUG FIX: these were missing from the API client
  verifyLead: (id: string, quality: string) => api.patch(`/admin/leads/${id}/verify`, { quality }),
  rejectLead: (id: string, reason?: string) => api.patch(`/admin/leads/${id}/reject`, { reason }),
  toggleUserActive: (id: string) => api.patch(`/admin/users/${id}/toggle-active`),
};

/* =========================
   NOTIFICATIONS API
========================= */
export const notificationAPI = {
  getNotifications: async () => {
    const res = await api.get("/notifications");
    return res.data;
  },

  markAsRead: async (id) => {
    const res = await api.put(`/notifications/${id}/read`);
    return res.data;
  },

  markAllAsRead: async () => {
    const res = await api.put("/notifications/read-all");
    return res.data;
  },

  deleteNotification: async (id) => {
    const res = await api.delete(`/notifications/${id}`);
    return res.data;
  },

  createTestNotification: async () => {
    const res = await api.post("/notifications/test");
    return res.data;
  },
};

export default api;