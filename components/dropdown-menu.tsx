import {
  DropdownMenuLabel,
  type DropdownMenuProps,
} from "@radix-ui/react-dropdown-menu";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

interface DropdownMenuComponentProps
  extends React.ComponentProps<React.FC<DropdownMenuProps>> {
  trigger: React.ReactNode;
  title: string;
  items: {
    title: string;
    onClick: () => void;
  }[];
}

export function DropdownMenuComponent({
  trigger,
  title,
  items,
  ...props
}: DropdownMenuComponentProps) {
  return (
    <DropdownMenu {...props}>
      <DropdownMenuTrigger
        asChild
        className="cursor-pointer hover:bg-primary rounded-full p-1"
      >
        {trigger}
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        sideOffset={10}
        className="bg-primary-foreground"
      >
        <DropdownMenuLabel className="pl-1 text-sm text-sidebar-ring">
          {title}
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-primary" />
        {items.map((item) => (
          <DropdownMenuItem
            key={item.title}
            onClick={item.onClick}
            className="text-sm focus:bg-primary focus:text-primary-foreground cursor-pointer"
          >
            {item.title}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
