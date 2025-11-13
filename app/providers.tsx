"use client";

import { Auth0Provider } from "@auth0/auth0-react";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/query-client";
import { UserProvider } from "@/context/user-context";

interface ProvidersProps {
  children: React.ReactNode;
  auth0Config: {
    domain: string;
    clientId: string;
  };
}

export function Providers({ children, auth0Config }: ProvidersProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <Auth0Provider
        domain={auth0Config.domain}
        clientId={auth0Config.clientId}
        authorizationParams={{
          redirect_uri:
            typeof window !== "undefined"
              ? `${window.location.origin}/login`
              : undefined,
        }}
        useRefreshTokens={true}
        cacheLocation="localstorage"
      >
        <UserProvider>{children}</UserProvider>
      </Auth0Provider>
    </QueryClientProvider>
  );
}
