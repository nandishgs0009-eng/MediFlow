import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Pill, Clock, CheckCircle2, AlertCircle, Link } from "lucide-react";
import type { Medicine, IntakeLog } from "@shared/schema";

interface StatCard {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  bgColor: string;
  textColor: string;
}

export default function PatientOverview() {
  const { data: treatments = [] } = useQuery<any[]>({
    queryKey: ["/api/treatments"],
  });

  // Fetch all medicines across all treatments
  const { data: allMedicines = [] } = useQuery<Medicine[]>({
    queryKey: ["/api/all-medicines"],
    queryFn: async () => {
      const medicinesPromises = treatments.map((treatment) =>
        fetch(`/api/medicines/${treatment.id}`)
          .then((res) => (res.ok ? res.json() : []))
          .catch(() => [])
      );
      const medicinesArrays = await Promise.all(medicinesPromises);
      return medicinesArrays.flat();
    },
    enabled: treatments.length > 0,
  });

  // Fetch today's intake logs
  const { data: todayIntakeLogs = [] } = useQuery<IntakeLog[]>({
    queryKey: ["/api/intake-logs/today-all"],
    queryFn: async () => {
      const response = await fetch("/api/intake-logs/today-all");
      if (!response.ok) return [];
      return response.json();
    },
  });

  // Calculate statistics
  const totalMedicines = allMedicines.length;
  const totalTreatments = treatments.length;
  const medicinesTakenToday = todayIntakeLogs.filter(
    (log) => log.status === "taken"
  ).length;
  const pendingMedicines = totalMedicines - medicinesTakenToday;

  const stats: StatCard[] = [
    {
      title: "Total Medicines",
      value: totalMedicines,
      icon: <Pill className="w-8 h-8" />,
      bgColor: "bg-purple-500",
      textColor: "text-white",
    },
    {
      title: "Active Treatments",
      value: totalTreatments,
      icon: <AlertCircle className="w-8 h-8" />,
      bgColor: "bg-blue-500",
      textColor: "text-white",
    },
    {
      title: "Taken Today",
      value: medicinesTakenToday,
      icon: <CheckCircle2 className="w-8 h-8" />,
      bgColor: "bg-green-500",
      textColor: "text-white",
    },
    {
      title: "Pending",
      value: pendingMedicines,
      icon: <Clock className="w-8 h-8" />,
      bgColor: "bg-orange-500",
      textColor: "text-white",
    },
  ];

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl md:text-4xl font-semibold">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Overview of your medication and health statistics
        </p>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card
            key={stat.title}
            className={`${stat.bgColor} border-0 rounded-lg overflow-hidden hover:shadow-lg transition-shadow`}
          >
            <CardContent className="p-6 text-white">
              <div className="flex items-start justify-between mb-8">
                <div>
                  <p className="text-sm font-medium opacity-90">{stat.title}</p>
                  <p className="text-4xl font-bold mt-2">{stat.value}</p>
                </div>
                <div className="opacity-50 hover:opacity-75 transition-opacity">
                  <Link className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Activity Section */}
      <Card>
        <CardContent className="p-6">
          <h2 className="text-xl font-semibold mb-4">Today's Medications</h2>
          {allMedicines.length === 0 ? (
            <p className="text-muted-foreground">
              No medicines added yet. Start by adding a treatment and medicine.
            </p>
          ) : (
            <div className="space-y-3">
              {allMedicines.slice(0, 5).map((medicine) => {
                const isTaken = todayIntakeLogs.some(
                  (log) =>
                    log.medicineId === medicine.id && log.status === "taken"
                );
                return (
                  <div
                    key={medicine.id}
                    className="flex items-center justify-between p-3 bg-muted/50 rounded-md"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-sm">{medicine.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {medicine.dosage} • {medicine.scheduleTime}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {isTaken ? (
                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                      ) : (
                        <Clock className="w-5 h-5 text-orange-600" />
                      )}
                      <span className="text-xs font-semibold">
                        {isTaken ? "Taken" : "Pending"}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Health Metrics */}
      <Card>
        <CardContent className="p-6">
          <h2 className="text-xl font-semibold mb-4">Health Metrics</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-muted/50 rounded-md">
              <p className="text-sm text-muted-foreground mb-1">
                Adherence Rate
              </p>
              <p className="text-2xl font-bold text-green-600">
                {totalMedicines > 0
                  ? (
                      (medicinesTakenToday / totalMedicines) *
                      100
                    ).toFixed(0)
                  : 0}
                %
              </p>
            </div>
            <div className="p-4 bg-muted/50 rounded-md">
              <p className="text-sm text-muted-foreground mb-1">
                Total Doses Logged
              </p>
              <p className="text-2xl font-bold text-blue-600">
                {todayIntakeLogs.length}
              </p>
            </div>
            <div className="p-4 bg-muted/50 rounded-md">
              <p className="text-sm text-muted-foreground mb-1">
                Streak Days
              </p>
              <p className="text-2xl font-bold text-purple-600">
                {medicinesTakenToday > 0 ? "1" : "0"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
