"use client";

import { useForm } from "@/hooks/use-forms";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import {
  DropdownField,
  Field,
  MultiSelectField,
  SelectField,
} from "@/types/field";

interface FormViewProps {
  formId: string;
}

export default function FormView({ formId }: FormViewProps) {
  const { data: form, isLoading, error } = useForm(formId, true);

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  if (!form) {
    return <p>Form not found</p>;
  }

  const renderField = (field: Field, index: number) => {
    return (
      <div key={index} className="mb-4">
        <div className="flex items-center justify-between">
          <Label htmlFor={field.tag}>{field.label}</Label>
          {field.help_text && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Badge className="cursor-pointer">?</Badge>
                </TooltipTrigger>
                <TooltipContent>{field.help_text}</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
        <div className="mt-2">
          {/* Render field based on its type */}
          {field.type === "text" && (
            <Input
              id={field.tag}
              placeholder={`Enter ${field.label}`}
              required={field.required}
              maxLength={field.max_length}
            />
          )}
          {field.type === "paragraph" && (
            <Textarea
              id={field.tag}
              placeholder={`Enter ${field.label}`}
              required={field.required}
              maxLength={field.max_length}
              rows={5}
            />
          )}
          {["select", "dropdown"].includes(field.type) && (
            <Select>
              <SelectTrigger>
                <SelectValue placeholder={`Select ${field.label}`} />
              </SelectTrigger>
              <SelectContent>
                {(field as SelectField | DropdownField).options.map(
                  (option, idx) => (
                    <SelectItem key={idx} value={option}>
                      {option}
                    </SelectItem>
                  )
                )}
              </SelectContent>
            </Select>
          )}
          {field.type === "multi_select" && (
            <div>
              {(field as MultiSelectField).options.map((option, idx) => (
                <div key={idx} className="flex items-center space-x-2">
                  <Checkbox id={`${field.tag}-${idx}`} />
                  <Label htmlFor={`${field.tag}-${idx}`}>{option}</Label>
                </div>
              ))}
            </div>
          )}
          {field.type === "date" && (
            <Calendar
              mode="single"
              selected={field.min_date ? new Date(field.min_date) : undefined}
              fromDate={field.min_date ? new Date(field.min_date) : undefined}
              toDate={field.max_date ? new Date(field.max_date) : undefined}
            />
          )}
          {field.type === "email" && (
            <Input
              id={field.tag}
              type="email"
              placeholder={`Enter ${field.label}`}
              required={field.required}
            />
          )}
          {field.type === "number" && (
            <Input
              id={field.tag}
              type="number"
              placeholder={`Enter ${field.label}`}
              required={field.required}
              min={field.min_value ? field.min_value : undefined}
              max={field.max_value ? field.max_value : undefined}
            />
          )}
          {field.type === "url" && (
            <Input
              id={field.tag}
              type="url"
              placeholder={`Enter ${field.label}`}
              required={field.required}
            />
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="mt-8">
      <Card className="max-w-lg mx-auto">
        <CardHeader>
          <CardTitle>{form.title}</CardTitle>
          {form.description && (
            <CardDescription>{form.description}</CardDescription>
          )}
          <div className="mt-2 text-sm text-gray-500">
            Created by: {form.creator.first_name} {form.creator.last_name} (
            <a
              href={`mailto:${form.creator.email}`}
              className="text-blue-600 underline"
            >
              {form.creator.email}
            </a>
            )
          </div>
        </CardHeader>
        <CardContent>
          {form.fields.map((field, index) => renderField(field, index))}
        </CardContent>
      </Card>
    </div>
  );
}
