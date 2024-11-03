import { AuthGuard } from "@/components/auth/auth-guard";

export default function Dashboard() {
  return (
    <AuthGuard>
      <div className="flex flex-col items-center justify-center h-screen">
        <h1 className="text-4xl font-bold">Dashboard</h1>
      </div>
    </AuthGuard>
  );
}
