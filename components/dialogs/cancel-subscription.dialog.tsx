import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { SubscriptionAggregate } from "@/lib/entities/subscription";
import { useCancelSubscription } from "@/hooks/api/subscriptions";

interface CancelSubscriptionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subscription?: SubscriptionAggregate;
}

export function CancelSubscriptionDialog({
  open,
  onOpenChange,
  subscription,
}: CancelSubscriptionDialogProps) {
  const { mutateAsync: cancelSubscription } = useCancelSubscription();
  if (subscription === undefined) {
    return null;
  }

  const onCancelSubscription = async () => {
    await cancelSubscription({
      userId: subscription.user.id,
      subscriptionId: subscription.id,
    });
    onOpenChange(false);
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader className="text-start">
          <DialogTitle>Cancel·lar subscripció</DialogTitle>
          <DialogDescription>
            Estàs segur/a que vols cancel·lar la subscripció{" "}
            <strong>{subscription.product.name}</strong>?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="destructive" onClick={onCancelSubscription}>
            Confirmar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
