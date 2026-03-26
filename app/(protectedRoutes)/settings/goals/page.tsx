import AppTopBar from "@/features/shared/ui/AppShell/AppTopBar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function GoalsPage() {
  return (
    <>
      <AppTopBar title="Goals" subtitle="Track savings targets and progress" />
      <main className="mx-auto w-full max-w-5xl p-4 lg:p-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Financial goals</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Target</TableHead>
                  <TableHead>Progress</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>Emergency Fund</TableCell>
                  <TableCell>EMERGENCY_FUND</TableCell>
                  <TableCell>PKR 900,000</TableCell>
                  <TableCell>47%</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
    </>
  );
}
