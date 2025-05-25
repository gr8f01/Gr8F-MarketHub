import { useEffect, useState } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { CategoryCard, type CategoryItem } from "@/components/product/category-card";
import { ProductCard } from "@/components/product/product-card";
import { FlashSale } from "@/components/ui/flash-sale";
import { FAQAccordion, type FAQ } from "@/components/ui/faq-accordion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

export default function Home() {
  const { toast } = useToast();
  const [waitlistForm, setWaitlistForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    interests: "",
    acceptTerms: false
  });

  // Query categories
  const { data: categories, isLoading: categoriesLoading } = useQuery({
    queryKey: ["/api/categories"],
    select: (data) => {
      // Transform the data to match CategoryItem interface
      return data.map((category: any) => ({
        id: category.id,
        name: category.name,
        image: category.image,
        count: 20 + Math.floor(Math.random() * 100), // Random count for demo
        subcategories: [
          { 
            name: "New Arrivals", 
            href: `/products?category=${category.id}&sort=newest` 
          },
          { 
            name: category.id === 1 ? "Used Books" : 
                  category.id === 2 ? "Notebooks & Journals" : 
                  category.id === 3 ? "Laptops & Accessories" : 
                  "Bedding & Storage", 
            href: `/products?category=${category.id}&subcategory=1` 
          },
          { 
            name: category.id === 1 ? "Course Materials" : 
                  category.id === 2 ? "Pens & Writing" : 
                  category.id === 3 ? "Study Gadgets" : 
                  "Room Decor", 
            href: `/products?category=${category.id}&subcategory=2` 
          }
        ]
      }));
    }
  });

  // Query featured products
  const { data: featuredProducts, isLoading: productsLoading } = useQuery({
    queryKey: ["/api/products", { featured: true }],
    select: (data) => {
      return data.map((product: any) => ({
        ...product,
        categoryName: getCategoryName(product.categoryId),
        isNew: product.id === 1, // Just for demo purposes
        isBestSeller: product.id === 3
      }));
    }
  });

  const getCategoryName = (categoryId: number) => {
    if (!categories) return "";
    const category = categories.find((cat: CategoryItem) => cat.id === categoryId);
    return category ? category.name : "";
  };

  // Flash sale data (with expiry date 48 hours from now)
  const flashSaleEndTime = new Date();
  flashSaleEndTime.setHours(flashSaleEndTime.getHours() + 48);

  // FAQs data
  const faqs: FAQ[] = [
    {
      question: "When will GR8F MarketHub launch?",
      answer: "We're working hard to launch soon! Join our waitlist to be notified when we go live and to get early access to our platform."
    },
    {
      question: "Do I need an Egerton University email to sign up?",
      answer: "Yes, to ensure our platform serves current Egerton University students, we'll verify your student status using your university email address."
    },
    {
      question: "How does the referral program work?",
      answer: "After signing up, you'll receive a unique referral code. Share this with friends, and when they sign up and complete their first purchase, you'll earn a voucher. You can track your referrals and vouchers in your dashboard."
    },
    {
      question: "What payment methods will be available?",
      answer: "We'll offer multiple payment options including M-Pesa, bank transfers, and other local payment methods. Our goal is to make payments as convenient as possible for Egerton students."
    },
    {
      question: "How will deliveries work on campus?",
      answer: "We'll have dedicated pickup points around campus and offer direct delivery to dorms. Most orders will be delivered within 24-48 hours of purchase."
    }
  ];

  const handleWaitlistFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setWaitlistForm(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (checked: boolean) => {
    setWaitlistForm(prev => ({ ...prev, acceptTerms: checked }));
  };

  const handleWaitlistSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!waitlistForm.firstName || !waitlistForm.lastName || !waitlistForm.email) {
      toast({
        title: "Required fields missing",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    if (!waitlistForm.acceptTerms) {
      toast({
        title: "Terms & Conditions",
        description: "Please accept the terms and conditions to continue.",
        variant: "destructive"
      });
      return;
    }

    // Validate email domain for Egerton University
    if (!waitlistForm.email.endsWith('@student.egerton.ac.ke') && !waitlistForm.email.endsWith('@egerton.ac.ke')) {
      toast({
        title: "Invalid Email",
        description: "Please use your Egerton University email address.",
        variant: "destructive"
      });
      return;
    }

    // Success toast
    toast({
      title: "Success!",
      description: "You've been added to our waitlist. We'll notify you when we launch!",
    });

    // Reset form
    setWaitlistForm({
      firstName: "",
      lastName: "",
      email: "",
      interests: "",
      acceptTerms: false
    });
  };

  return (
    <>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-[#0B4619]/90 to-[#1a6830]/80 text-white">
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 mb-8 md:mb-0 md:pr-8">
              <h1 className="font-heading font-bold text-3xl sm:text-4xl md:text-5xl leading-tight mb-4">
                The Ultimate Marketplace for Egerton University Students
              </h1>
              <p className="text-white/90 text-lg mb-8">
                Discover textbooks, gadgets, dorm essentials, and more at student-friendly prices. We're building a better way for Egerton students to shop.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="#waitlist">
                  <Button className="bg-[#FF7A00] hover:bg-[#FF9633] text-white px-8 py-3 rounded-full font-medium text-center transition-colors w-full sm:w-auto">
                    Join the Waitlist
                  </Button>
                </Link>
                <Link href="/products">
                  <Button variant="outline" className="bg-white hover:bg-neutral-100 text-[#0B4619] px-8 py-3 rounded-full font-medium text-center transition-colors w-full sm:w-auto">
                    Browse Products
                  </Button>
                </Link>
              </div>
            </div>
            <div className="md:w-1/2">
              <div className="relative h-80 md:h-96 overflow-hidden rounded-xl shadow-xl">
                <img 
                  src="https://images.unsplash.com/photo-1531545514256-b1400bc00f31?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80" 
                  alt="African students at Egerton University" 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent flex items-end">
                  <div className="p-6">
                    <span className="inline-block bg-[#FF7A00] px-3 py-1 rounded-full text-sm font-medium mb-2">Coming Soon</span>
                    <h3 className="font-heading font-bold text-2xl">Your Campus Shopping Solution</h3>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Product Categories */}
      <section id="products" className="py-12 md:py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-heading font-bold text-3xl mb-4">Shop By Category</h2>
            <p className="text-neutral-800/80 max-w-2xl mx-auto">
              Discover everything you need for campus life in one convenient marketplace.
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {categoriesLoading ? (
              [...Array(4)].map((_, index) => (
                <div key={index} className="bg-neutral-100 rounded-xl overflow-hidden shadow-sm">
                  <Skeleton className="h-48 w-full" />
                  <div className="p-4">
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/4 mb-4" />
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-full mb-4" />
                    <Skeleton className="h-5 w-1/3" />
                  </div>
                </div>
              ))
            ) : (
              categories?.map((category: CategoryItem) => (
                <CategoryCard key={category.id} category={category} />
              ))
            )}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="font-heading font-bold text-2xl md:text-3xl">Featured Products</h2>
            <Link href="/products" className="text-[#0B4619] hover:text-[#083513] font-medium transition-colors inline-flex items-center">
              View All <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline-block ml-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </Link>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {productsLoading ? (
              [...Array(4)].map((_, index) => (
                <div key={index} className="bg-white rounded-xl overflow-hidden shadow-sm">
                  <Skeleton className="h-56 w-full" />
                  <div className="p-4">
                    <Skeleton className="h-4 w-1/3 mb-2" />
                    <Skeleton className="h-6 w-full mb-2" />
                    <Skeleton className="h-4 w-1/2 mb-4" />
                    <div className="flex justify-between">
                      <Skeleton className="h-6 w-1/3" />
                      <Skeleton className="h-10 w-10 rounded-full" />
                    </div>
                  </div>
                </div>
              ))
            ) : (
              featuredProducts?.map((product: any) => (
                <ProductCard key={product.id} product={product} />
              ))
            )}
          </div>
        </div>
      </section>

      {/* Flash Sale Banner */}
      <FlashSale 
        title="Flash Sale: 25% Off All Stationery"
        description="Only for the next 48 hours. Use code:"
        endTime={flashSaleEndTime}
        discountCode="EGERTON25"
        ctaLink="/products?category=2&sale=true"
      />

      {/* How It Works */}
      <section id="how-it-works" className="py-12 md:py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-heading font-bold text-3xl mb-4">How GR8F MarketHub Works</h2>
            <p className="text-neutral-800/80 max-w-2xl mx-auto">
              A simple process designed specifically for Egerton University students.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-[#0B4619]/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-[#0B4619]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
              </div>
              <h3 className="font-heading font-bold text-xl mb-3">Sign Up</h3>
              <p className="text-neutral-700">
                Join our waitlist to be the first to access GR8F MarketHub when we launch. Create your account with your student email.
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-[#0B4619]/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-[#0B4619]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <h3 className="font-heading font-bold text-xl mb-3">Shop & Save</h3>
              <p className="text-neutral-700">
                Browse through our categories, find what you need, and add items to your cart. Enjoy student discounts and special deals.
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-[#0B4619]/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-[#0B4619]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
                </svg>
              </div>
              <h3 className="font-heading font-bold text-xl mb-3">Fast Delivery</h3>
              <p className="text-neutral-700">
                Choose your preferred payment method and get your items delivered quickly to your dorm or pick them up at convenient campus locations.
              </p>
            </div>
          </div>
          
          <div className="mt-12 bg-neutral-100 rounded-xl p-6 md:p-8">
            <div className="flex flex-col md:flex-row items-center">
              <div className="md:w-2/3 mb-6 md:mb-0 md:pr-8">
                <h3 className="font-heading font-bold text-2xl mb-3">Refer Friends & Earn Rewards</h3>
                <p className="text-neutral-700 mb-4">
                  Share your unique referral code with friends. When they sign up and make their first purchase, you'll earn vouchers for discounts on your next order.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#0B4619] mt-0.5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span>Earn a voucher for every successful referral</span>
                  </li>
                  <li className="flex items-start">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#0B4619] mt-0.5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span>Track your referrals in your student dashboard</span>
                  </li>
                  <li className="flex items-start">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#0B4619] mt-0.5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span>Redeem vouchers on your favorite products</span>
                  </li>
                </ul>
              </div>
              <div className="md:w-1/3">
                <img 
                  src="https://images.unsplash.com/photo-1531545514256-b1400bc00f31?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80" 
                  alt="Students using the referral program" 
                  className="w-full h-auto rounded-lg shadow-md"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQs */}
      <FAQAccordion faqs={faqs} />

      {/* Waitlist */}
      <section id="waitlist" className="py-12 md:py-16 bg-[#0B4619] text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="font-heading font-bold text-3xl md:text-4xl mb-4">Join Our Waitlist</h2>
            <p className="text-white/90 mb-8 text-lg">
              Be the first to know when we launch and get exclusive early access and benefits.
            </p>
            
            <form onSubmit={handleWaitlistSubmit} className="bg-white p-6 rounded-xl shadow-lg text-left">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label htmlFor="firstName" className="block text-neutral-800 font-medium mb-1">First Name</label>
                  <Input 
                    type="text" 
                    id="firstName" 
                    name="firstName"
                    placeholder="Enter your first name" 
                    value={waitlistForm.firstName}
                    onChange={handleWaitlistFormChange}
                    className="w-full px-4 py-3 rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-[#0B4619]/30 focus:border-[#0B4619]"
                  />
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-neutral-800 font-medium mb-1">Last Name</label>
                  <Input 
                    type="text" 
                    id="lastName" 
                    name="lastName"
                    placeholder="Enter your last name" 
                    value={waitlistForm.lastName}
                    onChange={handleWaitlistFormChange}
                    className="w-full px-4 py-3 rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-[#0B4619]/30 focus:border-[#0B4619]"
                  />
                </div>
              </div>
              
              <div className="mb-4">
                <label htmlFor="email" className="block text-neutral-800 font-medium mb-1">University Email</label>
                <Input 
                  type="email" 
                  id="email" 
                  name="email"
                  placeholder="your.name@student.egerton.ac.ke" 
                  value={waitlistForm.email}
                  onChange={handleWaitlistFormChange}
                  className="w-full px-4 py-3 rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-[#0B4619]/30 focus:border-[#0B4619]"
                />
                <p className="text-neutral-600 text-sm mt-1">
                  We'll use this to verify your student status.
                </p>
              </div>
              
              <div className="mb-6">
                <label htmlFor="interests" className="block text-neutral-800 font-medium mb-1">Interested In</label>
                <Select 
                  value={waitlistForm.interests}
                  onValueChange={(value) => setWaitlistForm(prev => ({ ...prev, interests: value }))}
                >
                  <SelectTrigger className="w-full px-4 py-3 rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-[#0B4619]/30 focus:border-[#0B4619]">
                    <SelectValue placeholder="Select what you're most interested in" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="textbooks">Textbooks</SelectItem>
                    <SelectItem value="stationery">Stationery</SelectItem>
                    <SelectItem value="gadgets">Gadgets</SelectItem>
                    <SelectItem value="dorm-essentials">Dorm Essentials</SelectItem>
                    <SelectItem value="all">All Products</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="mb-6">
                <div className="flex items-start">
                  <Checkbox 
                    id="acceptTerms" 
                    checked={waitlistForm.acceptTerms}
                    onCheckedChange={handleCheckboxChange}
                    className="mt-1 mr-2"
                  />
                  <label htmlFor="acceptTerms" className="text-neutral-700 text-sm">
                    I agree to the <Link href="/terms" className="text-[#0B4619] hover:underline">Terms and Conditions</Link> and <Link href="/terms#privacy" className="text-[#0B4619] hover:underline">Privacy Policy</Link>.
                  </label>
                </div>
              </div>
              
              <Button 
                type="submit" 
                className="w-full bg-[#0B4619] hover:bg-[#1a6830] text-white font-medium py-3 px-6 rounded-lg transition-colors"
              >
                Join Waitlist
              </Button>
            </form>
            
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <div>
                  <span className="block font-bold text-xl">350+</span>
                  <span className="text-sm text-white/80">Students on waitlist</span>
                </div>
              </div>
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                <div>
                  <span className="block font-bold text-xl">1,200+</span>
                  <span className="text-sm text-white/80">Products coming soon</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
