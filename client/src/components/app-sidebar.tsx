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
import {
  LayoutDashboard,
  Pill,
  LogOut,
  Users,
  BarChart3,
  Clock,
  Settings,
  ChevronDown,
  Activity,
  FileText,
  Bell,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useState } from "react";

interface AppSidebarProps {
  role: "patient" | "admin";
  onLogout: () => void;
}

export function AppSidebar({ role, onLogout }: AppSidebarProps) {
  const [location, setLocation] = useLocation();
  const [settingsOpen, setSettingsOpen] = useState(false);

  const patientItems = [
    {
      title: "Dashboard",
      url: "/patient/overview",
      icon: Pill,
    },
    {
      title: "My Treatments",
      url: "/patient/dashboard",
      icon: LayoutDashboard,
    },
    {
      title: "History",
      url: "/patient/history",
      icon: Clock,
    },
    {
      title: "Recovery Reports",
      url: "/patient/recovery-reports",
      icon: Activity,
    },
  ];

  const settingsItems = [
    {
      title: "Profile",
      url: "/patient/settings/profile",
      icon: Users,
    },
    {
      title: "Notifications",
      url: "/patient/settings/notifications",
      icon: Bell,
    },
    {
      title: "Medical Records",
      url: "/patient/settings/medical-records",
      icon: FileText,
    },
    {
      title: "Health Summary",
      url: "/patient/settings/health-summary",
      icon: Activity,
    },
  ];

  const adminItems = [
    {
      title: "Overview",
      url: "/admin/dashboard",
      icon: BarChart3,
    },
    {
      title: "Patients",
      url: "/admin/patients",
      icon: Users,
    },
    {
      title: "Total Patients Reports",
      url: "/admin/patient-reports",
      icon: FileText,
    },
    {
      title: "Summary",
      url: "/admin/patient-reports",
      icon: Activity,
    },
    {
      title: "System Analytics",
      url: "/admin/reports",
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
            <h2 className="font-semibold">MediFlow</h2>
            <p className="text-xs text-muted-foreground capitalize">{role}</p>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Main</SidebarGroupLabel>
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

        {role === "patient" && (
          <SidebarGroup>
            <Collapsible open={settingsOpen} onOpenChange={setSettingsOpen}>
              <CollapsibleTrigger asChild>
                <SidebarMenuButton
                  className="w-full"
                  data-testid="sidebar-settings-toggle"
                >
                  <Settings className="w-4 h-4" />
                  <span>Settings</span>
                  <ChevronDown
                    className={`ml-auto w-4 h-4 transition-transform ${
                      settingsOpen ? "rotate-180" : ""
                    }`}
                  />
                </SidebarMenuButton>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <SidebarMenu className="mt-2 ml-2 border-l border-sidebar-border">
                  {settingsItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        isActive={location === item.url}
                        className="pl-4"
                        data-testid={`sidebar-${item.title.toLowerCase().replace(/\s+/g, '-')}`}
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
              </CollapsibleContent>
            </Collapsible>
          </SidebarGroup>
        )}
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
