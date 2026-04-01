"use client";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const sections = [
  { title: "Accounts", href: "/dashboard" },
  { title: "Categories", href: "/dashboard" },
  { title: "Subcategories", href: "/dashboard" },
  { title: "Goals", href: "/dashboard" },
  { title: "Investments", href: "/dashboard" },
  { title: "Recurring rules", href: "/dashboard" },
  { title: "Alert thresholds", href: "/dashboard" },
];

const SettingsWorkspace = () => {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {sections.map((section) => (
        <Link key={section.title} href={section.href}>
          <Card className="h-full transition-colors hover:bg-muted/40">
            <CardHeader>
              <CardTitle className="text-base">{section.title}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Manage {section.title.toLowerCase()}.
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
};

export default SettingsWorkspace;
