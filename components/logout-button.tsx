"use client";

import { LogOutIcon } from "lucide-react";
import { Button } from "./ui/button";
import { useUser } from "@/context/user-context";

export function LogoutButton() {
  const { logout } = useUser();
  return (
    <Button
      variant="ghost"
      onClick={logout}
      className="w-full text-muted-foreground"
    >
      <LogOutIcon className="size-4" />
      Sortir
    </Button>
  );
}
