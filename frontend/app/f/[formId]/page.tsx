"use client";

import { useForm } from "@/hooks/use-forms";
import { useRouter } from "next/navigation";

import FormWise from "@/components/form/formwise";
import Logo from "@/components/logo";
import Loader from "@/components/layout/loader";

interface FormSubmissionPageProps {
  params: {
    formId: string;
  };
}

export default function FormSubmissionPage({
  params,
}: FormSubmissionPageProps) {
  const { data: form, isLoading, error } = useForm(params.formId);
  const router = useRouter();

  if (isLoading) {
    return <Loader />;
  } else if (error) {
    router.push("/404");
    return null;
  }

  return (
    <div className="container mx-auto px-4">
      <FormWise form={form!} />
      <div className="flex justify-center mt-8 mb-4">
        <Logo target_blank />
      </div>
    </div>
  );
}
