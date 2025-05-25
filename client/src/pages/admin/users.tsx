import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useStore } from "@/lib/store";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import AdminLayout from "@/components/layout/admin-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogClose
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Search, Eye, Loader2 } from "lucide-react";

export default function AdminUsers() {
  const [location, navigate] = useLocation();
  const { toast } = useToast();
  const { user, isAuthenticated, isLoading } = useStore();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [userDetailsOpen, setUserDetailsOpen] = useState(false);
  
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
  
  // Get users
  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ['/api/users'],
    enabled: !!isAuthenticated && !!user?.isAdmin
  });
  
  // Get orders for the selected user
  const { data: orders, isLoading: ordersLoading } = useQuery({
    queryKey: ['/api/orders'],
    enabled: !!isAuthenticated && !!user?.isAdmin
  });
  
  // Get vouchers for the selected user
  const { data: allVouchers, isLoading: vouchersLoading } = useQuery({
    queryKey: ['/api/vouchers'],
    enabled: !!isAuthenticated && !!user?.isAdmin && !!selectedUser
  });
  
  // Filter users by search term
  const filteredUsers = users?.filter((u: any) => 
    u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.lastName.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Handle view user details
  const handleViewUserDetails = (userData: any) => {
    setSelectedUser(userData);
    setUserDetailsOpen(true);
  };
  
  // Calculate user statistics
  const getUserOrderCount = (userId: number) => {
    if (!orders) return 0;
    return orders.filter((order: any) => order.userId === userId).length;
  };
  
  const getUserTotalSpending = (userId: number) => {
    if (!orders) return 0;
    return orders
      .filter((order: any) => order.userId === userId)
      .reduce((total: number, order: any) => total + order.total, 0);
  };
  
  const getUserVouchers = (userId: number) => {
    if (!allVouchers) return [];
    return allVouchers.filter((voucher: any) => voucher.userId === userId);
  };
  
  const getUserReferrals = (userId: number) => {
    if (!users) return [];
    return users.filter((u: any) => u.referredBy === userId);
  };
  
  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  };
  
  if (isLoading || !isAuthenticated || !user?.isAdmin) {
    return null; // Redirect handled in useEffect
  }
  
  return (
    <AdminLayout title="Users">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>User Management</CardTitle>
          <CardDescription>
            View and manage registered users
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center mb-6">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                type="search"
                placeholder="Search users by name, email, or username..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          {usersLoading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-[#0B4619]" />
              <span className="ml-2">Loading users...</span>
            </div>
          ) : filteredUsers && filteredUsers.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12"></TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Username</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Orders</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((userData: any) => (
                    <TableRow key={userData.id}>
                      <TableCell>
                        <Avatar>
                          <AvatarImage src={userData.profilePicture} />
                          <AvatarFallback className="bg-[#0B4619]/10 text-[#0B4619]">
                            {userData.firstName.charAt(0)}{userData.lastName.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                      </TableCell>
                      <TableCell className="font-medium">
                        {userData.firstName} {userData.lastName}
                      </TableCell>
                      <TableCell>{userData.username}</TableCell>
                      <TableCell className="max-w-[200px] truncate">
                        {userData.email}
                      </TableCell>
                      <TableCell>{getUserOrderCount(userData.id)}</TableCell>
                      <TableCell>{formatDate(userData.createdAt)}</TableCell>
                      <TableCell>
                        {userData.isAdmin ? (
                          <Badge className="bg-purple-100 text-purple-800">Admin</Badge>
                        ) : (
                          <Badge className="bg-gray-100 text-gray-800">Customer</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleViewUserDetails(userData)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8">
              <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No users found</p>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* User Details Dialog */}
      {selectedUser && (
        <Dialog open={userDetailsOpen} onOpenChange={setUserDetailsOpen}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>User Details</DialogTitle>
              <DialogDescription>
                View complete user information
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-1">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <Avatar className="h-20 w-20 mx-auto mb-4">
                    <AvatarImage src={selectedUser.profilePicture} />
                    <AvatarFallback className="text-lg bg-[#0B4619]/10 text-[#0B4619]">
                      {selectedUser.firstName.charAt(0)}{selectedUser.lastName.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <h3 className="font-bold text-lg">
                    {selectedUser.firstName} {selectedUser.lastName}
                  </h3>
                  <p className="text-gray-500">{selectedUser.username}</p>
                  <p className="text-sm text-gray-500 mt-1">{selectedUser.email}</p>
                  
                  <div className="mt-4">
                    {selectedUser.isAdmin ? (
                      <Badge className="bg-purple-100 text-purple-800">Administrator</Badge>
                    ) : (
                      <Badge className="bg-gray-100 text-gray-800">Customer</Badge>
                    )}
                  </div>
                  
                  <div className="mt-4 text-sm text-left">
                    <div className="flex justify-between py-1 border-b">
                      <span className="font-medium">User ID:</span>
                      <span>{selectedUser.id}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b">
                      <span className="font-medium">Joined:</span>
                      <span>{formatDate(selectedUser.createdAt)}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b">
                      <span className="font-medium">Referral Code:</span>
                      <span className="font-mono">{selectedUser.referralCode}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="font-medium">Referred By:</span>
                      <span>
                        {selectedUser.referredBy ? (
                          users?.find((u: any) => u.id === selectedUser.referredBy)?.username || `ID: ${selectedUser.referredBy}`
                        ) : (
                          "None"
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="md:col-span-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <Card>
                    <CardHeader className="py-3">
                      <CardTitle className="text-base">Order Summary</CardTitle>
                    </CardHeader>
                    <CardContent className="py-3">
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Total Orders:</span>
                          <span className="font-medium">{getUserOrderCount(selectedUser.id)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Total Spent:</span>
                          <span className="font-medium">KSh {getUserTotalSpending(selectedUser.id).toLocaleString()}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="py-3">
                      <CardTitle className="text-base">Referral Summary</CardTitle>
                    </CardHeader>
                    <CardContent className="py-3">
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Referrals Made:</span>
                          <span className="font-medium">{getUserReferrals(selectedUser.id).length}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Vouchers Earned:</span>
                          <span className="font-medium">{getUserVouchers(selectedUser.id).length}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="font-medium mb-2">Recent Orders</h3>
                    {ordersLoading ? (
                      <p className="text-sm text-gray-500">Loading orders...</p>
                    ) : orders && orders.filter((order: any) => order.userId === selectedUser.id).length > 0 ? (
                      <div className="border rounded-md overflow-hidden">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Order ID</TableHead>
                              <TableHead>Date</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead>Total</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {orders
                              .filter((order: any) => order.userId === selectedUser.id)
                              .slice(0, 5)
                              .map((order: any) => (
                                <TableRow key={order.id}>
                                  <TableCell className="font-medium">#{order.id}</TableCell>
                                  <TableCell>{formatDate(order.createdAt)}</TableCell>
                                  <TableCell>
                                    <Badge className={
                                      order.status === 'completed' ? 'bg-green-100 text-green-800' :
                                      order.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                                      order.status === 'shipped' ? 'bg-purple-100 text-purple-800' :
                                      'bg-yellow-100 text-yellow-800'
                                    }>
                                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                    </Badge>
                                  </TableCell>
                                  <TableCell>KSh {order.total.toLocaleString()}</TableCell>
                                </TableRow>
                              ))}
                          </TableBody>
                        </Table>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500 bg-gray-50 p-3 rounded-md">No orders found for this user</p>
                    )}
                  </div>
                  
                  <div>
                    <h3 className="font-medium mb-2">Vouchers</h3>
                    {vouchersLoading ? (
                      <p className="text-sm text-gray-500">Loading vouchers...</p>
                    ) : allVouchers && getUserVouchers(selectedUser.id).length > 0 ? (
                      <div className="border rounded-md overflow-hidden">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Code</TableHead>
                              <TableHead>Amount</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead>Expires</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {getUserVouchers(selectedUser.id).map((voucher: any) => (
                              <TableRow key={voucher.id}>
                                <TableCell className="font-mono">{voucher.code}</TableCell>
                                <TableCell>KSh {voucher.discount.toLocaleString()}</TableCell>
                                <TableCell>
                                  {voucher.isUsed ? (
                                    <Badge variant="outline" className="text-gray-500">Used</Badge>
                                  ) : (
                                    <Badge className="bg-green-100 text-green-800">Active</Badge>
                                  )}
                                </TableCell>
                                <TableCell>
                                  {voucher.expiresAt ? formatDate(voucher.expiresAt) : "No expiry"}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500 bg-gray-50 p-3 rounded-md">No vouchers found for this user</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            <DialogClose asChild>
              <Button className="mt-4" variant="outline">Close</Button>
            </DialogClose>
          </DialogContent>
        </Dialog>
      )}
    </AdminLayout>
  );
}
