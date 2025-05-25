import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useStore } from "@/lib/store";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import AdminLayout from "@/components/layout/admin-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Gift, 
  CreditCard, 
  ShoppingBag, 
  RefreshCw, 
  Save, 
  Loader2 
} from "lucide-react";

export default function AdminSettings() {
  const [location, navigate] = useLocation();
  const { toast } = useToast();
  const { user, isAuthenticated, isLoading } = useStore();
  const queryClient = useQueryClient();
  
  // Settings state
  const [referralSettings, setReferralSettings] = useState({
    REFERRAL_COUNT: "3",
    VOUCHER_AMOUNT: "500",
    VOUCHER_EXPIRY_DAYS: "30"
  });
  
  const [paymentSettings, setPaymentSettings] = useState({
    PAYMENT_MPESA: "true",
    PAYMENT_BANK: "true",
    PAYMENT_CARD: "true"
  });
  
  // Get all settings
  const { data: settings, isLoading: settingsLoading } = useQuery({
    queryKey: ['/api/settings'],
    enabled: !!isAuthenticated && !!user?.isAdmin,
    onSuccess: (data) => {
      // Initialize state from fetched settings
      const refSettings: {[key: string]: string} = {};
      const paySettings: {[key: string]: string} = {};
      
      data.forEach((setting: any) => {
        if (setting.key.startsWith('REFERRAL_') || setting.key.startsWith('VOUCHER_')) {
          refSettings[setting.key] = setting.value;
        } else if (setting.key.startsWith('PAYMENT_')) {
          paySettings[setting.key] = setting.value;
        }
      });
      
      setReferralSettings(prev => ({ ...prev, ...refSettings }));
      setPaymentSettings(prev => ({ ...prev, ...paySettings }));
    }
  });
  
  // Update setting mutation
  const updateSettingMutation = useMutation({
    mutationFn: ({ key, value }: { key: string, value: string }) => 
      apiRequest('PUT', `/api/settings/${key}`, { value }),
    onSuccess: (_, variables) => {
      // Update the query cache
      queryClient.invalidateQueries({ queryKey: ['/api/settings'] });
      
      toast({
        title: "Setting updated",
        description: `Successfully updated ${variables.key.replace(/_/g, ' ').toLowerCase()}`
      });
    },
    onError: (error, variables) => {
      console.error(`Error updating setting ${variables.key}:`, error);
      toast({
        title: "Update failed",
        description: `Failed to update ${variables.key.replace(/_/g, ' ').toLowerCase()}`,
        variant: "destructive"
      });
    }
  });
  
  // Redirect if not authenticated or not admin
  useEffect(() => {
    if (!isLoading && (!isAuthenticated || !user?.isAdmin)) {
      toast({
        title: "Access denied",
        description: "You don't have permission to access this page",
        variant: "destructive"
      });
      navigate("/");
    }
  }, [isAuthenticated, isLoading, user, navigate, toast]);
  
  // Handle form submission for referral settings
  const handleReferralSettingsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Update each setting one by one
      for (const [key, value] of Object.entries(referralSettings)) {
        await updateSettingMutation.mutateAsync({ key, value });
      }
    } catch (error) {
      console.error("Error saving referral settings:", error);
    }
  };
  
  // Handle payment method toggle
  const handlePaymentToggle = async (key: string, checked: boolean) => {
    const value = checked.toString();
    setPaymentSettings(prev => ({ ...prev, [key]: value }));
    await updateSettingMutation.mutateAsync({ key, value });
  };
  
  // Handle input change for referral settings
  const handleReferralInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setReferralSettings(prev => ({ ...prev, [name]: value }));
  };
  
  if (isLoading || !isAuthenticated || !user?.isAdmin) {
    return null; // Redirect handled in useEffect
  }
  
  return (
    <AdminLayout title="Settings">
      <Tabs defaultValue="referral" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="referral" className="flex items-center">
            <Gift className="mr-2 h-4 w-4" />
            Referral Program
          </TabsTrigger>
          <TabsTrigger value="payment" className="flex items-center">
            <CreditCard className="mr-2 h-4 w-4" />
            Payment Methods
          </TabsTrigger>
          <TabsTrigger value="store" className="flex items-center">
            <ShoppingBag className="mr-2 h-4 w-4" />
            Store Settings
          </TabsTrigger>
          <TabsTrigger value="system" className="flex items-center">
            <RefreshCw className="mr-2 h-4 w-4" />
            System
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="referral">
          <Card>
            <CardHeader>
              <CardTitle>Referral Program Settings</CardTitle>
              <CardDescription>
                Configure how the student referral program works
              </CardDescription>
            </CardHeader>
            <CardContent>
              {settingsLoading ? (
                <div className="flex justify-center items-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-[#0B4619]" />
                  <span className="ml-2">Loading settings...</span>
                </div>
              ) : (
                <form onSubmit={handleReferralSettingsSubmit}>
                  <div className="grid gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="REFERRAL_COUNT">Referrals Required for Reward</Label>
                      <Input 
                        id="REFERRAL_COUNT"
                        name="REFERRAL_COUNT"
                        type="number"
                        value={referralSettings.REFERRAL_COUNT}
                        onChange={handleReferralInputChange}
                        min="1"
                      />
                      <p className="text-sm text-gray-500">
                        Number of successful referrals a student needs to make to earn a voucher
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="VOUCHER_AMOUNT">Voucher Amount (KSh)</Label>
                      <Input 
                        id="VOUCHER_AMOUNT"
                        name="VOUCHER_AMOUNT"
                        type="number"
                        value={referralSettings.VOUCHER_AMOUNT}
                        onChange={handleReferralInputChange}
                        min="100"
                        step="50"
                      />
                      <p className="text-sm text-gray-500">
                        Value of the voucher in KSh that will be awarded to students
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="VOUCHER_EXPIRY_DAYS">Voucher Expiry (Days)</Label>
                      <Input 
                        id="VOUCHER_EXPIRY_DAYS"
                        name="VOUCHER_EXPIRY_DAYS"
                        type="number"
                        value={referralSettings.VOUCHER_EXPIRY_DAYS}
                        onChange={handleReferralInputChange}
                        min="1"
                      />
                      <p className="text-sm text-gray-500">
                        Number of days before vouchers expire
                      </p>
                    </div>
                    
                    <div className="bg-gray-50 p-4 rounded-md mt-4">
                      <h3 className="font-medium mb-2">Referral Program Example</h3>
                      <p className="text-sm text-gray-600 mb-4">
                        With current settings, students will earn a <strong>KSh {referralSettings.VOUCHER_AMOUNT}</strong> voucher for every <strong>{referralSettings.REFERRAL_COUNT}</strong> successful referrals.
                        Vouchers will expire after <strong>{referralSettings.VOUCHER_EXPIRY_DAYS}</strong> days.
                      </p>
                    </div>
                  </div>
                  
                  <div className="mt-6">
                    <Button 
                      type="submit" 
                      className="bg-[#0B4619] hover:bg-[#1a6830]"
                      disabled={updateSettingMutation.isPending}
                    >
                      {updateSettingMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Save Changes
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="payment">
          <Card>
            <CardHeader>
              <CardTitle>Payment Methods</CardTitle>
              <CardDescription>
                Configure available payment methods for checkout
              </CardDescription>
            </CardHeader>
            <CardContent>
              {settingsLoading ? (
                <div className="flex justify-center items-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-[#0B4619]" />
                  <span className="ml-2">Loading settings...</span>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="PAYMENT_MPESA">M-Pesa</Label>
                      <p className="text-sm text-gray-500">
                        Allow payments via M-Pesa mobile money
                      </p>
                    </div>
                    <Switch 
                      id="PAYMENT_MPESA"
                      checked={paymentSettings.PAYMENT_MPESA === "true"}
                      onCheckedChange={(checked) => handlePaymentToggle("PAYMENT_MPESA", checked)}
                      disabled={updateSettingMutation.isPending}
                    />
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="PAYMENT_BANK">Bank Transfer</Label>
                      <p className="text-sm text-gray-500">
                        Allow payments via bank transfer
                      </p>
                    </div>
                    <Switch 
                      id="PAYMENT_BANK"
                      checked={paymentSettings.PAYMENT_BANK === "true"}
                      onCheckedChange={(checked) => handlePaymentToggle("PAYMENT_BANK", checked)}
                      disabled={updateSettingMutation.isPending}
                    />
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="PAYMENT_CARD">Card Payment</Label>
                      <p className="text-sm text-gray-500">
                        Allow payments via credit/debit cards
                      </p>
                    </div>
                    <Switch 
                      id="PAYMENT_CARD"
                      checked={paymentSettings.PAYMENT_CARD === "true"}
                      onCheckedChange={(checked) => handlePaymentToggle("PAYMENT_CARD", checked)}
                      disabled={updateSettingMutation.isPending}
                    />
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-md mt-4">
                    <h3 className="font-medium mb-2">Active Payment Methods</h3>
                    <div className="flex flex-wrap gap-2">
                      {paymentSettings.PAYMENT_MPESA === "true" && (
                        <Badge className="bg-green-100 text-green-800">M-Pesa</Badge>
                      )}
                      {paymentSettings.PAYMENT_BANK === "true" && (
                        <Badge className="bg-green-100 text-green-800">Bank Transfer</Badge>
                      )}
                      {paymentSettings.PAYMENT_CARD === "true" && (
                        <Badge className="bg-green-100 text-green-800">Card Payment</Badge>
                      )}
                      {paymentSettings.PAYMENT_MPESA !== "true" && 
                       paymentSettings.PAYMENT_BANK !== "true" && 
                       paymentSettings.PAYMENT_CARD !== "true" && (
                        <span className="text-red-600">No payment methods enabled!</span>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="store">
          <Card>
            <CardHeader>
              <CardTitle>Store Settings</CardTitle>
              <CardDescription>
                Configure general store settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="py-8 text-center text-gray-500">
                <p>Store settings will be available in a future update.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="system">
          <Card>
            <CardHeader>
              <CardTitle>System Settings</CardTitle>
              <CardDescription>
                Configure system-wide settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="py-8 text-center text-gray-500">
                <p>System settings will be available in a future update.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </AdminLayout>
  );
}
