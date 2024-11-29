import Link from "next/link";
import { Button } from "@/components/ui/button";
import { HomeIcon } from "@radix-ui/react-icons";

export default function NotFound() {
  return (
    <div className="min-h-[calc(100vh-7rem)] flex flex-col items-center justify-center gap-6 px-4 text-center">
      <h1 className="text-6xl md:text-8xl font-bold">404</h1>
      <p className="text-lg md:text-xl text-muted-foreground">
        The page you're looking for is on a permanent vacation. 🏖️
      </p>
      <Link href="/" passHref>
        <Button variant="outline">
          <HomeIcon className="mr-2 h-5 w-5" />
          Back to Home
        </Button>
      </Link>
    </div>
  );
}
