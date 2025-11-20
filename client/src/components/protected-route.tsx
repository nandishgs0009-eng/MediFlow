import { useAuth } from "@/components/auth-provider";
import { useLocation } from "wouter";
import { useEffect } from "react";

interface ProtectedRouteProps {
  allowedRoles: ("patient" | "admin")[];
  children: React.ReactNode;
}

export function ProtectedRoute({ allowedRoles, children }: ProtectedRouteProps) {
  const { user } = useAuth();
  const [, navigate] = useLocation();

  useEffect(() => {
    if (user && !allowedRoles.includes(user.role as "patient" | "admin")) {
      // Redirect based on actual role
      if (user.role === "admin") {
        navigate("/admin/dashboard");
      } else {
        navigate("/patient/overview");
      }
    }
  }, [user, allowedRoles, navigate]);

  if (!user || !allowedRoles.includes(user.role as "patient" | "admin")) {
    return null;
  }

  return <>{children}</>;
}
