"use client";

import { useContext } from "react";
import { FormsContext } from "@/providers/forms-provider";

export function useForms() {
  const context = useContext(FormsContext);
  if (!context) {
    throw new Error("useForms must be used within a FormsProvider");
  }
  return context;
}
