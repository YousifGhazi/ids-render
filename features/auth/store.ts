import { create } from "zustand";
import { persist } from "zustand/middleware";
import { User } from "@/features/users/types";

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthed: boolean;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
  can: (permission: string, prefixed?: boolean) => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthed: false,
      setAuth: (user: User, token: string) =>
        set({
          user,
          token,
          isAuthed: true,
        }),
      logout: () =>
        set({
          user: null,
          token: null,
          isAuthed: false,
        }),

      can: (permission: string, prefixed: boolean = false) => {
        const state = get();
        if (!state.isAuthed || !state.user) return false;

        if (!state.user.roles || state.user.roles.length === 0) return false;

        return state.user.roles.some((role) =>
          role.permissions?.some((perm) => {
            if (!prefixed) {
              return (
                perm.name === `admin-${permission}` ||
                perm.name === `organization-${permission}`
              );
            }
            return perm.name === permission;
          })
        );
      },
    }),
    {
      name: "auth",
    }
  )
);
