"use client";

import { User } from "@/types/auth";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Profile Details</DialogTitle>
          <DialogDescription>
            View and edit your profile details.
          </DialogDescription>
        </DialogHeader>
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
      </DialogContent>
    </Dialog>
  );
}
