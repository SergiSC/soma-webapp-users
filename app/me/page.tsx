import { PageSkeleton } from "@/components/page-skeleton";
import { UserIcon } from "./user-icon";
import { UserInformation } from "./user-information";
import { LogoutButton } from "@/components/logout-button";

export default function MePage() {
  return (
    <PageSkeleton
      title="Perfil"
      actions={<LogoutButton collapsed={true} />}
      sections={[
        {
          content: <UserIcon />,
        },
        {
          content: <UserInformation />,
        },
      ]}
    />
  );
}
