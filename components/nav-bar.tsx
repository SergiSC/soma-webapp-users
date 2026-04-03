import { CustomLink } from "./link";
import {
  CalendarIcon,
  FolderClockIcon,
  ShoppingBasket,
  UserCircleIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";

export function NavBar() {
  const pathname = usePathname();
  return (
    <nav
      className={cn(
        "bg-navbar sticky bottom-0 py-3 md:px-4 flex flex-row md:flex-col md:border-r-2 md:border-primary",
      )}
    >
      <ul className="grid grid-cols-[1fr_1fr_1fr_1fr] w-full md:grid-cols-1 md:grid-rows-auto md:gap-4">
        <NavBarItem
          icon={ShoppingBasket}
          to="/products"
          selected={pathname.includes("products")}
        >
          Tarifes
        </NavBarItem>
        <NavBarItem
          icon={CalendarIcon}
          to="/sessions"
          selected={pathname.includes("sessions")}
        >
          Horari
        </NavBarItem>
        <NavBarItem
          icon={FolderClockIcon}
          to="/reservations"
          selected={pathname.includes("reservations")}
        >
          Reserves
        </NavBarItem>
        <NavBarItem
          to="/me"
          selected={pathname.includes("me")}
          icon={UserCircleIcon}
        >
          Perfil
        </NavBarItem>
      </ul>
    </nav>
  );
}

interface NavBarItemProps {
  children: React.ReactNode;
  to: string;
  selected: boolean;
  icon: React.ElementType;
  className?: string;
}

function NavBarItem({
  children,
  to,
  selected,
  icon,
  className,
}: NavBarItemProps) {
  const Icon = icon;

  const content = (
    <div
      className={cn(
        "flex flex-col md:flex-row md:gap-2 items-center",
        className,
      )}
    >
      <Icon className="inline-block" size={20} />
      {children}
    </div>
  );

  return (
    <CustomLink
      to={to}
      className={cn(
        selected && "text-accent",
        !selected && "text-dark-900 hover:text-primary",
        "flex items-center gap-2 min-h-10 cursor-pointer justify-center md:justify-start",
      )}
    >
      {content}
    </CustomLink>
  );
}
