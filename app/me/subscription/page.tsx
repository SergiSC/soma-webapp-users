import { PageSkeleton } from "@/components/page-skeleton";
import { SubscriptionCard } from "@/components/cards/subscription/subscription.card";

export default function UserSubscriptionPage() {
  return (
    <PageSkeleton
      title="La meva subscripció"
      sections={[
        {
          content: <SubscriptionCard />,
        },
      ]}
    />
  );
}
