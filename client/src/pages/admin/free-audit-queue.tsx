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
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar, Save } from "lucide-react";

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

type PromoOffer = {
  id: string;
  name: string;
  startsAt: string;
  endsAt: string;
  status: string;
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

  return <AdminFreeAuditQueueContent data={data!} approveMutation={approveMutation} rejectMutation={rejectMutation} />;
}

function AdminFreeAuditQueueContent({ 
  data, 
  approveMutation, 
  rejectMutation 
}: { 
  data: FreeAuditsResponse, 
  approveMutation: any, 
  rejectMutation: any 
}) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: offer, isLoading: isOfferLoading } = useQuery<PromoOffer | null>({
    queryKey: ["/api/admin/promo-offer"],
  });

  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");

  // Update local state when offer loads
  useEffect(() => {
    if (offer) {
      if (offer.startsAt) setStartsAt(new Date(offer.startsAt).toISOString().slice(0, 16));
      if (offer.endsAt) setEndsAt(new Date(offer.endsAt).toISOString().slice(0, 16));
    } else {
      // Set some defaults if no offer exists
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(9, 0, 0, 0);
      setStartsAt(tomorrow.toISOString().slice(0, 16));
      
      const nextWeek = new Date(tomorrow);
      nextWeek.setDate(nextWeek.getDate() + 7);
      setEndsAt(nextWeek.toISOString().slice(0, 16));
    }
  }, [offer]);

  const updateOfferMutation = useMutation({
    mutationFn: async (values: { startsAt: string, endsAt: string }) => {
      if (!offer?.id) throw new Error("No active offer found");
      const res = await fetch(`/api/admin/promo-offer/${offer.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!res.ok) throw new Error("Failed to update offer");
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Campaign Updated", description: "The promo offer dates have been updated." });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/promo-offer"] });
      queryClient.invalidateQueries({ queryKey: ["/api/public/promo-offer"] });
    },
    onError: (error: any) => {
      toast({ title: "Update Failed", description: error.message, variant: "destructive" });
    }
  });

  const createOfferMutation = useMutation({
    mutationFn: async (values: { startsAt: string, endsAt: string }) => {
      const res = await fetch(`/api/admin/promo-offer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!res.ok) throw new Error("Failed to create offer");
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Campaign Created", description: "A new promo offer has been started." });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/promo-offer"] });
      queryClient.invalidateQueries({ queryKey: ["/api/public/promo-offer"] });
    },
    onError: (error: any) => {
      toast({ title: "Creation Failed", description: error.message, variant: "destructive" });
    }
  });

  const handleSaveOffer = () => {
    if (offer) {
      updateOfferMutation.mutate({ startsAt, endsAt });
    } else {
      createOfferMutation.mutate({ startsAt, endsAt });
    }
  };

  const requests = data?.requests || [];
  const todayCost = data?.todayCost || 0;
  const isCeilingReached = todayCost >= 100;

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Free Audit Queue</h1>
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

      {/* Campaign Settings Card */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            Campaign Settings
          </CardTitle>
          <CardDescription>
            Manage the start and end dates for the active Free Audit promo offer.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isOfferLoading ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading campaign data...
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row items-end gap-4 max-w-2xl">
              <div className="space-y-1.5 w-full sm:w-auto flex-1">
                <Label htmlFor="startsAt" className="text-xs">Start Date & Time</Label>
                <Input 
                  id="startsAt" 
                  type="datetime-local" 
                  value={startsAt}
                  onChange={(e) => setStartsAt(e.target.value)}
                  className="h-9"
                />
              </div>
              <div className="space-y-1.5 w-full sm:w-auto flex-1">
                <Label htmlFor="endsAt" className="text-xs">End Date & Time</Label>
                <Input 
                  id="endsAt" 
                  type="datetime-local" 
                  value={endsAt}
                  onChange={(e) => setEndsAt(e.target.value)}
                  className="h-9"
                />
              </div>
              <Button 
                onClick={handleSaveOffer} 
                disabled={updateOfferMutation.isPending || createOfferMutation.isPending}
                className="w-full sm:w-auto h-9"
              >
                {updateOfferMutation.isPending || createOfferMutation.isPending ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                {offer ? "Save Changes" : "Create Campaign"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

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
