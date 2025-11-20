import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import type { Treatment } from "@shared/schema";

export default function MedicalRecordsPage() {
  const [selectedTreatmentId, setSelectedTreatmentId] = useState<string | null>(null);

  const { data: treatments = [], isLoading: loadingTreatments } = useQuery<Treatment[]>({
    queryKey: ["/api/treatments"],
  });

  useEffect(() => {
    if (treatments.length > 0 && !selectedTreatmentId) {
      setSelectedTreatmentId(treatments[0].id);
    }
  }, [treatments, selectedTreatmentId]);

  const { data: treatmentHistory = [] } = useQuery(
    {
      queryKey: [`/api/history/treatment/${selectedTreatmentId}`],
      enabled: !!selectedTreatmentId,
    }
  ) as { data: any[] };

  const { data: dailyAdherence = [] } = useQuery(
    {
      queryKey: ["/api/health/daily-adherence", { days: 90 }],
      queryFn: async () => {
        const res = await fetch("/api/health/daily-adherence?days=90");
        return res.json();
      },
    }
  ) as { data: any[] };

  const currentTreatment = treatments.find((t: any) => t.id === selectedTreatmentId);

  const calculateMedicineStats = (medicine: any) => {
    const logs = medicine.intakeLogs || [];
    const taken = logs.filter((l: any) => l.status === "taken").length;
    const missed = logs.filter((l: any) => l.status === "missed").length;
    const pending = logs.filter((l: any) => l.status === "pending").length;
    
    return {
      total: logs.length,
      taken,
      missed,
      pending,
      adherence: logs.length > 0 ? (taken / logs.length) * 100 : 0,
    };
  };

  if (loadingTreatments) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (treatments.length === 0) {
    return (
      <div className="space-y-6 p-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Medical Records</h1>
          <p className="text-muted-foreground mt-2">View your treatment history and analysis</p>
        </div>
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">No treatments found. Add a treatment to view medical records.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Medical Records</h1>
          <p className="text-muted-foreground mt-2">View your treatment history and analysis</p>
        </div>
        <Button variant="outline" size="sm">
          <Download className="w-4 h-4 mr-2" />
          Export Records
        </Button>
      </div>

      {/* Treatment Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Your Treatments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {treatments.map((treatment: any) => (
              <button
                key={treatment.id}
                onClick={() => setSelectedTreatmentId(treatment.id)}
                className={`p-4 rounded-lg border-2 transition-all text-left ${
                  selectedTreatmentId === treatment.id
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                }`}
              >
                <p className="font-semibold">{treatment.name}</p>
                <p className="text-sm text-muted-foreground truncate">{treatment.description}</p>
                <div className="mt-2">
                  <Badge variant={treatment.status === "active" ? "default" : "secondary"}>
                    {treatment.status}
                  </Badge>
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {selectedTreatmentId && currentTreatment && (
        <div className="space-y-6">
          {/* Treatment Overview */}
          <Card>
            <CardHeader>
              <CardTitle>{(currentTreatment as any).name}</CardTitle>
              <CardDescription>{(currentTreatment as any).description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-3 rounded-lg bg-blue-500/5 border border-blue-500/20">
                  <p className="text-xs font-medium text-muted-foreground mb-1">Status</p>
                  <Badge variant={(currentTreatment as any).status === "active" ? "default" : "secondary"}>
                    {(currentTreatment as any).status}
                  </Badge>
                </div>
                <div className="p-3 rounded-lg bg-purple-500/5 border border-purple-500/20">
                  <p className="text-xs font-medium text-muted-foreground mb-1">Medicines</p>
                  <p className="text-xl font-bold">{treatmentHistory.length}</p>
                </div>
                <div className="p-3 rounded-lg bg-green-500/5 border border-green-500/20">
                  <p className="text-xs font-medium text-muted-foreground mb-1">Start Date</p>
                  <p className="text-sm font-semibold">
                    {format(new Date((currentTreatment as any).startDate), "MMM dd, yyyy")}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-orange-500/5 border border-orange-500/20">
                  <p className="text-xs font-medium text-muted-foreground mb-1">Duration</p>
                  <p className="text-sm font-semibold">
                    {(currentTreatment as any).endDate
                      ? format(new Date((currentTreatment as any).endDate), "MMM dd, yyyy")
                      : "Ongoing"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Medicines and Analysis */}
          <Tabs defaultValue="medicines" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="medicines">Medicines</TabsTrigger>
              <TabsTrigger value="analysis">Analysis</TabsTrigger>
              <TabsTrigger value="timeline">Timeline</TabsTrigger>
            </TabsList>

            {/* Medicines Tab */}
            <TabsContent value="medicines" className="space-y-4">
              {treatmentHistory.length === 0 ? (
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-center text-muted-foreground">
                      No medicines added for this treatment yet.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                treatmentHistory.map((medicine: any) => {
                  const stats = calculateMedicineStats(medicine);
                  return (
                    <Card key={medicine.id}>
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-lg">{medicine.name}</CardTitle>
                            <CardDescription>
                              {medicine.dosage} • {medicine.frequency}
                            </CardDescription>
                          </div>
                          <Badge
                            className={`${
                              stats.adherence >= 80
                                ? "bg-green-500/20 text-green-700 dark:text-green-400"
                                : stats.adherence >= 60
                                ? "bg-yellow-500/20 text-yellow-700 dark:text-yellow-400"
                                : "bg-red-500/20 text-red-700 dark:text-red-400"
                            }`}
                          >
                            {stats.adherence.toFixed(0)}%
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {medicine.instructions && (
                          <div>
                            <p className="text-sm font-medium text-muted-foreground mb-1">Instructions</p>
                            <p className="text-sm">{medicine.instructions}</p>
                          </div>
                        )}
                        <div className="grid grid-cols-4 gap-2">
                          <div className="p-2 rounded bg-blue-500/5 border border-blue-500/20">
                            <p className="text-xs font-medium text-muted-foreground">Total</p>
                            <p className="text-lg font-bold">{stats.total}</p>
                          </div>
                          <div className="p-2 rounded bg-green-500/5 border border-green-500/20">
                            <p className="text-xs font-medium text-muted-foreground">Taken</p>
                            <p className="text-lg font-bold text-green-600">{stats.taken}</p>
                          </div>
                          <div className="p-2 rounded bg-red-500/5 border border-red-500/20">
                            <p className="text-xs font-medium text-muted-foreground">Missed</p>
                            <p className="text-lg font-bold text-red-600">{stats.missed}</p>
                          </div>
                          <div className="p-2 rounded bg-yellow-500/5 border border-yellow-500/20">
                            <p className="text-xs font-medium text-muted-foreground">Pending</p>
                            <p className="text-lg font-bold text-yellow-600">{stats.pending}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </TabsContent>

            {/* Analysis Tab */}
            <TabsContent value="analysis" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Adherence Analysis</CardTitle>
                  <CardDescription>Your medication adherence trends for the last 90 days</CardDescription>
                </CardHeader>
                <CardContent>
                  {dailyAdherence.length === 0 ? (
                    <div className="h-80 flex items-center justify-center text-muted-foreground">
                      No data available
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={dailyAdherence}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis
                          dataKey="date"
                          tickFormatter={(date: string) => (date ? format(new Date(date), "MMM dd") : "")}
                          stroke="hsl(var(--muted-foreground))"
                        />
                        <YAxis domain={[0, 100]} stroke="hsl(var(--muted-foreground))" />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "hsl(var(--card))",
                            border: "1px solid hsl(var(--border))",
                          }}
                          formatter={(value: number) => `${value.toFixed(1)}%`}
                        />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="percentage"
                          stroke="#3b82f6"
                          strokeWidth={2}
                          dot={{ fill: "#3b82f6", r: 3 }}
                          name="Adherence %"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>

              {/* Summary Statistics */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Summary Statistics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {treatmentHistory.map((medicine: any) => {
                      const stats = calculateMedicineStats(medicine);
                      return (
                        <div key={medicine.id} className="flex items-center justify-between p-3 rounded-lg bg-accent/30">
                          <div>
                            <p className="font-medium">{medicine.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {stats.taken} of {stats.total} doses taken
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold">{stats.adherence.toFixed(0)}%</p>
                            <p className="text-xs text-muted-foreground">
                              {stats.adherence >= 80 ? "Excellent" : stats.adherence >= 60 ? "Good" : "Needs Work"}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Timeline Tab */}
            <TabsContent value="timeline" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activities</CardTitle>
                  <CardDescription>Your recent medication activities</CardDescription>
                </CardHeader>
                <CardContent>
                  {treatmentHistory.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">No activities recorded yet</p>
                  ) : (
                    <div className="space-y-4">
                      {treatmentHistory
                        .flatMap((medicine: any) =>
                          (medicine.intakeLogs || []).map((log: any) => ({
                            ...log,
                            medicineName: medicine.name,
                            dosage: medicine.dosage,
                          }))
                        )
                        .sort(
                          (a: any, b: any) =>
                            new Date(b.scheduledTime).getTime() - new Date(a.scheduledTime).getTime()
                        )
                        .slice(0, 20)
                        .map((log: any) => (
                          <div
                            key={log.id}
                            className="flex items-start gap-4 p-3 rounded-lg border hover:bg-accent/50 transition-colors"
                          >
                            <div className="mt-1">
                              {log.status === "taken" && <div className="w-3 h-3 rounded-full bg-green-500" />}
                              {log.status === "missed" && <div className="w-3 h-3 rounded-full bg-red-500" />}
                              {log.status === "pending" && <div className="w-3 h-3 rounded-full bg-yellow-500" />}
                            </div>
                            <div className="flex-1">
                              <p className="font-medium">{log.medicineName}</p>
                              <p className="text-sm text-muted-foreground">{log.dosage}</p>
                              <p className="text-xs text-muted-foreground mt-1">
                                Scheduled: {format(new Date(log.scheduledTime), "PPp")}
                              </p>
                              {log.takenTime && (
                                <p className="text-xs text-green-600">Taken: {format(new Date(log.takenTime), "PPp")}</p>
                              )}
                            </div>
                            <Badge
                              className={`${
                                log.status === "taken"
                                  ? "bg-green-500/20 text-green-700 dark:text-green-400"
                                  : log.status === "missed"
                                  ? "bg-red-500/20 text-red-700 dark:text-red-400"
                                  : "bg-yellow-500/20 text-yellow-700 dark:text-yellow-400"
                              }`}
                            >
                              {log.status}
                            </Badge>
                          </div>
                        ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
}
