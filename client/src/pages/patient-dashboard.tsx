import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Plus, Pill, Calendar, TrendingUp, Clock, CheckCircle2, XCircle } from "lucide-react";
import { AddTreatmentDialog } from "@/components/add-treatment-dialog";
import { AddMedicineDialog } from "@/components/add-medicine-dialog";
import { LogIntakeDialog } from "@/components/log-intake-dialog";
import type { Treatment, Medicine, IntakeLog } from "@shared/schema";

export default function PatientDashboard() {
  const [selectedTreatmentId, setSelectedTreatmentId] = useState<string | null>(null);
  const [showAddTreatment, setShowAddTreatment] = useState(false);
  const [showAddMedicine, setShowAddMedicine] = useState(false);
  const [showLogIntake, setShowLogIntake] = useState(false);
  const [selectedMedicineId, setSelectedMedicineId] = useState<string | null>(null);

  const { data: treatments = [], isLoading: loadingTreatments } = useQuery<Treatment[]>({
    queryKey: ["/api/treatments"],
  });

  const handleLogIntake = (medicineId: string) => {
    setSelectedMedicineId(medicineId);
    setShowLogIntake(true);
  };

  if (loadingTreatments) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="h-8 w-48 bg-muted animate-pulse rounded" />
          <div className="h-10 w-32 bg-muted animate-pulse rounded" />
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          {[1, 2].map((i) => (
            <div key={i} className="h-64 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-semibold">My Treatments</h1>
          <p className="text-muted-foreground mt-1">Manage your medications and track your progress</p>
        </div>
        <Button onClick={() => setShowAddTreatment(true)} data-testid="button-add-treatment">
          <Plus className="w-4 h-4 mr-2" />
          Add Treatment
        </Button>
      </div>

      {/* Empty State */}
      {treatments.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <Pill className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-medium mb-2">No treatments added yet</h3>
            <p className="text-muted-foreground text-center mb-6 max-w-md">
              Start by adding your first treatment to begin tracking your medication adherence
            </p>
            <Button onClick={() => setShowAddTreatment(true)} data-testid="button-add-first-treatment">
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Treatment
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Treatment Cards */}
      {treatments.length > 0 && (
        <div className="grid md:grid-cols-2 gap-6">
          {treatments.map((treatment) => (
            <TreatmentCard
              key={treatment.id}
              treatment={treatment}
              onAddMedicine={(treatmentId) => {
                setSelectedTreatmentId(treatmentId);
                setShowAddMedicine(true);
              }}
              onLogIntake={handleLogIntake}
            />
          ))}
        </div>
      )}

      {/* Dialogs */}
      <AddTreatmentDialog open={showAddTreatment} onOpenChange={setShowAddTreatment} />
      <AddMedicineDialog
        open={showAddMedicine}
        onOpenChange={setShowAddMedicine}
        treatmentId={selectedTreatmentId}
      />
      <LogIntakeDialog
        open={showLogIntake}
        onOpenChange={setShowLogIntake}
        medicineId={selectedMedicineId}
      />
    </div>
  );
}

function TreatmentCard({
  treatment,
  onAddMedicine,
  onLogIntake,
}: {
  treatment: Treatment;
  onAddMedicine: (treatmentId: string) => void;
  onLogIntake: (medicineId: string) => void;
}) {
  const { data: medicines = [] } = useQuery<Medicine[]>({
    queryKey: ["/api/medicines", treatment.id],
    queryFn: async () => {
      const response = await fetch(`/api/medicines/${treatment.id}`);
      if (!response.ok) throw new Error("Failed to fetch medicines");
      return response.json();
    },
  });

  const { data: adherenceData } = useQuery<{ percentage: number; taken: number; total: number }>({
    queryKey: ["/api/adherence", treatment.id],
    queryFn: async () => {
      const response = await fetch(`/api/adherence/${treatment.id}`);
      if (!response.ok) throw new Error("Failed to fetch adherence");
      return response.json();
    },
  });

  const adherencePercentage = adherenceData?.percentage || 0;

  return (
    <Card className="hover-elevate" data-testid={`card-treatment-${treatment.id}`}>
      <CardHeader className="space-y-0 pb-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <CardTitle className="text-xl mb-2">{treatment.name}</CardTitle>
            {treatment.description && (
              <CardDescription>{treatment.description}</CardDescription>
            )}
          </div>
          <Badge
            variant={treatment.status === "active" ? "default" : "secondary"}
            data-testid={`badge-status-${treatment.id}`}
          >
            {treatment.status}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Adherence Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Adherence</span>
            <span className="font-mono font-semibold" data-testid={`text-adherence-${treatment.id}`}>
              {adherencePercentage.toFixed(0)}%
            </span>
          </div>
          <Progress value={adherencePercentage} className="h-2" />
          {adherenceData && (
            <p className="text-xs text-muted-foreground">
              {adherenceData.taken} of {adherenceData.total} doses taken
            </p>
          )}
        </div>

        <Separator />

        {/* Medicines List */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium">Medications</h4>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onAddMedicine(treatment.id)}
              data-testid={`button-add-medicine-${treatment.id}`}
            >
              <Plus className="w-3 h-3 mr-1" />
              Add
            </Button>
          </div>

          {medicines.length === 0 ? (
            <p className="text-sm text-muted-foreground italic">No medications added yet</p>
          ) : (
            <div className="space-y-2">
              {medicines.map((medicine) => (
                <MedicineItem
                  key={medicine.id}
                  medicine={medicine}
                  onLogIntake={onLogIntake}
                />
              ))}
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="text-xs text-muted-foreground">
        <Calendar className="w-3 h-3 mr-1" />
        Started {new Date(treatment.startDate).toLocaleDateString()}
      </CardFooter>
    </Card>
  );
}

function MedicineItem({
  medicine,
  onLogIntake,
}: {
  medicine: Medicine;
  onLogIntake: (medicineId: string) => void;
}) {
  const { data: recentLog } = useQuery<IntakeLog | null>({
    queryKey: ["/api/intake-logs/recent", medicine.id],
    queryFn: async () => {
      const response = await fetch(`/api/intake-logs/recent/${medicine.id}`);
      if (!response.ok) throw new Error("Failed to fetch recent log");
      return response.json();
    },
  });

  const isTakenToday = recentLog?.status === "taken";

  return (
    <div
      className="flex items-center justify-between p-3 rounded-md bg-muted/50 gap-2"
      data-testid={`medicine-item-${medicine.id}`}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <p className="font-medium text-sm truncate">{medicine.name}</p>
          {isTakenToday && (
            <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" data-testid={`icon-taken-${medicine.id}`} />
          )}
        </div>
        <p className="text-xs text-muted-foreground font-mono">{medicine.dosage}</p>
        <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
          <Clock className="w-3 h-3" />
          <span>{medicine.scheduleTime}</span>
        </div>
      </div>
      <Button
        size="sm"
        onClick={() => onLogIntake(medicine.id)}
        variant={isTakenToday ? "outline" : "default"}
        data-testid={`button-log-intake-${medicine.id}`}
      >
        {isTakenToday ? "Logged" : "Log"}
      </Button>
    </div>
  );
}
