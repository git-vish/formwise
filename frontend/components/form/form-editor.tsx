"use client";

import { useForm } from "@/hooks/use-forms";

interface FormEditorProps {
  formId: string;
}

export default function FormEditor({ formId }: FormEditorProps) {
  const { data: form, isLoading, error } = useForm(formId, true);

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  if (!form) {
    return <p>Form not found</p>;
  }

  return (
    <div>
      <h1>Title: {form.title}</h1>
      <p>Description: {form.description}</p>
      <br />
      <p>Fields:</p>
      <div>
        {form.fields.map((field) => (
          <div key={field.tag}>
            <p>
              {field.label} | {field.type} |{" "}
              {field.required ? "required" : "not required"}
            </p>
            <hr />
          </div>
        ))}
      </div>
    </div>
  );
}
