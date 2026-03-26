import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LOGGING_HISTORY } from "../domain/history";

const HistoryTabContent = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Recent entries</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm text-muted-foreground">
        {LOGGING_HISTORY.map((entry) => (
          <div key={entry.id} className="rounded-xl border p-3">
            {entry.summary}
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default HistoryTabContent;
