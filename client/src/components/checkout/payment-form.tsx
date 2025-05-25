import { useState } from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, CheckCircle, CreditCard, Download, Smartphone } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface PaymentFormProps {
  paymentMethod: string;
  setPaymentMethod: (method: string) => void;
  voucherCode: string;
  setVoucherCode: (code: string) => void;
}

export function PaymentForm({ 
  paymentMethod, 
  setPaymentMethod,
  voucherCode,
  setVoucherCode
}: PaymentFormProps) {
  const [isApplyingVoucher, setIsApplyingVoucher] = useState(false);
  const [voucherMessage, setVoucherMessage] = useState<{type: "success" | "error", message: string} | null>(null);

  const handleApplyVoucher = () => {
    if (!voucherCode.trim()) {
      setVoucherMessage({ type: "error", message: "Please enter a voucher code" });
      return;
    }

    setIsApplyingVoucher(true);
    
    // Simulate API call to validate voucher
    setTimeout(() => {
      // Demo voucher code for testing
      if (voucherCode === "STUDENT10") {
        setVoucherMessage({ type: "success", message: "10% discount applied to your order!" });
      } else {
        setVoucherMessage({ type: "error", message: "Invalid or expired voucher code" });
      }
      setIsApplyingVoucher(false);
    }, 1000);
  };

  return (
    <div className="space-y-6">
      {/* Payment methods */}
      <RadioGroup 
        value={paymentMethod} 
        onValueChange={setPaymentMethod}
        className="space-y-3"
      >
        <div className="flex items-center space-x-2 border p-4 rounded-md hover:bg-gray-50 cursor-pointer">
          <RadioGroupItem value="mpesa" id="mpesa" />
          <Label htmlFor="mpesa" className="flex items-center cursor-pointer flex-1">
            <Smartphone className="mr-2 h-5 w-5 text-green-600" />
            <div>
              <p className="font-medium">M-Pesa</p>
              <p className="text-sm text-gray-500">Pay directly with your M-Pesa account</p>
            </div>
          </Label>
        </div>

        <div className="flex items-center space-x-2 border p-4 rounded-md hover:bg-gray-50 cursor-pointer">
          <RadioGroupItem value="bank" id="bank" />
          <Label htmlFor="bank" className="flex items-center cursor-pointer flex-1">
            <CreditCard className="mr-2 h-5 w-5 text-blue-600" />
            <div>
              <p className="font-medium">Bank Transfer</p>
              <p className="text-sm text-gray-500">Make a direct bank transfer</p>
            </div>
          </Label>
        </div>

        <div className="flex items-center space-x-2 border p-4 rounded-md hover:bg-gray-50 cursor-pointer">
          <RadioGroupItem value="cash" id="cash" />
          <Label htmlFor="cash" className="flex items-center cursor-pointer flex-1">
            <Download className="mr-2 h-5 w-5 text-orange-600" />
            <div>
              <p className="font-medium">Cash on Delivery</p>
              <p className="text-sm text-gray-500">Pay when you receive your items</p>
            </div>
          </Label>
        </div>
      </RadioGroup>

      {/* Show specific payment method details based on selection */}
      <div className="mt-6">
        {paymentMethod === "mpesa" && (
          <div className="bg-gray-50 p-4 rounded-md">
            <p className="text-sm mb-4">When you complete your order, you'll receive an M-Pesa prompt on your phone to complete the payment.</p>
            <Alert>
              <Smartphone className="h-4 w-4" />
              <AlertTitle>M-Pesa Payment</AlertTitle>
              <AlertDescription>
                Ensure your phone is on and has sufficient balance to complete the transaction.
              </AlertDescription>
            </Alert>
          </div>
        )}

        {paymentMethod === "bank" && (
          <div className="bg-gray-50 p-4 rounded-md">
            <p className="text-sm mb-4">Please use the following bank details to make your payment. Include your order number as the reference.</p>
            <div className="space-y-2 text-sm">
              <p><strong>Bank:</strong> Bank of Africa</p>
              <p><strong>Account Name:</strong> GR8F EgertonMarketHub</p>
              <p><strong>Account Number:</strong> 0123456789</p>
              <p><strong>Branch:</strong> Nakuru</p>
              <p><strong>Reference:</strong> Your order number (will be provided)</p>
            </div>
          </div>
        )}

        {paymentMethod === "cash" && (
          <div className="bg-gray-50 p-4 rounded-md">
            <p className="text-sm mb-4">Pay in cash when you receive your order. We'll provide a receipt for your payment.</p>
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Cash on Delivery</AlertTitle>
              <AlertDescription>
                Please have the exact amount ready for our delivery person.
              </AlertDescription>
            </Alert>
          </div>
        )}
      </div>

      {/* Voucher code */}
      <div className="mt-6 pt-6 border-t">
        <h3 className="font-medium mb-3">Apply Voucher</h3>
        <div className="flex gap-2">
          <Input 
            placeholder="Enter voucher code" 
            value={voucherCode}
            onChange={(e) => setVoucherCode(e.target.value)}
            className="flex-1"
          />
          <Button 
            onClick={handleApplyVoucher}
            disabled={isApplyingVoucher}
            variant="outline"
          >
            {isApplyingVoucher ? "Applying..." : "Apply"}
          </Button>
        </div>

        {voucherMessage && (
          <div className={`mt-2 text-sm flex items-center ${
            voucherMessage.type === "success" ? "text-green-600" : "text-red-600"
          }`}>
            {voucherMessage.type === "success" ? (
              <CheckCircle className="h-4 w-4 mr-1" />
            ) : (
              <AlertCircle className="h-4 w-4 mr-1" />
            )}
            {voucherMessage.message}
          </div>
        )}
      </div>
    </div>
  );
}