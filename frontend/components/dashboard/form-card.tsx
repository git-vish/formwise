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
import { Form } from "@/types/form";
import { useMemo } from "react";
import { formatDate } from "@/lib/utils";

const SUBMISSION_LIMIT = 150;

interface FormCardProps {
  form: Form;
}

export default function FormCard({ form }: FormCardProps) {
  const remainingResponses = useMemo(
    () => SUBMISSION_LIMIT - form.responses,
    [form.responses]
  );

  const responsePercentage = useMemo(
    () => (remainingResponses / SUBMISSION_LIMIT) * 100,
    [remainingResponses]
  );

  return (
    <Link href="#">
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
              <DropdownMenuItem>
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
            {form.accepting_responses && responsePercentage < 100 && (
              <Badge>Live</Badge>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Responses</span>
              <span className="font-medium">{form.responses}</span>
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
