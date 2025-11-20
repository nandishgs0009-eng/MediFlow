import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Shield, Clock, BarChart3, Bell } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/components/auth-provider";
import heroImage from "@assets/generated_images/Healthcare_medication_management_hero_204a4613.png";
import type { User } from "@shared/schema";

export default function Landing() {
  const [, setLocation] = useLocation();
  const { login } = useAuth();
  const { toast } = useToast();
  const [showPatientSignup, setShowPatientSignup] = useState(false);
  const [showPatientLogin, setShowPatientLogin] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);

  // Signup form state
  const [signupData, setSignupData] = useState({
    fullName: "",
    email: "",
    username: "",
    password: "",
  });

  // Login form state
  const [loginData, setLoginData] = useState({
    username: "",
    password: "",
  });

  // Admin login form state
  const [adminLoginData, setAdminLoginData] = useState({
    username: "",
    password: "",
  });

  const signupMutation = useMutation({
    mutationFn: async (data: typeof signupData) => {
      const response = await apiRequest("POST", "/api/auth/signup", data);
      return response.json();
    },
    onSuccess: (user: User) => {
      login(user);
      toast({
        title: "Account created",
        description: "Welcome to MediFlow!",
      });
      setShowPatientSignup(false);
      setLocation("/patient/overview");
    },
    onError: (error: any) => {
      toast({
        title: "Signup failed",
        description: error.message || "Failed to create account",
        variant: "destructive",
      });
    },
  });

  const loginMutation = useMutation({
    mutationFn: async (data: typeof loginData) => {
      const response = await apiRequest("POST", "/api/auth/login", data);
      return response.json();
    },
    onSuccess: (user: User) => {
      console.log("✅ Patient login response:", user);
      console.log("   Role:", `"${user.role}"`, "Type:", typeof user.role);
      
      // Only allow patient role, reject admin users
      const isPatient = user.role && user.role.toLowerCase() === "patient";
      console.log(`   Is Patient Check: ${isPatient}`);
      
      if (!isPatient) {
        console.error("❌ Admin users cannot login from patient side. Role:", user.role);
        toast({
          title: "Access denied",
          description: "Admin users must use the Admin Sign In. Please try the Admin Sign In option.",
          variant: "destructive",
        });
        return;
      }
      
      login(user);
      toast({
        title: "Welcome back!",
        description: "You've successfully logged in",
      });
      setShowPatientLogin(false);
      setLocation("/patient/overview");
    },
    onError: (error: any) => {
      toast({
        title: "Login failed",
        description: error.message || "Invalid credentials",
        variant: "destructive",
      });
    },
  });

  const adminLoginMutation = useMutation({
    mutationFn: async (data: typeof adminLoginData) => {
      const response = await apiRequest("POST", "/api/auth/login", data);
      return response.json();
    },
    onSuccess: (user: User) => {
      console.log("✅ Admin login response:", user);
      console.log("   Role:", `"${user.role}"`, "Type:", typeof user.role);
      
      const isAdmin = user.role && user.role.toLowerCase() === "admin";
      console.log(`   Is Admin Check: ${isAdmin}`);
      
      if (!isAdmin) {
        console.error("❌ User role is not admin. Expected 'admin', got:", user.role);
        toast({
          title: "Access denied",
          description: `Admin credentials required. Your role: ${user.role || "unknown"}`,
          variant: "destructive",
        });
        return;
      }
      
      // Invalidate auth cache to ensure fresh data
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      
      login(user);
      toast({
        title: "Welcome, Admin",
        description: "You've successfully logged in",
      });
      setShowAdminLogin(false);
      setLocation("/admin/dashboard");
    },
    onError: (error: any) => {
      console.error("❌ Admin login error:", error);
      toast({
        title: "Login failed",
        description: error.message || "Invalid credentials",
        variant: "destructive",
      });
    },
  });

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    signupMutation.mutate(signupData);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate(loginData);
  };

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    adminLoginMutation.mutate(adminLoginData);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroImage})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-black/70" />
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-16 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Never Miss a Dose Again
          </h1>
          <p className="text-xl md:text-2xl text-white/90 mb-12 max-w-3xl mx-auto">
            Smart medication management that helps you stay on track with your treatments and improve health outcomes
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              size="lg"
              variant="default"
              className="min-w-[200px] text-lg backdrop-blur-sm bg-primary/90 hover:bg-primary"
              onClick={() => setShowPatientSignup(true)}
              data-testid="button-patient-signup"
            >
              Patient Sign Up
            </Button>
            <Button 
              size="lg"
              variant="outline"
              className="min-w-[200px] text-lg backdrop-blur-sm bg-white/10 border-white/30 text-white hover:bg-white/20"
              onClick={() => setShowPatientLogin(true)}
              data-testid="button-patient-login"
            >
              Patient Login
            </Button>
            <Button 
              size="lg"
              variant="outline"
              className="min-w-[200px] text-lg backdrop-blur-sm bg-white/10 border-white/30 text-white hover:bg-white/20"
              onClick={() => setShowAdminLogin(true)}
              data-testid="button-admin-login"
            >
              Admin Sign In
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-24 bg-card">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          <h2 className="text-2xl md:text-4xl font-semibold text-center mb-12">
            Everything You Need to Manage Your Medications
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="border-card-border">
              <CardHeader className="space-y-0 pb-4">
                <div className="w-12 h-12 rounded-md bg-primary/10 flex items-center justify-center mb-4">
                  <Clock className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="text-xl">Smart Reminders</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Never forget a dose with customizable alerts and notification sounds
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-card-border">
              <CardHeader className="space-y-0 pb-4">
                <div className="w-12 h-12 rounded-md bg-primary/10 flex items-center justify-center mb-4">
                  <BarChart3 className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="text-xl">Track Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Monitor treatment adherence and see your health journey visualized
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-card-border">
              <CardHeader className="space-y-0 pb-4">
                <div className="w-12 h-12 rounded-md bg-primary/10 flex items-center justify-center mb-4">
                  <Shield className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="text-xl">Secure & Private</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Your health data is encrypted and protected with enterprise-grade security
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-card-border">
              <CardHeader className="space-y-0 pb-4">
                <div className="w-12 h-12 rounded-md bg-primary/10 flex items-center justify-center mb-4">
                  <Bell className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="text-xl">Real-time Updates</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Get instant notifications and updates on your treatment schedule
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Patient Signup Dialog */}
      <Dialog open={showPatientSignup} onOpenChange={setShowPatientSignup}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl">Create Patient Account</DialogTitle>
            <DialogDescription>
              Start managing your medications effectively
            </DialogDescription>
          </DialogHeader>
          <form className="space-y-4" onSubmit={handleSignup}>
            <div className="space-y-2">
              <Label htmlFor="signup-fullname">Full Name</Label>
              <Input
                id="signup-fullname"
                placeholder="John Doe"
                value={signupData.fullName}
                onChange={(e) => setSignupData({ ...signupData, fullName: e.target.value })}
                required
                data-testid="input-signup-fullname"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="signup-email">Email</Label>
              <Input
                id="signup-email"
                type="email"
                placeholder="john@example.com"
                value={signupData.email}
                onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                required
                data-testid="input-signup-email"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="signup-username">Username</Label>
              <Input
                id="signup-username"
                placeholder="johndoe"
                value={signupData.username}
                onChange={(e) => setSignupData({ ...signupData, username: e.target.value })}
                required
                data-testid="input-signup-username"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="signup-password">Password</Label>
              <Input
                id="signup-password"
                type="password"
                value={signupData.password}
                onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                required
                minLength={6}
                data-testid="input-signup-password"
              />
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={signupMutation.isPending}
              data-testid="button-signup-submit"
            >
              {signupMutation.isPending ? "Creating account..." : "Sign Up"}
            </Button>
            <p className="text-sm text-center text-muted-foreground">
              Already have an account?{" "}
              <button
                type="button"
                className="text-primary hover:underline"
                onClick={() => {
                  setShowPatientSignup(false);
                  setShowPatientLogin(true);
                }}
                data-testid="link-switch-to-login"
              >
                Login here
              </button>
            </p>
          </form>
        </DialogContent>
      </Dialog>

      {/* Patient Login Dialog */}
      <Dialog open={showPatientLogin} onOpenChange={setShowPatientLogin}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl">Patient Login</DialogTitle>
            <DialogDescription>
              Welcome back! Login to manage your medications
            </DialogDescription>
          </DialogHeader>
          <form className="space-y-4" onSubmit={handleLogin}>
            <div className="space-y-2">
              <Label htmlFor="login-username">Username</Label>
              <Input
                id="login-username"
                placeholder="johndoe"
                value={loginData.username}
                onChange={(e) => setLoginData({ ...loginData, username: e.target.value })}
                required
                data-testid="input-login-username"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="login-password">Password</Label>
              <Input
                id="login-password"
                type="password"
                value={loginData.password}
                onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                required
                data-testid="input-login-password"
              />
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={loginMutation.isPending}
              data-testid="button-login-submit"
            >
              {loginMutation.isPending ? "Logging in..." : "Login"}
            </Button>
            <p className="text-sm text-center text-muted-foreground">
              Don't have an account?{" "}
              <button
                type="button"
                className="text-primary hover:underline"
                onClick={() => {
                  setShowPatientLogin(false);
                  setShowPatientSignup(true);
                }}
                data-testid="link-switch-to-signup"
              >
                Sign up here
              </button>
            </p>
          </form>
        </DialogContent>
      </Dialog>

      {/* Admin Login Dialog */}
      <Dialog open={showAdminLogin} onOpenChange={setShowAdminLogin}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl">Admin Sign In</DialogTitle>
            <DialogDescription>
              Access the healthcare provider dashboard
            </DialogDescription>
          </DialogHeader>
          <form className="space-y-4" onSubmit={handleAdminLogin}>
            <div className="space-y-2">
              <Label htmlFor="admin-username">Username</Label>
              <Input
                id="admin-username"
                placeholder="admin"
                value={adminLoginData.username}
                onChange={(e) => setAdminLoginData({ ...adminLoginData, username: e.target.value })}
                required
                data-testid="input-admin-username"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="admin-password">Password</Label>
              <Input
                id="admin-password"
                type="password"
                value={adminLoginData.password}
                onChange={(e) => setAdminLoginData({ ...adminLoginData, password: e.target.value })}
                required
                data-testid="input-admin-password"
              />
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={adminLoginMutation.isPending}
              data-testid="button-admin-login-submit"
            >
              {adminLoginMutation.isPending ? "Signing in..." : "Sign In"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
