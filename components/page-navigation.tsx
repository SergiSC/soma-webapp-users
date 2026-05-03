import { JSX } from "react";
import { CustomLink } from "./link";

import { cn } from "@/lib/utils";

interface PageNavigationProps {
  items: PageNavigationItemProps[];
}

export function PageNavigation({ items }: PageNavigationProps) {
  return (
    <nav>
      <ul className="flex flex-col gap-4">
        {items.map((item) => (
          <PageNavigationItem key={item.to} {...item} />
        ))}
      </ul>
    </nav>
  );
}

interface PageNavigationItemProps {
  children: React.ReactNode;
  to: string;
  icon: JSX.Element;
  className?: string;
}

function PageNavigationItem({
  children,
  to,
  icon,
  className,
}: PageNavigationItemProps) {
  return (
    <CustomLink
      to={to}
      className={cn(
        "flex items-center gap-2 min-h-10 cursor-pointer justify-center text-lg font-bold text-primary bg-navbar rounded-lg p-2",
        className,
      )}
    >
      {icon}
      {children}
    </CustomLink>
  );
}
