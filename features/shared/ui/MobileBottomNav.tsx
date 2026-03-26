"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ROUTES } from "@/lib/routes";
import { cn } from "@/lib/utils";

const MobileBottomNav = () => {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/90 px-2 pb-[max(env(safe-area-inset-bottom),0.35rem)] pt-1.5 backdrop-blur supports-backdrop-filter:bg-background/75 lg:hidden">
      <ul className="grid grid-cols-5 gap-1">
        {ROUTES.NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 rounded-lg py-2 text-[11px] transition-colors",
                  active
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted",
                )}
              >
                <Icon className="size-4" />
                <span>{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

export default MobileBottomNav;
