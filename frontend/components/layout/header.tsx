import Link from "next/link";
import { Button } from "../ui/button";
import Logo from "./logo";

export default function Header() {
  return (
    <header className="top-0 w-full h-14">
      <nav className="container mx-auto h-full max-w-7xl px-4 flex items-center justify-between">
        <Logo />
        <div className="md:flex items-center">
          <Link href="/login" passHref>
            <Button variant="outline">Sign In</Button>
          </Link>
          <Link href="/register" passHref>
            <Button variant="default" className="ml-2">
              Sign Up
            </Button>
          </Link>
        </div>
      </nav>
    </header>
  );
}
