"use client";

import { PlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import FormCard from "./form-card";
import { useMemo } from "react";

const FORM_LIMIT = 5;

const forms = [
  {
    id: "form-1",
    title: "Employee Satisfaction Survey 2024",
    description:
      "Annual survey to measure employee engagement and workplace satisfaction",
    created_at: "2024-03-01",
    status: "active",
    responses: 150,
  },
  {
    id: "form-2",
    title: "Product Feature Request",
    description: "Help us prioritize new features for our next release",
    created_at: "2024-03-15",
    status: "inactive",
    responses: 89,
  },
  {
    id: "form-3",
    title: "Conference Registration Form",
    description: "Sign up for TechConnect 2024 - Limited spots available",
    created_at: "2024-02-28",
    status: "active",
    responses: 142,
  },
  {
    id: "form-4",
    title: "Website Redesign Feedback",
    created_at: "2024-03-18",
    status: "inactive",
    responses: 0,
  },
];

export default function FormsSection() {
  const formsUsagePercentage = useMemo(
    () => (forms.length / FORM_LIMIT) * 100,
    []
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
            disabled={forms.length >= FORM_LIMIT}
          >
            <PlusIcon className="h-4 w-4" /> Create Form
          </Button>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="w-32">
              <Progress value={formsUsagePercentage} className="h-2" />
            </div>
            <span>
              {forms.length}/{FORM_LIMIT} forms used
            </span>
          </div>
        </div>
      </div>

      {forms.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed rounded-lg">
          <p className="text-muted-foreground">
            Click &quot;Create Form&quot; to get started.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {forms.map((form) => (
            <FormCard key={form.id} form={form} />
          ))}
        </div>
      )}
    </section>
  );
}
