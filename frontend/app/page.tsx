import { Button } from "@/components/ui/button";
import { ArrowRightIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <main className="flex items-center justify-center min-h-[calc(100vh-7rem)] px-4">
      <div className="text-center max-w-4xl w-full">
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight text-balance">
          Transform Ideas into Forms
        </h1>
        <p className="text-lg md:text-xl mb-10 text-muted-foreground max-w-2xl mx-auto">
          Effortlessly create forms by simply describing them! Formwise uses AI
          to transform your ideas into ready-to-use forms in seconds.
        </p>
        <div className="flex justify-center">
          <Link href="/register" passHref>
            <Button
              className="group text-md rounded-full hover:bg-primary/90 transition-colors"
              size="lg"
            >
              Try It Out
              <ArrowRightIcon
                className="-me-1 ms-2 opacity-70 group-hover:translate-x-0.5 transition-transform"
                size={18}
                strokeWidth={2.5}
                aria-hidden="true"
              />
            </Button>
          </Link>
        </div>
        <div className="flex justify-center mt-12">
          <Link
            href="https://groq.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image
              src="https://groq.com/wp-content/uploads/2024/03/PBG-mark1-color.svg"
              alt="Powered by Groq for fast inference."
              width={100}
              height={50}
            />
          </Link>
        </div>
      </div>
    </main>
  );
}
