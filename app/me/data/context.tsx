import { PageSkeleton } from "@/components/page-skeleton";
import { useUser } from "@/context/user-context";
import { useGetUser, UserObject } from "@/hooks/api/users";
import { Loader2Icon } from "lucide-react";
import { createContext } from "react";

interface UserInformationContextType {
  user: UserObject | null;
  subscriptionId: string | null;
  packIds: string[] | null;
}

export const UserInformationContext =
  createContext<UserInformationContextType | null>(null);

export function UserInformationContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useUser();
  const { data: userInformation } = useGetUser({ userId: user?.id });
  if (!userInformation) {
    return (
      <PageSkeleton
        title="Carregant..."
        sections={[
          {
            content: <Loader2Icon className="animate-spin" size={30} />,
          },
        ]}
      />
    );
  }
  return (
    <UserInformationContext.Provider
      value={{
        user: userInformation,
        subscriptionId: userInformation?.subscriptionId,
        packIds: userInformation?.packIds
      }}
    >
      {children}
    </UserInformationContext.Provider>
  );
}
