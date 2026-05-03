"use client";

import { Label } from "@/components/ui/label";
import { useUser } from "@/context/user-context";

export function UserInformation() {
  const { user } = useUser();
  return (
    <div className="flex flex-col gap-4">
      <ul className="flex flex-col gap-4 md:grid md:grid-cols-1 lg:grid-cols-2">
        <li>
          <Label className="text-lg font-bold text-primary">Nom complet</Label>
          <p className="text-sm ">
            {user?.name} {user?.surname}
          </p>
        </li>
        <li>
          <Label className="text-lg font-bold text-primary">
            Correu electrònic
          </Label>
          <p className="text-sm ">{user?.email}</p>
        </li>
        <li>
          <Label className="text-lg font-bold text-primary">
            Data de naixement
          </Label>
          <p className="text-sm ">{user?.birthDate}</p>
        </li>
        <li>
          <Label className="text-lg font-bold text-primary">Codi postal</Label>
          <p className="text-sm ">{user?.postalCode}</p>
        </li>
      </ul>
    </div>
  );
}
