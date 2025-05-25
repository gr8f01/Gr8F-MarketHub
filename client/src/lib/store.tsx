import { ReactNode, createContext, useContext, useState, useEffect } from "react";
import { apiRequest } from "./queryClient";
import { useToast } from "@/hooks/use-toast";

// Define types
export type User = {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  isAdmin: boolean;
  referralCode: string;
  profilePicture?: string;
};

export type CartItem = {
  id: number;
  userId: number;
  productId: number;
  quantity: number;
  product: Product;
};

export type Product = {
  id: number;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  categoryId: number;
  stock: number;
  images: string[];
  rating: number;
  numReviews: number;
  isFeatured: boolean;
  isOnSale: boolean;
};

export type Order = {
  id: number;
  userId: number;
  status: string;
  total: number;
  shippingAddress: {
    address: string;
    city: string;
    postalCode: string;
    country: string;
  };
  paymentMethod: string;
  paymentStatus: string;
  createdAt: string;
  items: OrderItem[];
};

export type OrderItem = {
  id: number;
  orderId: number;
  productId: number;
  quantity: number;
  price: number;
  product: Product;
};

export type Settings = {
  [key: string]: string;
};

// WebSocket connection for notifications
let socket: WebSocket | null = null;

type StoreContextType = {
  user: User | null;
  cart: CartItem[];
  isInitialized: boolean;
  isLoading: boolean;
  isAuthenticated: boolean;
  settings: Settings;
  connectWebSocket: () => void;
  login: (username: string, password: string) => Promise<boolean>;
  register: (userData: any) => Promise<boolean>;
  logout: () => Promise<void>;
  fetchCart: () => Promise<void>;
  addToCart: (productId: number, quantity: number) => Promise<boolean>;
  updateCartItem: (cartItemId: number, quantity: number) => Promise<boolean>;
  removeFromCart: (cartItemId: number) => Promise<boolean>;
  clearCart: () => Promise<boolean>;
};

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [settings, setSettings] = useState<Settings>({});
  const { toast } = useToast();

  // Initialize websocket connection
  const connectWebSocket = () => {
    if (user && !socket) {
      try {
        // Use relative path for WebSocket connection
        const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
        const host = window.location.host;
        const wsUrl = `${protocol}://${host}/ws?userId=${user.id}`;
        console.log(`Connecting to WebSocket at: ${wsUrl}`);
        socket = new WebSocket(wsUrl);

        // Only set handlers if socket was successfully created
        if (socket) {
          socket.onmessage = (event) => {
            try {
              const data = JSON.parse(event.data);
              
              if (data.type === 'order') {
                toast({
                  title: 'Order Update',
                  description: data.message,
                });
              } else if (data.type === 'referral') {
                toast({
                  title: 'Referral Reward!',
                  description: data.message,
                });
              }
            } catch (error) {
              console.error('Error parsing WebSocket message:', error);
            }
          };
          
          socket.onclose = () => {
            setTimeout(() => {
              socket = null;
              if (user) connectWebSocket();
            }, 5000);
          };
        }
      } catch (error) {
        console.error("Failed to establish WebSocket connection:", error);
        socket = null;
      }
    }
  };

  // Load settings
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const response = await fetch('/api/settings');
        if (response.ok) {
          const settingsData = await response.json();
          const settingsMap: Settings = {};
          
          settingsData.forEach((setting: { key: string; value: string }) => {
            settingsMap[setting.key] = setting.value;
          });
          
          setSettings(settingsMap);
        }
      } catch (error) {
        console.error('Failed to load settings:', error);
      }
    };
    
    loadSettings();
  }, []);

  // Check if user is logged in
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me', {
          credentials: 'include'
        });
        
        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
          await fetchCart();
          connectWebSocket();
        }
      } catch (error) {
        console.error('Auth check failed:', error);
      } finally {
        setIsLoading(false);
        setIsInitialized(true);
      }
    };
    
    checkAuth();
    
    return () => {
      if (socket) {
        socket.close();
        socket = null;
      }
    };
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      const response = await apiRequest('POST', '/api/auth/login', { username, password });
      const userData = await response.json();
      setUser(userData);
      await fetchCart();
      connectWebSocket();
      return true;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: any): Promise<boolean> => {
    try {
      setIsLoading(true);
      const response = await apiRequest('POST', '/api/auth/register', userData);
      const user = await response.json();
      setUser(user);
      connectWebSocket();
      return true;
    } catch (error) {
      console.error('Registration failed:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      setIsLoading(true);
      await apiRequest('POST', '/api/auth/logout', {});
      setUser(null);
      setCart([]);
      
      // Close WebSocket connection
      if (socket) {
        socket.close();
        socket = null;
      }
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCart = async (): Promise<void> => {
    if (!user) return;
    
    try {
      const response = await fetch('/api/cart', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const cartData = await response.json();
        setCart(cartData);
      }
    } catch (error) {
      console.error('Failed to fetch cart:', error);
    }
  };

  const addToCart = async (productId: number, quantity: number): Promise<boolean> => {
    if (!user) return false;
    
    try {
      const response = await apiRequest('POST', '/api/cart', { productId, quantity });
      const cartItem = await response.json();
      
      setCart(prevCart => {
        const existingItemIndex = prevCart.findIndex(item => item.productId === productId);
        
        if (existingItemIndex >= 0) {
          return prevCart.map(item => 
            item.productId === productId
              ? { ...item, quantity: item.quantity + quantity }
              : item
          );
        } else {
          return [...prevCart, cartItem];
        }
      });
      
      return true;
    } catch (error) {
      console.error('Failed to add to cart:', error);
      return false;
    }
  };

  const updateCartItem = async (cartItemId: number, quantity: number): Promise<boolean> => {
    if (!user) return false;
    
    try {
      const response = await apiRequest('PUT', `/api/cart/${cartItemId}`, { quantity });
      const updatedCartItem = await response.json();
      
      setCart(prevCart => 
        prevCart.map(item => 
          item.id === cartItemId ? updatedCartItem : item
        )
      );
      
      return true;
    } catch (error) {
      console.error('Failed to update cart item:', error);
      return false;
    }
  };

  const removeFromCart = async (cartItemId: number): Promise<boolean> => {
    if (!user) return false;
    
    try {
      await apiRequest('DELETE', `/api/cart/${cartItemId}`, {});
      
      setCart(prevCart => prevCart.filter(item => item.id !== cartItemId));
      
      return true;
    } catch (error) {
      console.error('Failed to remove from cart:', error);
      return false;
    }
  };

  const clearCart = async (): Promise<boolean> => {
    if (!user) return false;
    
    try {
      await apiRequest('DELETE', '/api/cart', {});
      setCart([]);
      return true;
    } catch (error) {
      console.error('Failed to clear cart:', error);
      return false;
    }
  };

  return (
    <StoreContext.Provider
      value={{
        user,
        cart,
        isInitialized,
        isLoading,
        isAuthenticated: !!user,
        settings,
        connectWebSocket,
        login,
        register,
        logout,
        fetchCart,
        addToCart,
        updateCartItem,
        removeFromCart,
        clearCart,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (context === undefined) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
