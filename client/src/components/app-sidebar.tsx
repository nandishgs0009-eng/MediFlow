import { useLocation } from "wouter";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { LayoutDashboard, Pill, LogOut, Users, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AppSidebarProps {
  role: "patient" | "admin";
  onLogout: () => void;
}

export function AppSidebar({ role, onLogout }: AppSidebarProps) {
  const [location, setLocation] = useLocation();

  const patientItems = [
    {
      title: "Dashboard",
      url: "/patient/dashboard",
      icon: LayoutDashboard,
    },
  ];

  const adminItems = [
    {
      title: "Overview",
      url: "/admin/dashboard",
      icon: BarChart3,
    },
  ];

  const items = role === "patient" ? patientItems : adminItems;

  return (
    <Sidebar>
      <SidebarHeader className="p-4 border-b">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center">
            <Pill className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h2 className="font-semibold">MediTrack</h2>
            <p className="text-xs text-muted-foreground capitalize">{role}</p>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={location === item.url}
                    data-testid={`sidebar-${item.title.toLowerCase()}`}
                  >
                    <a href={item.url} onClick={(e) => {
                      e.preventDefault();
                      setLocation(item.url);
                    }}>
                      <item.icon className="w-4 h-4" />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-4 border-t">
        <Button
          variant="outline"
          className="w-full justify-start"
          onClick={onLogout}
          data-testid="button-logout"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Logout
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
