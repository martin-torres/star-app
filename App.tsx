import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Order, OrderItem, MenuItem, OrderStatus, CustomerInfo, PromoItem, AppSkinSettings, VisitorRecord, RestaurantTable, DineInStage } from './types';
import { menuItemsApi, promosApi, ordersApi, settingsApi, subscribeToOrders, tablesApi } from './lib/pocketbase';
import { useUrlMode } from './src/hooks/useUrlMode';
import { useVisitorTracking } from './src/hooks/useVisitorTracking';
import pb from './lib/pocketbase';
import { calculateDeliveryFee, haversineKm } from './src/core/pricing';
import { resolveUiSettings } from './src/core/uiSettings';
import { LanguageProvider } from './src/contexts/LanguageContext';
import { sendTelegramNotification } from './lib/telegram';
import {
  LoadingView,
  ErrorView,
  RestaurantLogo,
  LandingView,
  MenuView,
  CheckoutView,
  TrackingView,
  DataView,
  KitchenView,
  DataLock,
  KitchenLock,
  AdminModule,
} from './src/features/appViews';
import {
  QRScanner,
  RestaurantInfoView,
  TableSelector,
  DiningScreen,
  BillPayment,
  PaymentCompleteScreen,
} from './src/features/dinein';

type ViewMode = 'customer' | 'admin' | 'data' | 'dashboard';
type CustomerScreen = 'landing' | 'menu' | 'cart' | 'checkout' | 'tracking';
type AppMode = 'to-go' | 'dine-in';

// --- Helper: parse restaurant_id from URL query param ---
const getRestaurantIdFromUrl = (): string | null => {
  if (typeof window === 'undefined') return null;
  const params = new URLSearchParams(window.location.search);
  return params.get('restaurant_id');
};

