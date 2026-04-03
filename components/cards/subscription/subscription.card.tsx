"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { useUser } from "@/context/user-context";
import { useSubscriptionAggregate } from "@/hooks/api/subscriptions";
import { SubscriptionAggregate } from "@/lib/entities/subscription";

interface SubscriptionCardProps {
  subscription: SubscriptionAggregate;
}

export function SubscriptionCard() {
  const { user } = useUser();
  const { data: subscriptionAggregate, isLoading } = useSubscriptionAggregate(
    user?.subscriptionId ?? undefined,
  );

  if (isLoading) {
    return <Spinner />;
  }

  if (!subscriptionAggregate) {
    return (
      <Card>
        <CardContent>No tens cap subscripció activa</CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <SubscriptionCardHeader subscription={subscriptionAggregate} />

      <CardContent>
        <div>A</div>
      </CardContent>
      {subscriptionAggregate && (
        <SubscriptionCardFooter subscription={subscriptionAggregate} />
      )}
    </Card>
  );
}

function SubscriptionCardHeader({ subscription }: SubscriptionCardProps) {
  return (
    <CardHeader>
      <CardTitle>{subscription?.product.name}</CardTitle>
    </CardHeader>
  );
}

function SubscriptionCardFooter({ subscription }: SubscriptionCardProps) {
  return (
    <CardFooter>
      <Button>
        {subscription?.cancelledAt
          ? "Renovar subscripció"
          : "Cancel·lar subscripció"}
      </Button>
    </CardFooter>
  );
}
