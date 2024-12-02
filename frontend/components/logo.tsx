import { siteConfig } from "@/config/site";
import Link from "next/link";
import { Icons } from "./icons";

interface LogoProps {
  target_blank?: boolean;
}

export default function Logo({ target_blank = false }: LogoProps) {
  return (
    <Link
      href="/"
      className="flex items-center space-x-2"
      target={target_blank ? "_blank" : ""}
    >
      <Icons.logo className="h-6 w-6" />
      <span className="text-2xl font-bold">{siteConfig.name}</span>
    </Link>
  );
}
