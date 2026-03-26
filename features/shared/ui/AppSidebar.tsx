"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { ROUTES } from "@/lib/routes";
import { cn } from "@/lib/utils";

const AppSidebar = () => {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 hidden h-svh w-72 border-r bg-background/80 p-4 backdrop-blur supports-backdrop-filter:bg-background/60 lg:flex lg:flex-col">
      <h1 className="text-xl uppercase font-semibold -tight mb-6">Wealth OS</h1>

      <nav className="flex flex-1 flex-col gap-1">
        {ROUTES.NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors",
                active
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <Icon className="size-4" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-6 flex items-center justify-between rounded-xl border bg-muted/40 p-3">
        <div className="text-xs text-muted-foreground">
          <p>Signed in</p>
          <p className="font-medium text-foreground">Manage profile</p>
        </div>
        <UserButton />
      </div>
    </aside>
  );
};

export default AppSidebar;
