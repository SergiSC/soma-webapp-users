"use client";

import { UserCircleIcon } from "lucide-react";
import { useIsMobile } from "@/hooks/use-is-mobile";
import { useUser } from "@/context/user-context";

export function UserIcon() {
  const isMobile = useIsMobile();
  const { user } = useUser();
  const profileImageUrl = user?.profileImageUrl;
  return profileImageUrl ? (
    <div
      style={{
        backgroundImage: `url(${profileImageUrl})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
      className="rounded-full bg-cover bg-center justify-self-center md:justify-self-start w-[160px] h-[160px] md:w-[200px] md:h-[200px]"
    />
  ) : (
    <UserCircleIcon
      size={isMobile ? 120 : 200}
      className="text-primary fill-secondary justify-self-center md:justify-self-start"
    />
  );
}
