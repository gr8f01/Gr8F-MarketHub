import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useStore } from "@/lib/store";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
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
  TableCaption,
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
  DialogTrigger
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Eye, Search, FileText, Loader2 } from "lucide-react";

export default function AdminOrders() {
  const [location, navigate] = useLocation();
  const { toast } = useToast();
  const { user, isAuthenticated, isLoading } = useStore();
  const queryClient = useQueryClient();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [orderDetailsOpen, setOrderDetailsOpen] = useState(false);
  
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
  
  // Get orders
  const { data: orders, isLoading: ordersLoading } = useQuery({
    queryKey: ['/api/orders'],
    enabled: !!isAuthenticated && !!user?.isAdmin
  });
  
  // Get users
  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ['/api/users'],
    enabled: !!isAuthenticated && !!user?.isAdmin
  });
  
  // Update order status mutation
  const updateOrderStatusMutation = useMutation({
    mutationFn: ({ orderId, status }: { orderId: number, status: string }) => 
      apiRequest('PUT', `/api/orders/${orderId}/status`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/orders'] });
      toast({
        title: "Order updated",
        description: "The order status has been updated successfully"
      });
    },
    onError: (error) => {
      console.error('Error updating order status:', error);
      toast({
        title: "Update failed",
        description: "An error occurred while updating the order status",
        variant: "destructive"
      });
    }
  });
  
  // Filter orders by search term and status
  const filteredOrders = orders?.filter((order: any) => {
    const matchesSearch = 
      order.id.toString().includes(searchTerm) ||
      (users?.find((u: any) => u.id === order.userId)?.firstName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (users?.find((u: any) => u.id === order.userId)?.lastName || "").toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });
  
  // Handle view order details
  const handleViewOrderDetails = (order: any) => {
    setSelectedOrder(order);
    setOrderDetailsOpen(true);
  };
  
  // Handle update order status
  const handleUpdateOrderStatus = (orderId: number, status: string) => {
    updateOrderStatusMutation.mutate({ orderId, status });
  };
  
  // Get status badge color
  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };
  
  if (isLoading || !isAuthenticated || !user?.isAdmin) {
    return null; // Redirect handled in useEffect
  }
  
  return (
    <AdminLayout title="Orders">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Order Management</CardTitle>
          <CardDescription>
            View and manage customer orders
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row items-center gap-4 mb-6">
            <div className="relative w-full sm:max-w-md">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                type="search"
                placeholder="Search orders by ID or customer name..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="shipped">Shipped</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {ordersLoading || usersLoading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-[#0B4619]" />
              <span className="ml-2">Loading orders...</span>
            </div>
          ) : filteredOrders && filteredOrders.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Total (KSh)</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map((order: any) => {
                    const customer = users?.find((u: any) => u.id === order.userId);
                    
                    return (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">#{order.id}</TableCell>
                        <TableCell>
                          {customer ? `${customer.firstName} ${customer.lastName}` : `User ID: ${order.userId}`}
                        </TableCell>
                        <TableCell>{formatDate(order.createdAt)}</TableCell>
                        <TableCell>{order.total.toLocaleString()}</TableCell>
                        <TableCell>
                          <Badge className={getStatusBadgeColor(order.status)}>
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {order.paymentMethod} ({order.paymentStatus})
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleViewOrderDetails(order)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No orders found</p>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Order Details Dialog */}
      {selectedOrder && (
        <Dialog open={orderDetailsOpen} onOpenChange={setOrderDetailsOpen}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Order Details - #{selectedOrder.id}</DialogTitle>
              <DialogDescription>
                View complete order information
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h3 className="font-medium mb-2">Customer Information</h3>
                <div className="bg-gray-50 p-3 rounded-md">
                  {users && (
                    <p>
                      <span className="font-medium">Name:</span>{" "}
                      {users.find((u: any) => u.id === selectedOrder.userId)?.firstName}{" "}
                      {users.find((u: any) => u.id === selectedOrder.userId)?.lastName}
                    </p>
                  )}
                  <p>
                    <span className="font-medium">Email:</span>{" "}
                    {users?.find((u: any) => u.id === selectedOrder.userId)?.email}
                  </p>
                </div>
              </div>
              
              <div>
                <h3 className="font-medium mb-2">Shipping Information</h3>
                <div className="bg-gray-50 p-3 rounded-md">
                  <p>
                    <span className="font-medium">Address:</span>{" "}
                    {selectedOrder.shippingAddress.address}
                  </p>
                  <p>
                    <span className="font-medium">City:</span>{" "}
                    {selectedOrder.shippingAddress.city}
                  </p>
                  <p>
                    <span className="font-medium">Postal Code:</span>{" "}
                    {selectedOrder.shippingAddress.postalCode}
                  </p>
                  <p>
                    <span className="font-medium">Phone:</span>{" "}
                    {selectedOrder.shippingAddress.phone}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="mb-6">
              <h3 className="font-medium mb-2">Order Items</h3>
              <div className="border rounded-md overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Price (KSh)</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Total (KSh)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedOrder.items.map((item: any) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <div className="flex items-center">
                            {item.product.images && item.product.images.length > 0 && (
                              <img 
                                src={item.product.images[0]} 
                                alt={item.product.name} 
                                className="w-10 h-10 object-cover rounded mr-3"
                              />
                            )}
                            <span className="font-medium">{item.product.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>{item.price.toLocaleString()}</TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell>{(item.price * item.quantity).toLocaleString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h3 className="font-medium mb-2">Order Status</h3>
                <Select 
                  value={selectedOrder.status} 
                  onValueChange={(value) => handleUpdateOrderStatus(selectedOrder.id, value)}
                  disabled={updateOrderStatusMutation.isPending}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="shipped">Shipped</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
                {updateOrderStatusMutation.isPending && (
                  <p className="text-sm text-gray-500 mt-2 flex items-center">
                    <Loader2 className="h-3 w-3 animate-spin mr-1" />
                    Updating status...
                  </p>
                )}
              </div>
              
              <div>
                <h3 className="font-medium mb-2">Order Summary</h3>
                <div className="bg-gray-50 p-3 rounded-md">
                  <div className="flex justify-between mb-2">
                    <span>Subtotal:</span>
                    <span>KSh {selectedOrder.total.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span>Tax:</span>
                    <span>Included</span>
                  </div>
                  <div className="flex justify-between font-medium">
                    <span>Total:</span>
                    <span>KSh {selectedOrder.total.toLocaleString()}</span>
                  </div>
                  <div className="mt-2 pt-2 border-t">
                    <span className="font-medium">Payment Method:</span>{" "}
                    <Badge variant="outline">
                      {selectedOrder.paymentMethod} ({selectedOrder.paymentStatus})
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="text-sm text-gray-500">
              <p>Order placed on: {formatDate(selectedOrder.createdAt)}</p>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </AdminLayout>
  );
}
