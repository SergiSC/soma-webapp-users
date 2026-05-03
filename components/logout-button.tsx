"use client";

import { LogOutIcon } from "lucide-react";
import { Button } from "./ui/button";
import { useUser } from "@/context/user-context";

export function LogoutButton() {
  const { logout } = useUser();

  return (
    <div className="flex justify-center w-full">
      <Button
        variant="outline"
        onClick={logout}
        className="text-muted-foreground w-fit self-center"
      >
        <LogOutIcon className="size-4" />
        Sortir
      </Button>
    </div>
  );
}
