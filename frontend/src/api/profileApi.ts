import { apiFetch } from "./axios";

export interface Profile {
  phone: string;
  city: string;
  country: string;
  preferences: string;
  language: string;
  avatar_url: string;
}

export async function getProfile() {
  return apiFetch<Profile>("/profile/");
}

export async function updateProfileApi(profile: Partial<Profile>) {
  return apiFetch<Profile>("/profile/", {
    method: "PATCH",
    body: JSON.stringify(profile),
  });
}
