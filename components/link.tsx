import Link from "next/link";
import { cn } from "@/lib/utils";

type CustomLinkProps = React.PropsWithChildren<
  React.AnchorHTMLAttributes<HTMLAnchorElement>
> & {
  to: string;
};

export function CustomLink({
  children,
  className,
  to,
  ...props
}: CustomLinkProps) {
  return (
    <Link
      href={to}
      {...props}
      className={cn(
        "text-primary hover:text-primary-dark cursor-pointer hover:underline",
        className
      )}
    >
      {children}
    </Link>
  );
}
