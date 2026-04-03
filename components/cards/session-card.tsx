import { DailySession } from "@/hooks/api/daily-sessions";
import { SessionLevelEnum, SessionStatus } from "@/hooks/api/sessions";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { useMemo } from "react";
import { SuperAdminButton } from "../super-admin.button";
import { useRouter } from "next/navigation";
import { UserType } from "@/hooks/api/users";
import {
  sessionColorsRecord,
  sessionLevelToLabel,
  sessionTypeToLabel,
  sessionStatusColorRecord
} from "@/lib/constants";
import { useUser } from "@/context/user-context";

interface SessionCardProps {
  session: DailySession;
  className?: string;
  onSelect: (sessionId: string) => void;
}

export function SessionCard({
  session,
  className,
  onSelect,
}: SessionCardProps) {
  const { user } = useUser();
  const existingReservationType = useMemo(() => {
    return session.confirmedReservations.userIds.includes(user?.id ?? "");
  }, [user?.id, session.confirmedReservations.userIds]);

  const confirmedReservations = session.confirmedReservations;
  const isFull = confirmedReservations.count === session.room?.capacity;
  const isAlmostFull = session.room?.capacity
    ? confirmedReservations.count >= Math.ceil(session.room.capacity * 0.8)
    : false;

  const roomAtFullCapacity = session.room?.capacity
    ? confirmedReservations.count >= session.room.capacity
    : false;

  const canReserve = session.status === SessionStatus.PUBLISHED;

  const reserveButtonLabel = (() => {
    if (!canReserve) {
      switch (session.status) {
        case SessionStatus.COMPLETED:
          return "Finalitzada";
        case SessionStatus.CANCELLED:
          return "Cancel·lada";
        default:
          return "No disponible";
      }
    }
    if (roomAtFullCapacity) return "Completa";
    if (confirmedReservations.userIds.includes(user?.id ?? "")) return "Reservada";
    return "Reservar";
  })();

  return (
    <Card
      className={cn(
        "transition-all hover:shadow-md cursor-pointer ",
        session.status === SessionStatus.COMPLETED &&
          "opacity-[0.72] saturate-[0.65]",
        session.status === SessionStatus.CANCELLED && "opacity-[0.78]",
        className,
      )}
    >
      <SessionCardHeader session={session} />
      <CardContent className="p-4 relative">
        <div className="flex flex-col gap-2">
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
            {confirmedReservations.count}/{session.room?.capacity} places
          </p>
          <p className="text-xs text-muted-foreground">
            <span className="font-medium">Professor/a:</span>{" "}
            {session.teacher?.name}
          </p>
          <p className="text-xs text-muted-foreground">
            <span className="font-medium">Sala:</span> {session.room?.name}
          </p>
        </div>
        <Button
          variant="outline"
          disabled={
            !canReserve ||
            !!existingReservationType ||
            roomAtFullCapacity
          }
          size="sm"
          className="mt-auto w-fit absolute bottom-4 right-4"
          onClick={() => onSelect(session.id)}
        >
          {reserveButtonLabel}
        </Button>
      </CardContent>
      <SessionCardFooter session={session} />
    </Card>
  );
}

function SessionCardFooter({ session }: { session: DailySession }) {
  const router = useRouter();
  const { user } = useUser();
  if (user?.type === UserType.CLIENT || user?.type === undefined) {
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

function SessionCardHeader({ session }: { session: DailySession }) {
  const formatTime = (time: string) => {
    return time.slice(0, 5);
  };
  const isSessionCompleted = session.status === SessionStatus.COMPLETED;
  const isSessionCancelled = session.status === SessionStatus.CANCELLED;
  const sessionColor = isSessionCancelled 
    ? sessionStatusColorRecord[SessionStatus.CANCELLED] 
    : isSessionCompleted 
      ? sessionStatusColorRecord[SessionStatus.COMPLETED] 
      : sessionColorsRecord[session.type];

  return (
    <CardHeader
      className="flex flex-row space-between items-center justify-between rounded-t-md"
      style={{ backgroundColor:  `${sessionColor}50` }}
    >
      <CardTitle>{sessionTypeToLabel[session.type]}</CardTitle>
      <CardDescription className="text-md text-muted-foreground font-semibold">
        {formatTime(session.startHour)}
      </CardDescription>
    </CardHeader>
  );
}
