import { LogOutIcon } from "lucide-react";
import { Button } from "./ui/button";
import { useUser } from "@/context/user-context";

export function LogoutButton() {
  const { logout } = useUser();
  return (
    <Button variant="ghost" size="icon" onClick={logout}>
      <LogOutIcon className="size-4" />
      Sortir
    </Button>
  );
}
