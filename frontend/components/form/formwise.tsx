"use client";

import { useForm } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { FORM_URLS } from "@/config/api-urls";
import { useRouter } from "next/navigation";

interface FormWiseProps {
  form: FormType;
  preview?: boolean;
}

export default function FormWise({ form, preview = false }: FormWiseProps) {
  const { toast } = useToast();
  const router = useRouter();
  const zodSchema = generateFormwiseSchema(form);
  const formHook = useForm<z.infer<typeof zodSchema>>({
    resolver: zodResolver(zodSchema),
  });

  const handleSubmit = async (data: z.infer<typeof zodSchema>) => {
    const filteredData = Object.fromEntries(
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      Object.entries(data).filter(([_, value]) => value != null && value !== "")
    );

    Object.keys(filteredData).forEach((key) => {
      if (key.startsWith("date-")) {
        filteredData[key] = new Date(filteredData[key] as string)
          .toISOString()
          .split("T")[0];
      }
    });

    try {
      const response = await fetch(FORM_URLS.SUBMIT(form.id), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ answers: filteredData }),
      });

      if (response.ok) {
        router.push("/success");
        return;
      }

      const errorData = await response.json();
      if (response.status === 400 && errorData.detail) {
        Object.entries(errorData.detail).forEach(([fieldTag, errorMessage]) => {
          formHook.setError(fieldTag, {
            type: "manual",
            message: errorMessage as string,
          });
        });
        return;
      }

      throw new Error(await response.text());
    } catch (error) {
      console.error("Error submitting form:", error);
      toast({
        variant: "destructive",
        title: "Something went wrong. Please try again.",
      });
    }
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
                <FormLabel>
                  {field.label}
                  {field.required && (
                    <span className="text-red-600 text-md"> *</span>
                  )}
                </FormLabel>
                <FormControl>
                  <Input
                    {...formField}
                    type={field.type}
                    placeholder="Your answer"
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
                <FormLabel>
                  {field.label}
                  {field.required && (
                    <span className="text-red-600 text-md"> *</span>
                  )}
                </FormLabel>
                <FormControl>
                  <Textarea {...formField} placeholder="Your Answer" />
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
        return (
          <FormField
            control={formHook.control}
            name={field.tag}
            render={({ field: formField }) => (
              <FormItem>
                <FormLabel>
                  {field.label}
                  {field.required && (
                    <span className="text-red-600 text-md"> *</span>
                  )}
                </FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={formField.onChange}
                    defaultValue={formField.value}
                  >
                    {(field as SelectField).options.map((option: string) => (
                      <FormItem
                        key={option}
                        className="flex items-center space-x-2 space-y-0"
                      >
                        <FormControl>
                          <RadioGroupItem value={option} />
                        </FormControl>
                        <FormLabel className="font-normal">{option}</FormLabel>
                      </FormItem>
                    ))}
                  </RadioGroup>
                </FormControl>
                {field.help_text && (
                  <FormDescription>{field.help_text}</FormDescription>
                )}
                <FormMessage />
              </FormItem>
            )}
          />
        );
      case "dropdown":
        return (
          <FormField
            control={formHook.control}
            name={field.tag}
            render={({ field: formField }) => (
              <FormItem>
                <FormLabel>
                  {field.label}
                  {field.required && (
                    <span className="text-red-600 text-md"> *</span>
                  )}
                </FormLabel>
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
              <FormItem className="mb-8">
                <FormLabel>
                  {field.label}
                  {field.required && (
                    <span className="text-red-600 text-md"> *</span>
                  )}
                </FormLabel>
                <div className="flex flex-wrap gap-3 items-center">
                  {(field as MultiSelectField).options.map((option: string) => (
                    <FormField
                      key={option}
                      control={formHook.control}
                      name={field.tag}
                      render={({ field: formField }) => (
                        <FormItem
                          key={option}
                          className="flex items-center space-x-2 space-y-0"
                        >
                          <FormControl>
                            <Checkbox
                              id={`${field.tag}-${option}`}
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
                          <FormLabel
                            htmlFor={`${field.tag}-${option}`}
                            className="font-normal cursor-pointer"
                          >
                            {option}
                          </FormLabel>
                        </FormItem>
                      )}
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
                <FormLabel>
                  {field.label}
                  {field.required && (
                    <span className="text-red-600 text-md"> *</span>
                  )}
                </FormLabel>
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
                <FormLabel>
                  {field.label}
                  {field.required && (
                    <span className="text-red-600 text-md"> *</span>
                  )}
                </FormLabel>
                <FormControl>
                  <Input
                    {...formField}
                    type="number"
                    min={field.min_value ?? undefined}
                    max={field.max_value ?? undefined}
                    placeholder="Your Answer"
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
          {form.is_active || preview ? (
            <Form {...formHook}>
              <form
                onSubmit={formHook.handleSubmit(handleSubmit)}
                className="space-y-8"
              >
                <div className="space-y-6">
                  {form.fields.map((field: Field) => (
                    <div key={field.tag}>{renderField(field)}</div>
                  ))}
                </div>
                <Button
                  type="submit"
                  disabled={formHook.formState.isSubmitting || preview}
                >
                  {formHook.formState.isSubmitting ? "Submitting..." : "Submit"}
                </Button>
              </form>
            </Form>
          ) : (
            <p className="italic">
              This form is no longer accepting responses.
            </p>
          )}
        </CardContent>
        <CardFooter>
          <div className="text-sm text-muted-foreground">
            {form.creator.first_name} {form.creator.last_name} · {""}
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
