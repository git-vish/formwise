import Link from "next/link";
import { GithubIcon } from "lucide-react";
import { siteConfig } from "@/config/site";

export default function Footer() {
  return (
    <footer className="bottom-0 w-full">
      <div className="container mx-auto flex justify-between items-center px-4 py-4 text-sm">
        {/* Copyright and author link */}
        <p>
          &copy; {new Date().getFullYear()}{" "}
          <Link
            href={siteConfig.links.website}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-primary"
          >
            {siteConfig.author}
          </Link>
        </p>

        <div className="flex space-x-2 sm:space-x-4">
          {/* GitHub repository link */}
          <Link
            href={siteConfig.links.github}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center hover:text-primary"
            aria-label="GitHub repository"
          >
            <GithubIcon className="h-5 w-5 mr-1" />
            <span className="sr-only sm:not-sr-only">GitHub</span>
          </Link>
        </div>
      </div>
    </footer>
  );
}
