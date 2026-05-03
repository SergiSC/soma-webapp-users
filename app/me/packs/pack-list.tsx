"use client";

import { useListUserPacks } from "@/hooks/api/packs";
import { Loader2, PackageIcon } from "lucide-react";
import { PackCard } from "@/components/cards/pack.card";
import { useUser } from "@/context/user-context";
import { EmptyState } from "@/components/empty-state";
import { useRouter } from "next/navigation";

export function PackList() {
  const { user } = useUser();
  const { data: packs, isLoading } = useListUserPacks(user?.id);
  const router = useRouter();
  return (
    <div className="flex flex-col gap-4">
      {isLoading ? (
        <div className="flex justify-center items-center h-full">
          <Loader2 className="w-4 h-4 animate-spin" />
        </div>
      ) : packs?.length === 0 ? (
        <EmptyState
          icon={<PackageIcon className="size-10 text-muted-foreground" />}
          message="No tens cap pack comprat"
          button={{
            text: "Comprar pack",
            onClick: () => {
              router.push("/products?type=pack");
            },
          }}
        />
      ) : (
        packs?.map((pack) => <PackCard key={pack.id} pack={pack} />)
      )}
    </div>
  );
}
