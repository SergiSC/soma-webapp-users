import { Button } from "@/components/ui/button";
import { useCreateFakeReservation } from "@/hooks/api/reservations";
import { Loader2, PlusIcon } from "lucide-react";

export function CreateFakeReservationButton({
  sessionId,
}: {
  sessionId: string;
}) {
  const { mutate: createFakeReservation, isPending } =
    useCreateFakeReservation(sessionId);

  return (
    <Button onClick={() => createFakeReservation()} disabled={isPending}>
      {isPending ? (
        <Loader2 className="size-4 animate-spin" />
      ) : (
        <PlusIcon className="size-4" />
      )}
      Crear reserva fake
    </Button>
  );
}