const App: React.FC = () => {
  // Phase 1: UI State Management
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [promos, setPromos] = useState<PromoItem[]>([]);
  const [settings, setSettings] = useState<AppSkinSettings | null>(null);
  const [settingsLoading, setSettingsLoading] = useState(true);
  const { visitor, visitorId, sessionId, associateVisitorWithOrder } = useVisitorTracking();

  const restaurantId = getRestaurantIdFromUrl();
  const urlMode = useUrlMode();

  const ui = resolveUiSettings(settings);

  // Determine app mode: from restaurant settings, fallback to 'to-go'
  const appMode: AppMode = settings?.mode === 'dine-in' || settings?.mode === 'both' ? 'dine-in' : 'to-go';

  // Dine-in specific state
  const [dineInStage, setDineInStage] = useState<DineInStage>('qr-scan');
  const [currentRestaurant, setCurrentRestaurant] = useState<any>(null);
  const [selectedTable, setSelectedTable] = useState<RestaurantTable | null>(null);
  const [dineInOrders, setDineInOrders] = useState<OrderItem[]>([]);
  const [qrError, setQrError] = useState<string | null>(null);
  const [billData, setBillData] = useState<any>(null);

  // To-go state
  const [cart, setCart] = useState<OrderItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [analyticsOrders, setAnalyticsOrders] = useState<Order[]>([]);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [analyticsError, setAnalyticsError] = useState<string | null>(null);
  const [analyticsRefreshTrigger, setAnalyticsRefreshTrigger] = useState(0);
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const [deliveryType, setDeliveryType] = useState<'domicilio' | 'sucursal'>('domicilio');
  const [paymentMethod, setPaymentMethod] = useState<'efectivo' | 'tarjeta' | 'transferencia'>('efectivo');
  const [payWithAmount, setPayWithAmount] = useState<string>('');
  const [transferFile, setTransferFile] = useState<File | null>(null);
  const [authenticated, setAuthenticated] = useState(false);
  const [kitchenUnlocked, setKitchenUnlocked] = useState(false);
  const [dashboardUnlocked, setDashboardUnlocked] = useState(false);
  const [kitchenLoading, setKitchenLoading] = useState(true);
  const [switcherExpanded, setSwitcherExpanded] = useState(false);
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    name: '', address: '', cardNumber: '', expiry: '', cvv: ''
  });
  const [activeScreen, setActiveScreen] = useState<CustomerScreen>('landing');
  const [selectedWeightItem, setSelectedWeightItem] = useState<any>(null);
  const [showWeightModal, setShowWeightModal] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);

  // --- Load data ---
  useEffect(() => {
    setIsLoading(true);
    setError(null);

    menuItemsApi.getAll(restaurantId || undefined)
      .then(items => {
        const filtered = items.filter(item => {
          if (item.trackInventory && item.stock !== undefined && item.stock <= 0) return false;
          return true;
        });
        setMenuItems(filtered);
      })
      .catch(() => {
        setError("Error al cargar el menú desde el servidor.");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [restaurantId]);

  useEffect(() => {
    settingsApi
      .get(restaurantId || undefined)
      .then((data) => setSettings(data))
      .catch((err) => {
        console.error('Error loading restaurant settings:', err);
      })
      .finally(() => setSettingsLoading(false));
  }, [restaurantId]);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    document.documentElement.style.setProperty('--primary', ui.primaryColor);
    document.documentElement.style.setProperty('--secondary', ui.secondaryColor);
    document.documentElement.style.setProperty('--accent', ui.accentColor);
    document.documentElement.style.setProperty('--background', ui.backgroundColor);
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', ui.primaryColor);
    localStorage.setItem('theme-primary-color', ui.primaryColor);
    localStorage.setItem('theme-app-title', ui.name);
  }, [ui.primaryColor, ui.secondaryColor, ui.accentColor, ui.backgroundColor, ui.name]);

  useEffect(() => {
    promosApi.getActive(restaurantId || undefined)
      .then(items => {
        setPromos(items);
      })
      .catch(() => console.error('Error al cargar las promociones.'));
  }, [restaurantId]);

  // Load active orders for kitchen
  useEffect(() => {
    setKitchenLoading(true);
    ordersApi.getActive(restaurantId || undefined)
      .then(items => {
        setOrders(items);
      })
      .catch(() => {
        console.error('Error al cargar órdenes activas');
      })
      .finally(() => {
        setKitchenLoading(false);
      });
  }, [restaurantId]);

  const initialViewMode = urlMode;
  const [viewMode, setViewMode] = useState<ViewMode>(initialViewMode);

  // Handle manual refresh of analytics
  const handleRefreshAnalytics = () => {
    setAnalyticsRefreshTrigger(prev => prev + 1);
  };

  // Fetch historical orders for analytics
  useEffect(() => {
    setAnalyticsLoading(true);
    setAnalyticsError(null);

    ordersApi.getAll(restaurantId || undefined)
      .then(items => {
        setAnalyticsOrders(items);
      })
      .catch(err => {
        console.error('Error fetching historical orders:', err);
        setAnalyticsError('Error al cargar datos históricos');
      })
      .finally(() => {
        setAnalyticsLoading(false);
      });
  }, [analyticsRefreshTrigger, restaurantId]);

  const handleRetry = () => {
    setError(null);
    setIsLoading(true);
    menuItemsApi.getAll(restaurantId || undefined)
      .then(items => {
        const filtered = items.filter(item => {
          if (item.trackInventory && item.stock !== undefined && item.stock <= 0) return false;
          return true;
        });
        setMenuItems(filtered);
      })
      .catch(() => {
        setError("Error al cargar el menú desde el servidor.");
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTo(0, 0);
  }, [activeScreen, viewMode, dineInStage]);

  // --- Cart / To-go functions ---
  const addToCart = (item: MenuItem | PromoItem) => {
    if ('category' in item && item.category === 'promo' && (item as PromoItem).bundleItems && (item as PromoItem).bundleItems!.length > 0) {
      setCart(prev => {
        const existing = prev.find(i => i.id === item.id);
        if (existing) return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
        return [...prev, {
          ...item,
          quantity: 1,
          isBundle: true,
          bundleItems: (item as PromoItem).bundleItems,
        }];
      });
    } else if (item.isWeightBased || (item as any).weightInGrams) {
      setSelectedWeightItem(item);
      setShowWeightModal(true);
    } else {
      setCart(prev => {
        const existing = prev.find(i => i.id === item.id);
        if (existing) return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
        return [...prev, { ...item, quantity: 1 }];
      });
    }
  };

  const removeFromCart = (itemId: string) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === itemId);
      if (existing && existing.quantity > 1) return prev.map(i => i.id === itemId ? { ...i, quantity: i.quantity - 1 } : i);
      return prev.filter(i => i.id !== itemId);
    });
  };

  const handleWeightOrderConfirm = (weightInGrams: number) => {
    if (selectedWeightItem && weightInGrams > 0) {
      const itemWithWeight = {
        ...selectedWeightItem,
        quantity: 1,
        weightInGrams,
      };
      setCart(prev => {
        const existing = prev.find(i => i.id === selectedWeightItem.id);
        if (existing) return prev.map(i => i.id === selectedWeightItem.id ? { ...i, quantity: i.quantity + 1, weightInGrams } : i);
        return [...prev, itemWithWeight];
      });
      setShowWeightModal(false);
      setSelectedWeightItem(null);
    }
  };

  // --- Place Order (To-Go) ---
  const placeOrder = async (method: any) => {
    try {
      const now = Date.now();

      const STORE_LOCATION = {
        lat: ui.deliveryRules.storeLat ?? 25.74876,
        lng: ui.deliveryRules.storeLng ?? -100.41914,
      };
      const CUSTOMER_LOCATION = STORE_LOCATION;

      let deliveryDistanceKm: number | undefined;
      let deliveryFee: number | undefined;

      if (deliveryType === 'domicilio') {
        deliveryDistanceKm = haversineKm(STORE_LOCATION.lat, STORE_LOCATION.lng, CUSTOMER_LOCATION.lat, CUSTOMER_LOCATION.lng);
        deliveryFee = calculateDeliveryFee(deliveryDistanceKm, ui.deliveryRules.thresholds);
      }

      const newOrderData: Omit<Order, 'id'> = {
        customerName: customerInfo.name || 'Invitado',
        customerAddress: deliveryType === 'domicilio' ? customerInfo.address : ui.pickupLocationText,
        items: [...cart],
        total: cartTotal,
        status: method === 'transferencia' ? 'pendiente_pago' : 'recibido',
        paymentMethod: method,
        payWithAmount: method === 'efectivo' && payWithAmount ? parseFloat(payWithAmount) : undefined,
        transferScreenshot: method === 'transferencia' ? transferFile : undefined,
        deliveryDistanceKm,
        deliveryFee,
        restaurant_id: restaurantId || undefined,
        order_type: deliveryType === 'domicilio' ? 'delivery' : 'pickup',
        timestamp: now,
        statusTimestamps: { recibido: now }
      };

      const formData = new FormData();
      formData.append('customerName', newOrderData.customerName);
      formData.append('customerAddress', newOrderData.customerAddress);
      formData.append('items', JSON.stringify(newOrderData.items));
      formData.append('total', newOrderData.total.toString());
      formData.append('status', newOrderData.status);
      formData.append('paymentMethod', newOrderData.paymentMethod);
      formData.append('order_type', newOrderData.order_type || 'pickup');
      if (newOrderData.restaurant_id) formData.append('restaurant_id', newOrderData.restaurant_id);
      if (newOrderData.payWithAmount !== undefined) {
        formData.append('payWithAmount', newOrderData.payWithAmount.toString());
      }
      if (newOrderData.transferScreenshot !== undefined) {
        formData.append('transferScreenshot', newOrderData.transferScreenshot);
      }
      if (newOrderData.deliveryDistanceKm !== undefined) {
        formData.append('deliveryDistanceKm', newOrderData.deliveryDistanceKm.toString());
      }
      if (newOrderData.deliveryFee !== undefined) {
        formData.append('deliveryFee', newOrderData.deliveryFee.toString());
      }
      formData.append('timestamp', newOrderData.timestamp.toString());
      formData.append('statusTimestamps', JSON.stringify(newOrderData.statusTimestamps));

      const newOrder = await pb.collection('orders').create(formData);

      await associateVisitorWithOrder(newOrder.id);

      if (settings?.telegramBotToken && settings?.telegramChatId && settings?.telegramNotificationsEnabled) {
        sendTelegramNotification(newOrder, {
          botToken: settings.telegramBotToken,
          chatId: settings.telegramChatId
        }, 'new_order').catch(console.error);
      }

      setCurrentOrder(newOrder);
      setCart([]);
      setPayWithAmount('');
      setTransferFile(null);
      setCustomerInfo({ name: '', address: '', cardNumber: '', expiry: '', cvv: '' });
      setActiveScreen('tracking');
    } catch (error) {
      console.error('Error creating order:', error);
      alert('Error al crear orden. Por favor intenta de nuevo.');
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: OrderStatus) => {
    try {
      await ordersApi.updateStatus(orderId, newStatus);
    } catch (error) {
      console.error(`Error updating order ${orderId} status:`, error);
      throw error;
    }
  };

  const cartTotal = cart.reduce((acc, i) => acc + (i.price * i.quantity), 0);
  const checkoutDeliveryFee =
    deliveryType === 'domicilio' && cartTotal > 0
      ? calculateDeliveryFee(0, ui.deliveryRules.thresholds)
      : 0;

  // Subscribe to real-time order updates
  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    subscribeToOrders((order: Order) => {
      setOrders(prevOrders => {
        if (order.status === 'entregado' || order.status === 'paid' || order.status === 'cancelled') {
          return prevOrders.filter(o => o.id !== order.id);
        }
        const idx = prevOrders.findIndex(o => o.id === order.id);
        if (idx >= 0) {
          return prevOrders.map((o, i) => (i === idx ? order : o));
        }
        return [...prevOrders, order];
      });
    }).then((fn: any) => {
      unsubscribe = fn;
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  // Subscribe to real-time updates for customer's current order
  useEffect(() => {
    if (!currentOrder) return;

    let unsubscribe: (() => void) | undefined;

    subscribeToOrders((order: Order) => {
      if (order.id !== currentOrder.id) return;
      setCurrentOrder(order);

      if (order.status === 'entregado' || order.status === 'paid' || order.status === 'cancelled') {
        setTimeout(() => {
          setCurrentOrder(null);
          setActiveScreen('landing');
        }, 2000);
      }
    }).then((fn: any) => {
      unsubscribe = fn;
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [currentOrder?.id]);

  // ================================================================
  // DINE-IN HANDLERS
  // ================================================================

  const handleQRScan = useCallback(async (restaurantIdOrSlug: string) => {
    setQrError(null);

    try {
      // Try to get restaurant by ID first, then by slug
      let restaurant = await pb.collection('restaurants').getOne(restaurantIdOrSlug).catch(() => null);
      if (!restaurant) {
        const records = await pb.collection('restaurants').getFullList({
          filter: `slug = "${restaurantIdOrSlug}"`,
        });
        restaurant = records.length > 0 ? records[0] : null;
      }

      if (!restaurant) {
        setQrError('Restaurante no encontrado. Verifica el código QR e intenta de nuevo.');
        return;
      }

      setCurrentRestaurant(restaurant);
      setDineInStage('restaurant-info');
    } catch (err) {
      setQrError('Error al conectar con el servidor. Intenta de nuevo.');
    }
  }, []);

  const handleTableSelection = useCallback(async (tableId: string | null) => {
    if (!tableId) return;
    try {
      const table = await tablesApi.getById(tableId);
      setSelectedTable(table);
      setDineInStage('dining');
    } catch (err) {
      console.error('Error selecting table:', err);
    }
  }, []);

  const handleContinueOrdering = useCallback(() => {
    setDineInStage('dining');
    // In a real app, we'd navigate to the menu screen
    // For now, we show the dining screen which has a "continue ordering" button
    // that goes to the menu
    setActiveScreen('menu');
  }, []);

  const handleRequestBill = useCallback(() => {
    const subtotal = dineInOrders.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const tax = subtotal * 0.1;
    const total = subtotal + tax;

    setBillData({
      items: dineInOrders,
      subtotal,
      tax,
      tip: 0,
      total,
      payments: [],
    });
    setDineInStage('bill');
  }, [dineInOrders]);

  const handlePaymentComplete = useCallback((paidAmount: number, paidItems: string[]) => {
    setDineInStage('payment-complete');
    // Auto-reset after showing payment complete
    setTimeout(() => {
      setDineInStage('qr-scan');
      setCurrentRestaurant(null);
      setSelectedTable(null);
      setDineInOrders([]);
      setBillData(null);
      setActiveScreen('landing');
    }, 3000);
  }, []);

  const handleAddDineInItem = useCallback((item: MenuItem) => {
    setDineInOrders(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  }, []);

  // ================================================================
  // RENDER
  // ================================================================

  if (isLoading || settingsLoading) {
    return (
      <LoadingView
        restaurantName={ui.name}
        primaryColor={ui.primaryColor}
        backgroundColor={ui.backgroundColor}
        loadingTitle={ui.uiText.loadingTitle}
      />
    );
  }

  if (error) {
    return (
      <ErrorView
        error={error}
        onRetry={handleRetry}
        errorTitle={ui.uiText.errorTitle}
        retryLabel={ui.uiText.retryButton}
      />
    );
  }

  const renderCustomerView = () => {
    // If in dine-in mode, render the dine-in flow
    if (appMode === 'dine-in') {
      switch (dineInStage) {
        case 'qr-scan':
          return (
            <QRScanner
              restaurantName={ui.name}
              primaryColor={ui.primaryColor}
              onScan={handleQRScan}
              error={qrError}
            />
          );

        case 'restaurant-info':
          return currentRestaurant ? (
            <RestaurantInfoView
              restaurant={{
                id: currentRestaurant.id,
                name: currentRestaurant.name,
                address: currentRestaurant.address,
                hours: currentRestaurant.hours,
                waitTime: currentRestaurant.waitTime,
                promos: [],
              }}
              primaryColor={ui.primaryColor}
              secondaryColor={ui.secondaryColor}
              onContinue={() => setDineInStage('table-selection')}
            />
          ) : null;

        case 'table-selection': {
          // Load tables for this restaurant
          const [tables, setTables] = React.useState<RestaurantTable[]>([]);
          React.useEffect(() => {
            if (currentRestaurant?.id) {
              tablesApi.getAll(currentRestaurant.id).then(setTables).catch(console.error);
            }
          }, [currentRestaurant?.id]);

          return (
            <TableSelector
              tables={tables}
              primaryColor={ui.primaryColor}
              secondaryColor={ui.secondaryColor}
              onSelectTable={handleTableSelection}
            />
          );
        }

        case 'dining':
          return (
            <DiningScreen
              tableNumber={selectedTable?.table_number || 0}
              currentOrders={dineInOrders}
              primaryColor={ui.primaryColor}
              secondaryColor={ui.secondaryColor}
              onContinueOrdering={handleContinueOrdering}
              onRequestBill={handleRequestBill}
            />
          );

        case 'bill':
          return billData ? (
            <BillPayment
              bill={billData}
              primaryColor={ui.primaryColor}
              secondaryColor={ui.secondaryColor}
              onPaymentComplete={handlePaymentComplete}
            />
          ) : null;

        case 'payment-complete':
          return (
            <PaymentCompleteScreen
              tableNumber={selectedTable?.table_number}
              primaryColor={ui.primaryColor}
              onDone={() => {
                setDineInStage('qr-scan');
                setCurrentRestaurant(null);
                setSelectedTable(null);
                setDineInOrders([]);
                setBillData(null);
              }}
            />
          );

        default:
          return null;
      }
    }

    // To-go mode: show landing/menu/checkout/tracking
    return (
      <>
        {activeScreen === 'landing' && (
          <LandingView
            addToCart={addToCart}
            setActiveScreen={setActiveScreen}
            promos={promos}
            settings={ui}
            primaryColor={ui.primaryColor}
            secondaryColor={ui.secondaryColor}
          />
        )}
        {activeScreen === 'menu' && (
          <MenuView
            addToCart={addToCart}
            setCart={setCart}
            setActiveScreen={setActiveScreen}
            menuItems={menuItems}
            settings={ui}
            primaryColor={ui.primaryColor}
            secondaryColor={ui.secondaryColor}
          />
        )}
        {activeScreen === 'checkout' && (
          <CheckoutView
            cart={cart}
            setCart={setCart}
            addToCart={addToCart}
            removeFromCart={removeFromCart}
            setActiveScreen={setActiveScreen}
            deliveryType={deliveryType}
            setDeliveryType={setDeliveryType}
            customerInfo={customerInfo}
            setCustomerInfo={setCustomerInfo}
            payWithAmount={payWithAmount}
            setPayWithAmount={setPayWithAmount}
            transferFile={transferFile}
            setTransferFile={setTransferFile}
            paymentMethod={paymentMethod}
            setPaymentMethod={setPaymentMethod}
            placeOrder={placeOrder}
            cartTotal={cartTotal}
            menuItems={menuItems}
            settings={ui}
            currency={ui.currency}
            deliveryFee={checkoutDeliveryFee}
            deliveryDistanceKm={0}
            primaryColor={ui.primaryColor}
            secondaryColor={ui.secondaryColor}
          />
        )}
        {activeScreen === 'tracking' && (
          <TrackingView
            currentOrder={currentOrder}
            setActiveScreen={setActiveScreen}
            primaryColor={ui.primaryColor}
            currency={ui.currency}
            uiText={ui.uiText}
          />
        )}
      </>
    );
  };

  return (
    <LanguageProvider>
      <div className="h-screen max-w-lg mx-auto shadow-2xl flex flex-col relative overflow-hidden border-x border-gray-100" style={{ backgroundColor: ui.backgroundColor }}>
        {/* Top Navigation Bar */}
        <div className="shrink-0 bg-white/90 backdrop-blur-xl border-b-2 border-gray-100 p-4 flex justify-between items-center z-50">
          <div className="flex items-center gap-3">
            <RestaurantLogo logoUrl={ui.logoUrl} restaurantName={ui.name} primaryColor={ui.primaryColor} />
            <div className="flex flex-col leading-none">
              <span className="font-black text-gray-900 uppercase italic tracking-tighter">{ui.name}</span>
              <span className="text-[8px] font-bold uppercase tracking-[0.3em] mt-0.5" style={{ color: ui.secondaryColor }}>
                {appMode === 'dine-in' ? 'Dine-In' : ui.locationText}
              </span>
            </div>
          </div>
          <div className="bg-gray-100 p-1 rounded-full flex gap-1">
            <button
              onClick={() => {
                if (viewMode === 'customer') {
                  setSwitcherExpanded(!switcherExpanded);
                } else {
                  setSwitcherExpanded(true);
                  setViewMode('customer');
                }
              }}
              className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase transition-all ${viewMode === 'customer' ? 'bg-black shadow-sm' : 'text-gray-400'}`}
              style={viewMode === 'customer' ? { color: ui.primaryColor } : undefined}
            >
              App
            </button>
            {switcherExpanded && ['admin', 'data', 'dashboard'].map((mode) => (
              <button key={mode} onClick={() => {
                if (viewMode === 'admin') setKitchenUnlocked(false);
                if (viewMode === 'data') setAuthenticated(false);
                if (viewMode === 'dashboard') setDashboardUnlocked(false);
                setViewMode(mode as any);
              }} className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase transition-all ${viewMode === mode ? 'bg-black shadow-sm' : 'text-gray-400'}`} style={viewMode === mode ? { color: ui.primaryColor } : undefined}>
                {mode === 'admin' ? 'Cocina' : mode === 'data' ? 'Data' : 'Admin'}
              </button>
            ))}
          </div>
        </div>

        {/* Main Content Area */}
        <main ref={scrollRef} className={`flex-1 p-6 pb-32 overflow-y-auto overflow-x-hidden scroll-smooth ${viewMode === 'admin' || viewMode === 'data' || viewMode === 'dashboard' ? 'bg-gray-100' : ''}`}>
          {viewMode === 'customer' ? (
            renderCustomerView()
          ) : viewMode === 'admin' ? (
            kitchenUnlocked ? (
              <KitchenView
                orders={orders}
                updateOrderStatus={updateOrderStatus}
                kitchenLoading={kitchenLoading}
                currency={ui.currency}
                uiText={ui.uiText}
                pickupLocationText={ui.pickupLocationText}
                primaryColor={ui.primaryColor}
              />
            ) : (
              <KitchenLock onUnlock={() => setKitchenUnlocked(true)} expectedPin={ui.kitchenPin} title={ui.uiText.kitchenLockTitle} accentColor={ui.primaryColor} />
            )
          ) : viewMode === 'dashboard' ? (
            <AdminModule
              settings={settings || {}}
              onExit={() => {
                setDashboardUnlocked(false);
                setViewMode('customer');
              }}
              primaryColor={ui.primaryColor}
            />
          ) : (
            authenticated ? (
              <DataView
                orders={analyticsOrders}
                loading={analyticsLoading}
                error={analyticsError}
                onRefreshAnalytics={handleRefreshAnalytics}
                currency={ui.currency}
                uiText={ui.uiText}
                primaryColor={ui.primaryColor}
                secondaryColor={ui.secondaryColor}
              />
            ) : (
              <DataLock
                onUnlock={() => { setAuthenticated(true); setAnalyticsRefreshTrigger(prev => prev + 1); }}
                expectedPin={ui.adminPin}
                title={ui.uiText.dataLockTitle}
                accentColor={ui.primaryColor}
              />
            )
          )}
        </main>

        {/* Floating Cart Button (to-go mode only) */}
        {viewMode === 'customer' && appMode === 'to-go' && activeScreen !== 'tracking' && activeScreen !== 'checkout' && cart.length > 0 && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-full max-w-md px-6 z-40 animate-in slide-in-from-bottom-8">
            <button onClick={() => setActiveScreen('checkout')} className="w-full bg-black text-white p-5 rounded-2xl flex items-center justify-between shadow-2xl border-4 border-gray-800">
              <div className="flex items-center gap-4">
                <div className="text-black px-3 py-1 rounded-lg font-black text-sm" style={{ backgroundColor: ui.primaryColor }}>{cart.length}</div>
                <span className="font-black uppercase tracking-widest italic text-xs">{ui.uiText.cartButton}</span>
              </div>
              <span className="text-2xl font-black italic" style={{ color: ui.primaryColor }}>${cartTotal}</span>
            </button>
          </div>
        )}
      </div>
    </LanguageProvider>
  );
};

export default App;
