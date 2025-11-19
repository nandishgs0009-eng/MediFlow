import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import { NotificationCenter } from "@/components/notification-center";
import { AuthProvider, useAuth } from "@/components/auth-provider";
import Landing from "@/pages/landing";
import PatientDashboard from "@/pages/patient-dashboard";
import AdminDashboard from "@/pages/admin-dashboard";
import NotFound from "@/pages/not-found";

function AuthenticatedLayout({ role }: { role: "patient" | "admin" }) {
  const { logout } = useAuth();
  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <AppSidebar role={role} onLogout={logout} />
        <div className="flex flex-col flex-1 overflow-hidden">
          <header className="flex items-center justify-between gap-2 p-4 border-b bg-background shrink-0">
            <SidebarTrigger data-testid="button-sidebar-toggle" />
            <div className="flex items-center gap-2">
              {role === "patient" && <NotificationCenter />}
              <ThemeToggle />
            </div>
          </header>
          <main className="flex-1 overflow-y-auto bg-background">
            <Switch>
              {role === "patient" && (
                <Route path="/patient/dashboard" component={PatientDashboard} />
              )}
              {role === "admin" && (
                <Route path="/admin/dashboard" component={AdminDashboard} />
              )}
              <Route component={NotFound} />
            </Switch>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

function Router() {
  const { user, isLoading } = useAuth();
  const [location] = useLocation();

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user && location !== "/") {
    return <Landing />;
  }

  if (user) {
    if (user.role === "patient" && !location.startsWith("/patient")) {
      window.location.href = "/patient/dashboard";
      return null;
    }
    if (user.role === "admin" && !location.startsWith("/admin")) {
      window.location.href = "/admin/dashboard";
      return null;
    }
    return <AuthenticatedLayout role={user.role as "patient" | "admin"} />;
  }

  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route component={NotFound} />
    </Switch>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <Router />
        </AuthProvider>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}
