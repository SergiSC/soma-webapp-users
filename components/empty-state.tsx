import { JSX } from "react";

interface EmptyStateProps {
  icon: JSX.Element;
  message: string;
}

export function EmptyState({ icon, message }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center mt-12 gap">
      {icon}
      <h2 className="text-2xl font-semibold mt-3">
        No s&apos;ha trobat cap resultat
      </h2>
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
}
