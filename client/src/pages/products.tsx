import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { ProductGrid } from "@/components/product/product-grid";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Separator } from "@/components/ui/separator";
import { FlashSale } from "@/components/ui/flash-sale";
import { useIsMobile } from "@/hooks/use-mobile";
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger 
} from "@/components/ui/sheet";
import { Filter, SlidersHorizontal } from "lucide-react";

export default function Products() {
  const [location] = useLocation();
  const isMobile = useIsMobile();
  
  // Get query params
  const searchParams = new URLSearchParams(location.split('?')[1] || '');
  const queryCategory = searchParams.get('category');
  const querySearch = searchParams.get('search');
  
  // State for filters
  const [filters, setFilters] = useState({
    category: queryCategory || '',
    search: querySearch || '',
    minPrice: 0,
    maxPrice: 5000,
    sort: 'newest',
    inStock: true,
    onSale: false,
    featured: false
  });

  // State for mobile filter sheet
  const [filterOpen, setFilterOpen] = useState(false);
  
  // Fetch categories
  const { data: categories } = useQuery({
    queryKey: ['/api/categories']
  });
  
  // Fetch products with filters
  const { data: products, isLoading } = useQuery({
    queryKey: ['/api/products', { 
      category: filters.category,
      search: filters.search 
    }]
  });
  
  // Get filtered products
  const getFilteredProducts = () => {
    if (!products) return [];
    
    return products
      .filter(product => {
        // Apply price filter
        return product.price >= filters.minPrice && 
               product.price <= filters.maxPrice &&
               // Apply in stock filter
               (!filters.inStock || product.stock > 0) &&
               // Apply on sale filter
               (!filters.onSale || product.isOnSale) &&
               // Apply featured filter
               (!filters.featured || product.isFeatured);
      })
      .sort((a, b) => {
        // Apply sorting
        if (filters.sort === 'newest') {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        } else if (filters.sort === 'price-low') {
          return a.price - b.price;
        } else if (filters.sort === 'price-high') {
          return b.price - a.price;
        } else if (filters.sort === 'popular') {
          return b.numReviews - a.numReviews;
        }
        return 0;
      });
  };
  
  // Calculate price range from products
  useEffect(() => {
    if (products && products.length > 0) {
      const prices = products.map(p => p.price);
      const minPrice = Math.min(...prices);
      const maxPrice = Math.max(...prices);
      
      setFilters(prev => ({
        ...prev,
        minPrice: prev.minPrice || Math.floor(minPrice),
        maxPrice: prev.maxPrice || Math.ceil(maxPrice)
      }));
    }
  }, [products]);
  
  // Handle price slider change
  const handlePriceChange = (value: number[]) => {
    setFilters({
      ...filters,
      minPrice: value[0],
      maxPrice: value[1]
    });
  };
  
  // Filter UI for both desktop and mobile
  const FilterUI = () => (
    <div className="space-y-6">
      {/* Categories */}
      <div>
        <h3 className="text-lg font-semibold mb-3">Categories</h3>
        <Select 
          value={filters.category} 
          onValueChange={(value) => setFilters({...filters, category: value})}
        >
          <SelectTrigger>
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories?.map((category: any) => (
              <SelectItem key={category.id} value={category.id.toString()}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <Separator />
      
      {/* Price Range */}
      <div>
        <h3 className="text-lg font-semibold mb-3">Price Range</h3>
        <div className="mb-6">
          <Slider
            defaultValue={[filters.minPrice, filters.maxPrice]}
            max={5000}
            step={100}
            onValueChange={handlePriceChange}
            className="my-4"
          />
          <div className="flex justify-between items-center">
            <div>
              <span className="text-sm text-gray-500">Min:</span>
              <div className="font-medium">KSh {filters.minPrice}</div>
            </div>
            <div>
              <span className="text-sm text-gray-500">Max:</span>
              <div className="font-medium">KSh {filters.maxPrice}</div>
            </div>
          </div>
        </div>
      </div>
      
      <Separator />
      
      {/* Availability Filters */}
      <div>
        <h3 className="text-lg font-semibold mb-3">Availability</h3>
        <div className="space-y-2">
          <div className="flex items-center">
            <Checkbox 
              id="inStock" 
              checked={filters.inStock}
              onCheckedChange={(checked) => 
                setFilters({...filters, inStock: checked as boolean})
              }
              className="mr-2"
            />
            <label htmlFor="inStock" className="text-sm cursor-pointer">In Stock</label>
          </div>
          <div className="flex items-center">
            <Checkbox 
              id="onSale" 
              checked={filters.onSale}
              onCheckedChange={(checked) => 
                setFilters({...filters, onSale: checked as boolean})
              }
              className="mr-2"
            />
            <label htmlFor="onSale" className="text-sm cursor-pointer">On Sale</label>
          </div>
          <div className="flex items-center">
            <Checkbox 
              id="featured" 
              checked={filters.featured}
              onCheckedChange={(checked) => 
                setFilters({...filters, featured: checked as boolean})
              }
              className="mr-2"
            />
            <label htmlFor="featured" className="text-sm cursor-pointer">Featured Items</label>
          </div>
        </div>
      </div>
      
      <Separator />
      
      {/* Clear Filters */}
      <Button 
        variant="outline" 
        className="w-full"
        onClick={() => {
          setFilters({
            category: 'all',
            search: '',
            minPrice: 0,
            maxPrice: 5000,
            sort: 'newest',
            inStock: true,
            onSale: false,
            featured: false
          });
        }}
      >
        Clear Filters
      </Button>
    </div>
  );
  
  // Flash sale data (with expiry date 48 hours from now)
  const flashSaleEndTime = new Date();
  flashSaleEndTime.setHours(flashSaleEndTime.getHours() + 48);
  
  return (
    <>
      {/* Show Flash Sale if products are on sale */}
      {products?.some((p: any) => p.isOnSale) && (
        <FlashSale 
          title="Flash Sale: 25% Off Select Products"
          description="Only for the next 48 hours. Use code:"
          endTime={flashSaleEndTime}
          discountCode="EGERTON25"
          ctaLink="/products?onSale=true"
        />
      )}
      
      <div className="container mx-auto px-4 py-8">
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="font-heading text-3xl md:text-4xl font-bold">
            {querySearch 
              ? `Search Results for "${querySearch}"` 
              : queryCategory 
                ? `${categories?.find((c: any) => c.id.toString() === queryCategory)?.name || 'Category'} Products` 
                : 'All Products'}
          </h1>
          <p className="text-gray-600 mt-2">
            Browse our selection of products for Egerton University students
          </p>
        </div>
        
        {/* Filters and Products Grid */}
        <div className="flex flex-col md:flex-row gap-8">
          {/* Desktop Filters Sidebar */}
          {!isMobile && (
            <div className="w-64 flex-shrink-0">
              <FilterUI />
            </div>
          )}
          
          {/* Mobile Filters */}
          {isMobile && (
            <Sheet open={filterOpen} onOpenChange={setFilterOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" className="mb-4 w-full flex justify-between items-center">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter Products
                  <SlidersHorizontal className="h-4 w-4 ml-2" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left">
                <SheetHeader>
                  <SheetTitle>Filters</SheetTitle>
                </SheetHeader>
                <div className="py-4">
                  <FilterUI />
                </div>
              </SheetContent>
            </Sheet>
          )}
          
          {/* Products Section */}
          <div className="flex-1">
            {/* Sort and Results Count */}
            <div className="flex flex-col sm:flex-row justify-between mb-6">
              <p className="text-gray-600 mb-4 sm:mb-0">
                Showing {getFilteredProducts().length} products
              </p>
              
              <div className="flex items-center">
                <label className="mr-2 text-sm text-gray-600">Sort by:</label>
                <Select 
                  value={filters.sort}
                  onValueChange={(value) => setFilters({...filters, sort: value})}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Sort By" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest</SelectItem>
                    <SelectItem value="price-low">Price: Low to High</SelectItem>
                    <SelectItem value="price-high">Price: High to Low</SelectItem>
                    <SelectItem value="popular">Popularity</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {/* Products Grid */}
            <ProductGrid 
              products={getFilteredProducts()}
              isLoading={isLoading}
            />
          </div>
        </div>
      </div>
    </>
  );
}
