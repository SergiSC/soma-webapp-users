import { CustomLink } from "./link";
import {
  ArrowLeftToLine,
  ArrowRightToLine,
  CalendarIcon,
  HomeIcon,
  ShoppingBasket,
  UserCircleIcon,
} from "lucide-react";
import { useState } from "react";
import { TooltipComponent } from "./tooltip";
import { cn } from "@/lib/utils";
import { Separator } from "@radix-ui/react-separator";
import { usePathname } from "next/navigation";
import { NotificationAlert } from "./notification-alert";
import { useUser } from "@/context/user-context";
import { useIsMobile } from "@/hooks/use-is-mobile";

export function NavBar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const isMobile = useIsMobile();
  return (
    <nav
      className={cn(
        "bg-card sticky bottom-0 p-4 flex flex-row md:flex-col md:border-r-2 md:border-primary",
        !collapsed && !isMobile && "w-[200px]"
      )}
    >
      <ul className="grid grid-cols-[1fr_1fr_1fr_1fr] w-full md:grid-cols-1 md:grid-rows-auto md:gap-4">
        <NavBarHeader collapsed={collapsed} setCollapsed={setCollapsed} />
        {!isMobile && (
          <Separator
            className="w-full h-0.5 bg-primary"
            orientation="vertical"
          />
        )}
        <NavBarItem
          icon={HomeIcon}
          to="/"
          selected={pathname === "/"}
          collapsed={collapsed}
        >
          Inici
        </NavBarItem>

        <NavBarItem
          icon={CalendarIcon}
          to="/timetable"
          selected={pathname.includes("timetable")}
          collapsed={collapsed}
        >
          Horari
        </NavBarItem>

        <NavBarItem
          icon={ShoppingBasket}
          to="/products"
          selected={pathname.includes("products")}
          collapsed={collapsed}
        >
          Tarifes
        </NavBarItem>
      </ul>
    </nav>
  );
}

interface NavBarHeaderProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

function NavBarHeader({ collapsed, setCollapsed }: NavBarHeaderProps) {
  const { user } = useUser();
  const isMobile = useIsMobile();
  const pathname = usePathname();

  return (
    <div
      className={cn(
        "flex items-center justify-center md:justify-between border-primary cursor-pointer",
        collapsed && "justify-center"
      )}
    >
      {!collapsed && (
        <NavBarItem
          to="/me"
          selected={pathname === "/me"}
          collapsed={collapsed}
          icon={UserCircleIcon}
        >
          {isMobile ? "Perfil" : user?.name}
          <NotificationAlert />
        </NavBarItem>
      )}
      {!isMobile && (
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-fit border-light hover:border-primary p-1 rounded-md cursor-pointer"
        >
          {collapsed ? (
            <ArrowRightToLine
              color={"var(--color-primary)"}
              className="hover:path-red-500 min-h-10"
              size={20}
            />
          ) : (
            <ArrowLeftToLine
              color="var(--color-primary)"
              className="min-h-10"
              size={20}
            />
          )}
        </button>
      )}
    </div>
  );
}

interface NavBarItemProps {
  children: React.ReactNode;
  to: string;
  selected: boolean;
  collapsed: boolean;
  icon: React.ElementType;
  className?: string;
}

function NavBarItem({
  children,
  to,
  selected,
  icon,
  collapsed,
  className,
}: NavBarItemProps) {
  const Icon = icon;

  const content = (
    <div
      className={cn("flex flex-col md:flex-row items-center gap-2", className)}
    >
      <Icon className="inline-block" size={20} />
      {!collapsed ? children : null}
    </div>
  );

  return (
    <CustomLink
      to={to}
      className={cn(
        selected && "text-accent",
        !selected && "text-dark-900 hover:text-primary",
        collapsed && "justify-center",
        "flex items-center gap-2 min-h-10 cursor-pointer justify-center md:justify-start"
      )}
    >
      {collapsed ? (
        <TooltipComponent
          tooltipTrigger={<Icon size={20} />}
          tooltipContent={children}
        />
      ) : (
        content
      )}
    </CustomLink>
  );
}
