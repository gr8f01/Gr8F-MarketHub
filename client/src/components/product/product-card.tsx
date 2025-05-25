import { useState } from "react";
import { Link } from "wouter";
import { useStore } from "@/lib/store";
import { useToast } from "@/hooks/use-toast";
import { Heart, ShoppingCart, Star, StarHalf } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export interface ProductCardProps {
  product: {
    id: number;
    name: string;
    description: string;
    price: number;
    originalPrice?: number;
    images: string[];
    rating: number;
    numReviews: number;
    categoryId: number;
    categoryName?: string;
    isNew?: boolean;
    isOnSale?: boolean;
    isBestSeller?: boolean;
  };
}

export const ProductCard = ({ product }: ProductCardProps) => {
  const { addToCart, isAuthenticated } = useStore();
  const { toast } = useToast();
  const [isHovered, setIsHovered] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      toast({
        title: "Please login",
        description: "You need to be logged in to add items to your cart",
        variant: "destructive",
      });
      return;
    }
    
    setIsAddingToCart(true);
    try {
      const success = await addToCart(product.id, 1);
      if (success) {
        toast({
          title: "Added to cart",
          description: `${product.name} has been added to your cart`,
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to add item to cart",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred",
        variant: "destructive",
      });
    } finally {
      setIsAddingToCart(false);
    }
  };

  // Generate rating stars
  const renderRatingStars = () => {
    // Ensure product.rating is a valid number (fallback to 0 if undefined or NaN)
    const rating = typeof product.rating === 'number' && !isNaN(product.rating) ? product.rating : 0;
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    // Ensure fullStars is within valid range (0-5)
    const safeFullStars = Math.min(5, Math.max(0, fullStars));
    const remainingStars = Math.max(0, 5 - safeFullStars - (hasHalfStar ? 1 : 0));
    
    return (
      <div className="flex text-yellow-400 mr-1">
        {/* Full stars */}
        {Array.from({ length: safeFullStars }).map((_, i) => (
          <Star key={`full-${i}`} className="h-3 w-3 fill-current" />
        ))}
        
        {/* Half star if applicable */}
        {hasHalfStar && <StarHalf className="h-3 w-3 fill-current" />}
        
        {/* Empty stars */}
        {Array.from({ length: remainingStars }).map((_, i) => (
          <Star key={`empty-${i}`} className="h-3 w-3 text-gray-300" />
        ))}
      </div>
    );
  };

  return (
    <Link href={`/products/${product.id}`}>
      <div 
        className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow block cursor-pointer"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="relative">
          <div className="h-56 overflow-hidden">
            <img 
              src={product.images && product.images.length > 0 ? product.images[0] : 'https://placehold.co/600x400?text=No+Image'} 
              alt={product.name} 
              className={`w-full h-full object-cover transition-transform duration-300 ${isHovered ? "scale-105" : ""}`}
            />
          </div>
          
          {/* Badges */}
          {product.isNew && (
            <Badge className="absolute top-3 right-3 bg-[#FF7A00]/90 text-white">New</Badge>
          )}
          {product.isOnSale && (
            <Badge className="absolute top-3 right-3 bg-red-500/90 text-white">Sale</Badge>
          )}
          {product.isBestSeller && (
            <Badge className="absolute top-3 right-3 bg-[#FF7A00]/90 text-white">Best Seller</Badge>
          )}
          
          <Button 
            variant="outline"
            size="icon"
            className="absolute top-3 left-3 bg-white/90 text-neutral-800 hover:bg-white rounded-full" 
            aria-label="Add to favorites"
            onClick={(e) => {
              e.preventDefault();
              toast({
                title: "Feature coming soon",
                description: "Wishlist feature is under development",
              });
            }}
          >
            <Heart className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="p-4">
          <div className="mb-1">
            <span className="text-sm text-neutral-600">{product.categoryName}</span>
          </div>
          
          <h3 className="font-medium text-lg mb-1 line-clamp-1">{product.name}</h3>
          
          <div className="flex items-center mb-2">
            {renderRatingStars()}
            <span className="text-xs text-neutral-600">({product.numReviews || 0})</span>
          </div>
          
          <div className="flex justify-between items-center mt-4">
            <div>
              <span className="text-primary font-bold text-lg">
                KSh {typeof product.price === 'number' ? product.price.toLocaleString() : '0'}
              </span>
              {product.originalPrice && typeof product.originalPrice === 'number' && (
                <span className="text-neutral-500 text-sm line-through ml-2">
                  KSh {product.originalPrice.toLocaleString()}
                </span>
              )}
            </div>
            
            <Button
              variant="outline"
              size="icon"
              className="bg-primary/10 hover:bg-primary/20 text-primary rounded-full"
              aria-label="Add to cart"
              onClick={handleAddToCart}
              disabled={isAddingToCart}
            >
              <ShoppingCart className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </Link>
  );
};
