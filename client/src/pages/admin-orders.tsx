import { useQuery, useMutation } from "@tanstack/react-query";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, DollarSign, CheckCircle, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

export default function AdminOrdersPage() {
  const { toast } = useToast();

  const { data: orders, isLoading } = useQuery<any[]>({
    queryKey: ["/api/orders/admin"],
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const res = await apiRequest("POST", `/api/orders/admin/${id}/status`, { status });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders/admin"] });
      toast({
        title: "Order Updated",
        description: "The order status has been updated successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update order",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const getTotalRevenue = () => {
    if (!orders) return 0;
    return orders
      .filter(o => o.status === "marked_paid_manually")
      .reduce((sum, o) => sum + o.priceUsd, 0);
  };

  const getPendingRevenue = () => {
    if (!orders) return 0;
    return orders
      .filter(o => o.status === "pending_payment")
      .reduce((sum, o) => sum + o.priceUsd, 0);
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Audit Orders (Admin)</h1>
        <p className="text-muted-foreground">
          Manage audit readiness report invoices and payments.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue (Recognized)</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${getTotalRevenue().toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${getPendingRevenue().toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{orders?.length || 0}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
          <CardDescription>All audit orders across the platform.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Repository</TableHead>
                    <TableHead>Tier</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders && orders.length > 0 ? (
                    orders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="py-3 text-sm">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="py-3">
                          <div className="font-medium">{order.userData?.username}</div>
                          <div className="text-xs text-muted-foreground">{order.userData?.email}</div>
                        </TableCell>
                        <TableCell className="py-3">
                          {order.auditData?.repositoryUrl.split('/').slice(-2).join('/')}
                        </TableCell>
                        <TableCell className="py-3 capitalize">
                          {order.tierId}
                        </TableCell>
                        <TableCell className="py-3 font-medium">
                          ${order.priceUsd.toLocaleString()}
                        </TableCell>
                        <TableCell className="py-3">
                          <Badge variant={
                            order.status === 'marked_paid_manually' ? 'default' : 
                            order.status === 'comped' ? 'secondary' : 
                            'outline'
                          }>
                            {order.status.replace(/_/g, ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell className="py-3 text-right">
                          <div className="flex justify-end gap-2">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => updateStatusMutation.mutate({ id: order.id, status: "marked_paid_manually" })}
                              disabled={updateStatusMutation.isPending || order.status === "marked_paid_manually"}
                            >
                              Mark Paid
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => updateStatusMutation.mutate({ id: order.id, status: "comped" })}
                              disabled={updateStatusMutation.isPending || order.status === "comped"}
                            >
                              Comp
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        No orders found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
