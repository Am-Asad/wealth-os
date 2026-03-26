"use client";
import { LOGGING_ACTIONS } from "../domain/actions";
import { LOGGING_HISTORY } from "../domain/history";
import { useLoggingStore } from "../application/state/useLoggingStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ActionSheet from "./ActionSheet";

const LoggingWorkspace = () => {
  const open = useLoggingStore((s) => s.open);

  return (
    <div>
      <Tabs defaultValue="actions" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 lg:w-80">
          <TabsTrigger value="actions">Actions</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="actions">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Choose an action</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-2 sm:grid-cols-2">
              {LOGGING_ACTIONS.map((action) => (
                <button
                  key={action.id}
                  type="button"
                  onClick={() => open(action.id)}
                  className="rounded-xl border bg-muted/30 p-3 text-left transition-colors hover:bg-muted"
                >
                  <p className="font-medium">{action.title}</p>
                  <p className="text-xs text-muted-foreground">{action.description}</p>
                </button>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
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
        </TabsContent>
      </Tabs>
      <ActionSheet />
    </div>
  );
};

export default LoggingWorkspace;
