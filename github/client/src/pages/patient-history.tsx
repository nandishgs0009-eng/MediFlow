import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { CheckCircle2, XCircle, Clock, Calendar, Search } from "lucide-react";
import { format } from "date-fns";
import type { Treatment, Medicine, IntakeLog } from "@shared/schema";

export default function PatientHistory() {
  const [selectedTreatmentId, setSelectedTreatmentId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const { data: treatments = [], isLoading: loadingTreatments } = useQuery<Treatment[]>({
    queryKey: ["/api/treatments"],
  });

  const { data: treatmentHistory = [] } = useQuery(
    {
      queryKey: [`/api/history/treatment/${selectedTreatmentId}`],
      enabled: !!selectedTreatmentId,
    }
  ) as { data: any[] };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "taken":
        return <Badge className="bg-green-500/20 text-green-700 dark:text-green-400">Taken</Badge>;
      case "missed":
        return <Badge className="bg-red-500/20 text-red-700 dark:text-red-400">Missed</Badge>;
      case "pending":
        return <Badge className="bg-yellow-500/20 text-yellow-700 dark:text-yellow-400">Pending</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "taken":
        return <CheckCircle2 className="w-5 h-5 text-green-600" />;
      case "missed":
        return <XCircle className="w-5 h-5 text-red-600" />;
      case "pending":
        return <Clock className="w-5 h-5 text-yellow-600" />;
      default:
        return null;
    }
  };

  const filteredHistory = treatmentHistory.flatMap((medicine: any) =>
    (medicine.intakeLogs || []).map((log: any) => ({
      ...log,
      medicineName: medicine.name,
      medicineId: medicine.id,
      dosage: medicine.dosage,
      frequency: medicine.frequency,
    }))
  ).filter(log =>
    log.medicineName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.dosage.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loadingTreatments) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Medicine History</h1>
        <p className="text-muted-foreground mt-2">Track your medication intake history by treatment</p>
      </div>

      {treatments.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">No treatments found. Add a treatment to get started.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {/* Treatment Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Select Treatment</CardTitle>
              <CardDescription>Choose a treatment to view medicine history</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {treatments.map((treatment) => (
                  <button
                    key={treatment.id}
                    onClick={() => setSelectedTreatmentId(treatment.id)}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      selectedTreatmentId === treatment.id
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <p className="font-semibold text-left">{treatment.name}</p>
                    <p className="text-sm text-muted-foreground text-left">{treatment.description}</p>
                    <Badge className="mt-2" variant={treatment.status === "active" ? "default" : "secondary"}>
                      {treatment.status}
                    </Badge>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* History View */}
          {selectedTreatmentId && (
            <Card>
              <CardHeader>
                <CardTitle>Intake History</CardTitle>
                <CardDescription>
                  Detailed record of medication intake for {treatments.find(t => t.id === selectedTreatmentId)?.name}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by medicine name or dosage..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                {/* Tabs for view mode */}
                <Tabs defaultValue="list" className="w-full">
                  <TabsList>
                    <TabsTrigger value="list">List View</TabsTrigger>
                    <TabsTrigger value="grouped">Grouped by Medicine</TabsTrigger>
                  </TabsList>

                  <TabsContent value="list" className="space-y-3">
                    {filteredHistory.length === 0 ? (
                      <p className="text-center text-muted-foreground py-8">No intake records found</p>
                    ) : (
                      <div className="space-y-2">
                        {filteredHistory.map((log: any) => (
                          <div
                            key={log.id}
                            className="flex items-start gap-4 p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                          >
                            {getStatusIcon(log.status)}
                            <div className="flex-1">
                              <div className="flex items-center justify-between gap-2 mb-1">
                                <p className="font-semibold">{log.medicineName}</p>
                                {getStatusBadge(log.status)}
                              </div>
                              <p className="text-sm text-muted-foreground">Dosage: {log.dosage}</p>
                              <div className="flex gap-4 mt-2 text-sm text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <Calendar className="w-4 h-4" />
                                  <span>Scheduled: {format(new Date(log.scheduledTime), "PPp")}</span>
                                </div>
                                {log.takenTime && (
                                  <div className="flex items-center gap-1">
                                    <Clock className="w-4 h-4" />
                                    <span>Taken: {format(new Date(log.takenTime), "PPp")}</span>
                                  </div>
                                )}
                              </div>
                              {log.notes && (
                                <p className="text-sm mt-2 text-muted-foreground italic">Note: {log.notes}</p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="grouped" className="space-y-4">
                    {treatmentHistory.filter((med: any) =>
                      med.name.toLowerCase().includes(searchTerm.toLowerCase())
                    ).map((medicine: any) => {
                      const logs = medicine.intakeLogs || [];
                      const taken = logs.filter((l: any) => l.status === "taken").length;
                      const missed = logs.filter((l: any) => l.status === "missed").length;

                      return (
                        <Card key={medicine.id}>
                          <CardHeader>
                            <div className="flex items-start justify-between">
                              <div>
                                <CardTitle className="text-lg">{medicine.name}</CardTitle>
                                <CardDescription>
                                  {medicine.dosage} • {medicine.frequency}
                                </CardDescription>
                              </div>
                              <div className="flex gap-2">
                                <Badge variant="default" className="bg-green-500/20 text-green-700 dark:text-green-400">
                                  {taken} Taken
                                </Badge>
                                {missed > 0 && (
                                  <Badge className="bg-red-500/20 text-red-700 dark:text-red-400">
                                    {missed} Missed
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-2">
                              {logs.length === 0 ? (
                                <p className="text-muted-foreground text-sm">No intake records</p>
                              ) : (
                                logs.map((log: any) => (
                                  <div key={log.id} className="flex items-center justify-between p-3 rounded-lg bg-accent/30">
                                    <div className="flex items-center gap-3">
                                      {getStatusIcon(log.status)}
                                      <div>
                                        <p className="text-sm font-medium">
                                          {format(new Date(log.scheduledTime), "PPp")}
                                        </p>
                                        {log.takenTime && (
                                          <p className="text-xs text-muted-foreground">
                                            Taken at {format(new Date(log.takenTime), "pp")}
                                          </p>
                                        )}
                                      </div>
                                    </div>
                                    {getStatusBadge(log.status)}
                                  </div>
                                ))
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </TabsContent>
                </Tabs>

                {/* Summary Stats */}
                {filteredHistory.length > 0 && (
                  <div className="mt-6 pt-6 border-t">
                    <h3 className="font-semibold mb-4">Summary</h3>
                    <div className="grid grid-cols-3 gap-4">
                      <Card className="bg-green-500/5 border-green-500/20">
                        <CardContent className="pt-6">
                          <p className="text-2xl font-bold text-green-600">
                            {filteredHistory.filter(l => l.status === "taken").length}
                          </p>
                          <p className="text-sm text-muted-foreground">Taken</p>
                        </CardContent>
                      </Card>
                      <Card className="bg-red-500/5 border-red-500/20">
                        <CardContent className="pt-6">
                          <p className="text-2xl font-bold text-red-600">
                            {filteredHistory.filter(l => l.status === "missed").length}
                          </p>
                          <p className="text-sm text-muted-foreground">Missed</p>
                        </CardContent>
                      </Card>
                      <Card className="bg-blue-500/5 border-blue-500/20">
                        <CardContent className="pt-6">
                          <p className="text-2xl font-bold text-blue-600">
                            {((filteredHistory.filter(l => l.status === "taken").length / filteredHistory.length) * 100).toFixed(0)}%
                          </p>
                          <p className="text-sm text-muted-foreground">Adherence</p>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
