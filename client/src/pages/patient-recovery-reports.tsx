import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  Activity,
  TrendingUp,
  Calendar,
  Pill,
  CheckCircle2,
  AlertCircle,
  Heart,
} from "lucide-react";

interface Treatment {
  id: string;
  name: string;
  status: string;
  startDate: string;
  medicines: any[];
}

interface RecoveryData {
  treatment: Treatment;
  daysElapsed: number;
  totalMedicines: number;
  adherencePercentage: number;
  recoveryPercentage: number;
  medicinesTaken: number;
  medicinesMissed: number;
}

interface OverallRecovery {
  totalTreatments: number;
  totalMedicines: number;
  averageAdherence: number;
  averageRecovery: number;
  treatmentsCompleted: number;
  recoveryData: Array<{
    day: string;
    adherence: number;
    recovery: number;
  }>;
}

export default function PatientRecoveryReports() {
  // Fetch treatments
  const { data: treatments = [] } = useQuery<Treatment[]>({
    queryKey: ["/api/treatments"],
  });

  // Fetch daily adherence for recovery chart
  const { data: dailyAdherence = [] } = useQuery({
    queryKey: ["/api/health/daily-adherence"],
  });

  // Calculate recovery data for each treatment
  const calculateRecoveryData = async (treatment: Treatment): Promise<RecoveryData> => {
    const startDate = new Date(treatment.startDate);
    const today = new Date();
    const daysElapsed = Math.floor(
      (today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    // Fetch adherence for this treatment
    let adherencePercentage = 0;
    try {
      const res = await fetch(`/api/adherence/${treatment.id}`);
      if (res.ok) {
        const data = await res.json();
        adherencePercentage = data.percentage || 0;
      }
    } catch (error) {
      console.error("Error fetching adherence:", error);
    }

    // Calculate recovery percentage based on adherence
    const recoveryPercentage = Math.min(100, adherencePercentage * 0.8 + daysElapsed * 0.5);

    // Mock medicine tracking
    const totalMedicines = treatment.medicines?.length || 0;
    const medicinesTaken = Math.round((totalMedicines * adherencePercentage) / 100);
    const medicinesMissed = totalMedicines - medicinesTaken;

    return {
      treatment,
      daysElapsed,
      totalMedicines,
      adherencePercentage,
      recoveryPercentage,
      medicinesTaken,
      medicinesMissed,
    };
  };

  // Load recovery data
  const { data: recoveryDataList = [], isLoading } = useQuery<RecoveryData[]>({
    queryKey: ["/api/patient/recovery-reports", treatments.length],
    queryFn: async () => {
      if (treatments.length === 0) return [];
      const dataPromises = treatments.map((t) => calculateRecoveryData(t));
      return Promise.all(dataPromises);
    },
    enabled: treatments.length > 0,
  });

  // Calculate overall statistics
  const overallRecovery: OverallRecovery = {
    totalTreatments: treatments.length,
    totalMedicines: treatments.reduce((sum, t) => sum + (t.medicines?.length || 0), 0),
    averageAdherence:
      recoveryDataList.length > 0
        ? Math.round(
            recoveryDataList.reduce((sum, r) => sum + r.adherencePercentage, 0) /
              recoveryDataList.length
          )
        : 0,
    averageRecovery:
      recoveryDataList.length > 0
        ? Math.round(
            recoveryDataList.reduce((sum, r) => sum + r.recoveryPercentage, 0) /
              recoveryDataList.length
          )
        : 0,
    treatmentsCompleted: recoveryDataList.filter((r) => r.recoveryPercentage >= 80).length,
    recoveryData: dailyAdherence.map((day: any) => ({
      day: new Date(day.date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      adherence: Math.round(day.totalScheduled > 0 ? (day.totalTaken / day.totalScheduled) * 100 : 0),
      recovery: Math.round(
        (Math.round(day.totalScheduled > 0 ? (day.totalTaken / day.totalScheduled) * 100 : 0) * 0.8 +
          recoveryDataList.length * 0.5) /
          100
      ),
    })),
  };

  if (isLoading) {
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
        <h1 className="text-3xl md:text-4xl font-semibold">Recovery Reports</h1>
        <p className="text-muted-foreground mt-1">
          Track your overall medication adherence and recovery progress
        </p>
      </div>

      {/* Overall Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/30 dark:to-blue-900/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Treatments</CardTitle>
            <Pill className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-700">{overallRecovery.totalTreatments}</div>
            <p className="text-xs text-muted-foreground mt-1">Currently managing</p>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-gradient-to-br from-green-50 to-green-100/50 dark:from-green-950/30 dark:to-green-900/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Adherence</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-700">
              {overallRecovery.averageAdherence}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">Medication adherence rate</p>
          </CardContent>
        </Card>

        <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-950/30 dark:to-purple-900/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recovery Progress</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-700">{overallRecovery.averageRecovery}%</div>
            <p className="text-xs text-muted-foreground mt-1">Overall recovery rate</p>
          </CardContent>
        </Card>

        <Card className="border-orange-200 bg-gradient-to-br from-orange-50 to-orange-100/50 dark:from-orange-950/30 dark:to-orange-900/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Medicines Tracked</CardTitle>
            <Heart className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-700">{overallRecovery.totalMedicines}</div>
            <p className="text-xs text-muted-foreground mt-1">Total medications</p>
          </CardContent>
        </Card>
      </div>

      {/* Recovery Chart */}
      {overallRecovery.recoveryData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recovery Trend</CardTitle>
            <CardDescription>Daily adherence vs recovery percentage</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={overallRecovery.recoveryData}>
                <defs>
                  <linearGradient id="colorAdherence" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.1} />
                  </linearGradient>
                  <linearGradient id="colorRecovery" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="adherence"
                  stroke="#10b981"
                  fillOpacity={1}
                  fill="url(#colorAdherence)"
                  name="Adherence %"
                />
                <Area
                  type="monotone"
                  dataKey="recovery"
                  stroke="#8b5cf6"
                  fillOpacity={1}
                  fill="url(#colorRecovery)"
                  name="Recovery %"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Individual Treatment Reports */}
      {recoveryDataList.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Treatment Details</h2>
          <div className="space-y-4">
            {recoveryDataList.map((recovery) => (
              <Card key={recovery.treatment.id} className="overflow-hidden">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{recovery.treatment.name}</CardTitle>
                      <CardDescription className="mt-1">
                        Started {new Date(recovery.treatment.startDate).toLocaleDateString()}
                        {" • "}
                        {recovery.daysElapsed} days elapsed
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={recovery.treatment.status === "active" ? "default" : "secondary"}
                      >
                        {recovery.treatment.status}
                      </Badge>
                      <Badge
                        className={
                          recovery.recoveryPercentage >= 80
                            ? "bg-green-100 text-green-700 border-green-300"
                            : recovery.recoveryPercentage >= 50
                            ? "bg-yellow-100 text-yellow-700 border-yellow-300"
                            : "bg-red-100 text-red-700 border-red-300"
                        }
                      >
                        {recovery.recoveryPercentage.toFixed(0)}% Recovery
                      </Badge>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Recovery Stats Grid */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
                      <p className="text-sm text-muted-foreground font-medium">Total Medicines</p>
                      <p className="text-2xl font-bold text-blue-700 mt-1">
                        {recovery.totalMedicines}
                      </p>
                    </div>
                    <div className="p-3 bg-green-50 dark:bg-green-950/30 rounded-lg border border-green-200 dark:border-green-800">
                      <p className="text-sm text-muted-foreground font-medium">Taken</p>
                      <p className="text-2xl font-bold text-green-700 mt-1">
                        {recovery.medicinesTaken}
                      </p>
                    </div>
                    <div className="p-3 bg-red-50 dark:bg-red-950/30 rounded-lg border border-red-200 dark:border-red-800">
                      <p className="text-sm text-muted-foreground font-medium">Missed</p>
                      <p className="text-2xl font-bold text-red-700 mt-1">
                        {recovery.medicinesMissed}
                      </p>
                    </div>
                  </div>

                  {/* Adherence Progress */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Adherence Rate</span>
                      <span className="text-sm font-mono font-semibold">
                        {recovery.adherencePercentage.toFixed(0)}%
                      </span>
                    </div>
                    <Progress value={recovery.adherencePercentage} className="h-2" />
                  </div>

                  {/* Recovery Progress */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Recovery Progress</span>
                      <span className="text-sm font-mono font-semibold">
                        {recovery.recoveryPercentage.toFixed(0)}%
                      </span>
                    </div>
                    <Progress value={recovery.recoveryPercentage} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {treatments.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Activity className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <h3 className="text-xl font-medium mb-2">No treatments to report</h3>
            <p className="text-muted-foreground text-center mb-6 max-w-md">
              Add a treatment to start tracking your medication adherence and recovery progress
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
