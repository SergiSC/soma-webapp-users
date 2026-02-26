"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { PageSkeleton } from "@/components/page-skeleton";
import {
  useSession,
  sessionTypeToLabel,
  sessionLevelToLabel,
  sessionStatusToLabel,
  SessionStatus,
} from "@/hooks/api/sessions";
import { ReservationStatus } from "@/hooks/api/user-information";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";
import { Switch } from "@/components/ui/switch";
import { useUser } from "@/context/user-context";
import { UserType } from "@/lib/api";
import { Reservation, useTakeAttendance } from "@/hooks/api/reservations";
import { SuperAdminButton } from "@/components/super-admin.button";

const reservationStatusToLabel: Record<ReservationStatus, string> = {
  [ReservationStatus.CONFIRMED]: "Confirmada",
  [ReservationStatus.WAITING_LIST]: "Llista d'espera",
  [ReservationStatus.CANCELLED]: "Cancel·lada",
  [ReservationStatus.ATTENDED]: "Assistida",
  [ReservationStatus.NO_SHOW]: "No presentat",
};

const reservationStatusToVariant: Record<
  ReservationStatus,
  | "reservationConfirmed"
  | "reservationWaitingList"
  | "reservationCancelled"
  | "reservationAttended"
  | "reservationNoShow"
> = {
  [ReservationStatus.CONFIRMED]: "reservationConfirmed",
  [ReservationStatus.WAITING_LIST]: "reservationWaitingList",
  [ReservationStatus.CANCELLED]: "reservationCancelled",
  [ReservationStatus.ATTENDED]: "reservationAttended",
  [ReservationStatus.NO_SHOW]: "reservationNoShow",
};

const sessionStatusToVariant: Record<
  SessionStatus,
  "default" | "secondary" | "destructive" | "outline"
