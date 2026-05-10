import { Link, useRouterState } from "@tanstack/react-router";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  MapPinned,
  Plus,
  Wallet,
  Backpack,
  Settings,
  ShieldCheck,
  Compass,
  Globe,
  Sparkles,
  NotebookPen,
} from "lucide-react";
import { useAuth } from "@/store/auth";

const items = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "My Trips", url: "/trips", icon: MapPinned },
  { title: "New Trip", url: "/trips/new", icon: Plus },
  { title: "Discover", url: "/discover", icon: Globe },
  { title: "Activities", url: "/activities", icon: Sparkles },
  { title: "AI Planner", url: "/ai", icon: Sparkles },
  { title: "Budget", url: "/budget", icon: Wallet },
  { title: "Packing", url: "/packing", icon: Backpack },
  { title: "Journal", url: "/journal", icon: NotebookPen },
  { title: "Settings", url: "/settings", icon: Settings },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const path = useRouterState({ select: (r) => r.location.pathname });
  const user = useAuth((s) => s.user);

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b">
        <Link to="/dashboard" className="flex items-center gap-2 px-2 py-3">
          <div className="grid h-9 w-9 place-items-center rounded-lg bg-primary text-primary-foreground">
            <Compass className="h-5 w-5" />
          </div>
          {!collapsed && (
            <div className="font-serif text-xl font-semibold tracking-tight">Traveloop</div>
          )}
        </Link>
      </SidebarHeader>
      <SidebarContent>
        {user?.role === "admin" ? (
          <SidebarGroup>
            <SidebarGroupLabel>Admin</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={path === "/admin"}>
                    <Link to="/admin" className="flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4" />
                      {!collapsed && <span>Admin Dashboard</span>}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ) : (
          <SidebarGroup>
            <SidebarGroupLabel>Plan</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {items.map((item) => {
                  const active = path === item.url || (item.url !== "/dashboard" && path.startsWith(item.url));
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild isActive={active}>
                        <Link to={item.url} className="flex items-center gap-2">
                          <item.icon className="h-4 w-4" />
                          {!collapsed && <span>{item.title}</span>}
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
    </Sidebar>
  );
}
