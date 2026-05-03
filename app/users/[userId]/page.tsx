"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { PageSkeleton } from "@/components/page-skeleton";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { useUser } from "@/context/user-context";
import { useGetUser } from "@/hooks/api/users";
import { UserType } from "@/hooks/api/users";

export default function StaffUserProfilePage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.userId as string;
  const { user: currentUser } = useUser();

  const { data: profile, isLoading, error } = useGetUser({ userId });

  useEffect(() => {
    if (
      currentUser?.type === undefined ||
      currentUser.type === UserType.CLIENT
    ) {
      router.replace("/reservations");
    }
  }, [currentUser?.type, router]);

  if (isLoading) {
    return (
      <PageSkeleton
        title="Usuari"
        sections={[
          {
            content: (
              <div className="flex items-center justify-center py-12">
                <Spinner className="size-8" />
              </div>
            ),
          },
        ]}
      />
    );
  }

  if (error || !profile) {
    return (
      <PageSkeleton
        title="Usuari"
        sections={[
          {
            content: (
              <div className="flex flex-col gap-4 items-center py-12">
                <p className="text-muted-foreground text-center">
                  No s&apos;ha pogut carregar l&apos;usuari.
                </p>
                <Button variant="outline" onClick={() => router.back()}>
                  Tornar
                </Button>
              </div>
            ),
          },
        ]}
      />
    );
  }

  return (
    <PageSkeleton
      title={`${profile.name ?? ""} ${profile.surname ?? ""}`.trim() || "Usuari"}
      actions={
        <Button variant="outline" size="sm" onClick={() => router.back()}>
          Tornar
        </Button>
      }
      sections={[
        {
          content: (
            <div className="flex flex-col gap-4">
              <ul className="flex flex-col gap-4 md:grid md:grid-cols-1 lg:grid-cols-2">
                <li>
                  <Label className="text-lg font-bold text-primary">
                    Correu electrònic
                  </Label>
                  <p className="text-sm">{profile.email}</p>
                </li>
                <li>
                  <Label className="text-lg font-bold text-primary">
                    Data de naixement
                  </Label>
                  <p className="text-sm">{profile.birthDate ?? "—"}</p>
                </li>
                <li>
                  <Label className="text-lg font-bold text-primary">
                    Codi postal
                  </Label>
                  <p className="text-sm">{profile.postalCode ?? "—"}</p>
                </li>
                <li>
                  <Label className="text-lg font-bold text-primary">Tipus</Label>
                  <p className="text-sm capitalize">{profile.type}</p>
                </li>
              </ul>
            </div>
          ),
        },
      ]}
    />
  );
}
