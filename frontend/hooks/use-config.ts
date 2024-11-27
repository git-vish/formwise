"use client";

import { useContext } from "react";
import { ConfigContext } from "@/providers/config-provider";

export function useConfig() {
  const context = useContext(ConfigContext);
  if (!context) {
    throw new Error("useConfig must be used within a ConfigProvider");
  }
  return context;
}
