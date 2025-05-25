import { useEffect } from "react";
import { useLocation } from "wouter";
import { useStore } from "@/lib/store";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import AdminLayout from "@/components/layout/admin-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";
import { ArrowUp, ArrowDown, DollarSign, Users, ShoppingBag, Activity } from "lucide-react";

export default function AdminDashboard() {
  const [location, navigate] = useLocation();
  const { toast } = useToast();
  const { user, isAuthenticated, isLoading } = useStore();
  
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
  
  // Get products
  const { data: products, isLoading: productsLoading } = useQuery({
    queryKey: ['/api/products'],
    enabled: !!isAuthenticated && !!user?.isAdmin
  });
  
  // Calculate statistics
  const getTotalRevenue = () => {
    if (!orders) return 0;
    return orders.reduce((total: number, order: any) => total + order.total, 0);
  };
  
  const getTotalOrders = () => {
    if (!orders) return 0;
    return orders.length;
  };
  
  const getTotalUsers = () => {
    if (!users) return 0;
    return users.length;
  };
  
  const getItemsSold = () => {
    if (!orders) return 0;
    return orders.reduce((total: number, order: any) => {
      return total + order.items.reduce((sum: number, item: any) => sum + item.quantity, 0);
    }, 0);
  };
  
  // Prepare chart data
  const getSalesData = () => {
    if (!orders) return [];
    
    const salesByDay: {[key: string]: number} = {};
    
    orders.forEach((order: any) => {
      const date = new Date(order.createdAt).toISOString().split('T')[0];
      if (!salesByDay[date]) {
        salesByDay[date] = 0;
      }
      salesByDay[date] += order.total;
    });
    
    return Object.entries(salesByDay).map(([date, amount]) => ({
      date,
      amount
    })).sort((a, b) => a.date.localeCompare(b.date)).slice(-7);
  };
  
  const getProductCategoryData = () => {
    if (!products) return [];
    
    const categoryCount: {[key: string]: number} = {};
    
    products.forEach((product: any) => {
      const categoryId = product.categoryId;
      if (!categoryCount[categoryId]) {
        categoryCount[categoryId] = 0;
      }
      categoryCount[categoryId]++;
    });
    
    return Object.entries(categoryCount).map(([categoryId, count]) => ({
      name: getCategoryName(parseInt(categoryId)),
      value: count
    }));
  };
  
  const getOrderStatusData = () => {
    if (!orders) return [];
    
    const statusCount: {[key: string]: number} = {};
    
    orders.forEach((order: any) => {
      const status = order.status;
      if (!statusCount[status]) {
        statusCount[status] = 0;
      }
      statusCount[status]++;
    });
    
    return Object.entries(statusCount).map(([status, count]) => ({
      name: status.charAt(0).toUpperCase() + status.slice(1),
      value: count
    }));
  };
  
  const getCategoryName = (categoryId: number) => {
    switch (categoryId) {
      case 1:
        return "Textbooks";
      case 2:
        return "Stationery";
      case 3:
        return "Gadgets";
      case 4:
        return "Dorm Essentials";
      default:
        return `Category ${categoryId}`;
    }
  };
  
  // Pie chart colors
  const COLORS = ['#0B4619', '#1a6830', '#83c5be', '#FF7A00', '#d67d3e'];
  
  if (isLoading || !isAuthenticated || !user?.isAdmin) {
    return null; // Redirect handled in useEffect
  }
  
  return (
    <AdminLayout title="Dashboard">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Revenue</p>
                <h3 className="text-2xl font-bold">KSh {getTotalRevenue().toLocaleString()}</h3>
              </div>
              <div className="p-3 rounded-full bg-green-100">
                <DollarSign className="h-6 w-6 text-green-700" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <ArrowUp className="mr-1 h-4 w-4 text-green-600" />
              <span className="font-medium text-green-600">12%</span>
              <span className="ml-1 text-gray-500">from last month</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Orders</p>
                <h3 className="text-2xl font-bold">{getTotalOrders()}</h3>
              </div>
              <div className="p-3 rounded-full bg-blue-100">
                <ShoppingBag className="h-6 w-6 text-blue-700" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <ArrowUp className="mr-1 h-4 w-4 text-green-600" />
              <span className="font-medium text-green-600">8%</span>
              <span className="ml-1 text-gray-500">from last month</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Users</p>
                <h3 className="text-2xl font-bold">{getTotalUsers()}</h3>
              </div>
              <div className="p-3 rounded-full bg-purple-100">
                <Users className="h-6 w-6 text-purple-700" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <ArrowUp className="mr-1 h-4 w-4 text-green-600" />
              <span className="font-medium text-green-600">15%</span>
              <span className="ml-1 text-gray-500">from last month</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Items Sold</p>
                <h3 className="text-2xl font-bold">{getItemsSold()}</h3>
              </div>
              <div className="p-3 rounded-full bg-orange-100">
                <Activity className="h-6 w-6 text-orange-700" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <ArrowUp className="mr-1 h-4 w-4 text-green-600" />
              <span className="font-medium text-green-600">10%</span>
              <span className="ml-1 text-gray-500">from last month</span>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Revenue Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              {ordersLoading ? (
                <p>Loading chart data...</p>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={getSalesData()}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value) => [`KSh ${Number(value).toLocaleString()}`, 'Revenue']}
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="amount" 
                      name="Revenue" 
                      stroke="#0B4619" 
                      activeDot={{ r: 8 }} 
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Products by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              {productsLoading ? (
                <p>Loading chart data...</p>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={getProductCategoryData()}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {getProductCategoryData().map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [value, 'Products']} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Orders by Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              {ordersLoading ? (
                <p>Loading chart data...</p>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={getOrderStatusData()}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="value" name="Orders" fill="#FF7A00" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
        </CardHeader>
        <CardContent>
          {ordersLoading ? (
            <p>Loading recent orders...</p>
          ) : orders && orders.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                  <tr>
                    <th className="px-6 py-3">Order ID</th>
                    <th className="px-6 py-3">Customer</th>
                    <th className="px-6 py-3">Date</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.slice(-5).reverse().map((order: any) => (
                    <tr key={order.id} className="bg-white border-b hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium">#{order.id}</td>
                      <td className="px-6 py-4">
                        {users?.find((u: any) => u.id === order.userId)?.firstName} {users?.find((u: any) => u.id === order.userId)?.lastName}
                      </td>
                      <td className="px-6 py-4">{new Date(order.createdAt).toLocaleDateString()}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          order.status === 'completed' ? 'bg-green-100 text-green-800' :
                          order.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                          order.status === 'shipped' ? 'bg-purple-100 text-purple-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4">KSh {order.total.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-center py-4">No recent orders</p>
          )}
        </CardContent>
      </Card>
    </AdminLayout>
  );
}
