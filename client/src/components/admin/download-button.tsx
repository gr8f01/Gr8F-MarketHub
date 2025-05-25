import { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

export function DownloadButton() {
  const [isDownloading, setIsDownloading] = useState(false);
  const { toast } = useToast();

  // Get all the necessary data for download
  const { data: products } = useQuery({
    queryKey: ['/api/products'],
  });
  
  const { data: categories } = useQuery({
    queryKey: ['/api/categories'],
  });
  
  const { data: orders } = useQuery({
    queryKey: ['/api/orders'],
  });
  
  const { data: users } = useQuery({
    queryKey: ['/api/users'],
  });

  const { data: settings } = useQuery({
    queryKey: ['/api/settings'],
  });

  const downloadProjectData = () => {
    setIsDownloading(true);
    
    try {
      // Create a download link to our server-side endpoint
      const link = document.createElement("a");
      link.href = "/api/download";
      
      // Set attributes for download
      link.download = `gr8f-markethub-data-${new Date().toISOString().split('T')[0]}.json`;
      link.target = "_blank";
      
      // Append to document, click, then remove
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "Download initiated",
        description: "Project data is being downloaded",
      });
    } catch (error) {
      console.error("Download error:", error);
      toast({
        title: "Download failed",
        description: "There was an error downloading the project data",
        variant: "destructive"
      });
    } finally {
      setIsDownloading(false);
    }
  };
  
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={downloadProjectData}
      disabled={isDownloading}
    >
      {isDownloading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Downloading...
        </>
      ) : (
        <>
          <Download className="mr-2 h-4 w-4" />
          Download Project
        </>
      )}
    </Button>
  );
}