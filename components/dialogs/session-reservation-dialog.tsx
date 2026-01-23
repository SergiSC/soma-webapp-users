import { DailySession } from "@/hooks/api/daily-sessions";
import {
  sessionTypeToLabel,
  sessionColorsRecord,
  SessionTypeEnum,
  sessionLevelToLabel,
  SessionLevelEnum,
} from "@/hooks/api/sessions";
import { cn } from "@/lib/utils";
import { ReservationStatus } from "@/hooks/api/user-information";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ReserveButton } from "@/app/timetable/reserve-button";
import { Badge } from "../ui/badge";

interface SessionReservationDialogProps {
  session: DailySession;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const sessionTypeLabels: Record<SessionTypeEnum, string> = {
  [SessionTypeEnum.PILATES_REFORMER]: "Pilates Reformer",
  [SessionTypeEnum.PILATES_MAT]: "Pilates Mat",
  [SessionTypeEnum.BARRE]: "Barre",
  [SessionTypeEnum.FIT_MIX]: "Fit Mix",
  [SessionTypeEnum.PILATES_MAT_PLUS_65]: "Pilates Mat + 65",
  [SessionTypeEnum.FIT_MIX_PLUS_65]: "Fit Mix + 65",
};

const sessionTypeDescriptions: Record<SessionTypeEnum, string> = {
  [SessionTypeEnum.PILATES_REFORMER]:
    "El Pilates Reformer és una modalitat de Pilates que utilitza una màquina especialitzada anomenada reformer. Aquesta classe combina exercicis de força, flexibilitat i control corporal per millorar la postura, la força del core i la coordinació. Ideal per a tots els nivells.",
  [SessionTypeEnum.PILATES_MAT]:
    "El Pilates Mat és una forma clàssica de Pilates que es practica sobre una estora. Aquesta classe se centra en la força del core, la flexibilitat i el control corporal utilitzant només el pes corporal. Perfecte per millorar la postura i la força funcional.",
  [SessionTypeEnum.BARRE]:
    "El Barre combina elements de ballet, Pilates i entrenament de força. Aquesta classe utilitza una barra i moviments de baix impacte per treballar la força, la flexibilitat i la resistència. Ideal per esculpir i tonificar el cos sencer.",
  [SessionTypeEnum.FIT_MIX]:
    "El Fit Mix és una classe d'entrenament funcional que combina diferents modalitats d'exercici per millorar la força, la resistència cardiovascular i la coordinació. Inclou exercicis amb pes corporal i equipament variat per mantenir-te actiu i en forma.",
  [SessionTypeEnum.PILATES_MAT_PLUS_65]:
    "Pilates Mat adaptat especialment per a persones majors de 65 anys. Aquesta classe se centra en la mobilitat, l'equilibri i la força funcional amb moviments suaus i adaptats. Perfecte per mantenir-se actiu i millorar la qualitat de vida.",
  [SessionTypeEnum.FIT_MIX_PLUS_65]:
    "Fit Mix adaptat per a persones majors de 65 anys. Aquesta classe combina exercicis funcionals suaus per millorar la força, l'equilibri i la mobilitat. Tots els exercicis estan adaptats per ser segurs i efectius per a aquest grup d'edat.",
};

export function SessionReservationDialog({
  session,
  open,
  onOpenChange,
}: SessionReservationDialogProps) {
  const formatTime = (time: string) => {
    return time.slice(0, 5);
  };

  const sessionColor = sessionColorsRecord[session.type];
  const confirmedReservations = session.reservations.filter(
    (reservation) => reservation.status === ReservationStatus.CONFIRMED,
  );
  const isFull = confirmedReservations.length === session.room?.capacity;
  const isAlmostFull = session.room?.capacity
    ? confirmedReservations.length >= Math.ceil(session.room.capacity * 0.8)
    : false;
  const waitingListReservations = session.reservations.filter(
    (reservation) => reservation.status === ReservationStatus.WAITING_LIST,
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div
              className="w-1 h-8 rounded"
              style={{ backgroundColor: sessionColor }}
            />
            <div>
              <h3 className="text-xl font-semibold">
                {sessionTypeToLabel[session.type]}
              </h3>
              <p className="text-sm text-muted-foreground font-normal mt-1">
                {formatTime(session.startHour)} - {formatTime(session.endHour)}
              </p>
            </div>
          </DialogTitle>
          <DialogDescription>
            Informació sobre la sessió i opcions de reserva
          </DialogDescription>
        </DialogHeader>

        <p className="text-xs text-muted-foreground italic">
          Totes les classes tenen una durada de 50 minuts.
        </p>
        {/* Session Information */}
        <div className="space-y-3">
          <p
            className={cn(
              "text-sm",
              isFull
                ? "text-destructive"
                : isAlmostFull
                  ? "text-yellow-500"
                  : "text-muted-foreground",
            )}
          >
            <span className="font-medium">Capacitat:</span>{" "}
            {confirmedReservations.length}/{session.room?.capacity} places
          </p>
          <p className="text-sm text-muted-foreground">
            <span className="font-medium">Professor/a:</span>{" "}
            {session.teacher?.name || "No assignat"}
          </p>
          <p className="text-sm text-muted-foreground">
            <span className="font-medium">Sala:</span>{" "}
            {session.room?.name || "No assignada"}
          </p>
          <p className="text-sm text-muted-foreground flex items-center gap-2">
            <span className="font-medium">Nivell:</span>{" "}
            <Badge
              variant={
                session.level === SessionLevelEnum.ADVANCED
                  ? "levelAdvanced"
                  : "levelNormal"
              }
            >
              {sessionLevelToLabel[session.level]}
            </Badge>
          </p>
        </div>
        <div className="flex flex-col items-end space-y-3">
          {waitingListReservations.length > 0 && (
            <p className="text-sm text-muted-foreground">
              <span className="font-medium">Llista d&apos;espera:</span>{" "}
              {waitingListReservations.length}
            </p>
          )}
        </div>
        <ReserveButton
          session={{
            id: session.id,
            type: session.type,
            isFull,
          }}
          closeInformationDialog={() => onOpenChange(false)}
        />
        <div className="flex flex-col gap-4  border-t border-border/50 pt-4">
          {/* Session Type Description */}
          <div>
            <h4 className="font-semibold text-sm mb-2">
              Sobre el {sessionTypeLabels[session.type]}
            </h4>
            <DialogDescription className="text-sm text-muted-foreground">
              {sessionTypeDescriptions[session.type]}
            </DialogDescription>
          </div>

          {/* Observations */}
          {session.observations && (
            <div className="pt-4 border-t border-border/50">
              <h4 className="font-semibold text-sm mb-2">Observacions</h4>
              <p className="text-sm text-muted-foreground italic">
                {session.observations}
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
