import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";
import { apiRequest } from "@/lib/queryClient";
import { User, Mail, Calendar, Pill, Activity, Shield } from "lucide-react";

interface PatientProfile {
  user: {
    id: string;
    username: string;
    email: string;
    fullName: string;
    role: string;
    createdAt: string;
    insuranceProvider?: string | null;
    policyNumber?: string | null;
  };
  treatmentCount: number;
  activeTreatments: number;
}

export default function ProfilePage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<{
    fullName: string;
    email: string;
    insuranceProvider: string;
    policyNumber: string;
  }>({
    fullName: "",
    email: "",
    insuranceProvider: "",
    policyNumber: "",
  });

  const { data: profile, isLoading } = useQuery<PatientProfile>({
    queryKey: ["/api/patient/profile"],
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        fullName: profile.user.fullName,
        email: profile.user.email,
        insuranceProvider: profile.user.insuranceProvider || "",
        policyNumber: profile.user.policyNumber || "",
      });
    }
  }, [profile]);

  const updateProfileMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      return await apiRequest("PATCH", "/api/patient/profile", data).then(res => res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/patient/profile"] });
      setIsEditing(false);
      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update profile",
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="p-6">
        <p className="text-center text-muted-foreground">Failed to load profile</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 max-w-2xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Profile</h1>
        <p className="text-muted-foreground mt-2">Manage your account information and settings</p>
      </div>

      {/* Profile Information */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>Your account details</CardDescription>
          </div>
          {!isEditing && (
            <Button onClick={() => setIsEditing(true)} variant="outline" size="sm">
              Edit Profile
            </Button>
          )}
        </CardHeader>
        <CardContent className="space-y-6">
          {isEditing ? (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                updateProfileMutation.mutate(formData);
              }}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  value={formData.fullName}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, fullName: e.target.value }))
                  }
                  placeholder="Enter your full name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  disabled
                  placeholder="Enter your email"
                  className="opacity-60 cursor-not-allowed"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="insuranceProvider">Insurance Provider</Label>
                <Input
                  id="insuranceProvider"
                  value={formData.insuranceProvider}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, insuranceProvider: e.target.value }))
                  }
                  placeholder="e.g., Blue Cross"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="policyNumber">Policy Number</Label>
                <Input
                  id="policyNumber"
                  value={formData.policyNumber}
                  onChange={(e) => setFormData((prev) => ({ ...prev, policyNumber: e.target.value }))}
                  placeholder="e.g., XZ123456789"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  type="submit"
                  disabled={updateProfileMutation.isPending}
                  className="w-full"
                >
                  {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsEditing(false);
                    setFormData({
                      fullName: profile.user.fullName,
                      email: profile.user.email,
                      insuranceProvider: profile.user.insuranceProvider || "",
                      policyNumber: profile.user.policyNumber || "",
                    });
                  }}
                  className="w-full"
                >
                  Cancel
                </Button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <User className="w-5 h-5 text-muted-foreground mt-1" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Full Name</p>
                  <p className="text-lg font-semibold">{(profile as any)?.user.fullName}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-muted-foreground mt-1" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Email</p>
                  <p className="text-lg font-semibold">{(profile as any)?.user.email}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <User className="w-5 h-5 text-muted-foreground mt-1" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Username</p>
                  <p className="text-lg font-semibold">{(profile as any)?.user.username}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-muted-foreground mt-1" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Member Since</p>
                  <p className="text-lg font-semibold">
                    {new Date((profile as any)?.user.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Treatment Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>Treatment Overview</CardTitle>
          <CardDescription>Your current treatment status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
              <div className="flex items-center gap-2 mb-2">
                <Pill className="w-4 h-4 text-primary" />
                <p className="text-sm font-medium text-muted-foreground">Total Treatments</p>
              </div>
              <p className="text-3xl font-bold">{(profile as any)?.treatmentCount}</p>
            </div>
            <div className="p-4 rounded-lg bg-green-500/5 border border-green-500/20">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="w-4 h-4 text-green-600" />
                <p className="text-sm font-medium text-muted-foreground">Active Treatments</p>
              </div>
              <p className="text-3xl font-bold text-green-600">{(profile as any)?.activeTreatments}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Insurance Details Card */}
      <Card>
        <CardHeader>
          <CardTitle>Insurance Details</CardTitle>
          <CardDescription>Your medical insurance information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-muted-foreground mt-1" />
            <div>
              <p className="text-sm font-medium text-muted-foreground">Provider</p>
              <p className="text-lg font-semibold">{profile.user.insuranceProvider || "Not set"}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-muted-foreground mt-1" />
            <div>
              <p className="text-sm font-medium text-muted-foreground">Policy Number</p>
              <p className="text-lg font-semibold">{profile.user.policyNumber || "Not set"}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Account Security */}
      <Card>
        <CardHeader>
          <CardTitle>Account Security</CardTitle>
          <CardDescription>Manage your account security settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Password</p>
              <p className="text-sm text-muted-foreground">Change your password regularly</p>
            </div>
            <Button variant="outline" disabled>
              Coming Soon
            </Button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Two-Factor Authentication</p>
              <p className="text-sm text-muted-foreground">Add an extra layer of security</p>
            </div>
            <Button variant="outline" disabled>
              Coming Soon
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
