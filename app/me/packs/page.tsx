import { PageSkeleton } from "@/components/page-skeleton";
import { PackList } from "./pack-list";

export default function UserPacksPage() {
  return (
    <PageSkeleton
      title="Els meus packs"
      sections={[
        {
          content: <PackList />,
        },
      ]}
    />
  );
}
