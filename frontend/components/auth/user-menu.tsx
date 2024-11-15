"use client";

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { User } from "@/types/auth";
import { UserIcon, LogOutIcon } from "lucide-react";
import UserProfile from "./user-profile";

interface UserMenuProps {
  user: User;
  onLogout: () => void;
  onUpdateUser: (update: Partial<User>) => Promise<void>;
}

export default function UserMenu({
  user,
  onLogout,
  onUpdateUser,
}: UserMenuProps) {
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const getInitials = (user: User) => {
    return `${user.first_name.charAt(0)}${user.last_name.charAt(
      0
    )}`.toUpperCase();
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger>
          <Avatar className="h-8 w-8">
            <AvatarImage
              src={user.picture}
              alt={`${user.first_name} ${user.last_name}`}
              referrerPolicy="no-referrer"
            />
            <AvatarFallback className="text-sm">
              {getInitials(user)}
            </AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>My Account</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setIsProfileOpen(true)}>
            <UserIcon className="mr-2 h-4 w-4" />
            <span>Profile</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onLogout}>
            <LogOutIcon className="mr-2 h-4 w-4" />
            <span>Log out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <UserProfile
        user={user}
        open={isProfileOpen}
        setIsOpen={setIsProfileOpen}
        onOpenChange={setIsProfileOpen}
        onUpdateUser={onUpdateUser}
      />
    </>
  );
}

function UserMenuSkeleton() {
  return (
    <div className="flex items-center gap-2">
      <Skeleton className="h-8 w-8 rounded-full" />
    </div>
  );
}

UserMenu.Skeleton = UserMenuSkeleton;
