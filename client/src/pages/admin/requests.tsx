import { useQuery } from "@tanstack/react-query";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Activity } from "lucide-react";
import { ScatterChart, Scatter, XAxis, YAxis, ZAxis, Tooltip, ResponsiveContainer } from "recharts";

export default function AdminRequests() {
  const { data: requests, isLoading } = useQuery<any[]>({
    queryKey: ["/api/admin/requests"],
    refetchInterval: 3000, // Poll every 3 seconds
  });

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Group requests by region for a simple visualization
  const regionCounts: Record<string, number> = {};
  requests?.forEach((req) => {
    const r = req.geoRegion || "Unknown";
    regionCounts[r] = (regionCounts[r] || 0) + 1;
  });

  const scatterData = Object.entries(regionCounts).map(([region, count], i) => ({
    region,
    count,
    x: i,
    y: Math.random() * 100, // Random scatter for visualization purpose
  }));

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center">
          <Activity className="mr-2 h-8 w-8 text-blue-500" />
          Live Request Logs
        </h1>
        <p className="text-muted-foreground">Real-time HTTP request telemetry with masked IPs.</p>
      </div>

      <div className="grid gap-8 md:grid-cols-3">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Regional Density</CardTitle>
            <CardDescription>Traffic distributed by region.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
                  <XAxis dataKey="x" type="number" hide />
                  <YAxis dataKey="y" type="number" hide />
                  <ZAxis dataKey="count" range={[50, 400]} />
                  <Tooltip 
                    cursor={{ strokeDasharray: '3 3' }} 
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-background border rounded-lg shadow-lg p-3 text-sm">
                            <p className="font-semibold">{payload[0].payload.region}</p>
                            <p className="text-muted-foreground">{payload[0].payload.count} requests</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Scatter data={scatterData} fill="#3b82f6" />
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Recent Traffic</CardTitle>
            <CardDescription>The last 100 HTTP requests.</CardDescription>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Time</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Path</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>IP (Masked)</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Latency</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requests?.map((req) => (
                  <TableRow key={req.id}>
                    <TableCell className="whitespace-nowrap">{new Date(req.timestamp).toLocaleTimeString()}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={
                        req.method === "GET" ? "text-green-500" : 
                        req.method === "POST" ? "text-blue-500" : "text-yellow-500"
                      }>
                        {req.method}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-xs max-w-[200px] truncate">{req.path}</TableCell>
                    <TableCell>
                      <Badge variant={req.statusCode >= 400 ? "destructive" : "secondary"}>
                        {req.statusCode}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-xs">{req.ipAddress}</TableCell>
                    <TableCell className="text-xs truncate max-w-[150px]">
                      {req.geoCity ? `${req.geoCity}, ${req.geoRegion}` : "Unknown"}
                    </TableCell>
                    <TableCell className="text-xs">{req.responseTimeMs}ms</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
