"use client";

import { useAuth0 } from "@auth0/auth0-react";
import { useEffect } from "react";
import { redirect, useSearchParams } from "next/navigation";
import { Spinner } from "@/components/ui/spinner";

export default function AuthenticatePage() {
  const { loginWithRedirect, getAccessTokenSilently } = useAuth0();
  const searchParams = useSearchParams();

  useEffect(() => {
    const checkToken = async () => {
      const accessToken = await getAccessTokenSilently();
      if (accessToken) {
        redirect(`/`);
      }
    };
    // Check if this is an organization invitation
    const invitation = searchParams.get("invitation");
    const organization = searchParams.get("organization");
    const organization_name = searchParams.get("organization_name");

    if (invitation && organization) {
      // This is an organization invitation - redirect to Auth0 with invitation parameters
      loginWithRedirect({
        authorizationParams: {
          invitation,
          organization,
          organization_name: organization_name || undefined,
          redirect_uri: `${window.location.origin}`,
        },
      });
    } else {
      checkToken();
    }
  }, [searchParams, loginWithRedirect, getAccessTokenSilently]);

  return (
    <div className="flex flex-col items-center justify-center h-screen gap-4">
      <Spinner />
      <p>Carregant...</p>
    </div>
  );
}
