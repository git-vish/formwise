import { Button } from "@/components/ui/button";
import { Icons } from "@/components/icons";

interface GoogleAuthButtonProps {
  isLoading: boolean;
  onClick: () => void;
  disabled: boolean;
}

export function GoogleAuthButton({
  isLoading,
  onClick,
  disabled,
}: GoogleAuthButtonProps) {
  return (
    <Button
      variant="outline"
      className="w-full"
      onClick={onClick}
      disabled={disabled}
    >
      <Icons.google className="h-5 w-5" />
      <span>{isLoading ? "Signing in..." : "Sign in with Google"}</span>
    </Button>
  );
}
