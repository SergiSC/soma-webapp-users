"use client";

import { DropdownMenuComponent } from "./dropdown-menu";
import { EllipsisVerticalIcon } from "lucide-react";
import { NavBar } from "./nav-bar";
import { useIsMobile } from "@/hooks/use-is-mobile";

export interface PageSkeletonProps {
  title: string;
  description?: string | React.ReactNode;
  sections: {
    title?: string;
    action?: React.ReactNode;
    content: React.ReactNode;
  }[];
  actions?:
    | {
        title: string;
        onClick: () => void;
      }[]
    | React.ReactNode;
}

export function PageSkeleton({
  title,
  description,
  sections,
  actions,
}: PageSkeletonProps) {
  const isMobile = useIsMobile();

  return (
    <main className="grid grid-rows-[1fr_auto] md:grid-cols-[auto_1fr] h-screen">
      {isMobile ? null : <NavBar />}
      <div className="grid gap-4 md:gap-8 grid-rows-[auto_1fr] p-8 pb-0  mb-0 md:pr-12 max-h-dvh overflow-y-hidden">
        <header>
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-primary">{title}</h1>
            {Array.isArray(actions) ? (
              <DropdownMenuComponent
                trigger={<EllipsisVerticalIcon size={30} />}
                title="Accions"
                items={actions}
              />
            ) : (
              actions
            )}
          </div>
          {description &&
            (typeof description === "string" ? (
              <p className="text-sm text-dark-400">{description}</p>
            ) : (
              description
            ))}
        </header>
        <div
          className={`flex flex-col gap-8 overflow-y-scroll [scrollbar-width:none] [&::-webkit-scrollbar]:hidden`}
        >
          {sections.map((section, index) => (
            <section
              key={`section-${index}`}
              className={`h-min space-y-2 ${
                index === sections.length - 1 ? "mb-4" : ""
              }`}
            >
              {(section.title || section.action) && (
                <div className="flex items-center justify-between">
                  {section.title && (
                    <h2 className="text-lg font-bold text-dark-600">
                      {section.title}
                    </h2>
                  )}
                  {section.action}
                </div>
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
