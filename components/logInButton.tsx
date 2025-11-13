"use client";

import { Button } from "@/components/ui/button";
import { useAuth0 } from "@auth0/auth0-react";
import { LogInIcon } from "lucide-react";

interface LogInButtonProps {
  label?: string;
}

export function LogInButton({ label = "Entrar" }: LogInButtonProps) {
  const { loginWithRedirect } = useAuth0();
  return (
    <Button
      onClick={() =>
        loginWithRedirect({
          authorizationParams: {
            redirect_uri: `${window.location.origin}/login`,
          },
        })
      }
    >
      <LogInIcon className="size-4" />
      {label}
    </Button>
  );
}
