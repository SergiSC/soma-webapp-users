import { DailySession } from "@/hooks/api/daily-sessions";
import { SessionLevelEnum } from "@/hooks/api/sessions";
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

  return (
    <Card
      className={cn(
        "transition-all hover:shadow-md cursor-pointer ",
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
          disabled={!!existingReservationType || roomAtFullCapacity}
          size="sm"
          className="mt-auto w-fit absolute bottom-4 right-4"
          onClick={() => onSelect(session.id)}
        >
          {roomAtFullCapacity
            ? "Completa"
            : confirmedReservations.userIds.includes(user?.id ?? "")
              ? "Reservada"
              : "Reservar"}
        </Button>
      </CardContent>
      <SessionCardFooter session={session} />
    </Card>
  );
}

function SessionCardFooter({ session }: { session: DailySession }) {
  const router = useRouter();
  const { user } = useUser();
  console.log(user);
  if (user?.type !== UserType.ADMIN && user?.type !== UserType.TEACHER) {
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
  const sessionColor = sessionColorsRecord[session.type];
  return (
    <CardHeader
      className="flex flex-row space-between items-center justify-between rounded-t-md"
      style={{ backgroundColor: `${sessionColor}50` }}
    >
      <CardTitle>{sessionTypeToLabel[session.type]}</CardTitle>
      <CardDescription className="text-md text-muted-foreground font-semibold">
        {formatTime(session.startHour)}
      </CardDescription>
    </CardHeader>
  );
}
