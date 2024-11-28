import FormView from "@/components/form/form-view";
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
            <TabsTrigger value="responses">Responses</TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="questions">
          <FormView formId={params.formId} />
        </TabsContent>
        <TabsContent value="responses">
          <FormResponses formId={params.formId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
