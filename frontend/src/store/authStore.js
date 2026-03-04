import { create } from 'zustand'

const useAuthStore = create((set) => ({
  user: null,
  token: null,
  isLoggedIn: false,

  setUser: (user) => set({ user }),
  setToken: (token) => set({ token, isLoggedIn: !!token }),
  logout: () => set({ user: null, token: null, isLoggedIn: false }),
}))

export default useAuthStore
