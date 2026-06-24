import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { FileJson, FileText, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function AdminExport() {
  const [entity, setEntity] = useState<string>("users");
  const [range, setRange] = useState<string>("7d");
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const { toast } = useToast();

  const handleExport = async (format: "json" | "pdf") => {
    try {
      setIsExporting(true);
      const url = `/api/admin/export/${entity}?range=${range}&format=${format}`;
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Export failed");
      }

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = `export_${entity}_${range}.${format}`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);

      toast({
        title: "Export Successful",
        description: `Successfully exported ${entity} as ${format.toUpperCase()}`,
      });
    } catch (error: any) {
      toast({
        title: "Export Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Data Export Center</h1>
        <p className="text-muted-foreground">Download raw platform data for external analysis or compliance.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Export Configuration</CardTitle>
          <CardDescription>Select the data entity and time range to export.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Data Entity</label>
              <Select value={entity} onValueChange={setEntity}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Data Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="users">Users & Accounts</SelectItem>
                  <SelectItem value="orders">Audit Orders & Payments</SelectItem>
                  <SelectItem value="reviews">PR Reviews & Analysis</SelectItem>
                  <SelectItem value="logs">System Access Logs</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Time Range</label>
              <Select value={range} onValueChange={setRange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Time Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">Last 7 Days</SelectItem>
                  <SelectItem value="15d">Last 15 Days</SelectItem>
                  <SelectItem value="30d">Last 30 Days</SelectItem>
                  <SelectItem value="all">All Time</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex gap-4">
          <Button 
            variant="outline" 
            className="w-full flex items-center gap-2"
            onClick={() => handleExport("json")}
            disabled={isExporting}
          >
            <FileJson className="w-4 h-4" />
            Export as JSON
          </Button>
          <Button 
            className="w-full flex items-center gap-2"
            onClick={() => handleExport("pdf")}
            disabled={isExporting}
          >
            <FileText className="w-4 h-4" />
            Export as PDF
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
