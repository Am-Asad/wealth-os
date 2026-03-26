"use client";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const sections = [
  { title: "Accounts", href: "/setup" },
  { title: "Categories", href: "/setup" },
  { title: "Subcategories", href: "/setup" },
  { title: "Goals", href: "/settings/goals" },
  { title: "Investments", href: "/settings/investments" },
  { title: "Recurring rules", href: "/settings/recurring" },
  { title: "Alert thresholds", href: "/settings/thresholds" },
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
