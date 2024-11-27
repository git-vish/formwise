"use client";

import { PlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import FormCard from "./form-card";
import { useMemo } from "react";

import { useConfig } from "@/hooks/use-config";
import { useForms } from "@/hooks/use-forms";

export default function FormsSection() {
  const { appConfig } = useConfig();
  const { forms, isLoading } = useForms();

  const maxForms = appConfig?.max_forms || 5;
  const maxResponses = appConfig?.max_responses || 150;

  const formsUsagePercentage = useMemo(
    () => (forms.length / maxForms) * 100,
    [forms.length, maxForms]
  );

  return (
    <section
      id="forms-section"
      className="space-y-8 animate-in fade-in duration-500"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Forms</h1>
          <p className="text-muted-foreground mt-1">
            Manage your forms in one place
          </p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <Button
            className="flex items-center gap-2 w-full sm:w-auto"
            disabled={forms.length >= maxForms || isLoading}
          >
            <PlusIcon className="h-4 w-4" /> Create Form
          </Button>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="w-32">
              <Progress value={formsUsagePercentage} className="h-2" />
            </div>
            <span>
              {forms.length}/{maxForms} forms used
            </span>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, index) => (
            <FormCard.Skeleton key={index} />
          ))}
        </div>
      ) : forms.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed rounded-lg">
          <p className="text-muted-foreground">
            Click &quot;Create Form&quot; to get started.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {forms.map((form) => (
            <FormCard key={form.id} form={form} maxResponses={maxResponses} />
          ))}
        </div>
      )}
    </section>
  );
}
