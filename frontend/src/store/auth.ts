import { create } from "zustand";
import { persist } from "zustand/middleware";
import { getProfile, updateProfileApi, type Profile } from "@/api/profileApi";
import { hasSession, loginApi, logoutApi, registerApi } from "@/api/authApi";

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: "user" | "admin";
  profile?: Profile;
}

interface AuthState {
  user: User | null;
  hydrated: boolean;
  login: (username: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  loadProfile: () => Promise<void>;
  logout: () => void;
  updateProfile: (patch: Partial<User> & Partial<Profile>) => Promise<void>;
}

const userFromIdentity = (identity: string): User => ({
  id: identity,
  name: identity.split("@")[0].replace(/^./, (c) => c.toUpperCase()),
  email: identity.includes("@") ? identity : `${identity}@traveloop.local`,
  role: identity.includes("admin") ? "admin" : "user",
});

export const useAuth = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      hydrated: hasSession(),
      login: async (username, password) => {
        await loginApi(username, password);
        set({ user: userFromIdentity(username), hydrated: true });
        get().loadProfile().catch(() => {
          // Profile hydration should not block entering the app after JWT login.
        });
      },
      signup: async (name, email, password) => {
        const username = email.trim().toLowerCase();
        await registerApi(username, email, password);
        set({ user: { ...userFromIdentity(username), name, email, role: "user" }, hydrated: true });
        get().loadProfile().catch(() => {
          // Profile hydration should not block entering the app after registration.
        });
      },
      loadProfile: async () => {
        if (!hasSession()) return;
        try {
          const profile = await getProfile();
          set((state) => ({
            user: state.user
              ? { ...state.user, profile }
              : {
                  id: "traveller",
                  name: "Traveloop Traveller",
                  email: "traveller@traveloop.local",
                  role: "user",
                  profile,
                },
            hydrated: true,
          }));
        } catch {
          set({ hydrated: true });
        }
      },
      logout: () => {
        logoutApi();
        set({ user: null, hydrated: false });
      },
      updateProfile: async (patch) => {
        const profilePatch = {
          phone: patch.phone,
          city: patch.city,
          country: patch.country,
          preferences: patch.preferences,
          language: patch.language,
          avatar_url: patch.avatar_url,
        };
        const cleanProfilePatch = Object.fromEntries(
          Object.entries(profilePatch).filter(([, value]) => value !== undefined)
        );
        const profile =
          Object.keys(cleanProfilePatch).length > 0
            ? await updateProfileApi(cleanProfilePatch)
            : get().user?.profile;
        set((state) => ({
          user: state.user ? { ...state.user, ...patch, profile } : state.user,
        }));
      },
    }),
    {
      name: "traveloop-auth",
      partialize: (state) => ({ user: state.user, hydrated: state.hydrated }),
    }
  )
);
