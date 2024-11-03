import Link from "next/link";
import { Button } from "../ui/button";
import { ThemeToggle } from "../theme/theme-toggle";

export default function Header() {
  return (
    <header className="top-0 w-full h-14">
      <nav className="container mx-auto h-full max-w-7xl px-4 flex items-center justify-between">
        <Link href="/" className="text-2xl text-primary font-bold">
          FormWise
        </Link>

        <div className="md:flex items-center">
          <Button variant="outline">
            <Link href="/login">Sign In</Link>
          </Button>
          <Button className="ml-2">
            <Link href="/register">Sign Up</Link>
          </Button>
          <ThemeToggle />
        </div>
      </nav>
    </header>
  );
}
