import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  Users,
  Search,
  TrendingUp,
  Calendar,
  Activity,
  AlertCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

interface PatientUser {
  id: string;
  username: string;
  email: string;
  fullName: string;
  createdAt: string;
}

interface Treatment {
  id: string;
  name: string;
  description?: string;
  status: string;
  startDate: string;
  medicines: any[];
}

interface PatientDetail {
  user: PatientUser;
  treatments: Treatment[];
  treatmentCount: number;
  totalMedicines: number;
}

export default function AdminPatientReports() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [expandedTreatment, setExpandedTreatment] = useState<string | null>(null);

  // Fetch all patients
  const { data: patients = [], isLoading: loadingPatients } = useQuery<PatientDetail[]>({
    queryKey: ["/api/admin/patients/detailed/all"],
  });

  const filteredPatients = patients.filter(
    (patient) =>
      patient.user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedPatient = patients.find((p) => p.user.id === selectedPatientId);

  // Calculate recovery data based on treatment start date
  const calculateRecoveryData = (treatment: Treatment) => {
    const startDate = new Date(treatment.startDate);
    const today = new Date();
    const daysElapsed = Math.floor(
      (today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    const oneMonthDays = 30;
    const daysRemaining = Math.max(0, oneMonthDays - daysElapsed);
    const percentageComplete = Math.min(100, Math.round((daysElapsed / oneMonthDays) * 100));

    // Generate mock recovery data for chart
    const recoveryData = [];
    for (let i = 0; i <= Math.min(daysElapsed, 30); i++) {
      recoveryData.push({
        day: `Day ${i + 1}`,
        adherence: Math.min(100, 40 + i * 2 + Math.random() * 20),
        recovery: Math.min(100, 30 + i * 2.3 + Math.random() * 15),
      });
    }

    return {
      daysElapsed,
      daysRemaining,
      percentageComplete,
      recoveryData,
    };
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
      <div>
        <h1 className="text-3xl md:text-4xl font-semibold">Patient Recovery Reports</h1>
        <p className="text-muted-foreground mt-1">
          Track treatment adherence and recovery progress for each patient
        </p>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search patients by name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Patients List - Grid */}
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
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center">
                  <Users className="h-5 w-5 text-indigo-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold truncate text-indigo-900 dark:text-indigo-100">{patient.user.fullName}</h3>
                  <p className="text-xs text-muted-foreground truncate">{patient.user.email}</p>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Treatments</span>
                  <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300 dark:bg-green-900/30 dark:text-green-400">{patient.treatmentCount}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Medicines</span>
                  <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-900/30 dark:text-blue-400">{patient.totalMedicines}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Selected Patient Report */}
      {selectedPatient && (
        <div className="space-y-6">
          {/* Patient Header */}
          <Card className="border-primary/50 bg-gradient-to-br from-primary/5 to-primary/10">
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
                  <Users className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-2xl">{selectedPatient.user.fullName}</CardTitle>
                  <CardDescription className="mt-1">{selectedPatient.user.email}</CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Treatment Reports */}
          {selectedPatient.treatments.length > 0 ? (
            <div className="space-y-4">
              {selectedPatient.treatments.map((treatment) => {
                const recovery = calculateRecoveryData(treatment);
                const isActive = treatment.status === "active";

                return (
                  <Card key={treatment.id} className="overflow-hidden">
                    {/* Treatment Header - Expandable */}
                    <button
                      onClick={() =>
                        setExpandedTreatment(
                          expandedTreatment === treatment.id ? null : treatment.id
                        )
                      }
                      className="w-full px-6 py-4 flex items-center justify-between hover:bg-muted/50 transition border-b"
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Activity className="h-6 w-6 text-primary" />
                        </div>
                        <div className="text-left">
                          <h3 className="font-semibold text-lg">{treatment.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            Started: {new Date(treatment.startDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge
                          variant={isActive ? "default" : "secondary"}
                        >
                          {treatment.status}
                        </Badge>
                        {expandedTreatment === treatment.id ? (
                          <ChevronUp className="h-5 w-5" />
                        ) : (
                          <ChevronDown className="h-5 w-5" />
                        )}
                      </div>
                    </button>

                    {/* Treatment Details */}
                    {expandedTreatment === treatment.id && (
                      <CardContent className="pt-6 space-y-6">
                        {/* Recovery Progress Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {/* Days Elapsed */}
                          <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/30 dark:to-blue-900/30">
                            <CardContent className="pt-6">
                              <div className="text-center">
                                <Calendar className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                                <div className="text-3xl font-bold text-blue-700">
                                  {recovery.daysElapsed}
                                </div>
                                <p className="text-sm text-muted-foreground mt-1">
                                  Days Elapsed
                                </p>
                                {recovery.daysRemaining > 0 && (
                                  <p className="text-xs text-muted-foreground mt-2">
                                    {recovery.daysRemaining} days remaining in month
                                  </p>
                                )}
                              </div>
                            </CardContent>
                          </Card>

                          {/* Recovery Percentage */}
                          <Card className="border-green-200 bg-gradient-to-br from-green-50 to-green-100/50 dark:from-green-950/30 dark:to-green-900/30">
                            <CardContent className="pt-6">
                              <div className="text-center">
                                <TrendingUp className="h-8 w-8 text-green-600 mx-auto mb-2" />
                                <div className="text-3xl font-bold text-green-700">
                                  {recovery.percentageComplete}%
                                </div>
                                <p className="text-sm text-muted-foreground mt-1">
                                  Treatment Progress
                                </p>
                              </div>
                            </CardContent>
                          </Card>

                          {/* Medicines Count */}
                          <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-950/30 dark:to-purple-900/30">
                            <CardContent className="pt-6">
                              <div className="text-center">
                                <Activity className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                                <div className="text-3xl font-bold text-purple-700">
                                  {treatment.medicines.length}
                                </div>
                                <p className="text-sm text-muted-foreground mt-1">
                                  Medicines
                                </p>
                              </div>
                            </CardContent>
                          </Card>
                        </div>

                        {/* Progress Bar */}
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold text-sm">Monthly Progress</h4>
                            <span className="text-xs text-muted-foreground">
                              {recovery.daysElapsed} / 30 days
                            </span>
                          </div>
                          <Progress
                            value={recovery.percentageComplete}
                            className="h-3"
                          />
                          {recovery.percentageComplete === 100 && (
                            <p className="text-xs text-green-600 mt-2 font-semibold">
                              ✓ Treatment milestone reached!
                            </p>
                          )}
                        </div>

                        {/* Recovery Chart */}
                        {recovery.recoveryData.length > 0 && (
                          <div>
                            <h4 className="font-semibold text-sm mb-4">
                              Adherence & Recovery Tracking
                            </h4>
                            <div className="w-full h-80 bg-muted/30 rounded-lg p-4">
                              <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={recovery.recoveryData}>
                                  <defs>
                                    <linearGradient
                                      id="colorAdherence"
                                      x1="0"
                                      y1="0"
                                      x2="0"
                                      y2="1"
                                    >
                                      <stop
                                        offset="5%"
                                        stopColor="#3b82f6"
                                        stopOpacity={0.8}
                                      />
                                      <stop
                                        offset="95%"
                                        stopColor="#3b82f6"
                                        stopOpacity={0}
                                      />
                                    </linearGradient>
                                    <linearGradient
                                      id="colorRecovery"
                                      x1="0"
                                      y1="0"
                                      x2="0"
                                      y2="1"
                                    >
                                      <stop
                                        offset="5%"
                                        stopColor="#10b981"
                                        stopOpacity={0.8}
                                      />
                                      <stop
                                        offset="95%"
                                        stopColor="#10b981"
                                        stopOpacity={0}
                                      />
                                    </linearGradient>
                                  </defs>
                                  <CartesianGrid strokeDasharray="3 3" />
                                  <XAxis
                                    dataKey="day"
                                    tick={{ fontSize: 12 }}
                                  />
                                  <YAxis tick={{ fontSize: 12 }} />
                                  <Tooltip
                                    formatter={(value) => `${Math.round(value as number)}%`}
                                    contentStyle={{
                                      backgroundColor: "rgba(0,0,0,0.8)",
                                      border: "none",
                                      borderRadius: "4px",
                                      color: "#fff",
                                    }}
                                  />
                                  <Legend />
                                  <Area
                                    type="monotone"
                                    dataKey="adherence"
                                    stroke="#3b82f6"
                                    fillOpacity={1}
                                    fill="url(#colorAdherence)"
                                    name="Adherence %"
                                    isAnimationActive={false}
                                  />
                                  <Area
                                    type="monotone"
                                    dataKey="recovery"
                                    stroke="#10b981"
                                    fillOpacity={1}
                                    fill="url(#colorRecovery)"
                                    name="Recovery %"
                                    isAnimationActive={false}
                                  />
                                </AreaChart>
                              </ResponsiveContainer>
                            </div>
                          </div>
                        )}

                        {/* Medicines List */}
                        {treatment.medicines.length > 0 && (
                          <div>
                            <h4 className="font-semibold text-sm mb-3">
                              Medicines ({treatment.medicines.length})
                            </h4>
                            <div className="space-y-2">
                              {treatment.medicines.map((medicine) => (
                                <div
                                  key={medicine.id}
                                  className="p-3 bg-muted/50 rounded-lg flex items-center justify-between"
                                >
                                  <div>
                                    <p className="font-medium text-sm">{medicine.name}</p>
                                    <p className="text-xs text-muted-foreground">
                                      {medicine.dosage} • {medicine.frequency}
                                    </p>
                                  </div>
                                  <Badge variant="outline" className="text-xs">
                                    {medicine.scheduleTime}
                                  </Badge>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Treatment Description */}
                        {treatment.description && (
                          <div className="p-4 bg-muted/30 rounded-lg border border-muted">
                            <p className="text-sm text-muted-foreground">
                              <AlertCircle className="inline h-4 w-4 mr-2" />
                              {treatment.description}
                            </p>
                          </div>
                        )}
                      </CardContent>
                    )}
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card>
              <CardContent className="pt-12 pb-12 text-center">
                <Activity className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p className="text-muted-foreground">No treatments found for this patient</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Empty State */}
      {!selectedPatient && filteredPatients.length > 0 && (
        <Card>
          <CardContent className="pt-12 pb-12 text-center">
            <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="text-muted-foreground">Select a patient to view their recovery report</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