> = {
  [SessionStatus.DRAFT]: "secondary",
  [SessionStatus.PUBLISHED]: "default",
  [SessionStatus.CANCELLED]: "destructive",
  [SessionStatus.COMPLETED]: "outline",
};

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("ca-ES", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

function formatTime(time: string): string {
  return time.slice(0, 5);
}

export default function SessionPage() {
  const user = useUser();
  const router = useRouter();
  const params = useParams();
  const sessionId = params.sessionId as string;
  const [isAttendanceDialogOpen, setIsAttendanceDialogOpen] = useState(false);
  const [attendance, setAttendance] = useState<Record<string, boolean>>({});

  const { data: session, isLoading, error } = useSession(sessionId);
  const takeAttendanceMutation = useTakeAttendance();

  // Redirect clients away from this page
  useEffect(() => {
    if (user.user?.type === undefined || user.user.type === UserType.CLIENT) {
      router.replace("/timetable");
    }
  }, [user.user?.type, router]);

  // Initialize attendance state when dialog opens
  const handleOpenAttendanceDialog = () => {
    if (session) {
      const eligibleReservations = session.reservations.filter(
        (r) =>
          r.status === ReservationStatus.CONFIRMED ||
          r.status === ReservationStatus.ATTENDED ||
          r.status === ReservationStatus.NO_SHOW,
      );
      const initialAttendance: Record<string, boolean> = {};
      eligibleReservations.forEach((r) => {
        // Pre-check those who already attended or are confirmed
        initialAttendance[r.user.id] =
          r.status === ReservationStatus.ATTENDED || false;
      });
      setAttendance(initialAttendance);
    }
    setIsAttendanceDialogOpen(true);
  };

  const handleToggleAttendance = (userId: string) => {
    setAttendance((prev) => ({
      ...prev,
      [userId]: !prev[userId],
    }));
  };

  const handleSubmitAttendance = () => {
    const attendeeUserIds = Object.entries(attendance)
      .filter(([, attended]) => attended)
      .map(([userId]) => userId);
    const notAttendedUserIds = Object.entries(attendance)
      .filter(([, attended]) => !attended)
      .map(([userId]) => userId);

    takeAttendanceMutation.mutate(
      {
        sessionId,
        attendeeUserIds,
        notAttendedUserIds,
      },
      {
        onSuccess: () => {
          setIsAttendanceDialogOpen(false);
        },
      },
    );
  };

  if (isLoading) {
    return (
      <PageSkeleton
        title="Carregant sessió..."
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

  if (error || !session) {
    return (
      <PageSkeleton
        title="Error"
        sections={[
          {
            content: (
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  No s&apos;ha pogut carregar la sessió. Si us plau, torna-ho a
                  intentar.
                </p>
              </div>
            ),
          },
        ]}
      />
    );
  }

  const countedReservations = session.reservations.filter(
    (r) =>
      r.status === ReservationStatus.CONFIRMED ||
      r.status === ReservationStatus.ATTENDED ||
      r.status === ReservationStatus.NO_SHOW,
  );
  const waitingListReservations = session.reservations.filter(
    (r) => r.status === ReservationStatus.WAITING_LIST,
  );

  return (
    <PageSkeleton
      title={sessionTypeToLabel[session.type]}
      description={
        <div className="grid grid-cols-[1fr_auto] gap-4 items-center mt-2">
          <div className="flex flex-col gap-1">
            <p className="text-sm text-dark-400">
              <strong>Data:</strong> {formatDate(session.day)}
            </p>
            <p className="text-sm text-dark-400">
              <strong>Hora:</strong> {formatTime(session.startHour)} -{" "}
              {formatTime(session.endHour)}
            </p>
          </div>
          <div className="flex flex-col gap-2 items-end">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-muted-foreground">
                Nivell:
              </span>
              <Badge
                variant={
                  session.level === "advanced" ? "levelAdvanced" : "levelNormal"
                }
              >
                {sessionLevelToLabel[session.level]}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-muted-foreground">
                Estat:
              </span>
              <Badge variant={sessionStatusToVariant[session.status]}>
                {sessionStatusToLabel[session.status]}
              </Badge>
              {session.isFree && <Badge variant="outline">Gratuïta</Badge>}
            </div>
          </div>
        </div>
      }
      sections={[
        {
          title: "Informació de la sessió",
          content: (
            <dl className="space-y-4">
              {/* Teacher */}
              <div>
                <dt className="text-sm text-muted-foreground">Professor/a</dt>
                <dd className="font-medium">
                  {session.teacher
                    ? `${session.teacher.name} ${session.teacher.surname}`
                    : "No assignat"}
                </dd>
              </div>

              {session.observations && (
                <div className="pt-4 border-t">
                  <dt className="text-sm text-muted-foreground">
                    Observacions
                  </dt>
                  <dd className="text-sm">{session.observations}</dd>
                </div>
              )}
            </dl>
          ),
        },
        {
          title: `Reserves (${countedReservations.length}/${session.room?.capacity ?? "?"})${waitingListReservations.length > 0 ? ` +${waitingListReservations.length} en espera` : ""}`,
          action: (
            <>
              <SuperAdminButton
                label="Passar llista"
                onClick={handleOpenAttendanceDialog}
              />
              <Dialog
                open={isAttendanceDialogOpen}
                onOpenChange={setIsAttendanceDialogOpen}
              >
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Passar llista</DialogTitle>
                  </DialogHeader>
                  <div className="max-h-[60vh] overflow-y-auto">
                    <div className="divide-y">
                      {session.reservations
                        .filter(
                          (r) =>
                            r.status === ReservationStatus.CONFIRMED ||
                            r.status === ReservationStatus.ATTENDED ||
                            r.status === ReservationStatus.NO_SHOW,
                        )
                        .map((reservation) => (
                          <div
                            key={reservation.id}
                            className="flex items-center justify-between py-3"
                          >
                            <div className="flex flex-col gap-0.5">
                              <span className="text-sm font-medium">
                                {reservation.user.name}{" "}
                                {reservation.user.surname}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {reservation.product?.name ?? "Sense producte"}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-muted-foreground">
                                {attendance[reservation.user.id]
                                  ? "Assisteix"
                                  : "No assisteix"}
                              </span>
                              <Switch
                                checked={
                                  attendance[reservation.user.id] ?? false
                                }
                                onCheckedChange={() =>
                                  handleToggleAttendance(reservation.user.id)
                                }
                              />
                            </div>
                          </div>
                        ))}
                    </div>
                    {session.reservations.filter(
                      (r) =>
                        r.status === ReservationStatus.CONFIRMED ||
                        r.status === ReservationStatus.ATTENDED ||
                        r.status === ReservationStatus.NO_SHOW,
                    ).length === 0 && (
                      <p className="text-center text-muted-foreground py-4">
                        No hi ha reserves confirmades per aquesta sessió
                      </p>
                    )}
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setIsAttendanceDialogOpen(false)}
                    >
                      Cancel·lar
                    </Button>
                    <SuperAdminButton
                      label="Guardar"
                      onClick={handleSubmitAttendance}
                      disabled={takeAttendanceMutation.isPending}
                    />
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </>
          ),
          content: <ReservationsList reservations={session.reservations} />,
        },
      ]}
    />
  );
}

interface ReservationsListProps {
  reservations: Reservation[];
}

function formatDateTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("ca-ES", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function ReservationsList({ reservations }: ReservationsListProps) {
  if (reservations.length === 0) {
    return (
      <Card>
        <CardContent className="py-8">
          <p className="text-center text-muted-foreground">
            No hi ha reserves per aquesta sessió
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="divide-y">
      {reservations.map((reservation) => {
        const productType = reservation.subscriptionId
          ? "Subscripció"
          : reservation.packId
            ? "Pack"
            : null;

        return (
          <div
            key={reservation.id}
            className="flex w-full items-center justify-between p-4 transition-colors hover:bg-muted/50"
          >
            <div className="flex items-center gap-3">
              <div className="flex flex-col gap-1">
                <span className="text-sm font-medium">
                  {reservation.user.name} {reservation.user.surname}
                </span>
                {reservation.product && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      {productType}:
                    </span>
                    <Badge variant="outline">{reservation.product.name}</Badge>
                  </div>
                )}
                <span className="text-xs text-muted-foreground">
                  Creada: {formatDateTime(reservation.createdAt)}
                  {reservation.updatedAt && (
                    <>
                      {" "}
                      · Actualitzada: {formatDateTime(reservation.updatedAt)}
                    </>
                  )}
                </span>
              </div>
            </div>
            <Badge variant={reservationStatusToVariant[reservation.status]}>
              {reservationStatusToLabel[reservation.status]}
            </Badge>
          </div>
        );
      })}
    </div>
  );
}
