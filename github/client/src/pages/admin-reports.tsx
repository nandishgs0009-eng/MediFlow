import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
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
  Users,
  Pill,
  Download,
  Calendar,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AdminStats {
  totalPatients: number;
  activeTreatments: number;
  totalMedicines: number;
  adherenceRate: number;
}

interface PatientDetail {
  user: {
    id: string;
    username: string;
    email: string;
    fullName: string;
    createdAt: string;
  };
  treatments: any[];
  treatmentCount: number;
  totalMedicines: number;
}

export default function AdminReports() {
  const { toast } = useToast();
  const [timeRange, setTimeRange] = useState("month");

  // Fetch statistics
  const { data: stats } = useQuery<AdminStats>({
    queryKey: ["/api/admin/stats"],
  });

  // Fetch patients for reports
  const { data: patients = [] } = useQuery<PatientDetail[]>({
    queryKey: ["/api/admin/patients/detailed/all"],
  });

  // Generate treatment distribution data
  const treatmentDistribution = patients.reduce((acc, patient) => {
    const count = patient.treatmentCount;
    const existing = acc.find((item) => item.range === `${count} treatments`);
    if (existing) {
      existing.patients += 1;
    } else {
      acc.push({ range: `${count} treatments`, patients: 1 });
    }
    return acc;
  }, [] as any[]);

  // Generate patient adherence data
  const patientAdherence = patients.map((patient) => ({
    name: patient.user.fullName.split(" ")[0], // First name only
    medicines: patient.totalMedicines,
    treatments: patient.treatmentCount,
  }));

  const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

  const handleExportReport = () => {
    const reportData = {
      generatedAt: new Date().toISOString(),
      stats,
      patientCount: patients.length,
      summary: {
        totalPatients: stats?.totalPatients || 0,
        activeTreatments: stats?.activeTreatments || 0,
        totalMedicines: stats?.totalMedicines || 0,
        adherenceRate: stats?.adherenceRate || 0,
      },
    };

    const csvContent = [
      ["Smart Medication Tracker - Admin Report"],
      ["Generated:", new Date().toLocaleString()],
      [],
      ["Summary Statistics"],
      ["Total Patients", stats?.totalPatients || 0],
      ["Active Treatments", stats?.activeTreatments || 0],
      ["Total Medicines", stats?.totalMedicines || 0],
      ["Overall Adherence Rate (%)", stats?.adherenceRate || 0],
      [],
      ["Patient Details"],
      ["Name", "Treatments", "Medicines", "Member Since"],
      ...patients.map((p) => [
        p.user.fullName,
        p.treatmentCount,
        p.totalMedicines,
        new Date(p.user.createdAt).toLocaleDateString(),
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const element = document.createElement("a");
    element.setAttribute(
      "href",
      "data:text/csv;charset=utf-8," + encodeURIComponent(csvContent)
    );
    element.setAttribute("download", `admin-report-${new Date().toISOString().split("T")[0]}.csv`);
    element.style.display = "none";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);

    toast({
      title: "Report exported",
      description: "CSV file has been downloaded",
    });
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-semibold">Reports & Analytics</h1>
          <p className="text-muted-foreground mt-1">View comprehensive system analytics and reports</p>
        </div>
        <Button onClick={handleExportReport} className="gap-2">
          <Download className="h-4 w-4" />
          Export Report
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalPatients || 0}</div>
            <Progress value={Math.min(100, (stats?.totalPatients || 0) * 10)} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Treatments</CardTitle>
            <Activity className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.activeTreatments || 0}</div>
            <Progress value={Math.min(100, (stats?.activeTreatments || 0) * 5)} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Medicines</CardTitle>
            <Pill className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalMedicines || 0}</div>
            <Progress value={Math.min(100, (stats?.totalMedicines || 0) * 2)} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Adherence Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.adherenceRate || 0}%</div>
            <Progress value={stats?.adherenceRate || 0} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Patient Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Patient Treatment Distribution</CardTitle>
            <CardDescription>Patients grouped by number of treatments</CardDescription>
          </CardHeader>
          <CardContent>
            {treatmentDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={treatmentDistribution}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="range" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="patients" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-80 flex items-center justify-center text-muted-foreground">
                No data available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Adherence Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Medication Adherence</CardTitle>
            <CardDescription>Overall system adherence metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Overall Adherence</span>
                  <span className="text-sm font-bold">{stats?.adherenceRate || 0}%</span>
                </div>
                <Progress value={stats?.adherenceRate || 0} />
              </div>
              <div className="grid grid-cols-3 gap-4 pt-4">
                <div className="text-center p-4 bg-muted rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {Math.round((stats?.adherenceRate || 0) / 1)}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Adherence %</p>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{stats?.activeTreatments || 0}</div>
                  <p className="text-xs text-muted-foreground mt-1">Active</p>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">{stats?.totalMedicines || 0}</div>
                  <p className="text-xs text-muted-foreground mt-1">Medicines</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Patient Analytics */}
      <Card>
        <CardHeader>
          <CardTitle>Patient Analytics</CardTitle>
          <CardDescription>Medicines and treatments per patient</CardDescription>
        </CardHeader>
        <CardContent>
          {patientAdherence.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={patientAdherence}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="medicines"
                  stroke="#8b5cf6"
                  name="Medicines"
                  dot={{ fill: "#8b5cf6" }}
                />
                <Line
                  type="monotone"
                  dataKey="treatments"
                  stroke="#10b981"
                  name="Treatments"
                  dot={{ fill: "#10b981" }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-80 flex items-center justify-center text-muted-foreground">
              No patient data available
            </div>
          )}
        </CardContent>
      </Card>

      {/* System Health */}
      <Card>
        <CardHeader>
          <CardTitle>System Health</CardTitle>
          <CardDescription>Overall system status and metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-600 dark:text-green-400 font-medium">System Status</p>
                  <p className="text-2xl font-bold text-green-700 dark:text-green-300 mt-1">Healthy</p>
                </div>
                <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
                  <Activity className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>

            <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">Data Points</p>
                  <p className="text-2xl font-bold text-blue-700 dark:text-blue-300 mt-1">
                    {(stats?.totalMedicines || 0) + (stats?.activeTreatments || 0)}
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>

            <div className="p-4 bg-purple-50 dark:bg-purple-950 rounded-lg border border-purple-200 dark:border-purple-800">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-purple-600 dark:text-purple-400 font-medium">Active Users</p>
                  <p className="text-2xl font-bold text-purple-700 dark:text-purple-300 mt-1">
                    {stats?.totalPatients || 0}
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center">
                  <Users className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
