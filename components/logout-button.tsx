import { LogOutIcon } from "lucide-react";
import { Button } from "./ui/button";
import { useUser } from "@/context/user-context";
import { cn } from "@/lib/utils";

interface LogoutButtonProps {
  collapsed: boolean;
}

export function LogoutButton({ collapsed }: LogoutButtonProps) {
  const { logout } = useUser();
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={logout}
      className={cn(collapsed && "justify-center")}
    >
      <LogOutIcon className="size-4" />
      {collapsed ? null : "Sortir"}
    </Button>
  );
}
