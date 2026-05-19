import { create } from 'zustand'

const useAuthStore = create((set) => ({
    user: null,
    accessToken: null,
    login: (user, token) => set({
        user, accessToken: token
    }),
    logout: () => set({
        user: null,
        accessToken: null
    })
}))

export default useAuthStore