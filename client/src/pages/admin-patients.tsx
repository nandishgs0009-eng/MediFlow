import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Users,
  Search,
  Trash2,
  Mail,
  Calendar,
  Clock,
  Activity,
  Pill,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PatientUser {
  id: string;
  username: string;
  email: string;
  fullName: string;
  createdAt: string;
}

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
  user: PatientUser;
  treatments: Treatment[];
  treatmentCount: number;
  totalMedicines: number;
}

export default function AdminPatients() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [expandedTreatment, setExpandedTreatment] = useState<string | null>(null);

  // Fetch all patients
  const { data: patients = [], isLoading: loadingPatients } = useQuery<PatientDetail[]>({
    queryKey: ["/api/admin/patients/detailed/all"],
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
      toast({
        title: "Success",
        description: "Patient deleted successfully",
      });
      setSelectedPatientId(null);
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

  const selectedPatient = patients.find((p) => p.user.id === selectedPatientId);

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
          <h1 className="text-3xl md:text-4xl font-semibold">Patients</h1>
          <p className="text-muted-foreground mt-1">
            Select a patient to view details ({filteredPatients.length})
          </p>
        </div>
      </div>

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

      {/* Selected Patient Details Card */}
      {selectedPatient && (
        <Card className="border-primary/50 bg-gradient-to-br from-primary/5 to-primary/10">
          <CardHeader className="pb-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
                  <Users className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-2xl">{selectedPatient.user.fullName}</CardTitle>
                  <CardDescription className="mt-1">{selectedPatient.user.email}</CardDescription>
                </div>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleDeletePatient(selectedPatient.user.id)}
                disabled={deletePatientMutation.isPending}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Patient Info Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/30 dark:to-blue-900/30 rounded-lg border border-blue-200 dark:border-blue-800">
                <p className="text-sm text-muted-foreground font-medium">Username</p>
                <p className="text-lg font-semibold mt-2 text-blue-700 dark:text-blue-400">{selectedPatient.user.username}</p>
              </div>
              <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-950/30 dark:to-purple-900/30 rounded-lg border border-purple-200 dark:border-purple-800">
                <p className="text-sm text-muted-foreground font-medium">Member Since</p>
                <p className="text-lg font-semibold mt-2 text-purple-700 dark:text-purple-400">
                  {new Date(selectedPatient.user.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="p-4 bg-gradient-to-br from-green-50 to-green-100/50 dark:from-green-950/30 dark:to-green-900/30 rounded-lg border border-green-200 dark:border-green-800">
                <p className="text-sm text-muted-foreground font-medium flex items-center gap-1">
                  <Activity className="h-4 w-4 text-green-600" />
                  Treatments
                </p>
                <p className="text-lg font-semibold mt-2 text-green-700 dark:text-green-400">{selectedPatient.treatmentCount}</p>
              </div>
              <div className="p-4 bg-gradient-to-br from-orange-50 to-orange-100/50 dark:from-orange-950/30 dark:to-orange-900/30 rounded-lg border border-orange-200 dark:border-orange-800">
                <p className="text-sm text-muted-foreground font-medium flex items-center gap-1">
                  <Pill className="h-4 w-4 text-orange-600" />
                  Medicines
                </p>
                <p className="text-lg font-semibold mt-2 text-orange-700 dark:text-orange-400">{selectedPatient.totalMedicines}</p>
              </div>
            </div>

            {/* Treatments & Medicines Section */}
            {selectedPatient.treatments.length > 0 ? (
              <div>
                <h3 className="font-semibold text-lg mb-4">Treatments & Medicines</h3>
                <div className="space-y-3">
                  {selectedPatient.treatments.map((treatment) => (
                    <div key={treatment.id} className="bg-white dark:bg-slate-950 rounded-lg border overflow-hidden">
                      {/* Treatment Header */}
                      <button
                        onClick={() =>
                          setExpandedTreatment(
                            expandedTreatment === treatment.id ? null : treatment.id
                          )
                        }
                        className="w-full px-4 py-3 flex items-center justify-between hover:bg-muted/50 transition"
                      >
                        <div className="flex items-center gap-3 flex-1">
                          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Activity className="h-5 w-5 text-primary" />
                          </div>
                          <div className="text-left">
                            <p className="font-semibold">{treatment.name}</p>
                            <p className="text-xs text-muted-foreground">
                              Started: {new Date(treatment.startDate).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge
                            variant={treatment.status === "active" ? "default" : "secondary"}
                          >
                            {treatment.status}
                          </Badge>
                          {expandedTreatment === treatment.id ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </div>
                      </button>

                      {/* Treatment Details */}
                      {expandedTreatment === treatment.id && (
                        <div className="px-4 py-4 border-t bg-muted/30 space-y-3">
                          {treatment.description && (
                            <p className="text-sm text-muted-foreground">{treatment.description}</p>
                          )}

                          {/* Medicines List */}
                          {treatment.medicines.length > 0 ? (
                            <div className="space-y-2">
                              <p className="text-sm font-semibold">Medicines ({treatment.medicines.length})</p>
                              {treatment.medicines.map((medicine) => (
                                <div
                                  key={medicine.id}
                                  className="p-3 bg-white dark:bg-slate-950 rounded-lg border space-y-2"
                                >
                                  <div className="flex items-center justify-between gap-2">
                                    <div>
                                      <p className="font-medium text-sm">{medicine.name}</p>
                                      <div className="flex gap-2 mt-1">
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
                                    Time: {medicine.scheduleTime}
                                  </div>

                                  {/* Intake Logs */}
                                  {medicine.intakeLogs && medicine.intakeLogs.length > 0 && (
                                    <div className="pt-2 border-t">
                                      <p className="text-xs font-semibold mb-2">
                                        Recent Logs ({medicine.intakeLogs.length})
                                      </p>
                                      <div className="space-y-1 max-h-32 overflow-y-auto">
                                        {medicine.intakeLogs.slice(0, 5).map((log, idx) => (
                                          <div
                                            key={idx}
                                            className="text-xs p-2 bg-muted/50 rounded flex items-center justify-between"
                                          >
                                            <span className="text-muted-foreground">
                                              {new Date(log.scheduledTime).toLocaleString()}
                                            </span>
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
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-sm text-muted-foreground italic">No medicines added</p>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="py-8 text-center">
                <Activity className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p className="text-muted-foreground">No treatments added</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Patients List - Grid View */}
      <Card>
        <CardHeader>
          <CardTitle>All Patients</CardTitle>
          <CardDescription>
            Click on a patient card to view details above
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredPatients.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="text-lg font-medium text-muted-foreground">No patients found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredPatients.map((patient) => (
                <Card
                  key={patient.user.id}
                  className={`cursor-pointer transition-all hover:shadow-lg ${
                    selectedPatientId === patient.user.id
                      ? "border-indigo-500 bg-gradient-to-br from-indigo-50 to-indigo-100/50 dark:from-indigo-950/40 dark:to-indigo-900/40 ring-2 ring-indigo-500"
                      : "hover:border-indigo-300 hover:bg-gradient-to-br hover:from-indigo-50/50 hover:to-indigo-100/30"
                  }`}
                  onClick={() => setSelectedPatientId(patient.user.id)}
                >
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center flex-shrink-0">
                        <Users className="h-6 w-6 text-indigo-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold truncate text-indigo-900 dark:text-indigo-100">{patient.user.fullName}</h3>
                        <p className="text-sm text-muted-foreground truncate">{patient.user.email}</p>
                      </div>
                    </div>

                    <div className="mt-4 space-y-2">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">Treatments</span>
                        <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300 dark:bg-green-900/30 dark:text-green-400">{patient.treatmentCount}</Badge>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">Medicines</span>
                        <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-900/30 dark:text-blue-400">{patient.totalMedicines}</Badge>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">Member Since</span>
                        <span className="text-xs">
                          {new Date(patient.user.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <Button
                      size="sm"
                      variant="ghost"
                      className="w-full mt-4 text-red-600 hover:text-red-700"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeletePatient(patient.user.id);
                      }}
                      disabled={deletePatientMutation.isPending}
                    >
                      <Trash2 className="h-3 w-3 mr-2" />
                      Delete
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
