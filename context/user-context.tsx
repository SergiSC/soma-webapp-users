"use client";

import { LogInButton } from "@/components/logInButton";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";
import {
  LoginResponse,
  useGetUser,
  useLogin,
  UserObject,
  useUpdateUser,
} from "@/hooks/api/users";
import { apiClient } from "@/lib/api";
import { useAuth0 } from "@auth0/auth0-react";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { bebas } from "@/app/fonts";
import { OnboardingProcess } from "@/components/onboarding-process/component";
import { OnboardingProcessProvider } from "@/components/onboarding-process/context";

// Define the context type that includes the user data and token
export interface UserContextType {
  user: UserObject | null;
  logout: () => void;
  updateUser: (user: Partial<UserObject>) => void;
}

export const UserContext = createContext<UserContextType | null>(null);

export const UserContextProvider = UserContext.Provider;

interface UserProviderProps {
  children: React.ReactNode;
}

export function UserProvider({ children }: UserProviderProps) {
  const {
    user: auth0User,
    isLoading,
    logout,
    isAuthenticated,
    getAccessTokenSilently,
  } = useAuth0();
  const [loggedUser, setLoggedUser] = useState<LoginResponse | null>(null);
  const { data: userData } = useGetUser({ userId: loggedUser?.id });
  const { mutate: updateUser } = useUpdateUser({ userId: loggedUser?.id });
  const {
    mutate: loginUser,
    isError,
    isPending,
    isSuccess,
  } = useLogin({
    onSuccess: (data) => setLoggedUser(data),
  });

  useEffect(() => {
    const getTokenAndLogin = async () => {
      try {
        const accessToken = await getAccessTokenSilently();
        apiClient.setAuthToken(accessToken);
        loginUser({
          email: auth0User?.email || "",
          externalId: auth0User?.sub || "",
          emailVerified: auth0User?.email_verified ?? false,
        });
      } catch {
        toast.error("No s'ha pogut iniciar la sessió");
      }
    };

    if (auth0User) {
      getTokenAndLogin();
    }
  }, [auth0User, loginUser, getAccessTokenSilently]);

  const FinalComponent = useMemo(() => {
    return isSuccess && userData?.onboardingCompletedAt == null ? (
      <OnboardingProcessProvider>
        <OnboardingProcess />
      </OnboardingProcessProvider>
    ) : (
      children
    );
  }, [isSuccess, children, userData]);

  const useMemoProjectSomaLogo = useMemo(() => {
    return (
      <div className="flex items-center justify-center">
        <h1
          className={cn(
            bebas.className,
            "md:text-8xl text-6xl font-bold text-primary",
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
        updateUser: updateUser,
      }}
    >
      {FinalComponent}
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
