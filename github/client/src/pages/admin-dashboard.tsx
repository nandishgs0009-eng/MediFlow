import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  Activity,
  Pill,
  TrendingUp,
  Search,
  Trash2,
  Calendar,
  ChevronDown,
  ChevronUp,
  Clock,
  Eye,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Medicine {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  scheduleTime: string;
  intakeLogs?: any[];
}

interface Treatment {
  id: string;
  name: string;
  description?: string;
  status: string;
  startDate: string;
  medicines: Medicine[];
}

interface PatientDetail {
  user: {
    id: string;
    username: string;
    email: string;
    fullName: string;
    createdAt: string;
  };
  treatments: Treatment[];
  treatmentCount: number;
  totalMedicines: number;
}

interface AdminStats {
  totalPatients: number;
  activeTreatments: number;
  totalMedicines: number;
  adherenceRate: number;
}

export default function AdminDashboard() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedPatient, setExpandedPatient] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "expanded">("grid");

  // Fetch all patients with detailed info
  const { data: patients = [], isLoading: loadingPatients } = useQuery<PatientDetail[]>({
    queryKey: ["/api/admin/patients/detailed/all"],
  });

  // Fetch admin statistics
  const { data: stats } = useQuery<AdminStats>({
    queryKey: ["/api/admin/stats"],
  });

  // Delete patient mutation
  const deletePatientMutation = useMutation({
    mutationFn: async (patientId: string) => {
      const response = await fetch(`/api/admin/patients/${patientId}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete patient");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/patients/detailed/all"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      toast({
        title: "Success",
        description: "Patient deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete patient",
        variant: "destructive",
      });
    },
  });

  const filteredPatients = patients.filter(
    (patient) =>
      patient.user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.user.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDeletePatient = (patientId: string) => {
    if (window.confirm("Are you sure you want to delete this patient and all their data? This action cannot be undone.")) {
      deletePatientMutation.mutate(patientId);
    }
  };

  if (loadingPatients) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-semibold">Dashboard Overview</h1>
          <p className="text-muted-foreground mt-1">Monitor all patients and their medication adherence</p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/30 dark:to-blue-900/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-700">{stats?.totalPatients || 0}</div>
            <p className="text-xs text-muted-foreground">Active patients in system</p>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-gradient-to-br from-green-50 to-green-100/50 dark:from-green-950/30 dark:to-green-900/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Treatments</CardTitle>
            <Activity className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-700">{stats?.activeTreatments || 0}</div>
            <p className="text-xs text-muted-foreground">Currently active</p>
          </CardContent>
        </Card>

        <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-950/30 dark:to-purple-900/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Medicines</CardTitle>
            <Pill className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-700">{stats?.totalMedicines || 0}</div>
            <p className="text-xs text-muted-foreground">Across all treatments</p>
          </CardContent>
        </Card>

        <Card className="border-orange-200 bg-gradient-to-br from-orange-50 to-orange-100/50 dark:from-orange-950/30 dark:to-orange-900/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Adherence Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-700">{stats?.adherenceRate || 0}%</div>
            <p className="text-xs text-muted-foreground">Overall medication adherence</p>
          </CardContent>
        </Card>
      </div>

      {/* Patients Management Section */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle>Patient Management</CardTitle>
              <CardDescription>View and manage all registered patients</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, email, or username..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Patients List */}
          <div className="space-y-3">
            {filteredPatients.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p className="text-lg font-medium">No patients found</p>
                <p className="text-sm">Start adding patients to the system</p>
              </div>
            ) : (
              filteredPatients.map((patient) => (
                <div key={patient.user.id} className="border rounded-lg hover:shadow-md transition-shadow">
                  {/* Patient Header */}
                  <button
                    onClick={() =>
                      setExpandedPatient(
                        expandedPatient === patient.user.id ? null : patient.user.id
                      )
                    }
                    className="w-full px-4 py-4 flex items-center justify-between hover:bg-muted/50 transition"
                  >
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Users className="h-6 w-6 text-primary" />
                      </div>
                      <div className="text-left min-w-0">
                        <p className="font-semibold">{patient.user.fullName}</p>
                        <p className="text-sm text-muted-foreground truncate">{patient.user.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 flex-wrap justify-end">
                      <Badge variant="outline" className="text-xs">
                        {patient.treatmentCount} treatments
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {patient.totalMedicines} medicines
                      </Badge>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeletePatient(patient.user.id);
                        }}
                        disabled={deletePatientMutation.isPending}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      {expandedPatient === patient.user.id ? (
                        <ChevronUp className="h-5 w-5 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>
                  </button>

                  {/* Patient Details - Expandable */}
                  {expandedPatient === patient.user.id && (
                    <div className="px-4 py-4 border-t bg-muted/30 space-y-4">
                      {/* Patient Info */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground font-medium">Username</p>
                          <p className="mt-1">{patient.user.username}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground font-medium">Email</p>
                          <p className="mt-1 truncate">{patient.user.email}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground font-medium">Member Since</p>
                          <p className="mt-1">
                            {new Date(patient.user.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground font-medium">Total Treatments</p>
                          <p className="mt-1">{patient.treatmentCount}</p>
                        </div>
                      </div>

                      {/* Treatments Section */}
                      {patient.treatments.length > 0 ? (
                        <div className="space-y-3">
                          <h4 className="font-semibold text-sm">Treatments ({patient.treatments.length})</h4>
                          {patient.treatments.map((treatment) => (
                            <div key={treatment.id} className="bg-white dark:bg-slate-950 p-4 rounded-lg border space-y-3">
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex-1">
                                  <p className="font-semibold text-base">{treatment.name}</p>
                                  {treatment.description && (
                                    <p className="text-sm text-muted-foreground mt-1">{treatment.description}</p>
                                  )}
                                </div>
                                <Badge
                                  variant={treatment.status === "active" ? "default" : "secondary"}
                                >
                                  {treatment.status}
                                </Badge>
                              </div>
                              <p className="text-xs text-muted-foreground flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                Started: {new Date(treatment.startDate).toLocaleDateString()}
                              </p>

                              {/* Medicines Section */}
                              {treatment.medicines.length > 0 ? (
                                <div className="mt-3 space-y-2 border-t pt-3">
                                  <p className="text-xs font-semibold text-muted-foreground">
                                    Medicines ({treatment.medicines.length})
                                  </p>
                                  {treatment.medicines.map((medicine) => (
                                    <div
                                      key={medicine.id}
                                      className="bg-muted/50 p-3 rounded-md text-sm space-y-2"
                                    >
                                      <div className="flex items-center justify-between gap-2">
                                        <div>
                                          <p className="font-semibold">{medicine.name}</p>
                                          <div className="flex gap-1 mt-1">
                                            <Badge variant="outline" className="text-xs">
                                              {medicine.dosage}
                                            </Badge>
                                            <Badge variant="outline" className="text-xs">
                                              {medicine.frequency}
                                            </Badge>
                                          </div>
                                        </div>
                                      </div>
                                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                        <Clock className="h-3 w-3" />
                                        Schedule: {medicine.scheduleTime}
                                      </div>

                                      {/* Intake Logs */}
                                      {medicine.intakeLogs && medicine.intakeLogs.length > 0 && (
                                        <div className="pt-2 mt-2 border-t space-y-1">
                                          <p className="text-xs font-semibold">
                                            Recent Intake Logs ({medicine.intakeLogs.length})
                                          </p>
                                          <div className="space-y-1 max-h-40 overflow-y-auto">
                                            {medicine.intakeLogs.slice(0, 5).map((log, idx) => (
                                              <div
                                                key={idx}
                                                className="text-xs text-muted-foreground flex items-center gap-2 bg-white/50 dark:bg-black/20 p-2 rounded"
                                              >
                                                <Badge
                                                  variant={
                                                    log.status === "taken"
                                                      ? "default"
                                                      : log.status === "missed"
                                                      ? "destructive"
                                                      : "secondary"
                                                  }
                                                  className="text-xs"
                                                >
                                                  {log.status}
                                                </Badge>
                                                <span>
                                                  {new Date(log.scheduledTime).toLocaleString()}
                                                </span>
                                              </div>
                                            ))}
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-xs text-muted-foreground italic">No medicines added</p>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="py-6 text-center">
                          <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
                          <p className="text-sm text-muted-foreground">No treatments added yet</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
