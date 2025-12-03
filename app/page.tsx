import { MyPackCards } from "@/components/cards/my-pack.card";
import {
  MyCompletedSessionsCard,
  MyNextSessionsCard,
} from "@/components/cards/my-sessions.card";
import { MySubscriptionCard } from "@/components/cards/subscription/my-subscription.card";
import { PageSkeleton } from "@/components/page-skeleton";

export default function Home() {
  return (
    <PageSkeleton
      title="Inici"
      sections={[
        {
          title: "La meva subscripció",
          content: <MySubscriptionCard />,
        },
        {
          title: "Els meus packs",
          content: <MyPackCards />,
        },
        {
          title: "Pròximes classes",
          content: <MyNextSessionsCard />,
        },
        {
          title: "Classes completades",
          content: <MyCompletedSessionsCard />,
        },
      ]}
    />
  );
}
