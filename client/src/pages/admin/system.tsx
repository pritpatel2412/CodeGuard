import { useQuery } from "@tanstack/react-query";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Server } from "lucide-react";

export default function AdminSystem() {
  const { data: usageLogs, isLoading } = useQuery<any[]>({
    queryKey: ["/api/admin/system"],
    refetchInterval: 2000,
  });

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center">
          <Server className="mr-2 h-8 w-8 text-green-500" />
          System Health
        </h1>
        <p className="text-muted-foreground">Monitor API usage, errors, and upstream providers.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Upstream Provider Usage</CardTitle>
          <CardDescription>Recent API calls and costs.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Time</TableHead>
                <TableHead>Provider</TableHead>
                <TableHead>Model</TableHead>
                <TableHead>Prompt Tokens</TableHead>
                <TableHead>Completion Tokens</TableHead>
                <TableHead className="text-right">Cost (USD)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {usageLogs?.map((log) => (
                <TableRow key={log.id}>
                  <TableCell>{new Date(log.createdAt).toLocaleString()}</TableCell>
                  <TableCell>{log.provider}</TableCell>
                  <TableCell className="font-mono text-xs">{log.model}</TableCell>
                  <TableCell>{log.tokensIn}</TableCell>
                  <TableCell>{log.tokensOut}</TableCell>
                  <TableCell className="text-right font-mono text-xs">
                    ${Number(log.costUsd).toFixed(4)}
                  </TableCell>
                </TableRow>
              ))}
              {usageLogs?.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    No recent API usage detected.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
