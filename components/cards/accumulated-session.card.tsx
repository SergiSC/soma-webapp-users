import {
  CATALAN_MONTHS,
  accumulatedSessionStatusToLabel,
  accumulatedSessionStatusToVariant,
  sessionColorsRecord,
} from "@/lib/constants";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { AccumulatedSessionJsonObject } from "@/hooks/api/reservations";
import { SessionTypeEnum } from "@/hooks/api/sessions";
import { Badge } from "../ui/badge";

interface AccumulatedSessionCardProps {
  accumulatedSession: AccumulatedSessionJsonObject;
}

export function AccumulatedSessionCard({
  accumulatedSession,
}: AccumulatedSessionCardProps) {
  return (
    <Card className="border border-primary">
      <AccumulatedSessionCardHeader accumulatedSession={accumulatedSession} />
      <AccumulatedSessionCardContent accumulatedSession={accumulatedSession} />
    </Card>
  );
}

function AccumulatedSessionCardHeader({
  accumulatedSession,
}: AccumulatedSessionCardProps) {
  const headerColor = accumulatedSession.includesReformer
    ? sessionColorsRecord[SessionTypeEnum.PILATES_REFORMER]
    : sessionColorsRecord[SessionTypeEnum.PILATES_MAT];

  return (
    <CardHeader
      className="flex flex-row items-center gap-2 p-4 rounded-t-md"
      style={{ backgroundColor: `${headerColor}50` }}
    >
      <CardTitle>Sessió acumulada</CardTitle>
    </CardHeader>
  );
}

function AccumulatedSessionCardContent({
  accumulatedSession,
}: AccumulatedSessionCardProps) {
  const labels: Record<string, string> = {
    "Reformer:": accumulatedSession.includesReformer ? "Si" : "No",
    "Creada:": formatDate(new Date(accumulatedSession.createdAt)),
    "Caduca:": formatDate(new Date(accumulatedSession.expiresAt)),
  };

  return (
    <CardContent className="p-4 relative">
      {Object.entries(labels).map(([label, value]) => (
        <p key={label}>
          <span className="font-medium">{label}</span> {value}
        </p>
      ))}
      <Badge
        variant={accumulatedSessionStatusToVariant[accumulatedSession.status]}
        className="absolute bottom-5 right-4 opacity-70"
      >
        {accumulatedSessionStatusToLabel[accumulatedSession.status]}
      </Badge>
    </CardContent>
  );
}

function formatDate(date: Date): string {
  const day = date.getDate().toString().padStart(2, "0");
  const month = CATALAN_MONTHS[date.getMonth()];
  const year = date.getFullYear();
  return `${day} ${month} ${year}`;
}
