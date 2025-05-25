import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useStore } from "@/lib/store";
import { useToast } from "@/hooks/use-toast";
import { PaymentForm } from "@/components/checkout/payment-form";
import { OrderSummary } from "@/components/checkout/order-summary";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { CheckCircle } from "lucide-react";

// Form schemas
const shippingSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  address: z.string().min(5, "Address must be at least 5 characters"),
  city: z.string().min(2, "City must be at least 2 characters"),
  postalCode: z.string().min(5, "Postal code must be at least 5 characters"),
  country: z.string().default("Kenya"),
  phone: z.string().min(10, "Phone number must be at least 10 characters"),
  email: z.string().email("Invalid email address")
});

type ShippingFormValues = z.infer<typeof shippingSchema>;

export default function Checkout() {
  const [location, navigate] = useLocation();
  const { toast } = useToast();
  const { user, cart, clearCart, isAuthenticated, isLoading } = useStore();
  
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderNumber, setOrderNumber] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("mpesa");
  const [voucherCode, setVoucherCode] = useState("");

  // Initialize form with user data
  const shippingForm = useForm<ShippingFormValues>({
    resolver: zodResolver(shippingSchema),
    defaultValues: {
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      address: "",
      city: "Nakuru",
      postalCode: "20100",
      country: "Kenya",
      phone: "",
      email: user?.email || ""
    }
  });

  // Update form when user data changes
  useEffect(() => {
    if (user) {
      shippingForm.setValue("firstName", user.firstName);
      shippingForm.setValue("lastName", user.lastName);
      shippingForm.setValue("email", user.email);
    }
  }, [user, shippingForm]);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Login required",
        description: "Please login to checkout",
        variant: "destructive"
      });
      navigate("/login?redirect=checkout");
    }
  }, [isAuthenticated, isLoading, navigate, toast]);

  // Redirect to cart if cart is empty
  useEffect(() => {
    if (!isLoading && cart.length === 0 && !orderPlaced) {
      toast({
        title: "Empty cart",
        description: "Your cart is empty. Add some items before checking out.",
        variant: "destructive"
      });
      navigate("/cart");
    }
  }, [cart, isLoading, orderPlaced, navigate, toast]);

  const onSubmit = async (data: ShippingFormValues) => {
    if (cart.length === 0) {
      toast({
        title: "Empty cart",
        description: "Your cart is empty. Add some items before checking out.",
        variant: "destructive"
      });
      return;
    }

    // Create order
    setIsSubmitting(true);
    try {
      const orderData = {
        shippingAddress: {
          ...data
        },
        paymentMethod,
        voucherCode: voucherCode || undefined,
        items: cart.map(item => ({
          productId: item.productId,
          quantity: item.quantity
        }))
      };

      const response = await apiRequest('POST', '/api/orders', orderData);
      const order = await response.json();

      // Show success
      setOrderPlaced(true);
      setOrderNumber(order.id.toString());

      // Clear cart
      await clearCart();

      toast({
        title: "Order placed successfully",
        description: `Your order #${order.id} has been placed.`
      });
    } catch (error) {
      console.error('Error placing order:', error);
      toast({
        title: "Order failed",
        description: "There was an error placing your order. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p>Loading checkout...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Redirect handled in useEffect
  }

  // Order success view
  if (orderPlaced) {
    return (
      <div className="container mx-auto px-4 py-16 text-center max-w-xl">
        <div className="flex justify-center mb-6">
          <CheckCircle className="h-16 w-16 text-green-500" />
        </div>
        <h1 className="text-3xl font-bold mb-4">Thank You for Your Order!</h1>
        <p className="text-gray-600 mb-8">
          Your order #{orderNumber} has been placed and is being processed.
          We've sent a confirmation email to your inbox.
        </p>
        <div className="bg-gray-50 p-6 rounded-lg mb-8">
          <h2 className="font-medium mb-4">What's Next?</h2>
          <ol className="text-left space-y-2">
            <li className="flex gap-2">
              <span className="font-bold">1.</span>
              <span>You'll receive an email confirmation with order details.</span>
            </li>
            <li className="flex gap-2">
              <span className="font-bold">2.</span>
              <span>We'll process your order and prepare it for delivery.</span>
            </li>
            <li className="flex gap-2">
              <span className="font-bold">3.</span>
              <span>You'll receive updates when your order is dispatched.</span>
            </li>
          </ol>
        </div>
        <div className="space-x-4">
          <Button className="bg-[#0B4619] hover:bg-[#1a6830]" onClick={() => navigate("/profile")}>
            Track Your Order
          </Button>
          <Button variant="outline" onClick={() => navigate("/products")}>
            Continue Shopping
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold font-heading mb-8">Checkout</h1>

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="lg:w-2/3">
          <Form {...shippingForm}>
            <form onSubmit={shippingForm.handleSubmit(onSubmit)}>
              {/* Shipping Information */}
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle>Shipping Information</CardTitle>
                  <CardDescription>
                    Enter your shipping details for delivery
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={shippingForm.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>First Name</FormLabel>
                          <FormControl>
                            <Input placeholder="John" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={shippingForm.control}
                      name="lastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Last Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Doe" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={shippingForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email Address</FormLabel>
                          <FormControl>
                            <Input placeholder="john@example.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={shippingForm.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone Number</FormLabel>
                          <FormControl>
                            <Input placeholder="+254712345678" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={shippingForm.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel>Address</FormLabel>
                          <FormControl>
                            <Input placeholder="123 Main St, Egerton University" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={shippingForm.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>City</FormLabel>
                          <FormControl>
                            <Input placeholder="Nakuru" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={shippingForm.control}
                      name="postalCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Postal Code</FormLabel>
                          <FormControl>
                            <Input placeholder="20100" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Payment Information */}
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle>Payment Method</CardTitle>
                  <CardDescription>
                    Choose how you want to pay for your order
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <PaymentForm 
                    paymentMethod={paymentMethod}
                    setPaymentMethod={setPaymentMethod}
                    voucherCode={voucherCode}
                    setVoucherCode={setVoucherCode}
                  />
                </CardContent>
              </Card>

              {/* Terms and conditions */}
              <Card className="mb-8">
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <input 
                        type="checkbox" 
                        id="terms" 
                        className="mt-1 mr-2"
                        required
                      />
                      <label htmlFor="terms" className="text-sm">
                        I agree to the <a href="/terms" className="text-[#0B4619] hover:underline">Terms and Conditions</a> and <a href="/terms#privacy" className="text-[#0B4619] hover:underline">Privacy Policy</a>
                      </label>
                    </div>
                    <div className="flex items-start">
                      <input 
                        type="checkbox" 
                        id="communications" 
                        className="mt-1 mr-2"
                      />
                      <label htmlFor="communications" className="text-sm">
                        I would like to receive marketing communications about products and offers
                      </label>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Button 
                type="submit" 
                className="w-full bg-[#0B4619] hover:bg-[#1a6830] py-6 text-lg"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Processing..." : "Place Order"}
              </Button>
            </form>
          </Form>
        </div>

        {/* Order Summary */}
        <div className="lg:w-1/3">
          <OrderSummary cart={cart} voucherCode={voucherCode} />

          <div className="mt-6 bg-gray-50 p-4 rounded-lg text-sm">
            <h3 className="font-medium mb-2">Shipping Information</h3>
            <p className="text-gray-600 mb-4">
              We offer fast delivery within Egerton University campuses (usually within 24-48 hours).
            </p>
            
            <h3 className="font-medium mb-2">Secure Payment</h3>
            <p className="text-gray-600">
              All transactions are secure and encrypted. We support M-Pesa, bank transfers, and more.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
