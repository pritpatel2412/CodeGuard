import { useQuery } from "@tanstack/react-query";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, FileText } from "lucide-react";

export default function AdminAuditLog() {
  const { data: logs, isLoading } = useQuery<any[]>({
    queryKey: ["/api/admin/audit-log"],
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
          <FileText className="mr-2 h-8 w-8 text-orange-500" />
          Audit Log
        </h1>
        <p className="text-muted-foreground">Immutable trail of administrative actions.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Actions</CardTitle>
          <CardDescription>Actions performed by administrators.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Time</TableHead>
                <TableHead>Admin</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Target ID</TableHead>
                <TableHead>Changes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs?.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="whitespace-nowrap">{new Date(log.timestamp).toLocaleString()}</TableCell>
                  <TableCell className="font-medium">{log.adminUsername || "Unknown"}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{log.actionType}</Badge>
                  </TableCell>
                  <TableCell className="font-mono text-xs">{log.targetId}</TableCell>
                  <TableCell className="text-xs">
                    {log.beforeState && log.afterState ? (
                      <div className="flex flex-col space-y-1">
                        <span className="text-red-500 line-through">
                          {JSON.stringify(log.beforeState)}
                        </span>
                        <span className="text-green-500">
                          {JSON.stringify(log.afterState)}
                        </span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">No data</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {logs?.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                    No admin actions recorded yet.
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
