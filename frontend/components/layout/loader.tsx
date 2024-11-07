import { Icons } from "@/components/icons";

export default function Loader() {
  return (
    <div className="flex items-center justify-center h-screen">
      <Icons.logo className="h-16 w-16 animate-pulse-bounce" />
    </div>
  );
}
