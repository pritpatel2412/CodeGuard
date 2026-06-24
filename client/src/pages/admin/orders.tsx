import { useQuery, useMutation } from "@tanstack/react-query";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Loader2 } from "lucide-react";

export default function AdminOrders() {
  const { toast } = useToast();
  
  const { data: orders, isLoading } = useQuery<any[]>({
    queryKey: ["/api/admin/orders"],
    refetchInterval: 2000,
  });

  const changeStatusMutation = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string, status: string }) => {
      const res = await apiRequest("POST", `/api/admin/orders/${orderId}/status`, { status });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/orders"] });
      toast({ title: "Order status updated", description: "The order status has been updated successfully." });
    },
    onError: (error: Error) => {
      toast({ title: "Update failed", description: error.message, variant: "destructive" });
    }
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
        <h1 className="text-3xl font-bold tracking-tight">Audit Orders</h1>
        <p className="text-muted-foreground">Manage and mark audit orders as paid to unlock reports.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
          <CardDescription>Viewing the most recent 100 audit orders.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Repository</TableHead>
                <TableHead>Tier</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders?.map((o) => (
                <TableRow key={o.id}>
                  <TableCell className="whitespace-nowrap">{new Date(o.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell className="font-medium">{o.username || "Unknown"}</TableCell>
                  <TableCell className="max-w-[200px] truncate">{o.repositoryUrl}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{o.tierId}</Badge>
                  </TableCell>
                  <TableCell>${o.priceUsd}</TableCell>
                  <TableCell>
                    <Badge variant={
                      o.status === "marked_paid_manually" || o.status === "comped" ? "default" : "secondary"
                    }>
                      {o.status.replace(/_/g, " ")}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Select 
                      defaultValue={o.status} 
                      onValueChange={(val) => changeStatusMutation.mutate({ orderId: o.id, status: val })}
                      disabled={changeStatusMutation.isPending}
                    >
                      <SelectTrigger className="w-[160px] ml-auto h-8 text-xs">
                        <SelectValue placeholder="Update status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending_payment">Pending Payment</SelectItem>
                        <SelectItem value="marked_paid_manually">Marked Paid</SelectItem>
                        <SelectItem value="comped">Comped</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                </TableRow>
              ))}
              {orders?.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                    No orders found.
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
