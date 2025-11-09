import { CustomLink } from "./link";
import {
  ArrowLeftToLine,
  ArrowRightToLine,
  CalendarIcon,
  EuroIcon,
  HomeIcon,
  UserCircleIcon,
  UsersIcon,
  CalendarDays,
} from "lucide-react";
import { useState } from "react";
import { TooltipComponent } from "./tooltip";
import { cn } from "@/lib/utils";
import { Separator } from "@radix-ui/react-separator";
import { usePathname } from "next/navigation";
import { LogoutButton } from "./logout-button";
import { NotificationAlert } from "./notification-alert";
import { useUser } from "@/context/user-context";

export function NavBar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  return (
    <nav
      className={cn(
        "bg-light p-4 flex flex-col border-r-2 border-primary",
        !collapsed && "w-[200px]"
      )}
    >
      <NavBarHeader collapsed={collapsed} setCollapsed={setCollapsed} />
      <Separator className="w-full h-0.5 bg-primary" />
      <ul className="grid gap-4 pt-4">
        <NavBarItem
          icon={HomeIcon}
          to="/"
          selected={pathname === "/"}
          collapsed={collapsed}
        >
          Dashboard
        </NavBarItem>
        <NavBarItem
          icon={EuroIcon}
          to="/finance"
          selected={pathname.includes("finance")}
          collapsed={collapsed}
        >
          Finances
        </NavBarItem>
        <NavBarItem
          icon={UsersIcon}
          to="/clients"
          selected={pathname.includes("clients")}
          collapsed={collapsed}
        >
          Clients
        </NavBarItem>
        <NavBarItem
          icon={CalendarIcon}
          to="/time-table"
          selected={pathname.includes("time-table")}
          collapsed={collapsed}
        >
          Horari
        </NavBarItem>
        <NavBarItem
          icon={CalendarDays}
          to="/calendar"
          selected={pathname.includes("calendar")}
          collapsed={collapsed}
        >
          Calendar
        </NavBarItem>
      </ul>
      <div className="mt-auto flex justify-center">
        <LogoutButton />
      </div>
    </nav>
  );
}

interface NavBarHeaderProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

function NavBarHeader({ collapsed, setCollapsed }: NavBarHeaderProps) {
  const { user } = useUser();

  return (
    <div className="flex items-center justify-between border-primary pb-4 cursor-pointer">
      {!collapsed && (
        <NavBarItem
          to={`/me/${user?.id}`}
          selected={false}
          collapsed={collapsed}
          icon={UserCircleIcon}
        >
          Sergi
          <NotificationAlert />
        </NavBarItem>
      )}
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
    <div className={cn("flex items-center gap-2", className)}>
      <Icon className="inline-block" size={20} />
      {!collapsed && children}
    </div>
  );

  return (
    <CustomLink
      to={to}
      className={cn(
        selected && "text-primary underline",
        !selected && "text-dark-900 hover:text-primary",
        "flex items-center gap-2 min-h-10 cursor-pointer"
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
