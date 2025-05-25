import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { X, Plus, Upload, Tag, CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

// Product form schema
const productSchema = z.object({
  name: z.string().min(3, {
    message: "Product name must be at least 3 characters long",
  }),
  description: z.string().min(10, {
    message: "Description must be at least 10 characters long",
  }),
  price: z.coerce.number().positive({
    message: "Price must be a positive number",
  }),
  originalPrice: z.coerce.number().positive().optional(),
  categoryId: z.coerce.number().positive({
    message: "Category is required",
  }),
  stock: z.coerce.number().nonnegative({
    message: "Stock must be zero or a positive number",
  }),
  sku: z.string().optional(),
  isFeatured: z.boolean().default(false),
  isOnSale: z.boolean().default(false),
  isVisible: z.boolean().default(true),
  scheduledLaunch: z.string().optional(),
});

type ProductFormValues = z.infer<typeof productSchema>;

interface ProductFormProps {
  initialData?: any;
  onSubmit: (data: ProductFormValues & { images: string[], tags: string[] }) => void;
  isSubmitting: boolean;
}

export default function ProductForm({ initialData, onSubmit, isSubmitting }: ProductFormProps) {
  const { toast } = useToast();
  const [images, setImages] = useState<string[]>(initialData?.images || []);
  const [imageUrl, setImageUrl] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>(initialData?.tags || []);
  
  // Fetch categories
  const { data: categories = [] } = useQuery({
    queryKey: ['/api/categories'],
  });
  
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: initialData || {
      name: "",
      description: "",
      price: 0,
      originalPrice: undefined,
      categoryId: 0,
      stock: 0,
      sku: "",
      isFeatured: false,
      isOnSale: false,
      isVisible: true,
      scheduledLaunch: undefined,
    },
  });
  
  // Add image URL to the list
  const addImageUrl = () => {
    if (!imageUrl) return;
    
    if (!imageUrl.startsWith("http")) {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid image URL starting with http:// or https://",
        variant: "destructive",
      });
      return;
    }
    
    setImages([...images, imageUrl]);
    setImageUrl("");
  };
  
  // Remove image from the list
  const removeImage = (index: number) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    setImages(newImages);
  };
  
  // Add tag to the list
  const addTag = () => {
    if (!tagInput) return;
    if (tags.includes(tagInput)) {
      toast({
        title: "Duplicate Tag",
        description: "This tag already exists",
        variant: "destructive",
      });
      return;
    }
    setTags([...tags, tagInput]);
    setTagInput("");
  };
  
  // Remove tag from the list
  const removeTag = (index: number) => {
    const newTags = [...tags];
    newTags.splice(index, 1);
    setTags(newTags);
  };
  
  // Handle form submission
  const handleSubmit = (data: ProductFormValues) => {
    if (images.length === 0) {
      toast({
        title: "Missing Images",
        description: "Please add at least one product image",
        variant: "destructive",
      });
      return;
    }
    
    // If product is not on sale, remove original price
    const formData = { ...data };
    if (!formData.isOnSale) {
      delete formData.originalPrice;
    }
    
    onSubmit({ ...formData, images, tags });
  };
  
  // Toggle sale status
  useEffect(() => {
    const isOnSale = form.watch("isOnSale");
    if (!isOnSale) {
      form.setValue("originalPrice", undefined);
    }
  }, [form.watch("isOnSale")]);
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Product Name */}
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Product Name</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* Category */}
          <FormField
            control={form.control}
            name="categoryId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <Select
                  onValueChange={(value) => field.onChange(parseInt(value))}
                  defaultValue={field.value?.toString()}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {categories.map((category: any) => (
                      <SelectItem key={category.id} value={category.id.toString()}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* Price */}
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Price (KSh)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    min="0" 
                    step="0.01"
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* Stock */}
          <FormField
            control={form.control}
            name="stock"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Stock</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    min="0" 
                    step="1" 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* On Sale Checkbox */}
          <FormField
            control={form.control}
            name="isOnSale"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>On Sale</FormLabel>
                  <FormDescription>
                    Mark this product as on sale with a discounted price
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />
          
          {/* Original Price (only shown if isOnSale is true) */}
          {form.watch("isOnSale") && (
            <FormField
              control={form.control}
              name="originalPrice"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Original Price (KSh)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      min="0" 
                      step="0.01"
                      {...field} 
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormDescription>
                    This is the price before discount
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
          
          {/* Featured Checkbox */}
          <FormField
            control={form.control}
            name="isFeatured"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Featured Product</FormLabel>
                  <FormDescription>
                    This product will be displayed on the homepage
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />

          {/* Visibility Checkbox */}
          <FormField
            control={form.control}
            name="isVisible"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Product Visibility</FormLabel>
                  <FormDescription>
                    Make this product visible on the store
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />

          {/* SKU */}
          <FormField
            control={form.control}
            name="sku"
            render={({ field }) => (
              <FormItem>
                <FormLabel>SKU/Product ID</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="e.g. SKU-12345" />
                </FormControl>
                <FormDescription>
                  Unique identifier for inventory management
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Scheduled Launch */}
          <FormField
            control={form.control}
            name="scheduledLaunch"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Scheduled Launch Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(new Date(field.value), "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value ? new Date(field.value) : undefined}
                      onSelect={(date) => field.onChange(date ? date.toISOString() : "")}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormDescription>
                  When this product will be automatically made visible
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        {/* Description */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  rows={5}
                  placeholder="Enter a detailed product description"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {/* Product Tags */}
        <div className="space-y-4">
          <div>
            <FormLabel className="block mb-2">Product Tags</FormLabel>
            <div className="flex space-x-2">
              <Input
                type="text"
                placeholder="Enter a tag (e.g. electronics, fashion)"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                className="flex-1"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addTag();
                  }
                }}
              />
              <Button type="button" onClick={addTag} size="sm">
                <Tag className="mr-2 h-4 w-4" />
                Add
              </Button>
            </div>
            <FormDescription className="mt-2">
              Add tags to improve product discoverability
            </FormDescription>
          </div>
          
          {/* Tags Preview */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {tags.map((tag, index) => (
                <div key={index} className="flex items-center bg-primary/10 text-primary rounded-full px-3 py-1">
                  <span className="mr-1">{tag}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-4 w-4 rounded-full"
                    onClick={() => removeTag(index)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Product Images */}
        <div className="space-y-4">
          <div>
            <FormLabel className="block mb-2">Product Images</FormLabel>
            <div className="flex space-x-2">
              <Input
                type="text"
                placeholder="Enter image URL"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="flex-1"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addImageUrl();
                  }
                }}
              />
              <Button type="button" onClick={addImageUrl} size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Add
              </Button>
            </div>
            <FormDescription className="mt-2">
              Add at least one image URL for the product
            </FormDescription>
          </div>
          
          {/* Image Preview */}
          {images.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
              {images.map((url, index) => (
                <div key={index} className="relative group">
                  <img
                    src={url}
                    alt={`Product image ${index + 1}`}
                    className="h-24 w-full object-cover rounded-md border"
                    onError={(e) => {
                      e.currentTarget.src = "https://placehold.co/400x300?text=Image+Error";
                    }}
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-1 right-1 h-6 w-6 opacity-80"
                    onClick={() => removeImage(index)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Submit Button */}
        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? "Saving..." : initialData ? "Update Product" : "Create Product"}
        </Button>
      </form>
    </Form>
  );
}