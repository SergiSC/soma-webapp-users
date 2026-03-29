import {
  CATALAN_MONTHS,
  CATALAN_WEEKDAYS,
  reservationStatusToLabel,
  reservationStatusToVariant,
  sessionColorsRecord,
  sessionTypeToLabel,
} from "@/lib/constants";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { AggregatedReservationJsonObject } from "@/hooks/api/reservations";
import { sessionLevelToLabel } from "@/lib/constants";
import { Trash2Icon } from "lucide-react";
import { Badge } from "../ui/badge";

interface ReservationCardProps {
  reservation: AggregatedReservationJsonObject;
  setReservationToCancel: (
    reservation: AggregatedReservationJsonObject,
  ) => void;
  isCompleted: boolean;
}

export function ReservationCard({
  reservation,
  setReservationToCancel,
  isCompleted,
}: ReservationCardProps) {
  return (
    <Card className="border border-primary">
      <ReservationCardHeader reservation={reservation} />
      <ReservationCardContent
        reservation={reservation}
        setReservationToCancel={setReservationToCancel}
        isCompleted={isCompleted}
      />
    </Card>
  );
}

function ReservationCardHeader({
  reservation,
}: {
  reservation: AggregatedReservationJsonObject;
}) {
  const reservationColor = sessionColorsRecord[reservation.session.type];
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_, month, day] = reservation.session.schedule.day.split("-");
  const weekDay =
    CATALAN_WEEKDAYS[new Date(reservation.session.schedule.day).getDay() - 1];

  return (
    <CardHeader
      className="flex flex-row items-center gap-2 p-4 rounded-t-md"
      style={{ backgroundColor: `${reservationColor}50` }}
    >
      <span className="size-12 rounded-md flex flex-col text-center justify-center font-semibold text-sm bg-primary/70 text-background">
        {weekDay} {day}
        <br />
        {CATALAN_MONTHS[Number(month) - 1]}
      </span>
      <div className="flex flex-col gap-1">
        <CardTitle>{sessionTypeToLabel[reservation.session.type]}</CardTitle>
        <CardDescription className="text-xs text-muted-foreground">
          {reservation.session.schedule.start} -{" "}
          {reservation.session.schedule.end}
        </CardDescription>
      </div>
    </CardHeader>
  );
}

function ReservationCardContent({
  reservation,
  setReservationToCancel,
  isCompleted,
}: ReservationCardProps) {
  const [year, month, day] = reservation.session.schedule.day.split("-");
  const date = new Date(Number(year), Number(month) - 1, Number(day));
  const [startHour, startMinute] =
    reservation.session.schedule.start.split(":");
  date.setHours(Number(startHour), Number(startMinute), 0, 0);

  const labels: Record<string, string> = {
    "Professor/a:": reservation.session.teacher?.name ?? "-",
    "Sala:": reservation.session.room?.name ?? "-",
    "Nivell:": sessionLevelToLabel[reservation.session.level] ?? "-",
  };
  return (
    <CardContent className="p-4 relative">
      {Object.entries(labels).map(([label, value]) => (
        <p key={label}>
          <span className="font-medium">{label}</span> {value}
        </p>
      ))}
      {isCompleted ? (
        <Badge
          variant={reservationStatusToVariant[reservation.status]}
          className="absolute bottom-5 right-4 opacity-70"
        >
          {reservationStatusToLabel[reservation.status]}
        </Badge>
      ) : (
        <Trash2Icon
          className="size-5 text-muted-foreground cursor-pointer absolute bottom-5 right-4"
          onClick={() => setReservationToCancel(reservation)}
        />
      )}
    </CardContent>
  );
}
