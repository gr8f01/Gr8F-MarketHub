import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertUserSchema, 
  insertCategorySchema,
  insertProductSchema,
  insertOrderSchema,
  insertOrderItemSchema,
  insertCartItemSchema,
  insertReviewSchema,
  insertVoucherSchema,
  insertSettingSchema
} from "@shared/schema";
import express from "express";
import session from "express-session";
import crypto from "crypto";
import MemoryStore from "memorystore";
import { WebSocketServer } from "ws";

const MemStore = MemoryStore(session);

export async function registerRoutes(app: Express): Promise<Server> {
  // Helper middleware to check if user is authenticated
  const isAuthenticated = (req: Request, res: Response, next: Function) => {
    if (req.session.userId) {
      return next();
    }
    res.status(401).json({ message: "Unauthorized" });
  };
  
  // Helper middleware to check if user is admin
  const isAdmin = async (req: Request, res: Response, next: Function) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    const user = await storage.getUser(req.session.userId);
    if (!user || !user.isAdmin) {
      return res.status(403).json({ message: "Forbidden" });
    }
    
    next();
  };

  // Add API health check endpoint
  app.get('/api/status', (req, res) => {
    res.json({ 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development'
    });
  });
  
  // Project data download route
  app.get('/api/download', isAdmin, async (req, res) => {
    try {
      // Collect all data
      const projectData = {
        products: await storage.getAllProducts(),
        categories: await storage.getAllCategories(),
        orders: await storage.getAllOrders(),
        users: await storage.getAllUsers(),
        settings: await storage.getAllSettings(),
        exportDate: new Date().toISOString(),
        version: "1.0.0"
      };
      
      // Set headers for file download
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename=gr8f-markethub-data-${new Date().toISOString().split('T')[0]}.json`);
      
      // Send data
      res.json(projectData);
    } catch (error) {
      console.error('Error generating download:', error);
      res.status(500).json({ message: 'Error generating download' });
    }
  });
  
  // Set up session
  app.use(session({
    secret: process.env.SESSION_SECRET || "gr8f-markethub-secret",
    resave: false,
    saveUninitialized: false,
    cookie: { secure: process.env.NODE_ENV === "production", maxAge: 86400000 }, // 24 hours
    store: new MemStore({ checkPeriod: 86400000 })
  }));
  
  // Auth routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if username or email already exists
      const existingUsername = await storage.getUserByUsername(userData.username);
      if (existingUsername) {
        return res.status(400).json({ message: "Username already exists" });
      }
      
      const existingEmail = await storage.getUserByEmail(userData.email);
      if (existingEmail) {
        return res.status(400).json({ message: "Email already exists" });
      }
      
      // If there's a referral code, validate it
      if (req.body.referralCode) {
        const referrer = await storage.getUserByReferralCode(req.body.referralCode);
        if (referrer) {
          userData.referredBy = referrer.id;
        }
      }
      
      // Hash password (in a real app we would use bcrypt)
      const hashedPassword = crypto
        .createHash("sha256")
        .update(userData.password)
        .digest("hex");
      
      const user = await storage.createUser({
        ...userData,
        password: hashedPassword
      });
      
      // If this user was referred, check if referrer gets a voucher
      if (userData.referredBy) {
        await handleReferralReward(userData.referredBy);
      }
      
      // Set session
      req.session.userId = user.id;
      
      // Don't return password in response
      const { password, ...userWithoutPassword } = user;
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      console.error(error);
      res.status(400).json({ message: "Invalid data" });
    }
  });
  
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
      }
      
      const user = await storage.getUserByUsername(username);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      // Hash password and compare
      const hashedPassword = crypto
        .createHash("sha256")
        .update(password)
        .digest("hex");
      
      if (user.password !== hashedPassword) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      // Set session
      req.session.userId = user.id;
      
      // Don't return password in response
      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  });
  
  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Failed to logout" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });
  
  app.get("/api/auth/me", isAuthenticated, async (req, res) => {
    try {
      const user = await storage.getUser(req.session.userId!);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Don't return password in response
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  });
  
  // User routes
  app.get("/api/users", isAdmin, async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      // Remove passwords
      const usersWithoutPasswords = users.map(user => {
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
      });
      res.json(usersWithoutPasswords);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  });
  
  app.get("/api/users/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID" });
      }
      
      const user = await storage.getUser(id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Don't return password in response
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  });
  
  app.put("/api/users/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID" });
      }
      
      // Only allow users to update their own profile, or admins to update any profile
      const currentUser = await storage.getUser(req.session.userId!);
      if (!currentUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      if (currentUser.id !== id && !currentUser.isAdmin) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      // Don't allow changing username or email to existing values
      if (req.body.username) {
        const existingUser = await storage.getUserByUsername(req.body.username);
        if (existingUser && existingUser.id !== id) {
          return res.status(400).json({ message: "Username already exists" });
        }
      }
      
      if (req.body.email) {
        const existingUser = await storage.getUserByEmail(req.body.email);
        if (existingUser && existingUser.id !== id) {
          return res.status(400).json({ message: "Email already exists" });
        }
      }
      
      // Hash password if it's being updated
      let updatedData = { ...req.body };
      if (req.body.password) {
        updatedData.password = crypto
          .createHash("sha256")
          .update(req.body.password)
          .digest("hex");
      }
      
      // Only admins can update isAdmin field
      if (!currentUser.isAdmin) {
        delete updatedData.isAdmin;
      }
      
      const updatedUser = await storage.updateUser(id, updatedData);
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Don't return password in response
      const { password, ...userWithoutPassword } = updatedUser;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  });
  
  // Category routes
  app.get("/api/categories", async (req, res) => {
    try {
      const categories = await storage.getAllCategories();
      res.json(categories);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  });
  
  app.get("/api/categories/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID" });
      }
      
      const category = await storage.getCategory(id);
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }
      
      res.json(category);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  });
  
  app.post("/api/categories", isAdmin, async (req, res) => {
    try {
      const categoryData = insertCategorySchema.parse(req.body);
      
      // Check if category already exists
      const existingCategory = await storage.getCategoryByName(categoryData.name);
      if (existingCategory) {
        return res.status(400).json({ message: "Category already exists" });
      }
      
      const category = await storage.createCategory(categoryData);
      res.status(201).json(category);
    } catch (error) {
      console.error(error);
      res.status(400).json({ message: "Invalid data" });
    }
  });
  
  app.put("/api/categories/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID" });
      }
      
      // Check if name is being updated to an existing name
      if (req.body.name) {
        const existingCategory = await storage.getCategoryByName(req.body.name);
        if (existingCategory && existingCategory.id !== id) {
          return res.status(400).json({ message: "Category name already exists" });
        }
      }
      
      const updatedCategory = await storage.updateCategory(id, req.body);
      if (!updatedCategory) {
        return res.status(404).json({ message: "Category not found" });
      }
      
      res.json(updatedCategory);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  });
  
  app.delete("/api/categories/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID" });
      }
      
      // Check if there are products in this category
      const products = await storage.getProductsByCategory(id);
      if (products.length > 0) {
        return res.status(400).json({ message: "Cannot delete category with products" });
      }
      
      const success = await storage.deleteCategory(id);
      if (!success) {
        return res.status(404).json({ message: "Category not found" });
      }
      
      res.json({ message: "Category deleted successfully" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  });
  
  // Product routes
  app.get("/api/products", async (req, res) => {
    try {
      const { category, search, featured, onSale } = req.query;
      
      let products;
      if (category) {
        const categoryId = parseInt(category as string);
        if (isNaN(categoryId)) {
          return res.status(400).json({ message: "Invalid category ID" });
        }
        products = await storage.getProductsByCategory(categoryId);
      } else if (search) {
        products = await storage.searchProducts(search as string);
      } else if (featured === 'true') {
        products = await storage.getFeaturedProducts();
      } else if (onSale === 'true') {
        products = await storage.getOnSaleProducts();
      } else {
        products = await storage.getAllProducts();
      }
      
      res.json(products);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  });
  
  app.get("/api/products/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID" });
      }
      
      const product = await storage.getProduct(id);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      res.json(product);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  });
  
  app.post("/api/products", isAdmin, async (req, res) => {
    try {
      const productData = insertProductSchema.parse(req.body);
      
      // Validate category exists
      if (productData.categoryId) {
        const category = await storage.getCategory(productData.categoryId);
        if (!category) {
          return res.status(400).json({ message: "Category not found" });
        }
      }
      
      const product = await storage.createProduct(productData);
      res.status(201).json(product);
    } catch (error) {
      console.error(error);
      res.status(400).json({ message: "Invalid data" });
    }
  });
  
  app.put("/api/products/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID" });
      }
      
      // Validate category exists if being updated
      if (req.body.categoryId) {
        const category = await storage.getCategory(req.body.categoryId);
        if (!category) {
          return res.status(400).json({ message: "Category not found" });
        }
      }
      
      const updatedProduct = await storage.updateProduct(id, req.body);
      if (!updatedProduct) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      res.json(updatedProduct);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  });
  
  app.delete("/api/products/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID" });
      }
      
      const success = await storage.deleteProduct(id);
      if (!success) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      res.json({ message: "Product deleted successfully" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  });
  
  // Cart routes
  app.get("/api/cart", isAuthenticated, async (req, res) => {
    try {
      const cartItems = await storage.getCartItems(req.session.userId!);
      
      // Populate with product details
      const populatedCartItems = await Promise.all(
        cartItems.map(async (item) => {
          const product = await storage.getProduct(item.productId);
          return {
            ...item,
            product
          };
        })
      );
      
      res.json(populatedCartItems);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  });
  
  app.post("/api/cart", isAuthenticated, async (req, res) => {
    try {
      const cartItemData = insertCartItemSchema.parse({
        ...req.body,
        userId: req.session.userId
      });
      
      // Validate product exists and has stock
      const product = await storage.getProduct(cartItemData.productId);
      if (!product) {
        return res.status(400).json({ message: "Product not found" });
      }
      
      if (product.stock < cartItemData.quantity) {
        return res.status(400).json({ message: "Not enough stock" });
      }
      
      const cartItem = await storage.addToCart(cartItemData);
      
      // Return with product details
      res.status(201).json({
        ...cartItem,
        product
      });
    } catch (error) {
      console.error(error);
      res.status(400).json({ message: "Invalid data" });
    }
  });
  
  app.put("/api/cart/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id) || isNaN(req.body.quantity)) {
        return res.status(400).json({ message: "Invalid data" });
      }
      
      // Validate cart item belongs to user
      const cartItem = await storage.getCartItems(req.session.userId!)
        .then(items => items.find(item => item.id === id));
      
      if (!cartItem) {
        return res.status(404).json({ message: "Cart item not found" });
      }
      
      // Validate quantity against stock
      const product = await storage.getProduct(cartItem.productId);
      if (!product) {
        return res.status(400).json({ message: "Product not found" });
      }
      
      if (product.stock < req.body.quantity) {
        return res.status(400).json({ message: "Not enough stock" });
      }
      
      const updatedCartItem = await storage.updateCartItem(id, req.body.quantity);
      if (!updatedCartItem) {
        return res.status(404).json({ message: "Cart item not found" });
      }
      
      // Return with product details
      res.json({
        ...updatedCartItem,
        product
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  });
  
  app.delete("/api/cart/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID" });
      }
      
      // Validate cart item belongs to user
      const cartItem = await storage.getCartItems(req.session.userId!)
        .then(items => items.find(item => item.id === id));
      
      if (!cartItem) {
        return res.status(404).json({ message: "Cart item not found" });
      }
      
      const success = await storage.removeFromCart(id);
      if (!success) {
        return res.status(404).json({ message: "Cart item not found" });
      }
      
      res.json({ message: "Item removed from cart" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  });
  
  app.delete("/api/cart", isAuthenticated, async (req, res) => {
    try {
      await storage.clearCart(req.session.userId!);
      res.json({ message: "Cart cleared successfully" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  });
  
  // Order routes
  app.get("/api/orders", isAuthenticated, async (req, res) => {
    try {
      const user = await storage.getUser(req.session.userId!);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      let orders;
      if (user.isAdmin) {
        // Admins can see all orders
        orders = await storage.getAllOrders();
      } else {
        // Regular users only see their own orders
        orders = await storage.getOrdersForUser(req.session.userId!);
      }
      
      // Populate with order items
      const populatedOrders = await Promise.all(
        orders.map(async (order) => {
          const items = await storage.getOrderItems(order.id);
          const populatedItems = await Promise.all(
            items.map(async (item) => {
              const product = await storage.getProduct(item.productId);
              return {
                ...item,
                product
              };
            })
          );
          
          return {
            ...order,
            items: populatedItems
          };
        })
      );
      
      res.json(populatedOrders);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  });
  
  app.get("/api/orders/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID" });
      }
      
      const order = await storage.getOrder(id);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      // Check if user is authorized to view this order
      const user = await storage.getUser(req.session.userId!);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      if (!user.isAdmin && order.userId !== user.id) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      // Populate with order items
      const items = await storage.getOrderItems(order.id);
      const populatedItems = await Promise.all(
        items.map(async (item) => {
          const product = await storage.getProduct(item.productId);
          return {
            ...item,
            product
          };
        })
      );
      
      res.json({
        ...order,
        items: populatedItems
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  });
  
  app.post("/api/orders", isAuthenticated, async (req, res) => {
    try {
      const { items, ...orderData } = req.body;
      
      if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ message: "Order must contain items" });
      }
      
      // Validate order data
      const orderInput = insertOrderSchema.parse({
        ...orderData,
        userId: req.session.userId,
      });
      
      // Check if payment method is enabled
      const paymentMethodSetting = await storage.getSetting(`PAYMENT_${orderInput.paymentMethod.toUpperCase()}`);
      if (!paymentMethodSetting || paymentMethodSetting.value !== 'true') {
        return res.status(400).json({ message: "Payment method not available" });
      }
      
      // Calculate total and check stock
      let total = 0;
      const cartItems = await storage.getCartItems(req.session.userId!);
      
      // Verify all items in cart exist and have sufficient stock
      for (const item of items) {
        const product = await storage.getProduct(item.productId);
        if (!product) {
          return res.status(400).json({ message: `Product with ID ${item.productId} not found` });
        }
        
        if (product.stock < item.quantity) {
          return res.status(400).json({ message: `Not enough stock for product ${product.name}` });
        }
        
        total += product.price * item.quantity;
      }
      
      // Check if a voucher is being applied
      if (req.body.voucherCode) {
        const voucher = await storage.getVoucherByCode(req.body.voucherCode);
        if (voucher) {
          // Apply discount
          total = Math.max(0, total - voucher.discount);
          
          // Mark voucher as used
          await storage.useVoucher(voucher.id);
        }
      }
      
      // Create order
      const order = await storage.createOrder({
        ...orderInput,
        total
      });
      
      // Create order items and update product stock
      for (const item of items) {
        await storage.createOrderItem({
          orderId: order.id,
          productId: item.productId,
          quantity: item.quantity,
          price: (await storage.getProduct(item.productId))!.price
        });
        
        // Update product stock
        const product = (await storage.getProduct(item.productId))!;
        await storage.updateProduct(item.productId, {
          stock: product.stock - item.quantity
        });
      }
      
      // Clear user's cart
      await storage.clearCart(req.session.userId!);
      
      // Populate order with items for response
      const orderItems = await storage.getOrderItems(order.id);
      const populatedItems = await Promise.all(
        orderItems.map(async (item) => {
          const product = await storage.getProduct(item.productId);
          return {
            ...item,
            product
          };
        })
      );
      
      // Send push notification (simulated)
      sendOrderNotification(req.session.userId!, order.id, "Order placed successfully");
      
      res.status(201).json({
        ...order,
        items: populatedItems
      });
    } catch (error) {
      console.error(error);
      res.status(400).json({ message: "Invalid data" });
    }
  });
  
  app.put("/api/orders/:id/status", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID" });
      }
      
      const { status } = req.body;
      if (!status || typeof status !== "string") {
        return res.status(400).json({ message: "Status is required" });
      }
      
      const order = await storage.getOrder(id);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      const updatedOrder = await storage.updateOrderStatus(id, status);
      if (!updatedOrder) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      // Send push notification (simulated)
      sendOrderNotification(order.userId, order.id, `Order status updated to ${status}`);
      
      res.json(updatedOrder);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  });
  
  // Review routes
  app.get("/api/products/:id/reviews", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID" });
      }
      
      const reviews = await storage.getProductReviews(id);
      
      // Populate with user details
      const populatedReviews = await Promise.all(
        reviews.map(async (review) => {
          const user = await storage.getUser(review.userId);
          return {
            ...review,
            user: user ? {
              id: user.id,
              username: user.username,
              firstName: user.firstName,
              lastName: user.lastName
            } : null
          };
        })
      );
      
      res.json(populatedReviews);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  });
  
  app.post("/api/products/:id/reviews", isAuthenticated, async (req, res) => {
    try {
      const productId = parseInt(req.params.id);
      if (isNaN(productId)) {
        return res.status(400).json({ message: "Invalid product ID" });
      }
      
      // Check if product exists
      const product = await storage.getProduct(productId);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      // Check if user has already reviewed this product
      const existingReviews = await storage.getProductReviews(productId);
      const hasReviewed = existingReviews.some(review => review.userId === req.session.userId);
      
      if (hasReviewed) {
        return res.status(400).json({ message: "You have already reviewed this product" });
      }
      
      const reviewData = insertReviewSchema.parse({
        ...req.body,
        productId,
        userId: req.session.userId
      });
      
      const review = await storage.createReview(reviewData);
      
      // Return with user details
      const user = await storage.getUser(req.session.userId!);
      
      res.status(201).json({
        ...review,
        user: {
          id: user!.id,
          username: user!.username,
          firstName: user!.firstName,
          lastName: user!.lastName
        }
      });
    } catch (error) {
      console.error(error);
      res.status(400).json({ message: "Invalid data" });
    }
  });
  
  // Voucher routes
  app.get("/api/vouchers", isAuthenticated, async (req, res) => {
    try {
      const vouchers = await storage.getVouchersForUser(req.session.userId!);
      res.json(vouchers);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  });
  
  app.post("/api/vouchers/validate", isAuthenticated, async (req, res) => {
    try {
      const { code } = req.body;
      
      if (!code) {
        return res.status(400).json({ message: "Voucher code is required" });
      }
      
      const voucher = await storage.getVoucherByCode(code);
      
      if (!voucher) {
        return res.status(404).json({ message: "Invalid or expired voucher" });
      }
      
      res.json(voucher);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  });
  
  // Settings routes (admin only)
  app.get("/api/settings", async (req, res) => {
    try {
      // Public settings are available to everyone
      // Admin settings only available to admins
      let settings = await storage.getAllSettings();
      
      if (!req.session.userId) {
        // Filter to only public settings
        settings = settings.filter(setting => 
          setting.key.startsWith('PAYMENT_') || 
          setting.key === 'REFERRAL_COUNT' ||
          setting.key === 'VOUCHER_AMOUNT'
        );
      }
      
      res.json(settings);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  });
  
  app.put("/api/settings/:key", isAdmin, async (req, res) => {
    try {
      const { key } = req.params;
      const { value } = req.body;
      
      if (!value) {
        return res.status(400).json({ message: "Value is required" });
      }
      
      const setting = await storage.getSetting(key);
      if (!setting) {
        return res.status(404).json({ message: "Setting not found" });
      }
      
      const updatedSetting = await storage.updateSetting(key, value);
      
      res.json(updatedSetting);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  });
  
  // Helper function to handle referral rewards
  async function handleReferralReward(referrerId: number) {
    try {
      // Get settings
      const referralCountSetting = await storage.getSetting('REFERRAL_COUNT');
      const voucherAmountSetting = await storage.getSetting('VOUCHER_AMOUNT');
      const voucherExpirySetting = await storage.getSetting('VOUCHER_EXPIRY_DAYS');
      
      if (!referralCountSetting || !voucherAmountSetting) {
        return; // Settings not found
      }
      
      const requiredReferrals = parseInt(referralCountSetting.value);
      const voucherAmount = parseFloat(voucherAmountSetting.value);
      const expiryDays = voucherExpirySetting ? parseInt(voucherExpirySetting.value) : 30;
      
      // Count how many users this user has referred
      const users = await storage.getAllUsers();
      const referrals = users.filter(user => user.referredBy === referrerId);
      
      // Check if user has reached the threshold
      if (referrals.length % requiredReferrals === 0) {
        // Generate voucher code
        const voucherCode = `REF-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
        
        // Calculate expiry date
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + expiryDays);
        
        // Create voucher
        await storage.createVoucher({
          userId: referrerId,
          code: voucherCode,
          discount: voucherAmount,
          isUsed: false,
          expiresAt: expiryDate
        });
        
        // Send notification (simulated)
        sendReferralNotification(referrerId, voucherCode, voucherAmount);
      }
    } catch (error) {
      console.error("Error handling referral reward:", error);
    }
  }
  
  // Set up WebSocket for real-time notifications
  const httpServer = createServer(app);
  
  // Add a specific route for WebSocket connections
  app.get('/ws', (req, res) => {
    res.set({
      'Connection': 'Upgrade',
      'Upgrade': 'websocket'
    });
    res.status(101).end();
  });
  
  const wss = new WebSocketServer({ 
    server: httpServer,
    path: '/ws',
    // Allow connections from any origin
    verifyClient: (info) => {
      console.log('WebSocket connection attempt from:', info.origin);
      return true; // Accept all connections
    },
  });
  
  console.log('WebSocket server initialized at path: /ws');
  
  // Store active connections
  const connections = new Map<number, WebSocket[]>();
  
  wss.on('connection', (ws, req) => {
    console.log('WebSocket client connected');
    
    // Extract user ID from query params
    const url = new URL(req.url || '', `http://${req.headers.host || 'localhost'}`);
    const userId = parseInt(url.searchParams.get('userId') || '0');
    console.log('WebSocket connected for user:', userId);
    
    if (userId) {
      // Store connection
      if (!connections.has(userId)) {
        connections.set(userId, []);
      }
      connections.get(userId)?.push(ws);
      
      // Handle disconnection
      ws.on('close', () => {
        const userConnections = connections.get(userId) || [];
        const index = userConnections.indexOf(ws);
        if (index !== -1) {
          userConnections.splice(index, 1);
        }
      });
    }
  });
  
  // Functions to send notifications via WebSocket
  function sendOrderNotification(userId: number, orderId: number, message: string) {
    const userConnections = connections.get(userId) || [];
    const notification = JSON.stringify({
      type: 'order',
      orderId,
      message
    });
    
    userConnections.forEach(conn => {
      if (conn.readyState === WebSocket.OPEN) {
        conn.send(notification);
      }
    });
  }
  
  function sendReferralNotification(userId: number, voucherCode: string, amount: number) {
    const userConnections = connections.get(userId) || [];
    const notification = JSON.stringify({
      type: 'referral',
      voucherCode,
      amount,
      message: `Congratulations! You've earned a voucher worth KSh ${amount}`
    });
    
    userConnections.forEach(conn => {
      if (conn.readyState === WebSocket.OPEN) {
        conn.send(notification);
      }
    });
  }
  
  return httpServer;
}
