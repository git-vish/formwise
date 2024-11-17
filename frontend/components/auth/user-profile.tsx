"use client";

import { User } from "@/types/auth";
import { Button } from "../ui/button";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { EditProfileFormValues, editProfileSchema } from "@/lib/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "../ui/input";
import {
  ResponsiveModal,
  ResponsiveModalContent,
  ResponsiveModalDescription,
  ResponsiveModalHeader,
  ResponsiveModalTitle,
  ResponsiveModalFooter,
} from "@/components/ui/responsive-modal";
import { PasswordInput } from "../ui/password-input";

interface UserProfileProps {
  user: User;
  open: boolean;
  setIsOpen: (open: boolean) => void;
  onOpenChange: (open: boolean) => void;
  onUpdateUser: (update: Partial<User>) => Promise<void>;
}

export default function UserProfile({
  user,
  open,
  setIsOpen,
  onOpenChange,
  onUpdateUser,
}: UserProfileProps) {
  const [isEditing, setIsEditing] = useState(false);

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setIsEditing(false);
    }
    onOpenChange(open);
  };

  const handleOnSave = async (update: Partial<User>) => {
    await onUpdateUser(update);
    setIsOpen(false);
  };

  return (
    <ResponsiveModal open={open} onOpenChange={handleOpenChange}>
      <ResponsiveModalContent>
        <ResponsiveModalHeader>
          <ResponsiveModalTitle>Profile Details</ResponsiveModalTitle>
          <ResponsiveModalDescription>
            {isEditing
              ? "Edit your profile details."
              : "View your profile details."}
          </ResponsiveModalDescription>
        </ResponsiveModalHeader>
        {isEditing ? (
          <EditProfile user={user} onSave={handleOnSave} />
        ) : (
          <ViewProfile user={user} onEdit={() => setIsEditing(true)} />
        )}
      </ResponsiveModalContent>
    </ResponsiveModal>
  );
}

interface ViewProfileProps {
  user: User;
  onEdit: () => void;
}

function ViewProfile({ user, onEdit }: ViewProfileProps) {
  return (
    <>
      <div className="space-y-4 py-4">
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">Name</p>
          <p className="text-sm">
            {user.first_name} {user.last_name}
          </p>
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">Email</p>
          <p className="text-sm">{user.email}</p>
        </div>
      </div>
      {user.auth_provider === "email" && (
        <ResponsiveModalFooter>
          <Button variant="outline" onClick={onEdit}>
            <span>Edit</span>
          </Button>
        </ResponsiveModalFooter>
      )}
    </>
  );
}

interface EditProfileProps {
  user: User;
  onSave: (update: Partial<User>) => Promise<void>;
}

function EditProfile({ user, onSave }: EditProfileProps) {
  const form = useForm<EditProfileFormValues>({
    resolver: zodResolver(editProfileSchema),
    defaultValues: {
      first_name: user.first_name,
      last_name: user.last_name,
    },
  });

  const { watch } = form;
  const first_name = watch("first_name");
  const last_name = watch("last_name");
  const password = watch("password");

  const isFormValid =
    first_name != user.first_name || last_name != user.last_name || password;

  const handleEditProfile = async (formData: EditProfileFormValues) => {
    // Filter out 'confirmPassword' and unchanged fields
    const filteredData = Object.fromEntries(
      Object.entries(formData).filter(
        ([key, value]) =>
          key !== "confirmPassword" &&
          value &&
          value !== user[key as keyof User]
      )
    );

    if (Object.keys(filteredData).length > 0) {
      await onSave(filteredData as Partial<User>);
      form.resetField("password");
      form.resetField("confirmPassword");
    }
  };

  return (
    <Form {...form}>
      <form
        className="space-y-4 py-4"
        onSubmit={form.handleSubmit(handleEditProfile)}
      >
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="first_name"
            render={({ field }) => (
              <FormItem className="grid gap-2">
                <FormLabel htmlFor="firstName">First name</FormLabel>
                <FormControl>
                  <Input
                    id="firstName"
                    placeholder="First name"
                    autoComplete="given-name"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="last_name"
            render={({ field }) => (
              <FormItem className="grid gap-2">
                <FormLabel htmlFor="lastName">Last name</FormLabel>
                <FormControl>
                  <Input
                    id="lastName"
                    placeholder="Last name"
                    autoComplete="family-name"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem className="grid gap-2">
              <FormLabel htmlFor="password">New Password</FormLabel>
              <FormControl>
                <PasswordInput
                  id="password"
                  placeholder="Leave blank to keep current password"
                  autoComplete="new-password"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {password && (
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem className="grid gap-2">
                <FormLabel htmlFor="confirmPassword">
                  Confirm New Password
                </FormLabel>
                <FormControl>
                  <PasswordInput
                    id="confirmPassword"
                    placeholder="Confirm your new password"
                    autoComplete="new-password"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <Button
          variant="outline"
          type="submit"
          className="w-full"
          disabled={!isFormValid || form.formState.isSubmitting}
        >
          {form.formState.isSubmitting ? "Saving..." : "Save"}
        </Button>
      </form>
    </Form>
  );
}
