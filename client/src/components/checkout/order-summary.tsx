import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Package } from "lucide-react";
import { useStore } from "@/lib/store";

interface OrderSummaryProps {
  cart: any[];
  voucherCode?: string;
}

export function OrderSummary({ cart, voucherCode }: OrderSummaryProps) {
  const [subtotal, setSubtotal] = useState(0);
  const [shipping, setShipping] = useState(100); // Default shipping cost in KES
  const [discount, setDiscount] = useState(0);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    // Calculate subtotal
    const calculatedSubtotal = cart.reduce((sum, item) => 
      sum + (item.product.price * item.quantity), 0);
    setSubtotal(calculatedSubtotal);
    
    // Apply voucher discount if valid
    let discountAmount = 0;
    if (voucherCode === "STUDENT10") {
      discountAmount = calculatedSubtotal * 0.1; // 10% discount
    }
    setDiscount(discountAmount);
    
    // Calculate total
    const calculatedTotal = calculatedSubtotal + shipping - discountAmount;
    setTotal(calculatedTotal);
    
    // Adjust shipping based on order size
    if (calculatedSubtotal > 5000) {
      setShipping(0); // Free shipping for orders above 5000 KES
    } else if (calculatedSubtotal > 2000) {
      setShipping(50); // Reduced shipping for orders above 2000 KES
    }
  }, [cart, voucherCode]);

  // Format currency
  const formatCurrency = (amount: number) => {
    return `KES ${amount.toFixed(2)}`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Package className="mr-2 h-5 w-5" />
          Order Summary
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Cart items */}
        <div className="space-y-4 mb-6">
          {cart.map((item) => (
            <div key={item.id} className="flex justify-between">
              <div className="flex-1">
                <p className="font-medium">{item.product.name}</p>
                <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
              </div>
              <p className="font-medium">
                {formatCurrency(item.product.price * item.quantity)}
              </p>
            </div>
          ))}
        </div>

        <Separator className="my-4" />

        {/* Order calculations */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <p>Subtotal</p>
            <p className="font-medium">{formatCurrency(subtotal)}</p>
          </div>
          <div className="flex justify-between text-sm">
            <p>Shipping</p>
            <p className="font-medium">
              {shipping === 0 ? "Free" : formatCurrency(shipping)}
            </p>
          </div>
          {discount > 0 && (
            <div className="flex justify-between text-sm text-green-600">
              <p>Discount (10%)</p>
              <p className="font-medium">-{formatCurrency(discount)}</p>
            </div>
          )}
        </div>

        <Separator className="my-4" />

        {/* Total */}
        <div className="flex justify-between items-center">
          <p className="font-bold">Total</p>
          <p className="font-bold text-lg">{formatCurrency(total)}</p>
        </div>

        {/* Shipment details */}
        <div className="mt-6 bg-gray-50 p-3 rounded-md">
          <div className="flex items-center text-sm text-gray-500 mb-2">
            <Package className="h-4 w-4 mr-1" />
            <p>Estimated delivery within 1-3 business days</p>
          </div>
          {subtotal > 5000 && (
            <Badge className="bg-[#0B4619]">Free Shipping</Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}