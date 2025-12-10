import { useQuery, useMutation } from "@tanstack/react-query";
import { FolderGit2, Plus } from "lucide-react";
import { RepositoryCard } from "@/components/repository-card";
import { EmptyState } from "@/components/empty-state";
import { RepositoryCardSkeleton } from "@/components/loading-skeleton";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { Repository } from "@shared/schema";

const addRepoSchema = z.object({
  owner: z.string().min(1, "Owner is required"),
  name: z.string().min(1, "Repository name is required"),
  platform: z.enum(["github", "gitlab"]),
});

type AddRepoForm = z.infer<typeof addRepoSchema>;

export default function Repositories() {
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  const { data: repositories, isLoading } = useQuery<Repository[]>({
    queryKey: ["/api/repositories"],
  });

  const form = useForm<AddRepoForm>({
    resolver: zodResolver(addRepoSchema),
    defaultValues: {
      owner: "",
      name: "",
      platform: "github",
    },
  });

  const addMutation = useMutation({
    mutationFn: async (data: AddRepoForm) => {
      return apiRequest("POST", "/api/repositories", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/repositories"] });
      setIsOpen(false);
      form.reset();
      toast({
        title: "Repository added",
        description: "The repository has been added successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to add repository",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      return apiRequest("PATCH", `/api/repositories/${id}`, { isActive });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/repositories"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/repositories/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/repositories"] });
      toast({
        title: "Repository removed",
        description: "The repository has been removed successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to remove repository",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: AddRepoForm) => {
    addMutation.mutate(data);
  };

  const getWebhookUrl = (repo: Repository) => {
    const baseUrl = window.location.origin;
    return `${baseUrl}/api/webhooks/${repo.platform}/${repo.id}`;
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Repositories</h1>
          <p className="text-sm text-muted-foreground">
            Manage repositories connected to AI code review
          </p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-add-repo">
              <Plus className="h-4 w-4 mr-2" />
              Add Repository
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Repository</DialogTitle>
              <DialogDescription>
                Connect a GitHub or GitLab repository to enable AI-powered code reviews.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="platform"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Platform</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-platform">
                            <SelectValue placeholder="Select platform" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="github">GitHub</SelectItem>
                          <SelectItem value="gitlab">GitLab</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="owner"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Owner / Organization</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="e.g., facebook" 
                          {...field} 
                          data-testid="input-repo-owner"
                        />
                      </FormControl>
                      <FormDescription>
                        The username or organization that owns the repository
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Repository Name</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="e.g., react" 
                          {...field}
                          data-testid="input-repo-name"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex justify-end gap-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={addMutation.isPending}
                    data-testid="button-submit-repo"
                  >
                    {addMutation.isPending ? "Adding..." : "Add Repository"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2">
          <RepositoryCardSkeleton />
          <RepositoryCardSkeleton />
        </div>
      ) : repositories?.length === 0 ? (
        <EmptyState
          icon={FolderGit2}
          title="No repositories connected"
          description="Add a GitHub or GitLab repository to start receiving AI-powered code reviews on your pull requests."
          action={{
            label: "Add Repository",
            onClick: () => setIsOpen(true),
          }}
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {repositories?.map((repo) => (
            <RepositoryCard
              key={repo.id}
              repository={repo}
              webhookUrl={getWebhookUrl(repo)}
              onToggleActive={(id, isActive) => toggleMutation.mutate({ id, isActive })}
              onDelete={(id) => deleteMutation.mutate(id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
