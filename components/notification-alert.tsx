"use client";

import { useUser } from "@/context/user-context";
import { Badge } from "./ui/badge";

export function NotificationAlert() {
  const { user } = useUser();

  if (user?.onboardingCompletedAt === null) {
    const undefinedValues =
      (user.name === null ? 1 : 0) +
      (user.surname === null ? 1 : 0) +
      (user.birthDate === null ? 1 : 0) +
      (user.languageCode === null ? 1 : 0) +
      (user.postalCode === null ? 1 : 0);
    return <Badge variant="destructive">{undefinedValues}</Badge>;
  }
  return null;
}
