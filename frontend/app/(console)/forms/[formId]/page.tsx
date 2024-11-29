"use client";

import FormResponses from "@/components/form/form-responses";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import FormWise from "@/components/form/formwise";
import { useForm } from "@/hooks/use-forms";
import { useRouter } from "next/navigation";

interface FormPageProps {
  params: {
    formId: string;
  };
}

export default function FormPage({ params }: FormPageProps) {
  const { data: form, isLoading, error } = useForm(params.formId);
  const router = useRouter();

  if (isLoading) {
    return <FormPageSkeleton />;
  } else if (error) {
    router.push("/404");
    return null;
  }

  return (
    <div className="container mx-auto p-4">
      <Tabs defaultValue="questions">
        <div className="flex justify-start md:justify-center">
          <TabsList>
            <TabsTrigger value="questions">Questions</TabsTrigger>
            <TabsTrigger value="responses">Responses</TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="questions">
          <FormWise form={form!} />
        </TabsContent>
        <TabsContent value="responses">
          <FormResponses formId={params.formId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function FormPageSkeleton() {
  return (
    <div className="container mx-auto p-4">
      <Tabs defaultValue="questions">
        <div className="flex justify-start md:justify-center animate-pulse-bounce">
          <TabsList>
            <TabsTrigger value="questions" disabled>
              Questions
            </TabsTrigger>
            <TabsTrigger value="responses" disabled>
              Responses
            </TabsTrigger>
          </TabsList>
        </div>
      </Tabs>
    </div>
  );
}
