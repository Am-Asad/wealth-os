import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import AppTopBar from "@/features/shared/ui/AppTopBar";

const BUCKETS = [
  { label: "Needs", used: 62 },
  { label: "Investments", used: 55 },
  { label: "Savings", used: 48 },
  { label: "Charity", used: 36 },
  { label: "Flex", used: 71 },
];

const DashboardPage = () => {
  return (
    <>
      <AppTopBar title="Dashboard" subtitle="Your weekly pulse in one glance" />
      <main className="mx-auto grid w-full max-w-6xl gap-4 p-4 lg:grid-cols-2 lg:p-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Month summary</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {[
              ["Income", "PKR 425,000"],
              ["Expenses", "PKR 268,400"],
              ["Invested", "PKR 71,000"],
              ["Savings rate", "36.8%"],
            ].map(([label, value]) => (
              <div key={label} className="rounded-xl border bg-muted/30 p-3">
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="text-lg font-semibold tracking-tight">{value}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Bucket burn rate</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {BUCKETS.map((bucket) => (
              <div key={bucket.label} className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span>{bucket.label}</span>
                  <span className="text-muted-foreground">{bucket.used}%</span>
                </div>
                <Progress value={bucket.used} />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Active alerts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="rounded-xl border bg-muted/30 p-3">
              FLEX bucket reached 71% with 12 days remaining.
            </div>
            <div className="rounded-xl border bg-muted/30 p-3">
              One recurring item due tomorrow: Netflix subscription.
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Account balances</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {[
              ["UBL", "PKR 152,300", "GENERAL"],
              ["Alfalah", "PKR 319,000", "EMERGENCY_FUND"],
              ["Easypaisa", "PKR 81,200", "INVESTMENT"],
              ["Nayapay", "PKR 28,100", "GENERAL"],
            ].map(([name, balance, purpose]) => (
              <div key={name} className="flex items-center justify-between rounded-xl border p-3">
                <div>
                  <p className="font-medium">{name}</p>
                  <p className="text-xs text-muted-foreground">{purpose}</p>
                </div>
                <p className="font-semibold">{balance}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Goals progress</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              ["Emergency fund", 47],
              ["MacBook Pro", 22],
              ["Murree trip", 61],
            ].map(([goal, progress]) => (
              <div key={goal as string} className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span>{goal as string}</span>
                  <span className="text-muted-foreground">{progress as number}%</span>
                </div>
                <Progress value={progress as number} />
              </div>
            ))}
            <Button className="w-full" variant="outline">
              Quick log
            </Button>
          </CardContent>
        </Card>
      </main>
    </>
  );
};

export default DashboardPage;
