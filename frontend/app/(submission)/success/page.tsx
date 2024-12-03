"use client";

import { useRouter } from "next/navigation";
import { CheckIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function SuccessPage() {
  const router = useRouter();

  const handleSubmitAnother = () => {
    router.back();
  };

  return (
    <div className="min-h-[calc(100vh-7rem)] flex items-center justify-center container mx-auto p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader className="flex flex-col items-center space-y-4">
          <CheckIcon className="text-primary" size={48} strokeWidth={2} />
          <CardTitle>Success</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Your response has been recorded.
          </p>
        </CardContent>
        <CardFooter>
          <Button
            variant="link"
            className="w-full"
            onClick={handleSubmitAnother}
          >
            Submit Another Response
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
