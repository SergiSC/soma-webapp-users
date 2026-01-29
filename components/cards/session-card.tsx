import { DailySession } from "@/hooks/api/daily-sessions";
import {
  sessionTypeToLabel,
  sessionColorsRecord,
  sessionLevelToLabel,
  SessionLevelEnum,
} from "@/hooks/api/sessions";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  ReservationStatus,
  useUserInformation,
} from "@/hooks/api/user-information";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { useMemo, useState } from "react";
import { SessionReservationDialog } from "../dialogs/session-reservation-dialog";
import { SuperAdminButton } from "../super-admin.button";
import { useRouter } from "next/navigation";
import { useUser } from "@/context/user-context";
import { UserType } from "@/lib/api";

interface SessionCardProps {
  session: DailySession;
  className?: string;
}

export function SessionCard({ session, className }: SessionCardProps) {
  const { data: userInfo } = useUserInformation();
  const existingReservationType = useMemo(() => {
    return userInfo?.nextReservations.find((reservation) => {
      return reservation.sessionId === session.id;
    })?.status;
  }, [userInfo?.nextReservations, session.id]);

  const [isDialogOpen, setIsDialogOpen] = useState(false);

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

  const roomAtFullCapacity = session.room?.capacity
    ? confirmedReservations.length >= session.room.capacity
    : false;

  return (
    <Card
      className={cn(
        "border-l-4 transition-all hover:shadow-md cursor-pointer bg-primary-foreground",
        className,
      )}
      style={{ borderLeftColor: sessionColor }}
    >
      <CardContent className="p-4">
        <div className="flex flex-col gap-3">
          {/* Header: Class name and time */}
          <div className="flex items-start justify-between">
            <div className="flex flex-col gap-1 flex-1">
              <h4 className="font-semibold text-lg text-foreground">
                {sessionTypeToLabel[session.type]}
              </h4>
            </div>
            <div className="text-right shrink-0 ml-4">
              <p className="font-semibold text-lg text-foreground">
                {formatTime(session.startHour)}
              </p>
            </div>
          </div>

          {/* Footer: Room and capacity info */}
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/50">
            <div className="flex flex-col gap-2">
              <p
                className={cn(
                  "text-xs text-muted-foreground",
                  isFull
                    ? "text-destructive"
                    : isAlmostFull
                      ? "text-yellow-500"
                      : "text-muted-foreground",
                )}
              >
                <span className="font-medium">Capacitat:</span>{" "}
                {
                  session.reservations.filter(
                    (reservation) =>
                      reservation.status === ReservationStatus.CONFIRMED,
                  ).length
                }
                /{session.room?.capacity} places
              </p>
              <p className="text-xs text-muted-foreground">
                <span className="font-medium">Professor/a:</span>{" "}
                {session.teacher?.name}
              </p>
              <p className="text-xs text-muted-foreground">
                <span className="font-medium">Sala:</span> {session.room?.name}
              </p>
              <p className="text-xs text-muted-foreground flex items-center gap-2">
                <span className="font-medium">Nivell:</span>
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
            <div className="flex flex-col space-between items-end">
              {waitingListReservations.length > 0 && (
                <p className="text-xs text-muted-foreground">
                  <span className="font-medium">Llista d&apos;espera:</span>{" "}
                  {waitingListReservations.length}
                </p>
              )}
              <Button
                variant="outline"
                disabled={!!existingReservationType || roomAtFullCapacity}
                size="sm"
                className="mt-auto"
                onClick={() => setIsDialogOpen(true)}
              >
                {roomAtFullCapacity
                  ? "Completa"
                  : reservationButtonLabel[
                      existingReservationType || "default"
                    ]}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
      <SessionCardFooter session={session} />
      <SessionReservationDialog
        session={session}
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
      />
    </Card>
  );
}

function SessionCardFooter({ session }: { session: DailySession }) {
  const router = useRouter();
  const user = useUser();
  if (user.user?.type === UserType.CLIENT) {
    return null;
  }
  return (
    <CardFooter>
      <SuperAdminButton
        className="w-full"
        label="Veure reserves"
        onClick={() => router.push(`/sessions/${session.id}`)}
      />
    </CardFooter>
  );
}

const reservationButtonLabel: Record<ReservationStatus | "default", string> = {
  [ReservationStatus.CONFIRMED]: "Reservada",
  [ReservationStatus.WAITING_LIST]: "Llista d'espera",
  [ReservationStatus.ATTENDED]: "Assistida",
  [ReservationStatus.NO_SHOW]: "No presentat",
  [ReservationStatus.CANCELLED]: "Reservar",
  default: "Reservar",
};
