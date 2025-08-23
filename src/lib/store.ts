import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { UserProfile } from './supabase'

interface AuthState {
  user: UserProfile | null
  isAuthenticated: boolean
  isLoading: boolean
  setUser: (user: UserProfile | null) => void
  setLoading: (loading: boolean) => void
  logout: () => void
  updateUser: (updates: Partial<UserProfile>) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: true,
      setUser: (user) => set({ 
        user, 
        isAuthenticated: !!user,
        isLoading: false 
      }),
      setLoading: (isLoading) => set({ isLoading }),
      logout: () => set({ 
        user: null, 
        isAuthenticated: false,
        isLoading: false 
      }),
      updateUser: (updates) => {
        const currentUser = get().user
        if (currentUser) {
          set({ user: { ...currentUser, ...updates } })
        }
      },
    }),
    {
      name: 'bitspark-auth',
      partialize: (state) => ({ 
        user: state.user, 
        isAuthenticated: state.isAuthenticated 
      }),
    }
  )
)

interface AppState {
  theme: 'light' | 'dark'
  sidebarOpen: boolean
  notifications: AppNotification[]
  inviteModalOpen: boolean
  setTheme: (theme: 'light' | 'dark') => void
  toggleSidebar: () => void
  addNotification: (notification: AppNotification) => void
  removeNotification: (id: string) => void
  setInviteModalOpen: (open: boolean) => void
}

interface AppNotification {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message?: string
  duration?: number
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      theme: 'dark',
      sidebarOpen: false,
      notifications: [],
      inviteModalOpen: false,
      setTheme: (theme) => set({ theme }),
      toggleSidebar: () => set({ sidebarOpen: !get().sidebarOpen }),
      addNotification: (notification) => 
        set({ notifications: [...get().notifications, notification] }),
      removeNotification: (id) => 
        set({ notifications: get().notifications.filter(n => n.id !== id) }),
      setInviteModalOpen: (inviteModalOpen) => set({ inviteModalOpen }),
    }),
    {
      name: 'bitspark-app',
      partialize: (state) => ({ 
        theme: state.theme,
        sidebarOpen: state.sidebarOpen 
      }),
    }
  )
)