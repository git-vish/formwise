"use client";

import {
  ResponsiveModal,
  ResponsiveModalContent,
  ResponsiveModalDescription,
  ResponsiveModalHeader,
  ResponsiveModalTitle,
} from "@/components/ui/responsive-modal";
import { CreateFormFormValues, createFormSchema } from "@/lib/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

interface FormCreateProps {
  open: boolean;
  setIsOpen: (open: boolean) => void;
}

export default function FormCreate({ open, setIsOpen }: FormCreateProps) {
  const form = useForm<CreateFormFormValues>({
    resolver: zodResolver(createFormSchema),
  });

  const handleCreateForm = async (formData: CreateFormFormValues) => {
    setIsOpen(false);
    console.log(formData);
    form.reset();
  };

  return (
    <ResponsiveModal open={open} onOpenChange={setIsOpen}>
      <ResponsiveModalContent>
        <ResponsiveModalHeader>
          <ResponsiveModalTitle>Create New Form</ResponsiveModalTitle>
          <ResponsiveModalDescription>
            Generate a form using AI. ✨
          </ResponsiveModalDescription>
        </ResponsiveModalHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleCreateForm)}
            className="grid gap-4"
          >
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem className="grid gap-2">
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input
                      id="title"
                      placeholder="Form Title"
                      autoComplete="title"
                      disabled={form.formState.isSubmitting}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Leave blank for an auto-generated title.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="prompt"
              render={({ field }) => (
                <FormItem className="grid gap-2">
                  <FormLabel>Prompt</FormLabel>
                  <FormControl>
                    <Textarea
                      id="prompt"
                      placeholder="I need a form for registering participants in a Python workshop. It should collect essential details for managing registrations and understanding participants' experience levels."
                      className="min-h-24"
                      autoComplete="prompt"
                      disabled={form.formState.isSubmitting}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              className="w-full"
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting ? "Creating..." : "Create"}
            </Button>
          </form>
        </Form>
      </ResponsiveModalContent>
    </ResponsiveModal>
  );
}
