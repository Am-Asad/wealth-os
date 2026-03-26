import { BarChart3, CalendarRange, Home, PlusCircle, Settings } from "lucide-react";

export const ROUTES = {
  NAV_ITEMS: [
    { href: "/dashboard", label: "Dashboard", icon: Home },
    { href: "/log", label: "Log", icon: PlusCircle },
    { href: "/plan", label: "Plan", icon: CalendarRange },
    { href: "/reports", label: "Reports", icon: BarChart3 },
    { href: "/settings", label: "Settings", icon: Settings },
  ],
};
