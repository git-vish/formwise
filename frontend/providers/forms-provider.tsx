"use client";

import { formService } from "@/lib/services/form";
import { FormCreateValues, FormOverview, FormsContextType } from "@/types/form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createContext, useCallback, useMemo } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";

// Constants
const FORMS_STALE_TIME = 5 * 60 * 1000; // 5 minutes

export const FormsContext = createContext<FormsContextType | null>(null);

export function FormsProvider({ children }: { children: React.ReactNode }) {
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Forms query
  const {
    data: forms,
    isLoading,
    error,
    refetch: refreshForms,
  } = useQuery<FormOverview[]>({
    queryKey: ["forms"],
    queryFn: formService.getForms,
    enabled: user !== null,
    retry: false,
    staleTime: FORMS_STALE_TIME,
  });

  const deleteFormMutation = useMutation({
    mutationFn: formService.deleteForm,
    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ queryKey: ["forms"] });
      const previousForms = queryClient.getQueryData<FormOverview[]>(["forms"]);

      queryClient.setQueryData(
        ["forms"],
        previousForms?.filter((form) => form.id !== id) ?? []
      );

      return { previousForms };
    },
    onError: (_, __, context) => {
      if (context?.previousForms) {
        queryClient.setQueryData(["forms"], context.previousForms);
      }

      toast({
        title: "Failed to delete form. Please try again.",
        variant: "destructive",
      });
    },
    onSuccess: (_, id) => {
      queryClient.removeQueries({
        queryKey: ["form", id],
      });

      toast({
        title: "Form deleted successfully.",
      });
    },
  });

  const deleteForm = useCallback(
    async (id: string) => {
      await deleteFormMutation.mutateAsync(id);
    },
    [deleteFormMutation]
  );

  const createFormMutation = useMutation({
    mutationFn: formService.createForm,
    onSuccess: (newForm) => {
      refreshForms();
      queryClient.setQueryData(["form", newForm.id], newForm);

      toast({
        title: "Form created successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: (error as Error).message,
        variant: "destructive",
      });
    },
  });

  const createForm = useCallback(
    async (data: FormCreateValues) => {
      await createFormMutation.mutateAsync(data);
    },
    [createFormMutation]
  );

  // Memoized context value
  const contextValue = useMemo<FormsContextType>(
    () => ({
      forms: forms ?? [],
      isLoading: authLoading || isLoading,
      error: error instanceof Error ? error : null,
      refreshForms: async () => {
        await refreshForms();
      },
      deleteForm,
      createForm,
    }),
    [forms, authLoading, isLoading, error, deleteForm, createForm, refreshForms]
  );

  return (
    <FormsContext.Provider value={contextValue}>
      {children}
    </FormsContext.Provider>
  );
}
