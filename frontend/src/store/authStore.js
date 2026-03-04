import { create } from 'zustand'

const useAuthStore = create((set, get) => ({
  user: null,
  token: null,       // access token (in-memory only)
  refreshToken: null,
  isLoggedIn: false,

  setUser: (user) => set({ user }),

  setToken: (access, refresh) =>
    set({ token: access, refreshToken: refresh ?? get().refreshToken, isLoggedIn: !!access }),

  setAuth: (user, access, refresh) =>
    set({ user, token: access, refreshToken: refresh, isLoggedIn: true }),

  logout: () => set({ user: null, token: null, refreshToken: null, isLoggedIn: false }),
}))

export default useAuthStore
