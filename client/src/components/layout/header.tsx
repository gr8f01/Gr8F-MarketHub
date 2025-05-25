import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SearchBar } from "@/components/ui/search-bar";
import { Menu, ShoppingCart, User, LogOut, Settings } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const Header = () => {
  const { isAuthenticated, user, cart, logout } = useStore();
  const [location, navigate] = useLocation();
  const isMobile = useIsMobile();
  const [scrolled, setScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const totalCartItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <header 
      className={`sticky top-0 z-50 transition-all ${
        scrolled ? "bg-white shadow-sm" : "bg-white"
      }`}
    >
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <Link href="/">
              <span className="text-primary font-bold text-2xl font-heading cursor-pointer">
                <span className="text-[#FF7A00]">GR8F</span> MarketHub
              </span>
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          {!isMobile && (
            <nav className="hidden md:flex items-center space-x-8">
              <Link href="/">
                <span className="font-medium text-neutral-800 hover:text-primary transition-colors cursor-pointer">
                  Home
                </span>
              </Link>
              <Link href="/products">
                <span className="font-medium text-neutral-800 hover:text-primary transition-colors cursor-pointer">
                  Shop
                </span>
              </Link>
              <Link href="/#how-it-works">
                <span className="font-medium text-neutral-800 hover:text-primary transition-colors cursor-pointer">
                  How It Works
                </span>
              </Link>
              <Link href="/#faq">
                <span className="font-medium text-neutral-800 hover:text-primary transition-colors cursor-pointer">
                  FAQ
                </span>
              </Link>
            </nav>
          )}
          
          {/* Right side actions */}
          <div className="flex items-center space-x-4">
            {!isMobile && (
              <div className="relative hidden sm:block">
                <SearchBar />
              </div>
            )}
            
            {/* Cart */}
            <Link href="/cart">
              <span className="text-neutral-800 hover:text-primary p-2 relative cursor-pointer" aria-label="Shopping cart">
                <ShoppingCart className="h-5 w-5" />
                {isAuthenticated && totalCartItems > 0 && (
                  <Badge className="absolute -top-1 -right-1 bg-[#FF7A00]" variant="secondary">
                    {totalCartItems}
                  </Badge>
                )}
              </span>
            </Link>
            
            {/* User actions */}
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="p-1 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user?.profilePicture} />
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {user?.firstName.charAt(0)}{user?.lastName.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate("/profile")}>
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </DropdownMenuItem>
                  {user?.isAdmin && (
                    <DropdownMenuItem onClick={() => navigate("/admin")}>
                      <Settings className="mr-2 h-4 w-4" />
                      Admin Dashboard
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link href="/login">
                <Button className="hidden sm:inline-block bg-[#0B4619] hover:bg-[#1a6830] text-white px-5 py-2 rounded-full font-medium transition-colors">
                  Login
                </Button>
              </Link>
            )}
            
            {/* Mobile menu button */}
            {isMobile && (
              <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" className="md:hidden p-1">
                    <Menu className="h-6 w-6" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right">
                  <SheetHeader>
                    <SheetTitle>Menu</SheetTitle>
                  </SheetHeader>
                  <div className="py-4">
                    <nav className="flex flex-col space-y-4">
                      <SearchBar />
                      <Link href="/">
                        <span onClick={() => setIsMenuOpen(false)} className="py-2 px-4 hover:bg-gray-100 rounded-md block cursor-pointer">
                          Home
                        </span>
                      </Link>
                      <Link href="/products">
                        <span onClick={() => setIsMenuOpen(false)} className="py-2 px-4 hover:bg-gray-100 rounded-md block cursor-pointer">
                          Shop
                        </span>
                      </Link>
                      <Link href="/#how-it-works">
                        <span onClick={() => setIsMenuOpen(false)} className="py-2 px-4 hover:bg-gray-100 rounded-md block cursor-pointer">
                          How It Works
                        </span>
                      </Link>
                      <Link href="/#faq">
                        <span onClick={() => setIsMenuOpen(false)} className="py-2 px-4 hover:bg-gray-100 rounded-md block cursor-pointer">
                          FAQ
                        </span>
                      </Link>
                      
                      {isAuthenticated ? (
                        <>
                          <Link href="/profile">
                            <span onClick={() => setIsMenuOpen(false)} className="py-2 px-4 hover:bg-gray-100 rounded-md block cursor-pointer">
                              Profile
                            </span>
                          </Link>
                          {user?.isAdmin && (
                            <Link href="/admin">
                              <span onClick={() => setIsMenuOpen(false)} className="py-2 px-4 hover:bg-gray-100 rounded-md block cursor-pointer">
                                Admin Dashboard
                              </span>
                            </Link>
                          )}
                          <Button variant="outline" className="mt-2" onClick={() => {
                            handleLogout();
                            setIsMenuOpen(false);
                          }}>
                            Logout
                          </Button>
                        </>
                      ) : (
                        <div className="flex flex-col space-y-2 mt-2">
                          <Link href="/login">
                            <Button variant="outline" onClick={() => setIsMenuOpen(false)}>
                              Login
                            </Button>
                          </Link>
                          <Link href="/register">
                            <Button className="bg-[#0B4619] hover:bg-[#1a6830]" onClick={() => setIsMenuOpen(false)}>
                              Register
                            </Button>
                          </Link>
                        </div>
                      )}
                    </nav>
                  </div>
                </SheetContent>
              </Sheet>
            )}
          </div>
        </div>
        
        {/* Mobile search bar */}
        {isMobile && (
          <div className="mt-3 relative md:hidden">
            <SearchBar />
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
