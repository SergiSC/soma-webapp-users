import { JSX } from "react";
import { Button } from "./ui/button";

interface EmptyStateProps {
  icon: JSX.Element;
  message: string;
  button?: {
    text: string;
    onClick: () => void;
  };
}

export function EmptyState({ icon, message, button }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center mt-12 gap-4">
      {icon}
      <h2 className="text-2xl font-semibold mt-3">
        No s&apos;ha trobat cap resultat
      </h2>
      <p className="text-sm text-muted-foreground">{message}</p>
      {button ? (
        <Button variant="outline" onClick={button.onClick}>
          {button.text}
        </Button>
      ) : null}
    </div>
  );
}
