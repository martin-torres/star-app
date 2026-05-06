import { useState, useEffect, useCallback } from 'react';
import { AdminLayout } from './components/AdminLayout';
import { AdminErrorBoundary } from './components/ErrorBoundary';
import { DashboardPage } from './pages/DashboardPage';
import { MenuPage } from './pages/MenuPage';
import { OrdersPage } from './pages/OrdersPage';
import { PromotionsPage } from './pages/PromotionsPage';
import { SettingsPage } from './pages/SettingsPage';
import { InventoryPage } from './pages/InventoryPage';
import { TablesPage } from './pages/TablesPage';
import { menuApi, ordersApi, settingsApi, promosApi, tablesApi, adminAuth } from './adminApi';

type AdminPage = 'dashboard' | 'menu' | 'orders' | 'promotions' | 'settings' | 'inventory' | 'tables';

interface AdminModuleProps {
  settings: any;
  onExit: () => void;
  primaryColor?: string;
}

export const AdminModule = ({
  settings: initialSettings,
  onExit,
  primaryColor = '#f59e0b',
}: AdminModuleProps) => {
  const [currentPage, setCurrentPage] = useState<AdminPage>('dashboard');
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [promos, setPromos] = useState<any[]>([]);
  const [tables, setTables] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>(initialSettings);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');

  const loadData = useCallback(async () => {
    try {
      console.log('[Admin] Loading data...');
      const [menuData, orderData, promoData, settingsData, tableData] = await Promise.all([
        menuApi.getAll(),
        ordersApi.getAll(),
        promosApi.getAll(),
        settingsApi.get(),
        tablesApi.getAll(),
      ]);
      console.log('[Admin] Loaded:', {
        menuItems: menuData.length,
        orders: orderData.length,
        promos: promoData.length,
        tables: tableData.length,
        hasSettings: !!settingsData
      });
      setMenuItems(menuData);
      setOrders(orderData);
      setPromos(promoData);
      setTables(tableData);
      if (settingsData) setSettings(settingsData);
    } catch (error) {
      console.error('[Admin] Error loading data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAdmin) {
      loadData();
    }
  }, [isAdmin, loadData]);

  const handlePinSubmit = async () => {
    const correctPin = settings?.adminPin || '1234';
    if (pinInput === correctPin) {
      try {
        const adminEmail = import.meta.env.VITE_ADMIN_EMAIL || prompt('Admin email:') || '';
        const adminPassword = import.meta.env.VITE_ADMIN_PASSWORD || prompt('Admin password:') || '';
        if (!adminEmail || !adminPassword) {
          setPinError('Credenciales no proporcionadas');
          return;
        }
        const authed = await adminAuth(adminEmail, adminPassword);
        if (authed) {
          setIsAdmin(true);
          setPinError('');
        } else {
          setPinError('Error de autenticación con base de datos');
        }
      } catch (error) {
        console.error('Auth error:', error);
        setPinError('Error conectando a la base de datos');
      }
    } else {
      setPinError('PIN incorrecto');
    }
  };

  const handleMenuSave = async (item: any) => {
    try {
      if (item.id) {
        await menuApi.update(item.id, item);
      } else {
        await menuApi.create(item);
      }
      await loadData();
      return true;
    } catch (error) {
      console.error('Error saving menu item:', error);
      throw error;
    }
  };

  const handleMenuDelete = async (id: string) => {
    try {
      await menuApi.delete(id);
      await loadData();
    } catch (error) {
      console.error('Error deleting menu item:', error);
      throw error;
    }
  };

  const handleOrderStatusUpdate = async (orderId: string, status: string) => {
    try {
      await ordersApi.updateStatus(orderId, status);
      await loadData();
    } catch (error) {
      console.error('Error updating order status:', error);
      throw error;
    }
  };

  const handlePromoSave = async (promo: any) => {
    try {
      if (promo.id) {
        await promosApi.update(promo.id, promo);
      } else {
        await promosApi.create(promo);
      }
      await loadData();
      return true;
    } catch (error) {
      console.error('Error saving promo:', error);
      throw error;
    }
  };

  const handlePromoDelete = async (id: string) => {
    try {
      await promosApi.delete(id);
      await loadData();
    } catch (error) {
      console.error('Error deleting promo:', error);
      throw error;
    }
  };

  const handleSettingsSave = async (newSettings: any) => {
    try {
      if (settings?.id) {
        await settingsApi.update(settings.id, newSettings);
      }
      await loadData();
      return true;
    } catch (error) {
      console.error('Error saving settings:', error);
      throw error;
    }
  };

  const handleToggleActive = async (id: string, active: boolean) => {
    try {
      await menuApi.update(id, { active });
      await loadData();
    } catch (error) {
      console.error('Error toggling item:', error);
      throw error;
    }
  };

  const handleUpdateStock = async (id: string, stock: number) => {
    try {
      await menuApi.update(id, { stock });
      await loadData();
    } catch (error) {
      console.error('Error updating stock:', error);
      throw error;
    }
  };

  const handleTableSave = async (table: any) => {
    try {
      if (table.id) {
        await tablesApi.update(table.id, table);
      } else {
        await tablesApi.create(table);
      }
      await loadData();
      return true;
    } catch (error) {
      console.error('Error saving table:', error);
      throw error;
    }
  };

  const handleTableDelete = async (id: string) => {
    try {
      await tablesApi.delete(id);
      await loadData();
    } catch (error) {
      console.error('Error deleting table:', error);
      throw error;
    }
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-sm">
          <h2 className="text-2xl font-bold text-center mb-6">Acceso Admin</h2>
          <p className="text-gray-600 text-center mb-6">Ingresa el PIN de administrador</p>
          <input
            type="password"
            value={pinInput}
            onChange={(e) => setPinInput(e.target.value)}
            placeholder="PIN"
            className="w-full px-4 py-3 border-2 rounded-xl text-center text-2xl tracking-widest mb-4"
            onKeyDown={(e) => e.key === 'Enter' && handlePinSubmit()}
          />
          {pinError && <p className="text-red-500 text-center mb-4">{pinError}</p>}
          <button
            onClick={handlePinSubmit}
            className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors"
          >
            Entrar
          </button>
          <button
            onClick={onExit}
            className="w-full mt-4 text-gray-500 hover:text-gray-700 transition-colors"
          >
            Volver
          </button>
        </div>
      </div>
    );
  }

  const categories = settings?.categories || [];

  const renderPage = (page: AdminPage) => {
    switch (page) {
      case 'dashboard':
        return <DashboardPage orders={orders} />;
      case 'menu':
        return (
          <MenuPage
            menuItems={menuItems}
            categories={categories}
            onSave={handleMenuSave}
            onDelete={handleMenuDelete}
            primaryColor={primaryColor}
          />
        );
      case 'orders':
        return (
          <OrdersPage
            orders={orders}
            onUpdateStatus={handleOrderStatusUpdate}
          />
        );
      case 'promotions':
        return (
          <PromotionsPage
            promotions={promos}
            onSave={handlePromoSave}
            onDelete={handlePromoDelete}
            primaryColor={primaryColor}
          />
        );
      case 'settings':
        return (
          <SettingsPage
            settings={settings || {}}
            onSave={handleSettingsSave}
          />
        );
      case 'inventory':
        return (
          <InventoryPage
            items={menuItems.map((item: any) => ({
              id: item.id,
              name: item.name,
              category: item.category,
              active: item.active ?? true,
              stock: item.stock,
            }))}
            categories={categories}
            onToggleActive={handleToggleActive}
            onUpdateStock={handleUpdateStock}
          />
        );
      case 'tables':
        return (
          <TablesPage
            tables={tables}
            onSave={handleTableSave}
            onDelete={handleTableDelete}
            primaryColor={primaryColor}
          />
        );
      default:
        return <DashboardPage orders={orders} />;
    }
  };

  return (
    <AdminErrorBoundary>
      <AdminLayout
        restaurantName={settings?.name || 'Restaurant'}
        onExit={onExit}
      >
        {(page: AdminPage) => renderPage(page)}
      </AdminLayout>
    </AdminErrorBoundary>
  );
};
