import FormEditor from "@/components/form/form-editor";
import FormResponses from "@/components/form/form-responses";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface FormPageProps {
  params: {
    formId: string;
  };
}

export default function FormPage({ params }: FormPageProps) {
  return (
    <div className="container mx-auto p-4">
      <Tabs defaultValue="questions">
        <div className="flex justify-start md:justify-center">
          <TabsList>
            <TabsTrigger value="questions">Questions</TabsTrigger>
            <TabsTrigger value="responses" disabled={params.formId === "new"}>
              Responses
            </TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="questions">
          <FormEditor formId={params.formId} />
        </TabsContent>
        <TabsContent value="responses">
          <FormResponses formId={params.formId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
