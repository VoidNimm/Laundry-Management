'use client'

import { SidebarProvider } from "@/components/ui/sidebar"
import { useSidebarState } from "@/lib/sidebar-state"
import { useEffect, useState } from "react"

interface SidebarWrapperProps {
  children: React.ReactNode
  style?: React.CSSProperties
}

export function SidebarWrapper({ children, style }: SidebarWrapperProps) {
  const { isOpen, setIsOpen } = useSidebarState()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Handle state changes from the sidebar context
  const handleOpenChange = (open: boolean) => {
    setIsOpen(open)
  }

  if (!mounted) {
    return (
      <SidebarProvider style={style}>
        {children}
      </SidebarProvider>
    )
  }

  return (
    <SidebarProvider
      open={isOpen}
      onOpenChange={handleOpenChange}
      style={style}
    >
      {children}
    </SidebarProvider>
  )
}
