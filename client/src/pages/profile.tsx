import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useStore } from "@/lib/store";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ReferralCard } from "@/components/user/referral-card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  User, 
  Package, 
  Receipt, 
  CreditCard, 
  Gift, 
  Settings, 
  ArrowUpRight 
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// Profile form schema
const profileSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Invalid email address").optional(),
  password: z.string().min(6, "Password must be at least 6 characters").optional(),
  confirmPassword: z.string().optional(),
  profilePicture: z.string().optional()
}).refine(data => {
  if (data.password && !data.confirmPassword) return false;
  if (!data.password && data.confirmPassword) return false;
  if (data.password && data.confirmPassword && data.password !== data.confirmPassword) return false;
  return true;
}, {
  message: "Passwords do not match",
  path: ["confirmPassword"]
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function Profile() {
  const [location, navigate] = useLocation();
  const { toast } = useToast();
  const { user, isAuthenticated, isLoading } = useStore();
  
  const [isUpdating, setIsUpdating] = useState(false);
  
  // Profile form
  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      email: user?.email || "",
      password: "",
      confirmPassword: "",
      profilePicture: user?.profilePicture || ""
    }
  });
  
  // Update form when user data changes
  useEffect(() => {
    if (user) {
      profileForm.setValue("firstName", user.firstName);
      profileForm.setValue("lastName", user.lastName);
      profileForm.setValue("email", user.email);
      profileForm.setValue("profilePicture", user.profilePicture || "");
    }
  }, [user, profileForm]);
  
  // Get user orders
  const { data: orders, isLoading: ordersLoading } = useQuery({
    queryKey: ['/api/orders'],
    enabled: !!isAuthenticated
  });
  
  // Get user vouchers
  const { data: vouchers, isLoading: vouchersLoading } = useQuery({
    queryKey: ['/api/vouchers'],
    enabled: !!isAuthenticated
  });
  
  // Handle profile update
  const onUpdateProfile = async (data: ProfileFormValues) => {
    if (!user) return;
    
    setIsUpdating(true);
    
    // Remove confirmPassword field from data to be sent to API
    const { confirmPassword, ...updateData } = data;
    
    // If password is empty, remove it from the update data
    if (!updateData.password) {
      delete updateData.password;
    }
    
    try {
      await apiRequest('PUT', `/api/users/${user.id}`, updateData);
      
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully"
      });
      
      // Clear password fields
      profileForm.setValue("password", "");
      profileForm.setValue("confirmPassword", "");
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Update failed",
        description: "Failed to update your profile. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsUpdating(false);
    }
  };
  
  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Login required",
        description: "Please login to view your profile",
        variant: "destructive"
      });
      navigate("/login?redirect=profile");
    }
  }, [isAuthenticated, isLoading, navigate, toast]);
  
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p>Loading profile...</p>
      </div>
    );
  }
  
  if (!isAuthenticated || !user) {
    return null; // Redirect handled in useEffect
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar */}
        <div className="md:w-1/4">
          <Card>
            <CardContent className="p-6">
              <div className="text-center mb-6">
                <Avatar className="h-24 w-24 mx-auto mb-4">
                  <AvatarImage src={user.profilePicture} />
                  <AvatarFallback className="text-lg bg-[#0B4619]/10 text-[#0B4619]">
                    {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <h2 className="text-xl font-bold">{user.firstName} {user.lastName}</h2>
                <p className="text-gray-500">{user.email}</p>
              </div>
              
              <Tabs defaultValue="orders" className="w-full">
                <TabsList className="grid grid-cols-2 w-full">
                  <TabsTrigger value="orders">Orders</TabsTrigger>
                  <TabsTrigger value="account">Account</TabsTrigger>
                </TabsList>
              </Tabs>
              
              <Separator className="my-6" />
              
              <div className="space-y-2">
                <h3 className="font-medium mb-2">Quick Links</h3>
                <Button 
                  variant="ghost" 
                  className="w-full justify-start"
                  onClick={() => navigate("/products")}
                >
                  <Package className="mr-2 h-5 w-5" />
                  Browse Products
                </Button>
                <Button 
                  variant="ghost" 
                  className="w-full justify-start"
                  onClick={() => navigate("/cart")}
                >
                  <CreditCard className="mr-2 h-5 w-5" />
                  View Cart
                </Button>
                {user.isAdmin && (
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start"
                    onClick={() => navigate("/admin")}
                  >
                    <Settings className="mr-2 h-5 w-5" />
                    Admin Dashboard
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
          
          {/* Referral Card */}
          <div className="mt-6">
            <ReferralCard referralCode={user.referralCode} />
          </div>
        </div>
        
        {/* Main Content */}
        <div className="md:w-3/4">
          <Tabs defaultValue="orders" className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="orders" className="flex items-center">
                <Receipt className="mr-2 h-5 w-5" />
                My Orders
              </TabsTrigger>
              <TabsTrigger value="vouchers" className="flex items-center">
                <Gift className="mr-2 h-5 w-5" />
                My Vouchers
              </TabsTrigger>
              <TabsTrigger value="account" className="flex items-center">
                <User className="mr-2 h-5 w-5" />
                Account Settings
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="orders">
              <Card>
                <CardHeader>
                  <CardTitle>Order History</CardTitle>
                  <CardDescription>
                    View and track your orders
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {ordersLoading ? (
                    <p>Loading orders...</p>
                  ) : orders && orders.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Order ID</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Total</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {orders.map((order: any) => (
                          <TableRow key={order.id}>
                            <TableCell className="font-medium">#{order.id}</TableCell>
                            <TableCell>{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                            <TableCell>
                              <Badge 
                                className={
                                  order.status === 'completed' ? 'bg-green-100 text-green-800' :
                                  order.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                                  order.status === 'shipped' ? 'bg-purple-100 text-purple-800' :
                                  'bg-yellow-100 text-yellow-800'
                                }
                              >
                                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                              </Badge>
                            </TableCell>
                            <TableCell>KSh {order.total.toLocaleString()}</TableCell>
                            <TableCell>
                              <Button variant="ghost" size="sm" className="h-8 px-2">
                                View Details
                                <ArrowUpRight className="ml-1 h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="text-center py-12">
                      <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                      <h3 className="text-lg font-medium mb-2">No Orders Yet</h3>
                      <p className="text-gray-500 mb-4">You haven't placed any orders yet.</p>
                      <Button 
                        className="bg-[#0B4619] hover:bg-[#1a6830]"
                        onClick={() => navigate("/products")}
                      >
                        Start Shopping
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="vouchers">
              <Card>
                <CardHeader>
                  <CardTitle>My Vouchers</CardTitle>
                  <CardDescription>
                    Vouchers earned from referrals and promotions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {vouchersLoading ? (
                    <p>Loading vouchers...</p>
                  ) : vouchers && vouchers.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {vouchers.map((voucher: any) => (
                        <Card key={voucher.id} className={voucher.isUsed ? "bg-gray-50" : "border-[#0B4619]/20"}>
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="text-sm text-gray-500">Voucher Code</p>
                                <p className="font-mono font-bold">{voucher.code}</p>
                              </div>
                              {voucher.isUsed ? (
                                <Badge variant="outline" className="text-gray-500">Used</Badge>
                              ) : (
                                <Badge className="bg-green-100 text-green-800">Active</Badge>
                              )}
                            </div>
                            <div className="mt-4">
                              <p className="font-bold text-lg text-[#0B4619]">KSh {voucher.discount.toLocaleString()}</p>
                              <p className="text-sm text-gray-500">
                                {voucher.expiresAt ? (
                                  <>Expires: {new Date(voucher.expiresAt).toLocaleDateString()}</>
                                ) : (
                                  "No expiration date"
                                )}
                              </p>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Gift className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                      <h3 className="text-lg font-medium mb-2">No Vouchers Yet</h3>
                      <p className="text-gray-500 mb-4">Earn vouchers by referring friends or participating in promotions.</p>
                      <Button 
                        variant="outline"
                        onClick={() => document.querySelector('[data-tab="referral"]')?.scrollIntoView({ behavior: 'smooth' })}
                      >
                        Check Your Referral Code
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="account">
              <Card>
                <CardHeader>
                  <CardTitle>Account Settings</CardTitle>
                  <CardDescription>
                    Update your account information and password
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...profileForm}>
                    <form onSubmit={profileForm.handleSubmit(onUpdateProfile)} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={profileForm.control}
                          name="firstName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>First Name</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={profileForm.control}
                          name="lastName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Last Name</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={profileForm.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem className="md:col-span-2">
                              <FormLabel>Email Address</FormLabel>
                              <FormControl>
                                <Input {...field} disabled />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <Separator className="md:col-span-2 my-2" />
                        
                        <FormField
                          control={profileForm.control}
                          name="password"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>New Password</FormLabel>
                              <FormControl>
                                <Input type="password" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={profileForm.control}
                          name="confirmPassword"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Confirm New Password</FormLabel>
                              <FormControl>
                                <Input type="password" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <Button 
                        type="submit" 
                        className="bg-[#0B4619] hover:bg-[#1a6830]"
                        disabled={isUpdating}
                      >
                        {isUpdating ? "Updating..." : "Update Profile"}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
