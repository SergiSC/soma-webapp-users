import { ShieldCheckIcon } from "lucide-react";
import { Button } from "./ui/button";
import { useUser } from "@/context/user-context";
import { UserType } from "@/lib/api";

interface SuperAdminButtonProps {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  className?: string;
}

export function SuperAdminButton({
  label,
  onClick,
  disabled,
  className,
}: SuperAdminButtonProps) {
  const user = useUser();
  if (user.user?.type === UserType.CLIENT) {
    return null;
  }
  return (
    <Button
      variant="superAdmin"
      onClick={onClick}
      disabled={disabled}
      className={className}
    >
      <ShieldCheckIcon className="size-4" /> {label}
    </Button>
  );
}
