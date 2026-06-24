import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, CheckCircle2, XCircle, Search } from "lucide-react";
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

type FreeAuditRequest = {
  id: string;
  repoUrl: string;
  contactName: string;
  contactEmail: string;
  motivationText: string;
  status: string;
  submittedAt: string;
};

type FreeAuditsResponse = {
  requests: FreeAuditRequest[];
  todayCost: number;
};

export default function AdminFreeAuditQueue() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery<FreeAuditsResponse>({
    queryKey: ["/api/admin/free-audits"],
  });

  const approveMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/free-audits/${id}/approve`, {
        method: "POST",
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to approve request");
      }
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Audit Approved", description: "The audit has been started and marked as comped." });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/free-audits"] });
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/free-audits/${id}/reject`, {
        method: "POST",
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to reject request");
      }
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Request Rejected" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/free-audits"] });
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  if (isLoading) {
    return (
      <div className="flex h-[50vh] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const requests = data?.requests || [];
  const todayCost = data?.todayCost || 0;
  const isCeilingReached = todayCost >= 100;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Free Audit Queue</h2>
          <p className="text-muted-foreground">
            Review and approve requests submitted via the public free audit offer.
          </p>
        </div>
        <div className="text-right">
          <Badge variant={isCeilingReached ? "destructive" : "secondary"} className="text-base px-3 py-1">
            Today's API Cost: ${todayCost.toFixed(2)} / $100.00
          </Badge>
        </div>
      </div>

      {isCeilingReached && (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive rounded-md p-4 flex items-start gap-3 text-left">
          <XCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <p className="text-sm">
            <strong>Daily cost ceiling reached.</strong> You cannot approve new free audits until tomorrow or unless the limit is increased.
          </p>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Pending Requests</CardTitle>
          <CardDescription>
            {requests.length === 0 ? "No pending requests at the moment." : `Found ${requests.length} pending request(s).`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Repository</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead className="max-w-[300px]">Motivation</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requests.map((req) => (
                  <TableRow key={req.id}>
                    <TableCell className="whitespace-nowrap">
                      {format(new Date(req.submittedAt), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell className="font-mono text-sm max-w-[200px] truncate" title={req.repoUrl}>
                      <a href={req.repoUrl} target="_blank" rel="noreferrer" className="text-primary hover:underline">
                        {req.repoUrl.replace(/^https?:\/\/(www\.)?github\.com\//, "")}
                      </a>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm font-medium">{req.contactName}</div>
                      <div className="text-xs text-muted-foreground">{req.contactEmail}</div>
                    </TableCell>
                    <TableCell className="max-w-[300px]">
                      <p className="text-sm truncate" title={req.motivationText}>
                        {req.motivationText}
                      </p>
                    </TableCell>
                    <TableCell className="text-right whitespace-nowrap">
                      <div className="flex justify-end gap-2">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="text-green-600 hover:text-green-700 hover:bg-green-50"
                          onClick={() => approveMutation.mutate(req.id)}
                          disabled={approveMutation.isPending || rejectMutation.isPending || isCeilingReached}
                        >
                          {approveMutation.isPending && approveMutation.variables === req.id ? (
                            <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                          ) : (
                            <CheckCircle2 className="mr-1 h-3 w-3" />
                          )}
                          Approve
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => rejectMutation.mutate(req.id)}
                          disabled={approveMutation.isPending || rejectMutation.isPending}
                        >
                          {rejectMutation.isPending && rejectMutation.variables === req.id ? (
                            <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                          ) : (
                            <XCircle className="mr-1 h-3 w-3" />
                          )}
                          Reject
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {requests.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                      No pending requests found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
