import { PageSkeleton } from "@/components/page-skeleton";
import { LogoutButton } from "@/components/logout-button";
import { PageNavigation } from "@/components/page-navigation";
import { CalendarSyncIcon, PackageIcon } from "lucide-react";
import { UserInformation } from "./user-information";

export default function MePage() {
  const items = [
    {
      to: "/me/subscription",
      children: "La meva subscripció",
      icon: <CalendarSyncIcon />,
    },
    {
      to: "/me/packs",
      children: "Els meus packs",
      icon: <PackageIcon />,
    },
  ];
  return (
    <PageSkeleton
      title="Perfil"
      sections={[
        {
          content: <PageNavigation items={items} />,
        },
        {
          content: <UserInformation />,
        },
        {
          content: <LogoutButton />,
          className: "fixed bottom-20 left-0 right-0",
        },
      ]}
    />
  );
}
