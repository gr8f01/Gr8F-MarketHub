import { 
  users, type User, type InsertUser,
  categories, type Category, type InsertCategory,
  products, type Product, type InsertProduct,
  orders, type Order, type InsertOrder,
  orderItems, type OrderItem, type InsertOrderItem,
  cartItems, type CartItem, type InsertCartItem,
  reviews, type Review, type InsertReview,
  vouchers, type Voucher, type InsertVoucher,
  settings, type Setting, type InsertSetting,
} from "@shared/schema";
import crypto from 'crypto';

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByReferralCode(referralCode: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<User>): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;
  
  // Category operations
  getCategory(id: number): Promise<Category | undefined>;
  getCategoryByName(name: string): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  updateCategory(id: number, category: Partial<Category>): Promise<Category | undefined>;
  deleteCategory(id: number): Promise<boolean>;
  getAllCategories(): Promise<Category[]>;
  
  // Product operations
  getProduct(id: number): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, product: Partial<Product>): Promise<Product | undefined>;
  deleteProduct(id: number): Promise<boolean>;
  getAllProducts(): Promise<Product[]>;
  getProductsByCategory(categoryId: number): Promise<Product[]>;
  searchProducts(query: string): Promise<Product[]>;
  getFeaturedProducts(): Promise<Product[]>;
  getOnSaleProducts(): Promise<Product[]>;
  
  // Order operations
  getOrder(id: number): Promise<Order | undefined>;
  getOrdersForUser(userId: number): Promise<Order[]>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrderStatus(id: number, status: string): Promise<Order | undefined>;
  getAllOrders(): Promise<Order[]>;
  
  // Order Items operations
  getOrderItems(orderId: number): Promise<OrderItem[]>;
  createOrderItem(orderItem: InsertOrderItem): Promise<OrderItem>;
  
  // Cart operations
  getCartItems(userId: number): Promise<CartItem[]>;
  addToCart(cartItem: InsertCartItem): Promise<CartItem>;
  updateCartItem(id: number, quantity: number): Promise<CartItem | undefined>;
  removeFromCart(id: number): Promise<boolean>;
  clearCart(userId: number): Promise<boolean>;
  
  // Review operations
  getProductReviews(productId: number): Promise<Review[]>;
  createReview(review: InsertReview): Promise<Review>;
  
  // Voucher operations
  getVouchersForUser(userId: number): Promise<Voucher[]>;
  getVoucherByCode(code: string): Promise<Voucher | undefined>;
  createVoucher(voucher: InsertVoucher): Promise<Voucher>;
  useVoucher(id: number): Promise<Voucher | undefined>;
  
  // Settings operations
  getSetting(key: string): Promise<Setting | undefined>;
  updateSetting(key: string, value: string): Promise<Setting | undefined>;
  getAllSettings(): Promise<Setting[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private categories: Map<number, Category>;
  private products: Map<number, Product>;
  private orders: Map<number, Order>;
  private orderItems: Map<number, OrderItem>;
  private cartItems: Map<number, CartItem>;
  private reviews: Map<number, Review>;
  private vouchers: Map<number, Voucher>;
  private settings: Map<number, Setting>;

  private userId: number;
  private categoryId: number;
  private productId: number;
  private orderId: number;
  private orderItemId: number;
  private cartItemId: number;
  private reviewId: number;
  private voucherId: number;
  private settingId: number;
  
  constructor() {
    this.users = new Map();
    this.categories = new Map();
    this.products = new Map();
    this.orders = new Map();
    this.orderItems = new Map();
    this.cartItems = new Map();
    this.reviews = new Map();
    this.vouchers = new Map();
    this.settings = new Map();
    
    this.userId = 1;
    this.categoryId = 1;
    this.productId = 1;
    this.orderId = 1;
    this.orderItemId = 1;
    this.cartItemId = 1;
    this.reviewId = 1;
    this.voucherId = 1;
    this.settingId = 1;
    
    // Initialize with default settings
    this.initializeDefaultSettings();
    this.initializeDemoData();
  }
  
  private initializeDefaultSettings() {
    const defaultSettings: InsertSetting[] = [
      { key: 'REFERRAL_COUNT', value: '3', type: 'number' },
      { key: 'VOUCHER_AMOUNT', value: '500', type: 'number' },
      { key: 'VOUCHER_EXPIRY_DAYS', value: '30', type: 'number' },
      { key: 'PAYMENT_MPESA', value: 'true', type: 'boolean' },
      { key: 'PAYMENT_BANK', value: 'true', type: 'boolean' },
      { key: 'PAYMENT_CARD', value: 'true', type: 'boolean' },
    ];
    
    defaultSettings.forEach(setting => {
      this.settings.set(this.settingId, {
        ...setting,
        id: this.settingId++
      });
    });
  }
  
  private initializeDemoData() {
    // Demo Categories
    const demoCategories: InsertCategory[] = [
      { name: 'Textbooks', description: 'Academic textbooks for all courses', image: 'https://images.unsplash.com/photo-1519682337058-a94d519337bc' },
      { name: 'Stationery', description: 'Notebooks, pens, and other supplies', image: 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338' },
      { name: 'Gadgets', description: 'Electronics and tech accessories', image: 'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb' },
      { name: 'Dorm Essentials', description: 'Everything you need for your dorm', image: 'https://images.unsplash.com/photo-1628157588553-5eeea00af15c' },
    ];
    
    demoCategories.forEach(category => {
      this.categories.set(this.categoryId, {
        ...category,
        id: this.categoryId++
      });
    });
    
    // Demo Products
    const demoProducts: InsertProduct[] = [
      { 
        name: 'Wireless Bluetooth Study Headphones', 
        description: 'Noise-cancelling headphones perfect for studying in noisy environments.',
        price: 2800, 
        originalPrice: 3500, 
        categoryId: 3, 
        stock: 25, 
        images: ['https://images.unsplash.com/photo-1568205631410-e304ca733666'],
        isFeatured: true,
        isOnSale: true
      },
      { 
        name: 'Engineering Mathematics Textbook', 
        description: 'Comprehensive textbook covering all aspects of engineering mathematics.',
        price: 1200, 
        originalPrice: 1800, 
        categoryId: 1, 
        stock: 15, 
        images: ['https://images.unsplash.com/photo-1544947950-fa07a98d237f'],
        isFeatured: true,
        isOnSale: false
      },
      { 
        name: 'Premium Notebook Set (3 Pack)', 
        description: 'High-quality notebooks with premium paper for all your note-taking needs.',
        price: 850, 
        originalPrice: 1050, 
        categoryId: 2, 
        stock: 50, 
        images: ['https://images.unsplash.com/photo-1618842676088-c4d48a6a7c9d'],
        isFeatured: true,
        isOnSale: true
      },
      { 
        name: 'Dorm Room LED String Lights', 
        description: 'Decorate your dorm room with these energy-efficient LED string lights.',
        price: 950, 
        originalPrice: 1200, 
        categoryId: 4, 
        stock: 30, 
        images: ['https://images.unsplash.com/photo-1587916297999-777c7410de08'],
        isFeatured: true,
        isOnSale: false
      },
    ];
    
    demoProducts.forEach(product => {
      const id = this.productId++;
      this.products.set(id, {
        ...product,
        id,
        rating: Math.floor(Math.random() * 5) + 3.5,
        numReviews: Math.floor(Math.random() * 100) + 10,
        sku: `SKU-${id}`,
        tags: product.name.includes('Headphones') ? ['Electronics', 'New'] : 
              product.name.includes('Dorm') ? ['Limited Edition', 'Home'] : 
              ['Featured'],
        isVisible: true,
        scheduledLaunch: undefined,
        createdAt: new Date()
      });
    });
    
    // Create admin user
    this.createUser({
      username: 'admin',
      password: 'admin123',
      email: 'admin@egerton.ac.ke',
      firstName: 'Admin',
      lastName: 'User',
      isAdmin: true,
    });
  }
  
  generateReferralCode(): string {
    return crypto.randomBytes(6).toString('hex').toUpperCase();
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username.toLowerCase() === username.toLowerCase(),
    );
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email.toLowerCase() === email.toLowerCase(),
    );
  }
  
  async getUserByReferralCode(referralCode: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.referralCode === referralCode,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userId++;
    const referralCode = this.generateReferralCode();
    const user: User = { 
      ...insertUser, 
      id, 
      referralCode,
      createdAt: new Date()
    };
    this.users.set(id, user);
    return user;
  }
  
  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    const user = await this.getUser(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...userData };
    this.users.set(id, updatedUser);
    return updatedUser;
  }
  
  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }
  
  // Category operations
  async getCategory(id: number): Promise<Category | undefined> {
    return this.categories.get(id);
  }
  
  async getCategoryByName(name: string): Promise<Category | undefined> {
    return Array.from(this.categories.values()).find(
      (category) => category.name.toLowerCase() === name.toLowerCase(),
    );
  }
  
  async createCategory(category: InsertCategory): Promise<Category> {
    const id = this.categoryId++;
    const newCategory: Category = { ...category, id };
    this.categories.set(id, newCategory);
    return newCategory;
  }
  
  async updateCategory(id: number, categoryData: Partial<Category>): Promise<Category | undefined> {
    const category = await this.getCategory(id);
    if (!category) return undefined;
    
    const updatedCategory = { ...category, ...categoryData };
    this.categories.set(id, updatedCategory);
    return updatedCategory;
  }
  
  async deleteCategory(id: number): Promise<boolean> {
    return this.categories.delete(id);
  }
  
  async getAllCategories(): Promise<Category[]> {
    return Array.from(this.categories.values());
  }
  
  // Product operations
  async getProduct(id: number): Promise<Product | undefined> {
    return this.products.get(id);
  }
  
  async createProduct(product: InsertProduct): Promise<Product> {
    const id = this.productId++;
    const newProduct: Product = { 
      ...product, 
      id, 
      rating: 0, 
      numReviews: 0,
      tags: product.tags || [],
      isVisible: product.isVisible !== undefined ? product.isVisible : true,
      sku: product.sku || `SKU-${id}`,
      createdAt: new Date() 
    };
    this.products.set(id, newProduct);
    return newProduct;
  }
  
  async updateProduct(id: number, productData: Partial<Product>): Promise<Product | undefined> {
    const product = await this.getProduct(id);
    if (!product) return undefined;
    
    const updatedProduct = { ...product, ...productData };
    this.products.set(id, updatedProduct);
    return updatedProduct;
  }
  
  async deleteProduct(id: number): Promise<boolean> {
    return this.products.delete(id);
  }
  
  async getAllProducts(): Promise<Product[]> {
    return Array.from(this.products.values());
  }
  
  async getProductsByCategory(categoryId: number): Promise<Product[]> {
    return Array.from(this.products.values()).filter(
      (product) => product.categoryId === categoryId,
    );
  }
  
  async searchProducts(query: string): Promise<Product[]> {
    const lowerQuery = query.toLowerCase();
    return Array.from(this.products.values()).filter(
      (product) => 
        product.name.toLowerCase().includes(lowerQuery) || 
        (product.description && product.description.toLowerCase().includes(lowerQuery))
    );
  }
  
  async getFeaturedProducts(): Promise<Product[]> {
    return Array.from(this.products.values()).filter(
      (product) => product.isFeatured,
    );
  }
  
  async getOnSaleProducts(): Promise<Product[]> {
    return Array.from(this.products.values()).filter(
      (product) => product.isOnSale,
    );
  }
  
  // Order operations
  async getOrder(id: number): Promise<Order | undefined> {
    return this.orders.get(id);
  }
  
  async getOrdersForUser(userId: number): Promise<Order[]> {
    return Array.from(this.orders.values()).filter(
      (order) => order.userId === userId,
    );
  }
  
  async createOrder(order: InsertOrder): Promise<Order> {
    const id = this.orderId++;
    const newOrder: Order = { 
      ...order, 
      id, 
      createdAt: new Date() 
    };
    this.orders.set(id, newOrder);
    return newOrder;
  }
  
  async updateOrderStatus(id: number, status: string): Promise<Order | undefined> {
    const order = await this.getOrder(id);
    if (!order) return undefined;
    
    const updatedOrder = { ...order, status };
    this.orders.set(id, updatedOrder);
    return updatedOrder;
  }
  
  async getAllOrders(): Promise<Order[]> {
    return Array.from(this.orders.values());
  }
  
  // Order Items operations
  async getOrderItems(orderId: number): Promise<OrderItem[]> {
    return Array.from(this.orderItems.values()).filter(
      (orderItem) => orderItem.orderId === orderId,
    );
  }
  
  async createOrderItem(orderItem: InsertOrderItem): Promise<OrderItem> {
    const id = this.orderItemId++;
    const newOrderItem: OrderItem = { ...orderItem, id };
    this.orderItems.set(id, newOrderItem);
    return newOrderItem;
  }
  
  // Cart operations
  async getCartItems(userId: number): Promise<CartItem[]> {
    return Array.from(this.cartItems.values()).filter(
      (cartItem) => cartItem.userId === userId,
    );
  }
  
  async addToCart(cartItem: InsertCartItem): Promise<CartItem> {
    // Check if product already in cart
    const existingItem = Array.from(this.cartItems.values()).find(
      (item) => item.userId === cartItem.userId && item.productId === cartItem.productId
    );
    
    if (existingItem) {
      // Update quantity instead
      return this.updateCartItem(existingItem.id, existingItem.quantity + cartItem.quantity) as Promise<CartItem>;
    }
    
    const id = this.cartItemId++;
    const newCartItem: CartItem = { ...cartItem, id };
    this.cartItems.set(id, newCartItem);
    return newCartItem;
  }
  
  async updateCartItem(id: number, quantity: number): Promise<CartItem | undefined> {
    const cartItem = this.cartItems.get(id);
    if (!cartItem) return undefined;
    
    const updatedCartItem = { ...cartItem, quantity };
    this.cartItems.set(id, updatedCartItem);
    return updatedCartItem;
  }
  
  async removeFromCart(id: number): Promise<boolean> {
    return this.cartItems.delete(id);
  }
  
  async clearCart(userId: number): Promise<boolean> {
    const cartItemsToRemove = Array.from(this.cartItems.values()).filter(
      (cartItem) => cartItem.userId === userId
    );
    
    cartItemsToRemove.forEach(item => {
      this.cartItems.delete(item.id);
    });
    
    return true;
  }
  
  // Review operations
  async getProductReviews(productId: number): Promise<Review[]> {
    return Array.from(this.reviews.values()).filter(
      (review) => review.productId === productId,
    );
  }
  
  async createReview(review: InsertReview): Promise<Review> {
    const id = this.reviewId++;
    const newReview: Review = { 
      ...review, 
      id, 
      createdAt: new Date() 
    };
    this.reviews.set(id, newReview);
    
    // Update product rating
    const product = await this.getProduct(review.productId);
    if (product) {
      const reviews = await this.getProductReviews(review.productId);
      const newNumReviews = reviews.length;
      const newRating = reviews.reduce((acc, curr) => acc + curr.rating, 0) / newNumReviews;
      
      await this.updateProduct(review.productId, {
        rating: newRating,
        numReviews: newNumReviews
      });
    }
    
    return newReview;
  }
  
  // Voucher operations
  async getVouchersForUser(userId: number): Promise<Voucher[]> {
    return Array.from(this.vouchers.values()).filter(
      (voucher) => voucher.userId === userId,
    );
  }
  
  async getVoucherByCode(code: string): Promise<Voucher | undefined> {
    return Array.from(this.vouchers.values()).find(
      (voucher) => voucher.code === code && !voucher.isUsed && (!voucher.expiresAt || new Date(voucher.expiresAt) > new Date()),
    );
  }
  
  async createVoucher(voucher: InsertVoucher): Promise<Voucher> {
    const id = this.voucherId++;
    const newVoucher: Voucher = { 
      ...voucher, 
      id, 
      createdAt: new Date() 
    };
    this.vouchers.set(id, newVoucher);
    return newVoucher;
  }
  
  async useVoucher(id: number): Promise<Voucher | undefined> {
    const voucher = this.vouchers.get(id);
    if (!voucher) return undefined;
    
    const updatedVoucher = { ...voucher, isUsed: true };
    this.vouchers.set(id, updatedVoucher);
    return updatedVoucher;
  }
  
  // Settings operations
  async getSetting(key: string): Promise<Setting | undefined> {
    return Array.from(this.settings.values()).find(
      (setting) => setting.key === key,
    );
  }
  
  async updateSetting(key: string, value: string): Promise<Setting | undefined> {
    const setting = await this.getSetting(key);
    if (!setting) return undefined;
    
    const updatedSetting = { ...setting, value };
    this.settings.set(setting.id, updatedSetting);
    return updatedSetting;
  }
  
  async getAllSettings(): Promise<Setting[]> {
    return Array.from(this.settings.values());
  }
}

export const storage = new MemStorage();
