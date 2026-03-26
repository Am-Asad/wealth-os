import AppTopBar from "@/features/shared/ui/AppShell/AppTopBar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function RecurringRulesPage() {
  return (
    <>
      <AppTopBar title="Recurring rules" subtitle="Automate recurring financial events" />
      <main className="mx-auto w-full max-w-5xl p-4 lg:p-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Configured rules</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {[
              ["Meezan SIP", "MONTHLY", "ACTIVE"],
              ["Netflix", "MONTHLY", "ACTIVE"],
              ["House Rent", "MONTHLY", "PAUSED"],
            ].map(([name, frequency, status]) => (
              <div key={name} className="flex items-center justify-between rounded-xl border p-3">
                <div>
                  <p className="font-medium">{name}</p>
                  <p className="text-xs text-muted-foreground">{frequency}</p>
                </div>
                <Badge variant={status === "ACTIVE" ? "default" : "outline"}>{status}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </main>
    </>
  );
}
