import { AggregatedReservationJsonObject } from "@/hooks/api/reservations";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { sessionTypeToLabel } from "@/lib/constants";
import { Button } from "../ui/button";

interface CancelReservationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCancel: (id: string) => void;
  reservation?: AggregatedReservationJsonObject;
}

export function CancelReservationDialog({
  open,
  onOpenChange,
  reservation,
  onCancel,
}: CancelReservationDialogProps) {
  if (reservation === undefined) {
    return null;
  }
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader className="text-start">
          <DialogTitle>Cancel·lar reserva</DialogTitle>
          <DialogDescription>
            Estàs segur/a que vols cancel·lar la reserva per la classe de{" "}
            {sessionTypeToLabel[reservation.session.type]}?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="destructive"
            onClick={() => onCancel(reservation.id)}
          >
            Confirmar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
