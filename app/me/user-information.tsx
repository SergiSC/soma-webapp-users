"use client";

import { Label } from "@/components/ui/label";
import { useUser } from "@/context/user-context";

export function UserInformation() {
  const { user } = useUser();
  return (
    <ul className="flex flex-col gap-4 md:grid md:grid-cols-1 lg:grid-cols-2">
      <li>
        <Label className="text-lg font-bold">Nom complet</Label>
        <p className="text-sm ">
          {user?.name} {user?.surname}
        </p>
      </li>
      <li>
        <Label className="text-lg font-bold">Correu electrònic</Label>
        <p className="text-sm ">{user?.email}</p>
      </li>
      <li>
        <Label className="text-lg font-bold">Data de naixement</Label>
        <p className="text-sm ">{user?.birthDate}</p>
      </li>
      <li>
        <Label className="text-lg font-bold">Codi postal</Label>
        <p className="text-sm ">{user?.postalCode}</p>
      </li>
      <li>
        <Label className="text-lg font-bold">Com ens has trobat</Label>
        <p className="text-sm ">{user?.howDidYouFindUs}</p>
      </li>
    </ul>
  );
}
