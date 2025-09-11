"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import {
  IconDashboard,
  IconReceipt,
  IconUsers,
  IconBuilding,
  IconPackage,
  IconUserCog,
  IconReport,
  IconLogout,
  IconInnerShadowTop,
  IconSettings,
  IconHelp,
} from "@tabler/icons-react"

import { NavDocuments } from "@/components/nav-documents"
import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

// Role-based menu configuration
const getMenuItems = (userRole: string) => {
  const allNavMain = [
    {
      title: "Dashboard",
      url: "/",
      icon: IconDashboard,
      roles: ["admin", "kasir", "owner"],
    },
    {
      title: "Transaksi",
      url: "/transaksi",
      icon: IconReceipt,
      roles: ["admin", "kasir"],
    },
    {
      title: "Member",
      url: "/members",
      icon: IconUsers,
      roles: ["admin", "kasir"],
    },
    {
      title: "Outlet",
      url: "/outlets",
      icon: IconBuilding,
      roles: ["admin"],
    },
    {
      title: "Paket Layanan",
      url: "/packages",
      icon: IconPackage,
      roles: ["admin"],
    },
    {
      title: "Pengguna",
      url: "/users",
      icon: IconUserCog,
      roles: ["admin"],
    },
    {
      title: "Laporan",
      url: "/reports",
      icon: IconReport,
      roles: ["admin", "kasir", "owner"],
    },
  ];

  const allNavSecondary = [
    {
      title: "Settings",
      url: "/",
      icon: IconSettings,
      roles: ["admin", "kasir", "owner"],
    },
  ];

  return {
    navMain: allNavMain.filter(item => item.roles.includes(userRole)),
    navSecondary: allNavSecondary.filter(item => item.roles.includes(userRole)),
  };
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const [user, setUser] = useState<any>(null);
  const [menuItems, setMenuItems] = useState<{ navMain: any[], navSecondary: any[] }>({ navMain: [], navSecondary: [] });

  useEffect(() => {
    // Get user data from localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      setMenuItems(getMenuItems(parsedUser.role));
    }
  }, []);

  const defaultUser = {
    name: user?.nama || "User",
    email: `${user?.username || "user"}@laundry.com`,
    avatar: "/avatars/user.jpg",
  };

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <a href="/">
                <IconInnerShadowTop className="!size-5" />
                <span className="text-base font-semibold">Laundry Management</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={menuItems.navMain} />
        <NavSecondary items={menuItems.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={defaultUser} />
      </SidebarFooter>
    </Sidebar>
  )
}
