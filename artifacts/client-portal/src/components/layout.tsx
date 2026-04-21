import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard, 
  FolderOpen, 
  PlusCircle, 
  Settings, 
  LogOut,
  Menu
} from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

const NAV_ITEMS = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/projects", label: "Projects", icon: FolderOpen },
  { href: "/projects/new", label: "New Request", icon: PlusCircle },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  const NavLinks = () => (
    <nav className="flex flex-col gap-2 p-4">
      <div className="mb-8 px-4 flex items-center gap-3">
        <div className="size-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold font-serif text-xl">
          S
        </div>
        <span className="font-serif font-bold text-xl tracking-tight">Studio</span>
      </div>
      
      {NAV_ITEMS.map((item) => {
        const isActive = location === item.href || (item.href !== "/" && location.startsWith(item.href));
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors font-medium ${
              isActive 
                ? "bg-primary text-primary-foreground" 
                : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
            }`}
          >
            <item.icon className="size-5" />
            {item.label}
          </Link>
        );
      })}

      <div className="mt-auto pt-8 flex flex-col gap-2">
        <button className="flex items-center gap-3 px-4 py-3 rounded-lg transition-colors font-medium text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground">
          <Settings className="size-5" />
          Settings
        </button>
        <button className="flex items-center gap-3 px-4 py-3 rounded-lg transition-colors font-medium text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground">
          <LogOut className="size-5" />
          Sign out
        </button>
      </div>
    </nav>
  );

  return (
    <div className="min-h-[100dvh] flex bg-background">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 flex-col bg-sidebar border-r border-sidebar-border">
        <NavLinks />
      </aside>

      {/* Mobile Header & Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="md:hidden flex items-center justify-between p-4 border-b bg-card">
          <div className="flex items-center gap-3">
            <div className="size-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold font-serif text-xl">
              S
            </div>
            <span className="font-serif font-bold text-xl tracking-tight">Studio</span>
          </div>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="size-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0 bg-sidebar border-sidebar-border">
              <NavLinks />
            </SheetContent>
          </Sheet>
        </header>
        
        <main className="flex-1 overflow-auto p-4 md:p-8">
          <div className="max-w-6xl mx-auto h-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
