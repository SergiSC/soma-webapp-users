"use client";

import { DropdownMenuComponent } from "./dropdown-menu";
import { EllipsisVerticalIcon } from "lucide-react";
import { NavBar } from "./nav-bar";
import { useIsMobile } from "@/hooks/use-is-mobile";

export interface PageSkeletonProps {
  title: string;
  description?: string;
  sections: {
    title?: string;
    content: React.ReactNode;
  }[];
  actions?: {
    title: string;
    onClick: () => void;
  }[];
}

export function PageSkeleton({
  title,
  description,
  sections,
  actions,
}: PageSkeletonProps) {
  const sectionsLength = Array.from(
    { length: sections.length },
    () => "auto"
  ).join("_");

  const isMobile = useIsMobile();

  return (
    <main className="grid grid-rows-[1fr_auto] md:grid-cols-[auto_1fr] h-screen">
      {isMobile ? null : <NavBar />}
      <div className="grid gap-8 grid-rows-[auto_1fr] pt-8 mb-8 pl-8 pr-12 max-h-dvh overflow-y-hidden">
        <header>
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-primary">{title}</h1>
            {actions && (
              <DropdownMenuComponent
                trigger={<EllipsisVerticalIcon size={30} />}
                title="Accions"
                items={actions}
              />
            )}
          </div>
          {description && (
            <p className="text-sm text-dark-400">{description}</p>
          )}
        </header>
        <div
          className={`grid gap-4 grid-rows-[${sectionsLength}] overflow-y-scroll`}
        >
          {sections.map((section, index) => (
            <section key={`section-${index}`} className="h-min">
              {section.title && (
                <h2 className="text-lg font-bold text-dark-600">
                  {section.title}
                </h2>
              )}
              {section.content}
            </section>
          ))}
        </div>
      </div>
      {isMobile ? <NavBar /> : null}
    </main>
  );
}
