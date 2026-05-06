import { useState } from 'react';
import {
  LayoutDashboard,
  UtensilsCrossed,
  ShoppingCart,
  Percent,
  Settings,
  Package,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  Table2,
} from 'lucide-react';
import { AdminErrorBoundary } from './ErrorBoundary';

type AdminPage = 'dashboard' | 'menu' | 'orders' | 'promotions' | 'settings' | 'inventory' | 'tables';

interface NavItem {
  id: AdminPage;
  label: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
  { id: 'menu', label: 'Menú', icon: <UtensilsCrossed className="w-5 h-5" /> },
  { id: 'orders', label: 'Órdenes', icon: <ShoppingCart className="w-5 h-5" /> },
  { id: 'promotions', label: 'Promociones', icon: <Percent className="w-5 h-5" /> },
  { id: 'inventory', label: 'Inventario', icon: <Package className="w-5 h-5" /> },
  { id: 'tables', label: 'Mesas', icon: <Table2 className="w-5 h-5" /> },
  { id: 'settings', label: 'Configuración', icon: <Settings className="w-5 h-5" /> },
];

interface AdminLayoutProps {
  children: (page: AdminPage) => React.ReactNode;
  restaurantName?: string;
  onExit: () => void;
}

export const AdminLayout = ({ children, restaurantName = 'Restaurant', onExit }: AdminLayoutProps) => {
  const [currentPage, setCurrentPage] = useState<AdminPage>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-50
          bg-gray-900 text-white
          transition-all duration-300 ease-in-out
          ${sidebarOpen ? 'w-64' : 'w-20'}
          ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-800">
          {sidebarOpen && (
            <span className="font-bold text-lg truncate">{restaurantName}</span>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-gray-800 rounded-lg hidden lg:block"
          >
            {sidebarOpen ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
          </button>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="p-2 hover:bg-gray-800 rounded-lg lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="p-4 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setCurrentPage(item.id);
                setMobileMenuOpen(false);
              }}
              className={`
                w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
                ${currentPage === item.id
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                }
                ${!sidebarOpen ? 'justify-center' : ''}
              `}
              title={!sidebarOpen ? item.label : undefined}
            >
              {item.icon}
              {sidebarOpen && <span className="font-medium">{item.label}</span>}
            </button>
          ))}
        </nav>

        <div className="absolute bottom-4 left-4 right-4">
          <button
            onClick={onExit}
            className={`
              w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg
              bg-red-600/20 text-red-400 hover:bg-red-600/30 transition-colors
              ${!sidebarOpen ? 'px-2' : ''}
            `}
          >
            <X className="w-5 h-5" />
            {sidebarOpen && <span>Salir del Admin</span>}
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 flex items-center px-4 bg-white border-b lg:hidden">
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <Menu className="w-6 h-6" />
          </button>
          <span className="ml-4 font-bold">{restaurantName}</span>
        </header>

        <main className="flex-1 p-6 overflow-auto">
          <AdminErrorBoundary>
            {children(currentPage)}
          </AdminErrorBoundary>
        </main>
      </div>
    </div>
  );
};
