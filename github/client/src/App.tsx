import { Switch, Route, useLocation } from "wouter";
import { useEffect } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import { NotificationCenter } from "@/components/notification-center";
import { AuthProvider, useAuth } from "@/components/auth-provider";
import { ProtectedRoute } from "@/components/protected-route";
import Landing from "@/pages/landing";
import PatientDashboard from "@/pages/patient-dashboard";
import PatientOverview from "@/pages/patient-overview";
import PatientHistory from "@/pages/patient-history";
import PatientProfile from "@/pages/patient-profile";
import PatientNotifications from "@/pages/patient-notifications";
import PatientMedicalRecords from "@/pages/patient-medical-records";
import PatientHealthSummary from "@/pages/patient-health-summary";
import PatientRecoveryReports from "@/pages/patient-recovery-reports";
import AdminDashboard from "@/pages/admin-dashboard";
import AdminPatients from "@/pages/admin-patients";
import AdminPatientReports from "@/pages/admin-patient-reports";
import AdminReports from "@/pages/admin-reports";
import NotFound from "@/pages/not-found";

function AuthenticatedLayout({ role }: { role: "patient" | "admin" }) {
  const { logout } = useAuth();
  const [location, navigate] = useLocation();
  
  // Redirect to appropriate dashboard if on invalid path
  useEffect(() => {
    if (role === "patient" && !location.startsWith("/patient")) {
      navigate("/patient/overview");
    }
    if (role === "admin" && !location.startsWith("/admin")) {
      navigate("/admin/dashboard");
    }
    // Block patients from accessing admin routes
    if (role === "patient" && location.startsWith("/admin")) {
      navigate("/patient/overview");
    }
    // Block admins from accessing patient routes
    if (role === "admin" && location.startsWith("/patient")) {
      navigate("/admin/dashboard");
    }
  }, [role, location, navigate]);

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
                <>
                  <Route path="/patient/overview">
                    {() => (
                      <ProtectedRoute allowedRoles={["patient"]}>
                        <PatientOverview />
                      </ProtectedRoute>
                    )}
                  </Route>
                  <Route path="/patient/dashboard">
                    {() => (
                      <ProtectedRoute allowedRoles={["patient"]}>
                        <PatientDashboard />
                      </ProtectedRoute>
                    )}
                  </Route>
                  <Route path="/patient/history">
                    {() => (
                      <ProtectedRoute allowedRoles={["patient"]}>
                        <PatientHistory />
                      </ProtectedRoute>
                    )}
                  </Route>
                  <Route path="/patient/recovery-reports">
                    {() => (
                      <ProtectedRoute allowedRoles={["patient"]}>
                        <PatientRecoveryReports />
                      </ProtectedRoute>
                    )}
                  </Route>
                  <Route path="/patient/settings/profile">
                    {() => (
                      <ProtectedRoute allowedRoles={["patient"]}>
                        <PatientProfile />
                      </ProtectedRoute>
                    )}
                  </Route>
                  <Route path="/patient/settings/notifications">
                    {() => (
                      <ProtectedRoute allowedRoles={["patient"]}>
                        <PatientNotifications />
                      </ProtectedRoute>
                    )}
                  </Route>
                  <Route path="/patient/settings/medical-records">
                    {() => (
                      <ProtectedRoute allowedRoles={["patient"]}>
                        <PatientMedicalRecords />
                      </ProtectedRoute>
                    )}
                  </Route>
                  <Route path="/patient/settings/health-summary">
                    {() => (
                      <ProtectedRoute allowedRoles={["patient"]}>
                        <PatientHealthSummary />
                      </ProtectedRoute>
                    )}
                  </Route>
                </>
              )}
              {role === "admin" && (
                <>
                  <Route path="/admin/dashboard">
                    {() => (
                      <ProtectedRoute allowedRoles={["admin"]}>
                        <AdminDashboard />
                      </ProtectedRoute>
                    )}
                  </Route>
                  <Route path="/admin/patients">
                    {() => (
                      <ProtectedRoute allowedRoles={["admin"]}>
                        <AdminPatients />
                      </ProtectedRoute>
                    )}
                  </Route>
                  <Route path="/admin/patient-reports">
                    {() => (
                      <ProtectedRoute allowedRoles={["admin"]}>
                        <AdminPatientReports />
                      </ProtectedRoute>
                    )}
                  </Route>
                  <Route path="/admin/reports">
                    {() => (
                      <ProtectedRoute allowedRoles={["admin"]}>
                        <AdminReports />
                      </ProtectedRoute>
                    )}
                  </Route>
                </>
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

  // If not logged in, show landing page
  if (!user) {
    return (
      <Switch>
        <Route path="/" component={Landing} />
        <Route component={NotFound} />
      </Switch>
    );
  }

  // If user is logged in, show authenticated layout
  if (user.role === "patient") {
    return <AuthenticatedLayout role="patient" />;
  }

  if (user.role === "admin") {
    return <AuthenticatedLayout role="admin" />;
  }

  // Default to authenticated layout for other roles
  return <AuthenticatedLayout role={user.role as "patient" | "admin"} />;
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
