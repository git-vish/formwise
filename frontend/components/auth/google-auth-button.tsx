import { Button } from "@/components/ui/button";
import { Icons } from "@/components/icons";

interface GoogleAuthButtonProps {
  isLoading: boolean;
  onClick: () => void;
  disabled: boolean;
  variant: "login" | "register";
}

export function GoogleAuthButton({
  isLoading,
  onClick,
  disabled,
  variant,
}: GoogleAuthButtonProps) {
  const text = variant === "login" ? "Sign in" : "Sign up";
  const loadingText = variant === "login" ? "Signing in..." : "Signing up...";

  return (
    <Button
      variant="outline"
      className="w-full"
      onClick={onClick}
      disabled={disabled}
    >
      <Icons.google className="h-5 w-5" />
      <span>{isLoading ? loadingText : `${text} with Google`}</span>
    </Button>
  );
}
