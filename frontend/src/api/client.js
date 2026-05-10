import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api";

export const api = axios.create({
  baseURL: API_BASE_URL,
});

// ─── JWT Token Management ───
export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common.Authorization;
  }
};

/**
 * Axios interceptor: if a request gets a 401, try to refresh the JWT
 * using the stored refresh token. If refresh fails, clear auth.
 */
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url.includes("/auth/login") &&
      !originalRequest.url.includes("/auth/refresh")
    ) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem("traveloop_refresh");
      if (refreshToken) {
        try {
          const { data } = await axios.post(`${API_BASE_URL}/auth/refresh/`, {
            refresh: refreshToken,
          });
          localStorage.setItem("traveloop_token", data.access);
          if (data.refresh) {
            localStorage.setItem("traveloop_refresh", data.refresh);
          }
          setAuthToken(data.access);
          originalRequest.headers.Authorization = `Bearer ${data.access}`;
          return api(originalRequest);
        } catch {
          // Refresh failed — clear everything
          localStorage.removeItem("traveloop_token");
          localStorage.removeItem("traveloop_refresh");
          localStorage.removeItem("traveloop_username");
          setAuthToken(null);
        }
      }
    }

    return Promise.reject(error);
  }
);

// ─── Auth ───
export const signup = async (payload) => {
  const { data } = await api.post("/auth/register/", payload);
  return data;
};

export const login = async (payload) => {
  const { data } = await api.post("/auth/login/", payload);
  // JWT returns { access, refresh }
  return data;
};

export const logout = async () => {
  // JWT is stateless — just clear tokens client-side
  localStorage.removeItem("traveloop_token");
  localStorage.removeItem("traveloop_refresh");
  localStorage.removeItem("traveloop_username");
  setAuthToken(null);
};

// ─── Trips ───
export const fetchTrips = async () => {
  const { data } = await api.get("/trips/");
  return data;
};

export const createTrip = async (payload) => {
  const { data } = await api.post("/trips/", payload);
  return data;
};

export const deleteTrip = async (id) => {
  await api.delete(`/trips/${id}/`);
};

// ─── Stops ───
export const createStop = async (payload) => {
  const { data } = await api.post("/stops/", payload);
  return data;
};

export const deleteStop = async (id) => {
  await api.delete(`/stops/${id}/`);
};

// ─── Stop Activities ───
export const createStopActivity = async (payload) => {
  const { data } = await api.post("/stop-activities/", payload);
  return data;
};

// ─── Public ───
export const fetchPublicTrip = async (tripId) => {
  const { data } = await api.get(`/public/trips/${tripId}/`);
  return data;
};

// ─── Cities ───
export const fetchCities = async () => {
  const { data } = await api.get("/cities/");
  return data;
};

// ─── Activities ───
export const fetchActivities = async () => {
  const { data } = await api.get("/activities/");
  return data;
};

// ─── Budget ───
export const fetchBudget = async (tripId) => {
  const { data } = await api.get(`/trips/${tripId}/budget/`);
  return data;
};

// ─── Packing Items ───
export const fetchPackingItems = async () => {
  const { data } = await api.get("/packing-items/");
  return data;
};

export const createPackingItem = async (payload) => {
  const { data } = await api.post("/packing-items/", payload);
  return data;
};

export const updatePackingItem = async (id, payload) => {
  const { data } = await api.patch(`/packing-items/${id}/`, payload);
  return data;
};

export const deletePackingItem = async (id) => {
  await api.delete(`/packing-items/${id}/`);
};

// ─── Notes ───
export const fetchNotes = async () => {
  const { data } = await api.get("/notes/");
  return data;
};

export const createNote = async (payload) => {
  const { data } = await api.post("/notes/", payload);
  return data;
};

export const deleteNote = async (id) => {
  await api.delete(`/notes/${id}/`);
};
