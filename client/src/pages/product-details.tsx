import { useState } from "react";
import { useLocation, Link } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useStore } from "@/lib/store";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { 
  Card,
  CardHeader,
  CardContent,
  CardDescription,
  CardFooter,
  CardTitle
} from "@/components/ui/card";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { ProductCard } from "@/components/product/product-card";
import { Heart, Minus, Plus, Share2, ShoppingCart, Star, StarHalf, Truck } from "lucide-react";

export default function ProductDetails() {
  const [location] = useLocation();
  const { toast } = useToast();
  const { user, isAuthenticated, addToCart } = useStore();
  const queryClient = useQueryClient();
  const productId = parseInt(location.split("/").pop() || "0");
  
  const [quantity, setQuantity] = useState(1);
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    comment: ""
  });
  
  // Get product details
  const { data: product, isLoading: productLoading } = useQuery({
    queryKey: [`/api/products/${productId}`],
    enabled: !!productId
  });
  
  // Get category details
  const { data: category } = useQuery({
    queryKey: [`/api/categories/${product?.categoryId}`],
    enabled: !!product?.categoryId
  });
  
  // Get product reviews
  const { data: reviews, isLoading: reviewsLoading } = useQuery({
    queryKey: [`/api/products/${productId}/reviews`],
    enabled: !!productId
  });
  
  // Get related products
  const { data: relatedProducts, isLoading: relatedLoading } = useQuery({
    queryKey: ['/api/products', { category: product?.categoryId }],
    enabled: !!product?.categoryId,
    select: (data) => data.filter((p: any) => p.id !== productId).slice(0, 4)
  });
  
  // Add review mutation
  const addReviewMutation = useMutation({
    mutationFn: (reviewData: any) => 
      apiRequest('POST', `/api/products/${productId}/reviews`, reviewData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/products/${productId}/reviews`] });
      queryClient.invalidateQueries({ queryKey: [`/api/products/${productId}`] });
      
      setReviewForm({
        rating: 5,
        comment: ""
      });
      
      toast({
        title: "Review submitted",
        description: "Thank you for your feedback!",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to submit review. You may have already reviewed this product.",
        variant: "destructive"
      });
    }
  });
  
  const handleQuantityChange = (amount: number) => {
    const newQuantity = quantity + amount;
    if (newQuantity >= 1 && newQuantity <= (product?.stock || 1)) {
      setQuantity(newQuantity);
    }
  };
  
  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      toast({
        title: "Login required",
        description: "Please login to add items to your cart",
        variant: "destructive"
      });
      return;
    }
    
    if (quantity > (product?.stock || 0)) {
      toast({
        title: "Insufficient stock",
        description: "Not enough items in stock",
        variant: "destructive"
      });
      return;
    }
    
    const success = await addToCart(productId, quantity);
    
    if (success) {
      toast({
        title: "Added to cart",
        description: `${quantity} item(s) added to cart`
      });
    } else {
      toast({
        title: "Failed to add to cart",
        description: "Please try again later",
        variant: "destructive"
      });
    }
  };
  
  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      toast({
        title: "Login required",
        description: "Please login to submit a review",
        variant: "destructive"
      });
      return;
    }
    
    addReviewMutation.mutate(reviewForm);
  };
  
  // Render full star rating
  const renderFullRating = (rating: number) => {
    return (
      <div className="flex">
        {[...Array(5)].map((_, i) => (
          <Star 
            key={i} 
            className={`h-5 w-5 ${i < Math.floor(rating) ? 'text-yellow-400 fill-yellow-400' : i < rating ? 'text-yellow-400' : 'text-gray-300'}`}
          />
        ))}
      </div>
    );
  };
  
  // Calculate discount percentage
  const calculateDiscount = () => {
    if (product?.originalPrice && product.price < product.originalPrice) {
      return Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);
    }
    return 0;
  };
  
  if (productLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-4">
          <Skeleton className="h-6 w-64" />
        </div>
        
        <div className="flex flex-col md:flex-row gap-8">
          <div className="md:w-1/2">
            <Skeleton className="aspect-square w-full rounded-lg" />
          </div>
          
          <div className="md:w-1/2">
            <Skeleton className="h-10 w-3/4 mb-4" />
            <Skeleton className="h-6 w-1/4 mb-4" />
            <Skeleton className="h-24 w-full mb-6" />
            <Skeleton className="h-8 w-1/3 mb-4" />
            <div className="flex items-center gap-4 mb-6">
              <Skeleton className="h-12 w-32" />
              <Skeleton className="h-12 w-40" />
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  if (!product) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
        <p className="text-gray-600 mb-6">The product you're looking for doesn't exist or has been removed.</p>
        <Link href="/products">
          <Button>Continue Shopping</Button>
        </Link>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumbs */}
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/products">Products</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href={`/products?category=${product.categoryId}`}>
              {category?.name || 'Category'}
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href={`/products/${product.id}`} isCurrentPage>
              {product.name}
            </BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Product Images */}
        <div className="lg:w-1/2">
          <Carousel className="w-full">
            <CarouselContent>
              {product.images.map((image, index) => (
                <CarouselItem key={index}>
                  <div className="aspect-square w-full overflow-hidden rounded-xl border">
                    <img 
                      src={image} 
                      alt={`${product.name} - Image ${index + 1}`} 
                      className="h-full w-full object-cover"
                    />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="left-2" />
            <CarouselNext className="right-2" />
          </Carousel>
        </div>
        
        {/* Product Details */}
        <div className="lg:w-1/2">
          <h1 className="text-3xl font-bold font-heading mb-2">{product.name}</h1>
          
          <div className="flex items-center gap-2 mb-4">
            <div className="flex items-center">
              {renderFullRating(product.rating)}
              <span className="ml-2 text-gray-600">({product.numReviews} reviews)</span>
            </div>
            
            {product.stock > 0 ? (
              <Badge className="bg-green-100 text-green-800 ml-2">In Stock</Badge>
            ) : (
              <Badge className="bg-red-100 text-red-800 ml-2">Out of Stock</Badge>
            )}
            
            {product.isOnSale && (
              <Badge className="bg-red-500 text-white ml-2">Sale</Badge>
            )}
          </div>
          
          <div className="mb-6">
            <div className="flex items-center gap-2">
              <span className="text-3xl font-bold text-[#0B4619]">
                KSh {product.price.toLocaleString()}
              </span>
              
              {product.originalPrice && product.price < product.originalPrice && (
                <>
                  <span className="text-lg text-gray-500 line-through">
                    KSh {product.originalPrice.toLocaleString()}
                  </span>
                  <Badge className="bg-red-500 text-white">
                    Save {calculateDiscount()}%
                  </Badge>
                </>
              )}
            </div>
          </div>
          
          <div className="mb-6">
            <h3 className="font-medium mb-2">Description</h3>
            <p className="text-gray-700">{product.description}</p>
          </div>
          
          {product.stock > 0 && (
            <div className="mb-6">
              <div className="flex items-center mb-6">
                <div className="flex items-center mr-6">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleQuantityChange(-1)}
                    disabled={quantity <= 1}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="mx-4 font-medium">{quantity}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleQuantityChange(1)}
                    disabled={quantity >= product.stock}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <span className="text-sm text-gray-600">
                  {product.stock} items available
                </span>
              </div>
              
              <div className="flex flex-wrap gap-4">
                <Button 
                  className="flex-1 bg-[#0B4619] hover:bg-[#1a6830]"
                  onClick={handleAddToCart}
                >
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  Add to Cart
                </Button>
                
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => {
                    toast({
                      title: "Added to wishlist",
                      description: "Feature coming soon"
                    });
                  }}
                >
                  <Heart className="mr-2 h-5 w-5" />
                  Add to Wishlist
                </Button>
              </div>
            </div>
          )}
          
          {/* Delivery Information */}
          <div className="mt-8 space-y-4">
            <div className="flex items-start gap-3">
              <Truck className="h-5 w-5 text-[#0B4619] mt-0.5" />
              <div>
                <h4 className="font-medium">Fast Delivery</h4>
                <p className="text-sm text-gray-600">
                  Delivery available to all Egerton University campuses within 24-48 hours
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <Share2 className="h-5 w-5 text-[#0B4619] mt-0.5" />
              <div>
                <h4 className="font-medium">Share this Product</h4>
                <div className="flex gap-3 mt-2">
                  <a href="#" className="text-gray-600 hover:text-[#0B4619]">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="bi bi-facebook" viewBox="0 0 16 16">
                      <path d="M16 8.049c0-4.446-3.582-8.05-8-8.05C3.58 0-.002 3.603-.002 8.05c0 4.017 2.926 7.347 6.75 7.951v-5.625h-2.03V8.05H6.75V6.275c0-2.017 1.195-3.131 3.022-3.131.876 0 1.791.157 1.791.157v1.98h-1.009c-.993 0-1.303.621-1.303 1.258v1.51h2.218l-.354 2.326H9.25V16c3.824-.604 6.75-3.934 6.75-7.951z"/>
                    </svg>
                  </a>
                  <a href="#" className="text-gray-600 hover:text-[#0B4619]">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="bi bi-twitter" viewBox="0 0 16 16">
                      <path d="M5.026 15c6.038 0 9.341-5.003 9.341-9.334 0-.14 0-.282-.006-.422A6.685 6.685 0 0 0 16 3.542a6.658 6.658 0 0 1-1.889.518 3.301 3.301 0 0 0 1.447-1.817 6.533 6.533 0 0 1-2.087.793A3.286 3.286 0 0 0 7.875 6.03a9.325 9.325 0 0 1-6.767-3.429 3.289 3.289 0 0 0 1.018 4.382A3.323 3.323 0 0 1 .64 6.575v.045a3.288 3.288 0 0 0 2.632 3.218 3.203 3.203 0 0 1-.865.115 3.23 3.23 0 0 1-.614-.057 3.283 3.283 0 0 0 3.067 2.277A6.588 6.588 0 0 1 .78 13.58a6.32 6.32 0 0 1-.78-.045A9.344 9.344 0 0 0 5.026 15z"/>
                    </svg>
                  </a>
                  <a href="#" className="text-gray-600 hover:text-[#0B4619]">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="bi bi-whatsapp" viewBox="0 0 16 16">
                      <path d="M13.601 2.326A7.854 7.854 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.933 7.933 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.898 7.898 0 0 0 13.6 2.326zM7.994 14.521a6.573 6.573 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.557 6.557 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592zm3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.729.729 0 0 0-.529.247c-.182.198-.691.677-.691 1.654 0 .977.71 1.916.81 2.049.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232z"/>
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Tabs for Details and Reviews */}
      <div className="mt-12">
        <Tabs defaultValue="details">
          <TabsList className="grid w-full grid-cols-2 md:w-auto">
            <TabsTrigger value="details">Product Details</TabsTrigger>
            <TabsTrigger value="reviews">Reviews ({product.numReviews})</TabsTrigger>
          </TabsList>
          
          <TabsContent value="details" className="mt-6">
            <Card>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-lg font-medium mb-3">Product Specifications</h3>
                    <ul className="space-y-2">
                      <li className="flex justify-between">
                        <span className="text-gray-600">Category:</span>
                        <span className="font-medium">{category?.name}</span>
                      </li>
                      <li className="flex justify-between">
                        <span className="text-gray-600">Stock:</span>
                        <span className="font-medium">{product.stock} available</span>
                      </li>
                      {product.originalPrice && (
                        <li className="flex justify-between">
                          <span className="text-gray-600">Discount:</span>
                          <span className="font-medium">{calculateDiscount()}% off</span>
                        </li>
                      )}
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium mb-3">Additional Information</h3>
                    <p className="text-gray-700">
                      This product is specifically curated for Egerton University students.
                      For any questions or special requests, please contact our support team.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="reviews" className="mt-6">
            <Card>
              <CardContent className="pt-6 px-6">
                {reviewsLoading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="flex gap-4">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="flex-1">
                          <Skeleton className="h-5 w-40 mb-2" />
                          <Skeleton className="h-4 w-20 mb-3" />
                          <Skeleton className="h-24 w-full" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : reviews?.length > 0 ? (
                  <div className="space-y-6">
                    {reviews.map((review: any) => (
                      <div key={review.id} className="border-b border-gray-200 pb-4 last:border-0">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="font-medium">{review.user?.firstName} {review.user?.lastName}</div>
                          <span className="text-gray-500 text-sm">
                            {new Date(review.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="mb-2">
                          {renderFullRating(review.rating)}
                        </div>
                        <p className="text-gray-700">{review.comment}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <h3 className="text-lg font-medium mb-2">No Reviews Yet</h3>
                    <p className="text-gray-600 mb-4">Be the first to review this product</p>
                  </div>
                )}
                
                {/* Add Review Form */}
                {isAuthenticated && (
                  <div className="mt-8 border-t border-gray-200 pt-6">
                    <h3 className="text-lg font-medium mb-4">Write a Review</h3>
                    <form onSubmit={handleSubmitReview}>
                      <div className="mb-4">
                        <label className="block mb-2 text-sm font-medium">Your Rating</label>
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                              className="text-gray-300 hover:text-yellow-400"
                            >
                              <Star 
                                className={`h-6 w-6 ${star <= reviewForm.rating ? 'text-yellow-400 fill-yellow-400' : ''}`}
                              />
                            </button>
                          ))}
                        </div>
                      </div>
                      
                      <div className="mb-4">
                        <label htmlFor="comment" className="block mb-2 text-sm font-medium">Your Review</label>
                        <Textarea
                          id="comment"
                          placeholder="What did you like or dislike about this product?"
                          rows={4}
                          value={reviewForm.comment}
                          onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                          required
                        />
                      </div>
                      
                      <Button 
                        type="submit" 
                        className="bg-[#0B4619] hover:bg-[#1a6830]"
                        disabled={addReviewMutation.isPending}
                      >
                        Submit Review
                      </Button>
                    </form>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Related Products */}
      <div className="mt-16">
        <h2 className="text-2xl font-bold font-heading mb-6">Related Products</h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {relatedLoading ? (
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
            relatedProducts?.map((relatedProduct: any) => (
              <ProductCard key={relatedProduct.id} product={{
                ...relatedProduct,
                categoryName: category?.name
              }} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
