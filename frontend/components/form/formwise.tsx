"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form as FormType } from "@/types/form";
import {
  Field,
  SelectField,
  DropdownField,
  MultiSelectField,
} from "@/types/field";
import { generateFormwiseSchema } from "@/lib/schemas";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface FormWiseProps {
  form: FormType;
}

export default function FormWise({ form }: FormWiseProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const zodSchema = generateFormwiseSchema(form);
  const formHook = useForm<z.infer<typeof zodSchema>>({
    resolver: zodResolver(zodSchema),
  });

  const onSubmit = async (data: z.infer<typeof zodSchema>) => {
    setIsSubmitting(true);
    // Here you would typically send the data to your backend
    console.log(data);
    setIsSubmitting(false);
  };

  const renderField = (field: Field) => {
    switch (field.type) {
      case "text":
      case "email":
      case "url":
        return (
          <FormField
            control={formHook.control}
            name={field.tag}
            render={({ field: formField }) => (
              <FormItem>
                <FormLabel>{field.label}</FormLabel>
                <FormControl>
                  <Input
                    {...formField}
                    type={field.type}
                    placeholder={field.label}
                  />
                </FormControl>
                {field.help_text && (
                  <FormDescription>{field.help_text}</FormDescription>
                )}
                <FormMessage />
              </FormItem>
            )}
          />
        );
      case "paragraph":
        return (
          <FormField
            control={formHook.control}
            name={field.tag}
            render={({ field: formField }) => (
              <FormItem>
                <FormLabel>{field.label}</FormLabel>
                <FormControl>
                  <Textarea {...formField} placeholder={field.label} />
                </FormControl>
                {field.help_text && (
                  <FormDescription>{field.help_text}</FormDescription>
                )}
                <FormMessage />
              </FormItem>
            )}
          />
        );
      case "select":
      case "dropdown":
        return (
          <FormField
            control={formHook.control}
            name={field.tag}
            render={({ field: formField }) => (
              <FormItem>
                <FormLabel>{field.label}</FormLabel>
                <Select
                  onValueChange={formField.onChange}
                  defaultValue={formField.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={`Select ${field.label}`} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {(field as SelectField | DropdownField).options.map(
                      (option: string) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>
                {field.help_text && (
                  <FormDescription>{field.help_text}</FormDescription>
                )}
                <FormMessage />
              </FormItem>
            )}
          />
        );
      case "multi_select":
        return (
          <FormField
            control={formHook.control}
            name={field.tag}
            render={() => (
              <FormItem>
                <FormLabel>{field.label}</FormLabel>
                <div className="space-y-2">
                  {(field as MultiSelectField).options.map((option: string) => (
                    <FormField
                      key={option}
                      control={formHook.control}
                      name={field.tag}
                      render={({ field: formField }) => {
                        return (
                          <FormItem
                            key={option}
                            className="flex flex-row items-start space-x-3 space-y-0"
                          >
                            <FormControl>
                              <Checkbox
                                checked={formField.value?.includes(option)}
                                onCheckedChange={(checked) => {
                                  return checked
                                    ? formField.onChange([
                                        ...(formField.value || []),
                                        option,
                                      ])
                                    : formField.onChange(
                                        formField.value?.filter(
                                          (value: string) => value !== option
                                        )
                                      );
                                }}
                              />
                            </FormControl>
                            <FormLabel className="font-normal">
                              {option}
                            </FormLabel>
                          </FormItem>
                        );
                      }}
                    />
                  ))}
                </div>
                {field.help_text && (
                  <FormDescription>{field.help_text}</FormDescription>
                )}
                <FormMessage />
              </FormItem>
            )}
          />
        );
      case "date":
        return (
          <FormField
            control={formHook.control}
            name={field.tag}
            render={({ field: formField }) => (
              <FormItem className="flex flex-col">
                <FormLabel>{field.label}</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !formField.value && "text-muted-foreground"
                        )}
                      >
                        {formField.value ? (
                          format(formField.value, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={formField.value}
                      onSelect={formField.onChange}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                {field.help_text && (
                  <FormDescription>{field.help_text}</FormDescription>
                )}
                <FormMessage />
              </FormItem>
            )}
          />
        );
      case "number":
        return (
          <FormField
            control={formHook.control}
            name={field.tag}
            render={({ field: formField }) => (
              <FormItem>
                <FormLabel>{field.label}</FormLabel>
                <FormControl>
                  <Input
                    {...formField}
                    type="number"
                    min={field.min_value ?? undefined}
                    max={field.max_value ?? undefined}
                    placeholder={field.label}
                    onChange={(e) => {
                      const value =
                        e.target.value === ""
                          ? undefined
                          : Number(e.target.value);
                      formField.onChange(value);
                    }}
                  />
                </FormControl>
                {field.help_text && (
                  <FormDescription>{field.help_text}</FormDescription>
                )}
                <FormMessage />
              </FormItem>
            )}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-2xl mx-auto my-8 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{form.title}</CardTitle>
          {form.description && (
            <CardDescription>{form.description}</CardDescription>
          )}
        </CardHeader>
        <CardContent>
          <Form {...formHook}>
            <form
              onSubmit={formHook.handleSubmit(onSubmit)}
              className="space-y-8"
            >
              <div className="space-y-6">
                {form.fields.map((field: Field) => (
                  <div key={field.tag}>{renderField(field)}</div>
                ))}
              </div>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Submitting..." : "Submit"}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter>
          <div className="text-sm text-muted-foreground">
            By: {form.creator.first_name} {form.creator.last_name} · {""}
            <a
              href={`mailto:${form.creator.email}`}
              className="text-primary hover:underline"
            >
              {form.creator.email}
            </a>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}

function FormWiseSkeleton() {
  return (
    <div className="max-w-2xl mx-auto my-8 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>
            <Skeleton className="h-8 w-3/4" />
          </CardTitle>
          <CardDescription>
            <Skeleton className="h-4 w-1/2" />
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {[1, 2, 3].map((item) => (
              <div key={item} className="space-y-2">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
          </div>
          <div className="mt-8">
            <Skeleton className="h-10 w-full" />
          </div>
        </CardContent>
        <CardFooter>
          <div className="space-y-2 w-full">
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}

FormWise.Skeleton = FormWiseSkeleton;
