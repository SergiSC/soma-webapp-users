"use client";

import { EllipsisVertical } from "lucide-react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Separator } from "./ui/separator";
import { cn } from "@/lib/utils";

export interface MenuOption {
  label: string;
  action: () => void;
  variant?: "regular" | "destructive";
}

interface OptionsMenuProps {
  title: string;
  description?: string;
  options: MenuOption[];
}

export function OptionsMenu({ title, description, options }: OptionsMenuProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon-sm"
          className="rounded-full hover:bg-accent p-0"
        >
          <EllipsisVertical className="size-5" />
          <span className="sr-only">Open menu</span>
        </Button>
      </DialogTrigger>
      <DialogContent showCloseButton={false} className="p-4 gap-2">
        <DialogHeader>
          <DialogTitle className="text-secondary-foreground text-left">
            {title}
          </DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        <Separator />
        {options.map((option) => (
          <DialogClose key={option.label} asChild>
            <Button
              onClick={option.action}
              variant="link"
              className={cn(
                "w-full justify-start px-0",
                option.variant === "destructive"
                  ? "text-destructive hover:text-destructive/80"
                  : "text-secondary-foreground hover:text-secondary-foreground/80"
              )}
            >
              {option.label}
            </Button>
          </DialogClose>
        ))}
      </DialogContent>
    </Dialog>
  );
}
