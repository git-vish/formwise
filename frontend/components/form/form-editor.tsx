interface FormEditorProps {
  formId: string;
}

export default function FormEditor({ formId }: FormEditorProps) {
  return (
    <div>
      <h1>Form Editor: {formId}</h1>
    </div>
  );
}
