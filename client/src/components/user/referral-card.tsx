import { useState } from "react";
import { Check, Copy, Share2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useStore } from "@/lib/store";

export function ReferralCard() {
  const { user } = useStore();
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  
  const referralLink = `${window.location.origin}/register?ref=${user?.referralCode}`;
  
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      toast({
        title: "Copied!",
        description: "Referral link copied to clipboard",
        duration: 3000,
      });
      
      setTimeout(() => setCopied(false), 3000);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy to clipboard",
        variant: "destructive",
      });
    }
  };
  
  const shareReferral = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Join GR8F EgertonMarketHub!",
          text: "Use my referral link to get a discount on your first purchase!",
          url: referralLink,
        });
        
        toast({
          title: "Shared!",
          description: "Thank you for sharing your referral link",
        });
      } catch (error) {
        console.error("Error sharing:", error);
      }
    } else {
      copyToClipboard();
    }
  };
  
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle>Refer a Friend</CardTitle>
        <CardDescription>
          Share your unique referral code with friends. Both of you will receive a KSh 500 voucher when they make their first purchase.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col space-y-4">
          <div className="flex flex-col space-y-2">
            <label htmlFor="referral-code" className="text-sm font-medium">
              Your Referral Code
            </label>
            <div className="flex items-center space-x-2">
              <Input
                id="referral-code"
                value={user?.referralCode || ""}
                readOnly
                className="font-medium text-center"
              />
              <Button 
                size="icon" 
                variant="outline" 
                onClick={copyToClipboard}
                aria-label="Copy referral code to clipboard"
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>
          
          <Separator />
          
          <div className="flex flex-col space-y-2">
            <label htmlFor="referral-link" className="text-sm font-medium">
              Your Referral Link
            </label>
            <div className="flex items-center space-x-2">
              <Input
                id="referral-link"
                value={referralLink}
                readOnly
                className="text-xs sm:text-sm"
              />
              <Button 
                size="icon" 
                variant="outline" 
                onClick={copyToClipboard}
                aria-label="Copy referral link to clipboard"
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={shareReferral} 
          className="w-full" 
          variant="default"
        >
          <Share2 className="mr-2 h-4 w-4" />
          Share Your Referral
        </Button>
      </CardFooter>
    </Card>
  );
}