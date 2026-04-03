import { DailySession } from "@/hooks/api/daily-sessions";
import {
  SessionTypeEnum,
  SessionLevelEnum,
  SessionStatus,
} from "@/hooks/api/sessions";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "../ui/badge";
import {
  sessionColorsRecord,
  sessionTypeToLabel,
  sessionLevelToLabel,
} from "@/lib/constants";
import { Button } from "../ui/button";
import { useMemo, useState } from "react";
import { ProductTypeEnum } from "@/hooks/api/products";
import { useListUserActiveProducts } from "@/hooks/api/products";
import { useUser } from "@/context/user-context";
import { EmptyState } from "../empty-state";
import { PackageIcon } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";

interface SessionReservationDialogProps {
  session: DailySession | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const sessionTypeDescriptions: Record<SessionTypeEnum, string> = {
  [SessionTypeEnum.PILATES_REFORMER]:
    "El Pilates Reformer és una modalitat de Pilates que utilitza una màquina especialitzada anomenada reformer. Aquesta classe combina exercicis de força, flexibilitat i control corporal per millorar la postura, la força del core i la coordinació. Ideal per a tots els nivells.",
  [SessionTypeEnum.PILATES_REFORMER_PRE_NATAL]:
    "El Pilates Reformer Pre Natal és una modalitat de Pilates que utilitza una màquina especialitzada anomenada reformer. Aquesta classe combina exercicis de força, flexibilitat i control corporal per millorar la postura, la força del core i la coordinació. Ideal per a totes les mares en diferents fases de la seva gestació.",
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
  const [isProductSelectorOpen, setIsProductSelectorOpen] = useState(false);

  if (!session) {
    return null;
  }

  const confirmedReservations = session.confirmedReservations;
  const isFull = confirmedReservations.count === session.room?.capacity;
  const isAlmostFull = session.room?.capacity
    ? confirmedReservations.count >= Math.ceil(session.room.capacity * 0.8)
    : false;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <SessionReservationDialogHeader session={session} />
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
              <span className="font-medium">Reserves:</span>{" "}
              {confirmedReservations.count}/{session.room?.capacity} places
            </p>
            <p className="text-sm text-muted-foreground">
              <span className="font-medium">Professor/a:</span>{" "}
              {session.teacher?.name || "No assignat"}
            </p>
            <p className="text-sm text-muted-foreground">
              <span className="font-medium">Duració:</span> 50 minuts
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
          <div className="flex flex-col gap-4  border-t border-border/50 pt-4">
            {/* Session Type Description */}
            <div>
              <h4 className="font-semibold text-sm mb-2">
                Sobre el {sessionTypeToLabel[session.type]}
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
          <SessionReservationDialogFooter
            session={session}
            setIsProductSelectorOpen={setIsProductSelectorOpen}
          />
        </DialogContent>
      </Dialog>
      <ProductSelectorDialog
        open={isProductSelectorOpen}
        onOpenChange={setIsProductSelectorOpen}
        session={session}
      />
    </>
  );
}

function SessionReservationDialogHeader({
  session,
}: {
  session: DailySession;
}) {
  const sessionColor = sessionColorsRecord[session.type];
  const formatTime = (time: string) => {
    return time.slice(0, 5);
  };
  return (
    <DialogHeader>
      <DialogTitle className="flex items-center gap-3">
        <div
          className="w-1 h-full rounded"
          style={{ backgroundColor: `${sessionColor}50` }}
        />
        <div className="text-start">
          <h3 className="text-xl font-semibold">
            {sessionTypeToLabel[session.type]}
          </h3>
          <p className="text-sm text-muted-foreground font-normal mt-1">
            {formatTime(session.startHour)} - {formatTime(session.endHour)}
          </p>
        </div>
      </DialogTitle>
    </DialogHeader>
  );
}

function SessionReservationDialogFooter({
  session,
  setIsProductSelectorOpen,
}: {
  session: DailySession;
  setIsProductSelectorOpen: (open: boolean) => void;
}) {
  const canReserve = session.status === SessionStatus.PUBLISHED;
  const isFull =
    session.confirmedReservations.count === session.room?.capacity;

  return (
    <DialogFooter className="flex flex-col gap-4  border-t border-border/50 pt-4">
      <Button
        variant="default"
        onClick={() => {
          setIsProductSelectorOpen(true);
        }}
        disabled={!canReserve || isFull}
      >
        {!canReserve
          ? session.status === SessionStatus.COMPLETED
            ? "Sessió finalitzada"
            : session.status === SessionStatus.CANCELLED
              ? "Sessió cancel·lada"
              : "Reservar"
          : isFull
            ? "Completa"
            : "Reservar"}
      </Button>
    </DialogFooter>
  );
}

interface ProductSelectorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  session: DailySession;
}

function ProductSelectorDialog({
  open,
  onOpenChange,
  session,
}: ProductSelectorDialogProps) {
  const [selectedProductId, setSelectedProductId] = useState<string | null>(
    null,
  );

  const { user } = useUser();
  const { data: userActiveProducts } = useListUserActiveProducts(user?.id);

  const items: ProductSelectorItem[] = useMemo(
    () => [
      ...(userActiveProducts?.subscription
        ? [
            {
              id: userActiveProducts.subscription.id,
              name: userActiveProducts.subscription.product.name,
              type: ProductTypeEnum.SUBSCRIPTION,
            },
          ]
        : []),
      ...(userActiveProducts?.packs ?? []).map((pack) => ({
        id: pack.id,
        name: pack.product.name,
        type: ProductTypeEnum.PACK,
      })),
    ],
    [userActiveProducts],
  );
  const displaEmptyState = items.length === 0;

  const handleCreateReservation = () => {
    if (!selectedProductId) {
      return;
    }
    console.log(selectedProductId);
    // TODO: Create reservation
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader className="text-start">
          <DialogTitle>Reserva</DialogTitle>
          <DialogDescription>
            Selecciona el producte per fer la reserva de la classe.
          </DialogDescription>
        </DialogHeader>
        {displaEmptyState ? (
          <EmptyState
            icon={<PackageIcon />}
            message="No tens cap producte actiu o subscripció activa"
          />
        ) : (
          <RadioGroup
            value={selectedProductId}
            onValueChange={setSelectedProductId}
          >
            {items.map((item) => (
              <RadioGroupItem
                key={item.id}
                value={item.id}
                id={item.id}
                className="cursor-pointer"
              >
                {item.name}
              </RadioGroupItem>
            ))}
          </RadioGroup>
        )}
        <DialogFooter>
          <Button onClick={handleCreateReservation}>Reservar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface ProductSelectorItem {
  id: string;
  name: string;
  type: ProductTypeEnum;
}
