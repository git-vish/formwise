import { siteConfig } from "@/config/site";
import Link from "next/link";
import { Icons } from "./icons";

export default function Logo() {
  return (
    <Link href="/" className="flex items-center space-x-2">
      <Icons.logo className="h-6 w-6" />
      <span className="text-2xl font-bold">{siteConfig.name}</span>
    </Link>
  );
}
