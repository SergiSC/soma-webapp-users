import { PageSkeleton } from "@/components/page-skeleton";
import { UserIcon } from "./user-icon";
import { UserInformation } from "./user-information";

export default function MePage() {
  return (
    <PageSkeleton
      title="Perfil"
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
