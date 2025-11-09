import type React from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";

export function TooltipComponent({
  tooltipTrigger,
  tooltipContent,
}: {
  tooltipTrigger: React.ReactNode;
  tooltipContent: React.ReactNode;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>{tooltipTrigger}</TooltipTrigger>
      <TooltipContent side="right">{tooltipContent}</TooltipContent>
    </Tooltip>
  );
}
