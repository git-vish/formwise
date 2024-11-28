interface FormResponsesProps {
  formId: string;
}

export default function FormResponses({ formId }: FormResponsesProps) {
  return (
    <div>
      <h1>Form Responses: {formId}</h1>
    </div>
  );
}
