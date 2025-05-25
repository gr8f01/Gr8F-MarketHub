import { useState, useEffect } from "react";
import { useLocation, Link } from "wouter";
import { useStore } from "@/lib/store";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ProductCard } from "@/components/product/product-card";
import { ProductGrid } from "@/components/product/product-grid";
import { useQuery } from "@tanstack/react-query";
import { Trash2, Minus, Plus, ShoppingCart, ArrowRight } from "lucide-react";

export default function Cart() {
  const [location, navigate] = useLocation();
  const { toast } = useToast();
  const { cart, updateCartItem, removeFromCart, clearCart, isAuthenticated, isLoading } = useStore();
  
  const [isUpdating, setIsUpdating] = useState<{[key: number]: boolean}>({});
  
  // Get recommended products
  const { data: recommendedProducts } = useQuery({
    queryKey: ['/api/products', { featured: true }],
    select: (data) => data.slice(0, 4)
  });
  
  // Calculate cart totals
  const calculateSubtotal = () => {
    return cart.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  };
  
  const calculateTax = () => {
    return calculateSubtotal() * 0.16; // 16% VAT
  };
  
  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax();
  };
  
  // Handle quantity update
  const handleQuantityUpdate = async (item: any, newQuantity: number) => {
    if (newQuantity < 1 || newQuantity > item.product.stock) return;
    
    setIsUpdating({...isUpdating, [item.id]: true});
    
    try {
      const success = await updateCartItem(item.id, newQuantity);
      
      if (!success) {
        toast({
          title: "Failed to update cart",
          description: "Please try again",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update cart",
        variant: "destructive"
      });
    } finally {
      setIsUpdating({...isUpdating, [item.id]: false});
    }
  };
  
  // Handle remove item
  const handleRemoveItem = async (itemId: number) => {
    try {
      const success = await removeFromCart(itemId);
      
      if (success) {
        toast({
          title: "Item removed",
          description: "Item has been removed from your cart"
        });
      } else {
        toast({
          title: "Failed to remove item",
          description: "Please try again",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove item",
        variant: "destructive"
      });
    }
  };
  
  // Handle clear cart
  const handleClearCart = async () => {
    try {
      const success = await clearCart();
      
      if (success) {
        toast({
          title: "Cart cleared",
          description: "All items have been removed from your cart"
        });
      } else {
        toast({
          title: "Failed to clear cart",
          description: "Please try again",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to clear cart",
        variant: "destructive"
      });
    }
  };
  
  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Login required",
        description: "Please login to view your cart",
        variant: "destructive"
      });
      navigate("/login?redirect=cart");
    }
  }, [isAuthenticated, isLoading, navigate, toast]);
  
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p>Loading cart...</p>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return null; // Redirect handled in useEffect
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold font-heading mb-6">Your Shopping Cart</h1>
      
      {cart.length === 0 ? (
        <div className="text-center py-12">
          <div className="mx-auto w-24 h-24 rounded-full bg-neutral-100 flex items-center justify-center mb-4">
            <ShoppingCart className="h-12 w-12 text-neutral-400" />
          </div>
          <h2 className="text-2xl font-medium mb-2">Your cart is empty</h2>
          <p className="text-gray-600 mb-6">Looks like you haven't added any items to your cart yet.</p>
          <Link href="/products">
            <Button className="bg-[#0B4619] hover:bg-[#1a6830]">
              Start Shopping
            </Button>
          </Link>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Cart Items */}
          <div className="lg:w-2/3">
            <Card>
              <CardContent className="p-0">
                <div className="hidden sm:grid grid-cols-12 gap-4 p-4 bg-gray-50 rounded-t-lg font-medium">
                  <div className="col-span-6">Product</div>
                  <div className="col-span-2 text-center">Price</div>
                  <div className="col-span-2 text-center">Quantity</div>
                  <div className="col-span-2 text-right">Subtotal</div>
                </div>
                
                <Separator />
                
                {cart.map((item) => (
                  <div key={item.id} className="p-4 sm:p-6">
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
                      {/* Product */}
                      <div className="col-span-6 flex gap-4">
                        <div className="w-20 h-20 rounded-md border overflow-hidden flex-shrink-0">
                          <img 
                            src={item.product.images[0]} 
                            alt={item.product.name} 
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <Link href={`/products/${item.product.id}`}>
                            <a className="font-medium hover:text-[#0B4619] line-clamp-2">{item.product.name}</a>
                          </Link>
                          <button 
                            className="text-red-500 text-sm flex items-center mt-2"
                            onClick={() => handleRemoveItem(item.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Remove
                          </button>
                        </div>
                      </div>
                      
                      {/* Price */}
                      <div className="col-span-2 text-center sm:text-lg">
                        <div className="sm:hidden inline-block mr-2 text-gray-600">Price:</div>
                        KSh {item.product.price.toLocaleString()}
                      </div>
                      
                      {/* Quantity */}
                      <div className="col-span-2 flex items-center justify-center">
                        <div className="flex items-center border rounded-md">
                          <button 
                            className="px-2 py-1"
                            onClick={() => handleQuantityUpdate(item, item.quantity - 1)}
                            disabled={isUpdating[item.id] || item.quantity <= 1}
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          <span className="px-3 text-center">{item.quantity}</span>
                          <button 
                            className="px-2 py-1"
                            onClick={() => handleQuantityUpdate(item, item.quantity + 1)}
                            disabled={isUpdating[item.id] || item.quantity >= item.product.stock}
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      
                      {/* Subtotal */}
                      <div className="col-span-2 text-right font-medium sm:text-lg">
                        <div className="sm:hidden inline-block mr-2 text-gray-600">Subtotal:</div>
                        KSh {(item.product.price * item.quantity).toLocaleString()}
                      </div>
                    </div>
                    {item !== cart[cart.length - 1] && <Separator className="mt-4" />}
                  </div>
                ))}
                
                <Separator />
                
                <div className="p-4 flex justify-between">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleClearCart}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Clear Cart
                  </Button>
                  
                  <Link href="/products">
                    <Button variant="link" className="text-[#0B4619]">
                      Continue Shopping
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Order Summary */}
          <div className="lg:w-1/3">
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-bold mb-4">Order Summary</h2>
                
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span>KSh {calculateSubtotal().toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">VAT (16%)</span>
                    <span>KSh {calculateTax().toLocaleString()}</span>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex justify-between font-medium text-lg">
                    <span>Total</span>
                    <span className="text-[#0B4619]">KSh {calculateTotal().toLocaleString()}</span>
                  </div>
                </div>
                
                <Link href="/checkout">
                  <Button className="w-full bg-[#0B4619] hover:bg-[#1a6830]">
                    Proceed to Checkout
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                
                <div className="mt-4 text-sm text-gray-600">
                  <p>Shipping costs calculated at checkout</p>
                  <p className="mt-2">We accept various payment methods including M-Pesa and bank transfers.</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
      
      {/* Recommended Products */}
      {recommendedProducts && recommendedProducts.length > 0 && (
        <div className="mt-12">
          <h2 className="text-2xl font-bold font-heading mb-6">You Might Also Like</h2>
          <ProductGrid products={recommendedProducts} />
        </div>
      )}
    </div>
  );
}
