import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { StyleTemplate, PageFlipMode } from '@/types'

interface UIState {
  theme: 'light' | 'dark'
  pageFlipMode: PageFlipMode
  sidebarOpen: boolean
  styleTemplate: StyleTemplate

  setTheme: (theme: 'light' | 'dark') => void
  toggleTheme: () => void
  setPageFlipMode: (mode: PageFlipMode) => void
  toggleSidebar: () => void
  setStyleTemplate: (style: StyleTemplate) => void
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      theme: 'light',
      pageFlipMode: '3d',
      sidebarOpen: true,
      styleTemplate: 'light',

      setTheme: (theme) => set({ theme }),
      toggleTheme: () => set((s) => ({ theme: s.theme === 'light' ? 'dark' : 'light' })),
      setPageFlipMode: (mode) => set({ pageFlipMode: mode }),
      toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
      setStyleTemplate: (style) => set({ styleTemplate: style }),
    }),
    { name: 'mydreambook-ui' }
  )
)
