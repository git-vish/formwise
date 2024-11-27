"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  MoreVerticalIcon,
  TypeIcon,
  Share2Icon,
  Trash2Icon,
  ClockIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import Link from "next/link";
import { FormOverview } from "@/types/form";
import { useMemo } from "react";
import { formatDate } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

interface FormCardProps {
  form: FormOverview;
  maxResponses: number;
}

export default function FormCard({ form, maxResponses }: FormCardProps) {
  const { toast } = useToast();

  const remainingResponses = useMemo(
    () => maxResponses - form.response_count,
    [form.response_count, maxResponses]
  );

  const responsePercentage = useMemo(
    () => (form.response_count / maxResponses) * 100,
    [form.response_count, maxResponses]
  );

  const handleShare = (): void => {
    navigator.clipboard
      .writeText(`${window.location.origin}/f/${form.id}`)
      .then(() => {
        toast({
          description: "Link copied to clipboard",
        });
      });
  };

  return (
    <Link href="/forms/[formId]" as={`/forms/${form.id}`}>
      <Card className="hover:border-primary">
        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
          <div className="space-y-1 max-w-[80%]">
            <CardTitle className="text-lg font-semibold line-clamp-1">
              {form.title}
            </CardTitle>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8">
                <MoreVerticalIcon className="h-4 w-4" />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={handleShare}>
                <Share2Icon className="mr-2 h-4 w-4" /> Share
              </DropdownMenuItem>
              <DropdownMenuItem>
                <TypeIcon className="mr-2 h-4 w-4" /> Rename
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="focus:text-destructive">
                <Trash2Icon className="mr-2 h-4 w-4" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <ClockIcon className="h-4 w-4" />
              <time dateTime={form.created_at}>
                {formatDate(form.created_at)}
              </time>
            </div>
            {form.is_active && responsePercentage < 100 && <Badge>Live</Badge>}
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Responses</span>
              <span className="font-medium">{form.response_count}</span>
            </div>
            <Progress value={responsePercentage} className="h-2" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{remainingResponses} responses remaining</span>
              <span>{Math.round(responsePercentage)}% of limit</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

function FormCardSkeleton() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <div className="space-y-1 max-w-[80%]">
          <CardTitle>
            <Skeleton className="h-6 w-3/4" />
          </CardTitle>
        </div>
        <Skeleton className="h-8 w-8 rounded-md" />
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Skeleton className="h-4 w-4 rounded-full" />
            <Skeleton className="h-4 w-24" />
          </div>
          <Skeleton className="h-6 w-12" />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-12" />
          </div>
          <Skeleton className="h-2 w-full" />
          <div className="flex justify-between">
            <Skeleton className="h-3 w-36" />
            <Skeleton className="h-3 w-16" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

FormCard.Skeleton = FormCardSkeleton;
