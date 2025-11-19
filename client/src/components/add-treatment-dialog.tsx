import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertTreatmentSchema } from "@shared/schema";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { InsertTreatment } from "@shared/schema";
import { z } from "zod";

const formSchema = insertTreatmentSchema.extend({
  patientId: z.string().optional(),
});

interface AddTreatmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddTreatmentDialog({ open, onOpenChange }: AddTreatmentDialogProps) {
  const { toast } = useToast();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      status: "active",
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: InsertTreatment) => {
      return await apiRequest("POST", "/api/treatments", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/treatments"] });
      toast({
        title: "Treatment added",
        description: "Your treatment has been successfully added",
      });
      form.reset();
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add treatment",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    createMutation.mutate(data as InsertTreatment);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Treatment</DialogTitle>
          <DialogDescription>
            Create a new treatment plan to start tracking medications
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Treatment Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Hypertension Management" {...field} data-testid="input-treatment-name" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Brief description of the treatment..."
                      {...field}
                      value={field.value || ""}
                      data-testid="input-treatment-description"
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
                data-testid="button-cancel-treatment"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1"
                disabled={createMutation.isPending}
                data-testid="button-submit-treatment"
              >
                {createMutation.isPending ? "Adding..." : "Add Treatment"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
