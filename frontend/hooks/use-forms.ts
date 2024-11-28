"use client";

import { useContext } from "react";
import { FormsContext } from "@/providers/forms-provider";
import { useQuery } from "@tanstack/react-query";
import { formService } from "@/lib/services/form";

export function useForms() {
  const context = useContext(FormsContext);
  if (!context) {
    throw new Error("useForms must be used within a FormsProvider");
  }
  return context;
}

export function useForm(formId: string, requireAuth: boolean = false) {
  return useQuery({
    queryKey: ["form", formId],
    queryFn: () => formService.getForm(formId, requireAuth),
    staleTime: 10 * 60 * 1000, // 10 minutes
    enabled: !!formId && formId !== "new",
  });
}
