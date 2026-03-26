import AppTopBar from "@/features/shared/ui/AppShell/AppTopBar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function ThresholdsPage() {
  return (
    <>
      <AppTopBar title="Alert thresholds" subtitle="Configure warning levels and limits" />
      <main className="mx-auto w-full max-w-4xl p-4 lg:p-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Threshold configuration</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Budget warning percentage</Label>
              <Input defaultValue="80" />
            </div>
            <div className="space-y-1.5">
              <Label>Large expense threshold (minor units)</Label>
              <Input defaultValue="800000" />
            </div>
            <Button className="md:col-span-2">Save thresholds</Button>
          </CardContent>
        </Card>
      </main>
    </>
  );
}
