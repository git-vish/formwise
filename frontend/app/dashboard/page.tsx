"use client";

import FormsSection from "@/components/dashboard/forms";
import { useAuth } from "@/hooks/use-auth";

export default function DashboardPage() {
  // TODO: Convert to server component
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { user } = useAuth();

  return (
    <div className="container mx-auto px-4 py-8">
      <FormsSection />
    </div>
  );
}
