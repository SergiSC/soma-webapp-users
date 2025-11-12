import { PageSkeleton } from "@/components/page-skeleton";
import { Timetable } from "./timetable";

export default function TimetablePage() {
  return (
    <PageSkeleton
      title="Horari"
      sections={[
        {
          content: <Timetable />,
        },
      ]}
    />
  );
}
