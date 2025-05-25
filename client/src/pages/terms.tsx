import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Terms() {
  const [activeTab, setActiveTab] = useState("terms");
  
  // Check if URL has a hash for direct linking
  if (typeof window !== "undefined") {
    const hash = window.location.hash;
    if (hash === "#privacy" && activeTab !== "privacy") {
      setActiveTab("privacy");
    } else if (hash === "#returns" && activeTab !== "returns") {
      setActiveTab("returns");
    }
  }
  
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold font-heading mb-4">Terms and Policies</h1>
          <p className="text-gray-600">
            Please read these terms carefully before using GR8F EgertonMarketHub
          </p>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <div className="flex justify-center">
            <TabsList>
              <TabsTrigger value="terms">Terms of Service</TabsTrigger>
              <TabsTrigger value="privacy">Privacy Policy</TabsTrigger>
              <TabsTrigger value="returns">Return Policy</TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="terms" className="prose max-w-none">
            <h2 className="text-2xl font-bold">Terms of Service</h2>
            <p className="text-gray-600">Last updated: June 30, 2023</p>
            
            <p>
              Welcome to GR8F EgertonMarketHub. These Terms of Service ("Terms") govern your use of the GR8F EgertonMarketHub website and services ("Service").
            </p>
            
            <h3 className="text-xl font-bold mt-6">1. Acceptance of Terms</h3>
            <p>
              By accessing or using our Service, you agree to be bound by these Terms. If you disagree with any part of the terms, you may not access the Service.
            </p>
            
            <h3 className="text-xl font-bold mt-6">2. Eligibility</h3>
            <p>
              The Service is available only to current students and staff of Egerton University. By using the Service, you represent and warrant that you are a current student or staff member of Egerton University.
            </p>
            
            <h3 className="text-xl font-bold mt-6">3. User Accounts</h3>
            <p>
              When you create an account with us, you must provide accurate, complete, and current information at all times. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account on our Service.
            </p>
            <p>
              You are responsible for safeguarding the password that you use to access the Service and for any activities or actions under your password. You agree not to disclose your password to any third party.
            </p>
            
            <h3 className="text-xl font-bold mt-6">4. Orders and Payments</h3>
            <p>
              By placing an order through the Service, you are making an offer to purchase the products you have selected. We reserve the right to refuse or cancel any orders at our sole discretion.
            </p>
            <p>
              Prices for products are subject to change without notice. We reserve the right to modify or discontinue the Service without notice at any time.
            </p>
            <p>
              Payment shall be made through the payment methods available on the Service. You agree to provide current, complete, and accurate purchase and account information for all purchases made via the Service.
            </p>
            
            <h3 className="text-xl font-bold mt-6">5. Referral Program</h3>
            <p>
              The referral program allows you to earn vouchers by referring new users to the Service. The terms of the referral program may change from time to time at our discretion.
            </p>
            <p>
              Vouchers earned through the referral program are subject to expiration and other terms as specified at the time of issuance. We reserve the right to revoke vouchers or terminate your participation in the referral program if we determine, in our sole discretion, that you have violated these Terms or engaged in fraudulent activity.
            </p>
            
            <h3 className="text-xl font-bold mt-6">6. Intellectual Property</h3>
            <p>
              The Service and its original content, features, and functionality are and will remain the exclusive property of GR8F EgertonMarketHub. The Service is protected by copyright, trademark, and other laws of Kenya and foreign countries.
            </p>
            
            <h3 className="text-xl font-bold mt-6">7. Termination</h3>
            <p>
              We may terminate or suspend your account immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.
            </p>
            
            <h3 className="text-xl font-bold mt-6">8. Limitation of Liability</h3>
            <p>
              In no event shall GR8F EgertonMarketHub, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the Service.
            </p>
            
            <h3 className="text-xl font-bold mt-6">9. Changes to Terms</h3>
            <p>
              We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material, we will try to provide at least 30 days' notice prior to any new terms taking effect.
            </p>
            
            <h3 className="text-xl font-bold mt-6">10. Contact Us</h3>
            <p>
              If you have any questions about these Terms, please contact us at hello@gr8fmarkethub.co.ke.
            </p>
          </TabsContent>
          
          <TabsContent value="privacy" className="prose max-w-none">
            <h2 className="text-2xl font-bold">Privacy Policy</h2>
            <p className="text-gray-600">Last updated: June 30, 2023</p>
            
            <p>
              This Privacy Policy describes how your personal information is collected, used, and shared when you visit or make a purchase from GR8F EgertonMarketHub.
            </p>
            
            <h3 className="text-xl font-bold mt-6">1. Information We Collect</h3>
            <p>
              When you visit the Service, we automatically collect certain information about your device, including information about your web browser, IP address, time zone, and some of the cookies that are installed on your device.
            </p>
            <p>
              When you make a purchase or attempt to make a purchase through the Service, we collect certain information from you, including your name, billing address, shipping address, payment information, email address, and phone number. We refer to this information as "Order Information."
            </p>
            
            <h3 className="text-xl font-bold mt-6">2. How We Use Your Information</h3>
            <p>
              We use the Order Information that we collect generally to fulfill any orders placed through the Service (including processing your payment information, arranging for shipping, and providing you with invoices and/or order confirmations).
            </p>
            <p>
              Additionally, we use this Order Information to:
            </p>
            <ul className="list-disc pl-5 my-4">
              <li>Communicate with you;</li>
              <li>Screen our orders for potential risk or fraud;</li>
              <li>When in line with the preferences you have shared with us, provide you with information or advertising relating to our products or services;</li>
              <li>Improve and optimize our Service;</li>
              <li>Provide personalized services, including content and advertisements;</li>
              <li>Monitor the effectiveness of our marketing campaigns;</li>
              <li>Help us understand how users interact with our Service.</li>
            </ul>
            
            <h3 className="text-xl font-bold mt-6">3. Sharing Your Information</h3>
            <p>
              We share your Personal Information with third parties to help us use your Personal Information, as described above. For example, we use payment processors to securely process your payment information.
            </p>
            <p>
              We may also share your Personal Information to comply with applicable laws and regulations, to respond to a subpoena, search warrant or other lawful request for information we receive, or to otherwise protect our rights.
            </p>
            
            <h3 className="text-xl font-bold mt-6">4. Your Rights</h3>
            <p>
              You have the right to access personal information we hold about you and to ask that your personal information be corrected, updated, or deleted. If you would like to exercise this right, please contact us through the contact information below.
            </p>
            
            <h3 className="text-xl font-bold mt-6">5. Data Retention</h3>
            <p>
              When you place an order through the Service, we will maintain your Order Information for our records unless and until you ask us to delete this information.
            </p>
            
            <h3 className="text-xl font-bold mt-6">6. Changes</h3>
            <p>
              We may update this privacy policy from time to time in order to reflect, for example, changes to our practices or for other operational, legal or regulatory reasons.
            </p>
            
            <h3 className="text-xl font-bold mt-6">7. Contact Us</h3>
            <p>
              For more information about our privacy practices, if you have questions, or if you would like to make a complaint, please contact us by e-mail at hello@gr8fmarkethub.co.ke.
            </p>
          </TabsContent>
          
          <TabsContent value="returns" className="prose max-w-none">
            <h2 className="text-2xl font-bold">Return Policy</h2>
            <p className="text-gray-600">Last updated: June 30, 2023</p>
            
            <p>
              This Return Policy outlines the terms and conditions for returning products purchased from GR8F EgertonMarketHub.
            </p>
            
            <h3 className="text-xl font-bold mt-6">1. Return Eligibility</h3>
            <p>
              We accept returns of most products within 7 days of delivery for a full refund of the purchase price, provided that the products are in their original condition, unused, and in the original packaging with all tags attached.
            </p>
            <p>
              Some items are not eligible for return, including:
            </p>
            <ul className="list-disc pl-5 my-4">
              <li>Downloadable products</li>
              <li>Gift cards</li>
              <li>Perishable goods</li>
              <li>Intimate items for hygiene reasons</li>
              <li>Custom-made or personalized items</li>
            </ul>
            
            <h3 className="text-xl font-bold mt-6">2. Return Process</h3>
            <p>
              To initiate a return, please contact us at hello@gr8fmarkethub.co.ke with your order number and details about the item(s) you wish to return.
            </p>
            <p>
              Once your return is approved, we will provide instructions on how and where to send your package. Items must be returned in their original packaging and in the same condition as they were received.
            </p>
            
            <h3 className="text-xl font-bold mt-6">3. Refunds</h3>
            <p>
              Once your return is received and inspected, we will send you an email to notify you that we have received your returned item. We will also notify you of the approval or rejection of your refund.
            </p>
            <p>
              If your return is approved, then your refund will be processed, and a credit will automatically be applied to your original method of payment within 7-14 business days.
            </p>
            
            <h3 className="text-xl font-bold mt-6">4. Late or Missing Refunds</h3>
            <p>
              If you haven't received a refund yet, first check your bank account again. Then contact your credit card company, it may take some time before your refund is officially posted. Next contact your bank. There is often some processing time before a refund is posted. If you've done all of this and you still have not received your refund yet, please contact us at hello@gr8fmarkethub.co.ke.
            </p>
            
            <h3 className="text-xl font-bold mt-6">5. Exchanges</h3>
            <p>
              We only replace items if they are defective or damaged. If you need to exchange it for the same item, send us an email at hello@gr8fmarkethub.co.ke and we will provide instructions.
            </p>
            
            <h3 className="text-xl font-bold mt-6">6. Shipping</h3>
            <p>
              You will be responsible for paying for your own shipping costs for returning your item. Shipping costs are non-refundable. If you receive a refund, the cost of return shipping will be deducted from your refund.
            </p>
            
            <h3 className="text-xl font-bold mt-6">7. Contact Us</h3>
            <p>
              If you have any questions about our Return Policy, please contact us at hello@gr8fmarkethub.co.ke.
            </p>
          </TabsContent>
        </Tabs>
        
        <div className="text-center mt-10">
          <Link href="/">
            <Button className="bg-[#0B4619] hover:bg-[#1a6830]">
              Return to Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
