import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Users, Activity, TrendingUp, AlertCircle } from "lucide-react";
import type { User, Treatment } from "@shared/schema";

interface PatientStats {
  userId: string;
  fullName: string;
  email: string;
  treatmentCount: number;
  adherenceRate: number;
  lastActivity: string;
}

interface DashboardStats {
  totalPatients: number;
  activeTreatments: number;
  averageAdherence: number;
  lowAdherenceCount: number;
}

export default function AdminDashboard() {
  const { data: stats, isLoading: loadingStats } = useQuery<DashboardStats>({
    queryKey: ["/api/admin/stats"],
  });

  const { data: patients = [], isLoading: loadingPatients } = useQuery<PatientStats[]>({
    queryKey: ["/api/admin/patients"],
  });

  if (loadingStats || loadingPatients) {
    return (
      <div className="p-6 space-y-6">
        <div className="h-8 w-48 bg-muted animate-pulse rounded" />
        <div className="grid md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
        <div className="h-96 bg-muted animate-pulse rounded-lg" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl md:text-4xl font-semibold">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-1">Monitor patient treatments and adherence</p>
      </div>

      {/* Stats Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
            <Users className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="stat-total-patients">
              {stats?.totalPatients || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Active users in system</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Treatments</CardTitle>
            <Activity className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="stat-active-treatments">
              {stats?.activeTreatments || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Ongoing treatment plans</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Adherence</CardTitle>
            <TrendingUp className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="stat-avg-adherence">
              {stats?.averageAdherence.toFixed(0) || 0}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">Across all patients</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Adherence</CardTitle>
            <AlertCircle className="w-4 h-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive" data-testid="stat-low-adherence">
              {stats?.lowAdherenceCount || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Patients below 70%</p>
          </CardContent>
        </Card>
      </div>

      {/* Patients Table */}
      <Card>
        <CardHeader>
          <CardTitle>Patient Overview</CardTitle>
          <CardDescription>
            View all patients and their treatment adherence
          </CardDescription>
        </CardHeader>
        <CardContent>
          {patients.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No patients registered yet
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Patient</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead className="text-center">Treatments</TableHead>
                    <TableHead className="text-center">Adherence</TableHead>
                    <TableHead>Last Activity</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {patients.map((patient) => (
                    <TableRow key={patient.userId} data-testid={`row-patient-${patient.userId}`}>
                      <TableCell className="font-medium">{patient.fullName}</TableCell>
                      <TableCell className="text-muted-foreground">{patient.email}</TableCell>
                      <TableCell className="text-center" data-testid={`cell-treatments-${patient.userId}`}>
                        <Badge variant="outline">{patient.treatmentCount}</Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge
                          variant={
                            patient.adherenceRate >= 80
                              ? "default"
                              : patient.adherenceRate >= 60
                              ? "secondary"
                              : "destructive"
                          }
                          data-testid={`badge-adherence-${patient.userId}`}
                        >
                          {patient.adherenceRate.toFixed(0)}%
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {patient.lastActivity ? new Date(patient.lastActivity).toLocaleDateString() : "Never"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
