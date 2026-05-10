import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api";

export const api = axios.create({
  baseURL: API_BASE_URL,
});

export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common.Authorization = `Token ${token}`;
  } else {
    delete api.defaults.headers.common.Authorization;
  }
};

export const signup = async (payload) => {
  const { data } = await api.post("/auth/signup/", payload);
  return data;
};

export const login = async (payload) => {
  const { data } = await api.post("/auth/login/", payload);
  return data;
};

export const logout = async () => {
  const { data } = await api.post("/auth/logout/");
  return data;
};

export const fetchTrips = async () => {
  const { data } = await api.get("/trips/");
  return data;
};

export const createTrip = async (payload) => {
  const { data } = await api.post("/trips/", payload);
  return data;
};

export const fetchPublicTrip = async (tripId) => {
  const { data } = await api.get(`/public/trips/${tripId}/`);
  return data;
};

export const fetchCities = async () => {
  const { data } = await api.get("/cities/");
  return data;
};

export const fetchActivities = async () => {
  const { data } = await api.get("/activities/");
  return data;
};

export const fetchBudget = async (tripId) => {
  const { data } = await api.get(`/trips/${tripId}/budget/`);
  return data;
};
