import { DailySession } from "@/hooks/api/daily-sessions";
import {
  SESSION_TYPES_THAT_INCLUDE_REFORMER,
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
import { Badge, badgeVariants } from "../ui/badge";
import {
  sessionColorsRecord,
  sessionTypeToLabel,
  sessionLevelToLabel,
} from "@/lib/constants";
import { Button } from "../ui/button";
import { useMemo, useState } from "react";
import {
  ProductTypeEnum,
  useListUserActiveProducts,
} from "@/hooks/api/products";
import { useUser } from "@/context/user-context";
import { EmptyState } from "../empty-state";
import { AlertCircleIcon, PackageIcon } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Label } from "../ui/label";
import { VariantProps } from "class-variance-authority";
import { useCreateReservationMutation } from "@/hooks/api/reservations";
import { Separator } from "../ui/separator";

interface SessionReservationDialogProps {
  session: DailySession | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

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
          <Separator />
          <SessionReservationRules session={session} />
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
        onReservationCreated={() => {
          onOpenChange(false);
        }}
      />
    </>
  );
}

function SessionReservationRules({ session }: { session: DailySession }) {
  const isEarlyMorningSession = session.startHour.startsWith("07:");

  return (
    <div className="space-y-2 px-4 py-2 bg-destructive/10 rounded-md">
      <div className="flex items-center gap-2">
        <AlertCircleIcon className="size-4" />{" "}
        <span className="font-medium">Atenció</span>
      </div>
      <ul className="space-y-1 list-disc list-inside ">
        {isEarlyMorningSession ? (
          <>
            <li className="text-sm text-muted-foreground">
              Les cancel·lacions s’han de fer com a màxim el dia anterior abans
              de les 23:59; en cas contrari, es consideraran com a no
              assistides.
            </li>
            <li className="text-sm text-muted-foreground">
              Les reserves s’han de realitzar com a màxim el dia anterior abans
              de les 23:59.
            </li>
          </>
        ) : (
          <>
            <li className="text-sm text-muted-foreground">
              Les cancel·lacions s’han de fer amb un mínim d’1 hora d’antelació;
              en cas contrari, es consideraran com a no assistides.
            </li>
            <li className="text-sm text-muted-foreground">
              Les reserves s’han de realitzar com a mínim 30 minuts abans de
              l’inici de la classe.
            </li>
          </>
        )}
      </ul>
    </div>
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
  const isFull = session.confirmedReservations.count === session.room?.capacity;

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
  onReservationCreated: () => void;
  session: DailySession;
}

function ProductSelectorDialog({
  open,
  onOpenChange,
  session,
  onReservationCreated,
}: ProductSelectorDialogProps) {
  const [selectedProductId, setSelectedProductId] = useState<string | null>(
    null,
  );

  const { user } = useUser();
  const { data: userActiveProducts } = useListUserActiveProducts(user?.id);
  const createReservationMutation = useCreateReservationMutation();

  const items: ProductSelectorItem[] = useMemo(() => {
    const items: ProductSelectorItem[] = [];
    if (SESSION_TYPES_THAT_INCLUDE_REFORMER.includes(session.type)) {
      if (
        userActiveProducts?.subscription &&
        (userActiveProducts.subscription.product.recurring.includesReformer ||
          userActiveProducts.subscription.product.recurring
            .amountReformerPerWeek !== undefined)
      ) {
        items.push({
          id: userActiveProducts.subscription.id,
          name: userActiveProducts.subscription.product.name,
          type: userActiveProducts.subscription.product.recurring.type,
          isAccumulatedSession: false,
        });
      }
    }

    const filteredPacks = userActiveProducts?.packs.filter((pack) => {
      if (SESSION_TYPES_THAT_INCLUDE_REFORMER.includes(session.type)) {
        return pack.product.recurring.includesReformer;
      } else {
        return pack.product.recurring.includesReformer === false;
      }
    });
    if (filteredPacks && filteredPacks.length > 0) {
      items.push(
        ...filteredPacks.map((pack) => ({
          id: pack.id,
          name: pack.product.name,
          type: ProductTypeEnum.PACK,
          isAccumulatedSession: false,
        })),
      );

      return items;
    }
    return items;
  }, [userActiveProducts, session.type]);

  const displaEmptyState = items.length === 0;

  const handleCreateReservation = async () => {
    if (!selectedProductId || !user?.id) {
      return;
    }
    const selectedItem = items.find((item) => item.id === selectedProductId);
    if (!selectedItem) {
      return;
    }

    await createReservationMutation.mutateAsync({
      sessionId: session.id,
      userId: user.id,
      product: {
        id: selectedProductId,
        type: selectedItem.type,
        accumulatedSessionId: selectedItem.isAccumulatedSession
          ? selectedItem.id
          : undefined,
      },
    });
    onReservationCreated();
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
              <div key={item.id} className="flex items-center gap-3">
                <RadioGroupItem
                  value={item.id}
                  id={item.id}
                  className="cursor-pointer"
                />
                <Label htmlFor={item.id} className="cursor-pointer">
                  <Badge variant={VARIANT_MAP[item.type]}>
                    {LABELS_MAP[item.type]}
                  </Badge>
                  {item.name}
                </Label>
              </div>
            ))}
          </RadioGroup>
        )}
        <DialogFooter>
          <Button
            onClick={handleCreateReservation}
            disabled={createReservationMutation.isPending || !selectedProductId}
          >
            {createReservationMutation.isPending ? "Reservant..." : "Reservar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface ProductSelectorItem {
  id: string;
  name: string;
  type: ProductTypeEnum;
  isAccumulatedSession: boolean;
}

const LABELS_MAP: Record<ProductTypeEnum, string> = {
  [ProductTypeEnum.SUBSCRIPTION]: "Sub",
  [ProductTypeEnum.SUBSCRIPTION_COMBO]: "Combo",
  [ProductTypeEnum.PACK]: "Pack",
};

const VARIANT_MAP: Record<
  ProductTypeEnum,
  VariantProps<typeof badgeVariants>["variant"]
> = {
  [ProductTypeEnum.SUBSCRIPTION]: "productSelectorSubscription",
  [ProductTypeEnum.SUBSCRIPTION_COMBO]: "productSelectorSubscription",
  [ProductTypeEnum.PACK]: "productSelectorPack",
};
