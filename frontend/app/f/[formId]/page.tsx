"use client";

interface FormSubmissionPageProps {
  params: {
    formId: string;
  };
}

export default function FormSubmissionPage({
  params,
}: FormSubmissionPageProps) {
  return <div>Form Submission Page: {params.formId}</div>;
}
