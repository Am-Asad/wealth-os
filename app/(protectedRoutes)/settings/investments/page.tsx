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

export default function InvestmentsPage() {
  return (
    <>
      <AppTopBar title="Investments" subtitle="Contribution and market value tracking" />
      <main className="mx-auto w-full max-w-5xl p-4 lg:p-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Investment portfolio</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Contributed</TableHead>
                  <TableHead>Current value</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>Meezan Islamic Fund</TableCell>
                  <TableCell>MUTUAL_FUND</TableCell>
                  <TableCell>PKR 310,000</TableCell>
                  <TableCell>PKR 338,000</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
    </>
  );
}
