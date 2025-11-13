"use client";

import { LogInButton } from "@/components/logInButton";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";
import { useLoggedUser } from "@/hooks/api/users";
import { User } from "@/lib/api";
import { useAuth0 } from "@auth0/auth0-react";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { bebas } from "@/app/fonts";
import { OnboardingProcess } from "@/components/onboarding-process/component";
import { OnboardingProcessProvider } from "@/components/onboarding-process/context";

// Define the context type that includes the user data and token
export interface UserContextType {
  user: User | null;
  logout: () => void;
}

export const UserContext = createContext<UserContextType | null>(null);

export const UserContextProvider = UserContext.Provider;

interface UserProviderProps {
  children: React.ReactNode;
}

export function UserProvider({ children }: UserProviderProps) {
  const { user: auth0User, isLoading, logout, isAuthenticated } = useAuth0();
  const [userData, setUserData] = useState<User | null>(null);
  const {
    mutate: loginUser,
    isError,
    isPending,
    isSuccess,
  } = useLoggedUser({
    onSuccess: (data) => {
      setUserData(data);
    },
    onError: () => {
      toast.error("No s'ha pogut iniciar la sessió");
    },
  });

  useEffect(() => {
    const getToken = async () => {
      try {
        loginUser({
          email: auth0User?.email || "",
          externalId: auth0User?.sub || "",
          emailVerified: auth0User?.emailVerified || false,
        });
      } catch {
        toast.error("No s'ha pogut iniciar la sessió");
      }
    };

    if (auth0User) {
      getToken();
    }
  }, [auth0User, loginUser]);

  const useMemoProjectSomaLogo = useMemo(() => {
    return (
      <div className="flex items-center justify-center">
        <h1
          className={cn(
            bebas.className,
            "md:text-8xl text-6xl font-bold text-primary"
          )}
        >
          PROJECT SOMA
        </h1>
      </div>
    );
  }, []);

  if (isLoading || isPending) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4">
        {useMemoProjectSomaLogo}
        <Spinner />
        <p>Carregant...</p>
      </div>
    );
  }

  if (isError && !userData) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4">
        {useMemoProjectSomaLogo}
        <h1 className="text-2xl font-bold">Error</h1>
        <p className="text-gray-600">No s&apos;ha pogut iniciar la sessió</p>
        <LogInButton label="Reintentar" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4">
        {useMemoProjectSomaLogo}
        <LogInButton label="Iniciar sessió" />
      </div>
    );
  }

  return (
    <UserContext.Provider
      value={{
        user: userData || null,
        logout: () =>
          logout({
            logoutParams: {
              returnTo: window.location.origin,
            },
          }),
      }}
    >
      {isSuccess && userData?.onboardingCompletedAt == null ? (
        <OnboardingProcessProvider>
          <OnboardingProcess />
        </OnboardingProcessProvider>
      ) : (
        children
      )}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}
