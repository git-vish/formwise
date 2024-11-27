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
        <TabsList>
          <TabsTrigger value="questions">Questions</TabsTrigger>
          <TabsTrigger value="responses" disabled={params.formId === "new"}>
            Responses
          </TabsTrigger>
        </TabsList>
        <TabsContent value="questions">
          <p className="text-lg">Questions: {params.formId}</p>
        </TabsContent>
        <TabsContent value="responses">
          <p className="text-lg">Responses: {params.formId}</p>
        </TabsContent>
      </Tabs>
    </div>
  );
}
