"use client";

import { User } from "@/types/auth";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "../ui/button";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { EditProfileFormValues, editProfileSchema } from "@/lib/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { Label } from "../ui/label";
import { Input } from "../ui/input";

interface UserProfileProps {
  user: User;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function UserProfile({
  user,
  open,
  onOpenChange,
}: UserProfileProps) {
  const [isEditing, setIsEditing] = useState(false);

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setIsEditing(false);
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Profile Details</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Edit your profile details."
              : "View your profile details."}
          </DialogDescription>
        </DialogHeader>
        {isEditing ? (
          <EditProfile user={user} />
        ) : (
          <ViewProfile user={user} onEdit={() => setIsEditing(true)} />
        )}
      </DialogContent>
    </Dialog>
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
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">
            Auth Provider
          </p>
          <p className="text-sm">{user.auth_provider}</p>
        </div>
      </div>
      {user.auth_provider === "email" && (
        <DialogFooter>
          <Button variant="outline" onClick={onEdit}>
            <span>Edit</span>
          </Button>
        </DialogFooter>
      )}
    </>
  );
}

interface EditProfileProps {
  user: User;
}

function EditProfile({ user }: EditProfileProps) {
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
    const filteredData = Object.fromEntries(
      Object.entries(formData).filter(
        ([key, value]) => value && value !== user[key as keyof User]
      )
    );
    console.log(filteredData);
  };

  return (
    <>
      <form
        className="space-y-4 py-4"
        onSubmit={form.handleSubmit(handleEditProfile)}
      >
        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="firstName">First name</Label>
            <Input
              id="firstName"
              placeholder="First name"
              {...form.register("first_name")}
            />
            {form.formState.errors.first_name && (
              <p className="text-sm text-destructive">
                {form.formState.errors.first_name.message}
              </p>
            )}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="lastName">Last name</Label>
            <Input
              id="lastName"
              placeholder="Last name"
              {...form.register("last_name")}
            />
            {form.formState.errors.last_name && (
              <p className="text-sm text-destructive">
                {form.formState.errors.last_name.message}
              </p>
            )}
          </div>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="password">New Password</Label>
          <Input
            id="password"
            type="password"
            placeholder="Leave blank to keep current password"
            {...form.register("password")}
          />
          {form.formState.errors.password && (
            <p className="text-sm text-destructive">
              {form.formState.errors.password.message}
            </p>
          )}
        </div>

        {password && (
          <div className="grid gap-2">
            <Label htmlFor="confirmPassword">Confirm New Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="Confirm your new password"
              {...form.register("confirmPassword")}
            />
            {form.formState.errors.confirmPassword && (
              <p className="text-sm text-destructive">
                {form.formState.errors.confirmPassword.message}
              </p>
            )}
          </div>
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
    </>
  );
}
