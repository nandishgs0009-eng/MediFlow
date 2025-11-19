import { useMutation, useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertIntakeLogSchema } from "@shared/schema";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { InsertIntakeLog, Medicine } from "@shared/schema";
import { z } from "zod";
import { Pill } from "lucide-react";

const formSchema = insertIntakeLogSchema.extend({
  medicineId: z.string().min(1),
  scheduledTime: z.string().optional(),
});

interface LogIntakeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  medicineId: string | null;
}

export function LogIntakeDialog({ open, onOpenChange, medicineId }: LogIntakeDialogProps) {
  const { toast } = useToast();
  
  const { data: medicine } = useQuery<Medicine>({
    queryKey: ["/api/medicines/detail", medicineId],
    queryFn: async () => {
      if (!medicineId) throw new Error("Medicine ID required");
      const response = await fetch(`/api/medicines/detail/${medicineId}`);
      if (!response.ok) throw new Error("Failed to fetch medicine");
      return response.json();
    },
    enabled: !!medicineId,
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      medicineId: medicineId || "",
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
        title: "Intake logged",
        description: "Your medication intake has been recorded",
      });
      form.reset();
      onOpenChange(false);
      playSuccessSound();
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

  if (medicineId && form.getValues("medicineId") !== medicineId) {
    form.setValue("medicineId", medicineId);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Log Medication Intake</DialogTitle>
          <DialogDescription>
            Record that you've taken this medication
          </DialogDescription>
        </DialogHeader>

        {medicine && (
          <div className="p-4 rounded-md bg-muted/50 space-y-1">
            <div className="flex items-center gap-2">
              <Pill className="w-4 h-4 text-primary" />
              <p className="font-medium">{medicine.name}</p>
            </div>
            <p className="text-sm text-muted-foreground font-mono">{medicine.dosage}</p>
            <p className="text-xs text-muted-foreground">Scheduled for {medicine.scheduleTime}</p>
          </div>
        )}

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
                      data-testid="input-intake-notes"
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
                onClick={() => onOpenChange(false)}
                data-testid="button-cancel-intake"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1"
                disabled={createMutation.isPending}
                data-testid="button-submit-intake"
              >
                {createMutation.isPending ? "Logging..." : "Confirm Intake"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
