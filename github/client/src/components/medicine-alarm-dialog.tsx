import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertIntakeLogSchema } from "@shared/schema";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { InsertIntakeLog, Medicine } from "@shared/schema";
import { z } from "zod";
import { Bell, AlertTriangle, Pill } from "lucide-react";
import { AlarmService } from "@/services/alarm-service";
import { useRef } from "react";

const formSchema = insertIntakeLogSchema.extend({
  medicineId: z.string().min(1),
  scheduledTime: z.string().optional(),
});

interface MedicineAlarmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  medicine: Medicine | null;
}

export function MedicineAlarmDialog({ open, onOpenChange, medicine }: MedicineAlarmDialogProps) {
  const { toast } = useToast();
  const [isPlaying, setIsPlaying] = useState(false);
  const alarmIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Query to check if already taken today
  const { data: todayIntake } = useQuery({
    queryKey: ["/api/intake-logs/today", medicine?.id],
    queryFn: async () => {
      if (!medicine?.id) return null;
      const response = await fetch(`/api/intake-logs/today/${medicine.id}`);
      if (!response.ok) return null;
      return response.json();
    },
    enabled: !!medicine?.id && open,
    refetchInterval: 1000, // Check every second
  });

  useEffect(() => {
    if (open && medicine) {
      AlarmService.playAlarmSound();
      setIsPlaying(true);
    }
    return () => {
      AlarmService.stopAlarmSound();
      setIsPlaying(false);
    };
  }, [open, medicine]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      medicineId: medicine?.id || "",
      status: "taken",
      notes: "",
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: InsertIntakeLog) => {
      return await apiRequest("POST", "/api/intake-logs", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/intake-logs"] });
      queryClient.invalidateQueries({ queryKey: ["/api/adherence"] });
      toast({
        title: "Medication logged",
        description: `${medicine?.name} has been recorded as taken`,
      });
      playSuccessSound();
      AlarmService.stopAlarmSound();
      setIsPlaying(false);
      form.reset();
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to log intake",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    const now = new Date();
    const logData = {
      ...data,
      scheduledTime: now.toISOString(),
      takenTime: now.toISOString(),
    } as InsertIntakeLog;
    createMutation.mutate(logData);
  };

  const playSuccessSound = () => {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 800;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.3);
  };

  if (medicine?.id && form.getValues("medicineId") !== medicine.id) {
    form.setValue("medicineId", medicine.id);
  }

  if (!medicine) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-red-500 animate-pulse" />
            Medication Reminder
          </DialogTitle>
          <DialogDescription>
            It's time to take your medication
          </DialogDescription>
        </DialogHeader>

        <Alert className="border-orange-200 bg-orange-50">
          <AlertTriangle className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-800">
            {isPlaying && "⏰ Alarm is ringing! Please take your medication now."}
          </AlertDescription>
        </Alert>

        {/* Medicine Details */}
        <div className="p-4 rounded-md bg-blue-50 border border-blue-200 space-y-2">
          <div className="flex items-center gap-2">
            <Pill className="w-5 h-5 text-blue-600" />
            <p className="font-semibold text-lg">{medicine.name}</p>
          </div>
          <div className="ml-7 space-y-1">
            <p className="text-sm text-blue-700">
              <span className="font-medium">Dosage:</span> {medicine.dosage}
            </p>
            <p className="text-sm text-blue-700">
              <span className="font-medium">Scheduled:</span> {medicine.scheduleTime}
            </p>
            {medicine.instructions && (
              <p className="text-sm text-blue-700">
                <span className="font-medium">Instructions:</span> {medicine.instructions}
              </p>
            )}
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Any notes about this dose..."
                      {...field}
                      value={field.value || ""}
                      className="text-sm"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => {
                  AlarmService.stopAlarmSound();
                  setIsPlaying(false);
                  onOpenChange(false);
                }}
                data-testid="button-dismiss-alarm"
              >
                Dismiss
              </Button>
              <Button
                type="submit"
                className="flex-1"
                disabled={createMutation.isPending || !!todayIntake}
                data-testid="button-confirm-alarm"
              >
                {todayIntake
                  ? "Already taken today"
                  : createMutation.isPending
                  ? "Recording..."
                  : "✓ Confirm Taken"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
