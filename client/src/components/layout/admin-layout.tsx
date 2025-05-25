import { ReactNode, useState } from "react";
import { Link, useLocation } from "wouter";
import { useStore } from "@/lib/store";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  Download,
} from "lucide-react";
import { DownloadButton } from "@/components/admin/download-button";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";

interface AdminLayoutProps {
  children: ReactNode;
  title: string;
}

const AdminLayout = ({ children, title }: AdminLayoutProps) => {
  const { logout } = useStore();
  const [location, navigate] = useLocation();
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const routes = [
    {
      name: "Dashboard",
      path: "/admin",
      icon: <LayoutDashboard className="h-5 w-5" />,
    },
    {
      name: "Products",
      path: "/admin/products",
      icon: <Package className="h-5 w-5" />,
    },
    {
      name: "Orders",
      path: "/admin/orders",
      icon: <ShoppingCart className="h-5 w-5" />,
    },
    {
      name: "Users",
      path: "/admin/users",
      icon: <Users className="h-5 w-5" />,
    },
    {
      name: "Settings",
      path: "/admin/settings",
      icon: <Settings className="h-5 w-5" />,
    },
  ];

  const SidebarContent = () => (
    <>
      <div className="mb-10">
        <Link href="/" className="text-primary font-bold text-2xl font-heading">
          <span className="text-[#FF7A00]">GR8F</span>
        </Link>
        <p className="text-sm text-gray-500 mt-1">Admin Panel</p>
      </div>

      <nav className="space-y-1">
        {routes.map((route) => (
          <Link 
            key={route.path} 
            href={route.path} 
            className={`flex items-center px-4 py-3 text-sm rounded-md ${
              location === route.path
                ? "bg-primary text-white"
                : "text-gray-700 hover:bg-gray-100"
            }`}
            onClick={() => isMobile && setSidebarOpen(false)}
          >
            {route.icon}
            <span className="ml-3">{route.name}</span>
          </Link>
        ))}
      </nav>

      <div className="mt-auto pt-8">
        <Button
          variant="outline"
          className="w-full flex items-center justify-center"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4 mr-2" />
          Logout
        </Button>
        <div className="mt-4">
          <Link href="/" className="text-sm text-center block text-gray-600 hover:text-primary">
            Return to Store
          </Link>
        </div>
      </div>
    </>
  );

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-50">
      {/* Mobile top bar */}
      {isMobile && (
        <header className="bg-white py-4 px-4 flex items-center justify-between shadow-sm">
          <h1 className="text-xl font-semibold">{title}</h1>
          <div className="flex items-center gap-2">
            <DownloadButton />
            <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[240px] p-4 flex flex-col h-full">
                <SidebarContent />
              </SheetContent>
            </Sheet>
          </div>
        </header>
      )}

      {/* Desktop sidebar */}
      {!isMobile && (
        <aside className="w-64 bg-white h-screen sticky top-0 p-6 shadow-sm flex flex-col">
          <SidebarContent />
        </aside>
      )}

      {/* Main content */}
      <main className="flex-1 p-6 overflow-auto">
        {!isMobile && (
          <header className="mb-6 flex items-center justify-between">
            <h1 className="text-2xl font-bold">{title}</h1>
            <DownloadButton />
          </header>
        )}
        {children}
      </main>
    </div>
  );
};

export default AdminLayout;
