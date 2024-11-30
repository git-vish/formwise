"use client";

import {
  ResponsiveModal,
  ResponsiveModalClose,
  ResponsiveModalContent,
  ResponsiveModalDescription,
  ResponsiveModalFooter,
  ResponsiveModalHeader,
  ResponsiveModalTitle,
} from "@/components/ui/responsive-modal";
import { Button } from "@/components/ui/button";
import { useForms } from "@/hooks/use-forms";

interface FormDeleteProps {
  formId: string;
  formTitle: string;
  open: boolean;
  setIsOpen: (open: boolean) => void;
}

export default function FormDelete({
  formId,
  formTitle,
  open,
  setIsOpen,
}: FormDeleteProps) {
  const { deleteForm } = useForms();
  return (
    <ResponsiveModal open={open} onOpenChange={setIsOpen}>
      <ResponsiveModalContent>
        <ResponsiveModalHeader>
          <ResponsiveModalTitle>Delete Form</ResponsiveModalTitle>
          <ResponsiveModalDescription>
            This action is permanent and will remove all responses.
          </ResponsiveModalDescription>
        </ResponsiveModalHeader>
        <div className="my-2 md:my-0 text-center">
          <p>
            Confirm deletion of <b>{formTitle}</b>?
          </p>
        </div>
        <ResponsiveModalFooter>
          <ResponsiveModalClose asChild>
            <Button
              variant="destructive"
              className="w-full"
              onClick={() => deleteForm(formId)}
            >
              Delete
            </Button>
          </ResponsiveModalClose>
        </ResponsiveModalFooter>
      </ResponsiveModalContent>
    </ResponsiveModal>
  );
}
