import { create } from 'zustand'

const useAuthStore = create((set, get) => ({
  user: null,
  token: null,       // access token (in-memory only)
  refreshToken: null,
  isLoggedIn: false,
  hasProfile: false,

  setUser: (user) => set({ user }),

  setToken: (access, refresh) =>
    set({ token: access, refreshToken: refresh ?? get().refreshToken, isLoggedIn: !!access }),

  setAuth: (user, access, refresh) =>
    set({ user, token: access, refreshToken: refresh, isLoggedIn: true }),

  setHasProfile: (val) => set({ hasProfile: val }),

  incrementGenerationsUsed: () =>
    set((state) => ({
      user: state.user ? { ...state.user, generations_used: (state.user.generations_used ?? 0) + 1 } : state.user,
    })),

  logout: () => set({ user: null, token: null, refreshToken: null, isLoggedIn: false, hasProfile: false }),
}))

export default useAuthStore
