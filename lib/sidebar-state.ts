import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface SidebarState {
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
}

export const useSidebarState = create<SidebarState>()(
  persist(
    (set) => ({
      isOpen: true,
      setIsOpen: (isOpen: boolean) => set({ isOpen }),
    }),
    {
      name: 'sidebar-state',
    }
  )
)
