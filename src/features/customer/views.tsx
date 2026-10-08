import React from 'react';
import {
  Plus,
  ArrowLeft,
  Trash2,
  Minus,
  MapPin,
  Bike,
  Store,
  CreditCard,
  Banknote,
  Upload,
  Image as ImageIcon,
  CheckCircle2,
  Clock,
  ChefHat,
  Smartphone,
} from 'lucide-react';
import type { MenuItem, OrderItem, Order } from '../../core/types';
import type { ResolvedUiSettings } from '../../core/uiSettings';

type CustomerScreen = 'landing' | 'menu' | 'cart' | 'checkout' | 'tracking';
import { TabBar } from './components/TabBar';
import { LanguageSelector } from './components/LanguageSelector';
import { WeightOrderModal } from './components/WeightOrderModal';
import { OptionSelector } from './components/OptionSelector';
import { useTranslations } from '../../hooks/useTranslations';
import { useUnlockState } from '../../hooks/useUnlockState';

const formatMoney = (value: number, currency = 'MXN') =>
  new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);

export const LandingView = ({
  addToCart,
  setActiveScreen,
  promos,
  settings,
  primaryColor = '#f59e0b',
  secondaryColor = '#ea580c',
}: {
  addToCart: (item: any) => void;
  setActiveScreen: (screen: any) => void;
  promos: any[];
  settings?: ResolvedUiSettings;
  primaryColor?: string;
  secondaryColor?: string;
}) => {
  const { t, getItemDescription } = useTranslations();

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="relative h-72 rounded-3xl overflow-hidden mb-8 shadow-2xl">
        <img 
          src={settings?.heroImageUrl}
          className="w-full h-full object-cover object-top" 
          alt="Grilled Chicken Hero" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent flex flex-col justify-end p-6">
          <div className="flex items-center gap-2 mb-1">
            <span
              className="text-black font-black text-[10px] px-2 py-0.5 rounded uppercase tracking-tighter"
              style={{ backgroundColor: primaryColor }}
            >
              {settings?.heroTitle || 'Hoy es'}
            </span>
          </div>
          <h1 className="text-5xl font-black italic uppercase leading-none mb-1" style={{ color: primaryColor }}>
            {settings?.name || 'Restaurant'}
          </h1>
          <p className="text-white/90 text-sm font-medium">{settings?.tagline || settings?.description || settings?.heroSubtitle || ''}</p>
        </div>
      </div>

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="w-2 h-8 rounded-full" style={{ backgroundColor: primaryColor }}></span>
          <h2 className="text-xl font-bold text-gray-800 italic">
            {t('promotionsTitle', settings?.uiText?.promotionsTitle || 'Promociones')}
          </h2>
        </div>
        <div className="flex items-center gap-3">
          <LanguageSelector />
          <button 
            onClick={() => setActiveScreen('menu')}
            className="bg-black text-white px-4 py-2 rounded-lg text-sm font-bold uppercase hover:bg-gray-900 transition-colors"
          >
            {t('menuButton', settings?.uiText?.menuButton || 'Menú')}
          </button>
        </div>
      </div>
      
      <section className="mb-8">
        <div className="grid gap-4">
          {promos.map(item => (
            <div 
              key={item.id} 
              className="bg-white overflow-hidden rounded-2xl shadow-sm border flex items-center group cursor-pointer transition-all hover:shadow-lg"
              onClick={() => addToCart(item)}
              style={{ borderColor: 'transparent' }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = primaryColor)}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'transparent')}
            >
              <div className="relative w-24 h-24 overflow-hidden shrink-0 bg-gray-100">
                {item.image ? (
                  <img src={item.image} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" alt={item.name} />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300">
                    <Plus className="w-8 h-8" />
                  </div>
                )}
              </div>
              <div className="p-4 flex-1">
                <h3 className="font-bold text-lg text-gray-800">{item.name}</h3>
                <p className="text-sm text-gray-500 line-clamp-1">{getItemDescription(item.id, item.description)}</p>
                {item.bundleItems && item.bundleItems.length > 0 && (
                  <div className="mt-1 space-y-0.5">
                    {item.bundleItems.map((bundleItem: any, idx: number) => (
                      <p key={idx} className="text-[10px] text-gray-400">
                        {bundleItem.quantity}x {bundleItem.name}
                      </p>
                    ))}
                  </div>
                )}
                <div className="flex items-center justify-between mt-1">
                  <div className="flex items-center gap-2">
                    <p className="font-black text-xl" style={{ color: secondaryColor }}>${item.price}</p>
                    {item.originalPrice && item.originalPrice > item.price && (
                      <p className="text-sm text-gray-400 line-through">${item.originalPrice}</p>
                    )}
                  </div>
                  <span 
                    className="text-black px-4 py-1.5 rounded-lg text-xs font-bold"
                    style={{ backgroundColor: primaryColor }}
                  >
                    {t('addButton', '+ Agregar')}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export const MenuView = ({
  addToCart,
  setCart,
  setActiveScreen,
  menuItems,
  settings,
  primaryColor = '#f59e0b',
  secondaryColor = '#ea580c',
  backScreen = 'landing',
}: {
  addToCart: (item: MenuItem) => void;
  setCart: React.Dispatch<React.SetStateAction<OrderItem[]>>;
  setActiveScreen: (screen: CustomerScreen) => void;
  menuItems: MenuItem[];
  settings: ResolvedUiSettings;
  primaryColor?: string;
  secondaryColor?: string;
  /** Where the back arrow sends the customer (dine-in uses a synthetic landing). */
  backScreen?: CustomerScreen;
}) => {
  const { t, getItemDescription } = useTranslations();
  const { isUnlocked } = useUnlockState();
  const categories = settings?.categories || [];
  const LOCKED_CATS = ['pasteles', 'postres', 'especial', 'promo'];
  const [selectedCategory, setSelectedCategory] = React.useState(categories[0]?.code || 'promo');
  const [selectedWeightItem, setSelectedWeightItem] = React.useState<any>(null);
  const [showWeightModal, setShowWeightModal] = React.useState(false);
  const [showOptions, setShowOptions] = React.useState(false);
  const [selectedOptionItem, setSelectedOptionItem] = React.useState<any>(null);
  
  const visibleCategories = isUnlocked
    ? categories.filter(cat => menuItems.some(item => item.category === cat.code))
    : categories.filter(cat => LOCKED_CATS.includes(cat.code) && menuItems.some(item => item.category === cat.code));
  
  // Update selected category if the current one has no items
  React.useEffect(() => {
    if (visibleCategories.length > 0 && !visibleCategories.some(cat => cat.code === selectedCategory)) {
      setSelectedCategory(visibleCategories[0].code);
    }
  }, [visibleCategories, selectedCategory]);
  
  React.useEffect(() => {
    if (!visibleCategories.some(cat => cat.code === selectedCategory) && visibleCategories.length > 0) {
      setSelectedCategory(visibleCategories[0].code);
    }
  }, [isUnlocked, visibleCategories, selectedCategory]);
  
  if (categories.length === 0) {
    return (
      <div className="animate-in fade-in slide-in-from-right-4 duration-300 flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-gray-500 font-medium">{t('noCategories', 'No hay categorías disponibles')}</p>
          <p className="text-[10px] text-gray-400 mt-1">{t('configureCategories', 'Por favor configura las categorías en la pantalla de ajustes')}</p>
        </div>
      </div>
    );
  }

  const filteredItems = menuItems.filter(i => i.category === selectedCategory);
  
  const handleItemClick = (item: any) => {
    if (item.options && item.options.length > 0) {
      setSelectedOptionItem(item);
      setShowOptions(true);
    } else if (item.isWeightBased) {
      setSelectedWeightItem(item);
      setShowWeightModal(true);
    } else {
      addToCart(item);
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="flex items-center justify-between relative mb-6">
        <button onClick={() => setActiveScreen(backScreen)} className="absolute left-0 p-2 -ml-2 hover:bg-gray-100 rounded-full">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h2 className="flex-1 text-center text-2xl font-bold italic font-black uppercase">
          {t('menuTitle', 'Menú')} {settings?.shortName || settings?.name || ''}
        </h2>
      </div>
      
      {visibleCategories.length > 0 && (
        <TabBar 
          categories={visibleCategories}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          primaryColor={primaryColor}
        />
      )}
      
      <div className="mb-6">
        {filteredItems.length === 0 ? (
          <div className="text-center py-12 px-8">
            <p className="text-gray-500 font-medium text-lg">{t('noProducts', 'No hay productos disponibles')}</p>
            <p className="text-[10px] text-gray-400 mt-1">{t('noProductsInCategory', 'Esta categoría no tiene items activos')}</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredItems.map(item => (
              <div 
                key={item.id} 
                className="bg-white overflow-hidden rounded-2xl border border-gray-100 shadow-sm flex items-center group cursor-pointer transition-all hover:shadow-lg"
                onClick={() => handleItemClick(item)}
                style={{ borderColor: 'transparent' }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = primaryColor)}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'transparent')}
              >
                <div className="relative w-24 h-24 shrink-0 overflow-hidden bg-gray-100">
                  {item.image ? (
                    <img src={item.image} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" alt={item.name} />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                      <Plus className="w-8 h-8" />
                    </div>
                  )}
                </div>
                <div className="p-4 flex-1 flex flex-col justify-center">
                  <h4 className="font-bold text-gray-800 mb-1">{item.name}</h4>
                  <p className="text-sm text-gray-500 line-clamp-4 leading-relaxed">{getItemDescription(item.id, item.description)}</p>
                </div>
                <div className="flex flex-col items-center gap-2 shrink-0 pr-4">
                  {item.options && item.options.length > 0 ? (
                    <>
                      <span 
                        className="text-black px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap"
                        style={{ backgroundColor: primaryColor }}
                      >
                        Opciones
                      </span>
                      <span className="font-black text-xl" style={{ color: secondaryColor }}>Desde ${Math.min(...item.options.map((o: any) => o.price))}</span>
                    </>
                  ) : item.isWeightBased ? (
                    <>
                      <span 
                        className="text-black px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap"
                        style={{ backgroundColor: primaryColor }}
                      >
                        Peso
                      </span>
                      <span className="font-black text-sm text-gray-500 italic">{item.weightPricePerKg} MXN/kg</span>
                    </>
                  ) : (
                    <>
                      <span 
                        className="text-black px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap"
                        style={{ backgroundColor: primaryColor }}
                      >
                        {t('addButton', '+ Agregar')}
                      </span>
                      <span className="font-black text-xl" style={{ color: secondaryColor }}>${item.price}</span>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

        {/* Weight-based Modal */}
      <WeightOrderModal
        isOpen={showWeightModal}
        item={selectedWeightItem || {}}
        onClose={() => {
          setShowWeightModal(false);
          setSelectedWeightItem(null);
        }}
        onConfirm={(weightInGrams: number, price: number) => {
          if (selectedWeightItem && weightInGrams > 0 && price > 0) {
            const itemWithWeight = {
              ...selectedWeightItem,
              quantity: 1,
              weightInGrams,
              price: price,
            };
            setCart(prev => {
              const existing = prev.find((i: any) => i.id === selectedWeightItem.id);
              if (existing) return prev.map((i: any) => i.id === selectedWeightItem.id ? { ...i, quantity: i.quantity + 1, weightInGrams, price } : i);
              return [...prev, itemWithWeight];
            });
            setShowWeightModal(false);
            setSelectedWeightItem(null);
          }
        }}
      />

      {/* Options Modal */}
      {showOptions && selectedOptionItem && (
        <OptionSelector
          options={selectedOptionItem?.options || []}
          primaryColor={primaryColor}
          onSelect={(option: any) => {
            if (selectedOptionItem) {
              const itemWithOption = {
                ...selectedOptionItem,
                quantity: 1,
                selectedOption: option,
                price: option.price,
              };
              setCart(prev => {
                const existing = prev.find((i: any) => i.id === selectedOptionItem.id && i.selectedOption?.id === option.id);
                if (existing) return prev.map((i: any) => i.id === selectedOptionItem.id && i.selectedOption?.id === option.id ? { ...i, quantity: i.quantity + 1 } : i);
                return [...prev, itemWithOption];
              });
              setShowOptions(false);
              setSelectedOptionItem(null);
            }
          }}
          onClose={() => {
            setShowOptions(false);
            setSelectedOptionItem(null);
          }}
        />
      )}
    </div>
  );
};

export const CheckoutView = ({
  cart,
  setCart,
  addToCart,
  removeFromCart,
  setActiveScreen,
  deliveryType,
  setDeliveryType,
  customerInfo,
  setCustomerInfo,
  payWithAmount,
  setPayWithAmount,
  transferFile,
  setTransferFile,
  placeOrder,
  cartTotal,
  paymentMethod,
  setPaymentMethod,
  menuItems,
  settings,
  currency = 'MXN',
  deliveryFee = 0,
  deliveryDistanceKm = 0,
  primaryColor = '#f59e0b',
  secondaryColor = '#ea580c',
}: any) => {
  const { t } = useTranslations();
  const { isUnlocked, disclaimerAccepted, acceptDisclaimer, unlock } = useUnlockState();
  const [showDisclaimerModal, setShowDisclaimerModal] = React.useState(false);
  
  const dbCombo = settings?.unlock_combo || [
    { itemId: 'gom-1', count: 2 },
    { itemId: 'dul-1', count: 1 },
    { itemId: 'cho-1', count: 1 },
  ];
  
  const isUnlockOrder = React.useMemo(() => {
    if (isUnlocked) return false;
    const cartByItemId: Record<string, number> = {};
    cart.forEach((item: any) => {
      const id = item.id || 'unknown';
      cartByItemId[id] = (cartByItemId[id] || 0) + (item.quantity || 1);
    });
    return dbCombo.every((req: any) => cartByItemId[req.itemId] === req.count);
  }, [cart, isUnlocked, dbCombo]);
  
  const unlockDiscount = React.useMemo(() => {
    if (!isUnlockOrder) return 0;
    return cart
      .filter((item: any) => dbCombo.some((req: any) => req.itemId === item.id))
      .reduce((sum: number, item: any) => sum + (item.price || 0) * (item.quantity || 1), 0);
  }, [cart, isUnlockOrder, dbCombo]);
  
  const recommended = (menuItems ?? []).filter(
    (item: MenuItem) => !cart.some((cartItem: any) => cartItem.id === item.id)
  );

  const finalTotal = Math.max(0, cartTotal + (deliveryType === 'domicilio' ? deliveryFee : 0) - unlockDiscount);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setTransferFile(file);
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="flex items-center justify-between relative mb-6">
        <button onClick={() => setActiveScreen('menu')} className="absolute left-0 p-2 -ml-2 hover:bg-gray-100 rounded-full">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h2 className="flex-1 text-center text-2xl font-bold italic uppercase font-black">
          {t('checkoutTitle', settings?.uiText?.checkoutTitle || 'Tu Pedido')}
        </h2>
      </div>

      <div className="space-y-6 pb-4">
        <section className="bg-white p-5 rounded-2xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <div className="space-y-3">
            {cart.map((item: any) => (
              <div key={item.id} className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                  <img src={item.image} className="w-full h-full object-cover" alt={item.name} />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-sm text-gray-800 truncate">{item.name}</h4>
                  {item.isBundle && item.bundleItems && (
                    <div className="mt-1 space-y-0.5">
                      {item.bundleItems.map((bundleItem: any, idx: number) => (
                        <p key={idx} className="text-[10px] text-gray-500">
                          {bundleItem.quantity}x {bundleItem.name}
                        </p>
                      ))}
                    </div>
                  )}
                  {item.selectedOption && (
                    <p className="text-xs font-bold text-gray-500 truncate">{item.selectedOption.label}</p>
                  )}
                  <p className="text-xs font-black" style={{ color: secondaryColor }}>${item.price}</p>
                </div>
                <div className="flex items-center bg-gray-100 rounded-lg p-1">
                  <button onClick={() => removeFromCart(item.id)} className="p-1 hover:bg-gray-200 rounded-md transition-colors">
                    {item.quantity === 1 && !item.weightInGrams && !item.selectedOption ? <Trash2 className="w-3 h-3 text-red-500" /> : <Minus className="w-3 h-3" />}
                  </button>
                  <span className="px-2 text-xs font-black">
                    {item.weightInGrams ? `${item.weightInGrams}g` : item.quantity}
                  </span>
                  {(!item.weightInGrams && !item.selectedOption) && (
                    <button onClick={() => addToCart(item)} className="p-1 hover:bg-gray-200 rounded-md transition-colors">
                      <Plus className="w-3 h-3" />
                    </button>
                  )}
                  {item.selectedOption && (
                    <button onClick={() => addToCart({ ...item, selectedOption: item.selectedOption })} className="p-1 hover:bg-gray-200 rounded-md transition-colors">
                      <Plus className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Horizontal Upsell Bar */}
        <section className="animate-in fade-in slide-in-from-left-4 duration-500">
          <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3 ml-1 italic">{t('upsellTitle', '¿Te falta algo para acompañar?')}</h3>
          <div className="flex overflow-x-auto gap-4 pb-4 no-scrollbar -mx-6 px-6">
            {recommended.map((item: MenuItem) => (
              <div 
                key={item.id} 
                className="flex-shrink-0 w-32 bg-white border border-gray-100 rounded-2xl p-2 shadow-sm transition-all flex flex-col justify-between cursor-pointer hover:shadow-lg"
                onClick={() => addToCart(item)}
                style={{ borderColor: 'transparent' }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = primaryColor)}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'transparent')}
              >
                <div>
                  <div className="w-full h-20 rounded-xl overflow-hidden mb-2 bg-gray-100">
                    {item.image ? (
                      <img src={item.image} className="w-full h-full object-cover" alt={item.name} />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300">
                        <Plus className="w-6 h-6" />
                      </div>
                    )}
                  </div>
                  <h4 className="text-[10px] font-bold text-gray-800 leading-tight mb-1 line-clamp-2">{item.name}</h4>
                </div>
                <div className="flex items-center justify-between mt-auto">
                  <span className="text-[10px] font-black text-black">${item.price}</span>
                  <span 
                    className="text-black px-2 py-1 rounded-lg text-[10px] font-bold"
                    style={{ backgroundColor: primaryColor }}
                  >
                    +
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-white p-5 rounded-2xl border-2 border-black/5 shadow-sm">
          <h3 className="font-bold mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5" style={{ color: secondaryColor }} />
            {t('deliveryTitle', settings?.uiText?.deliveryTitle || 'Entrega')}
          </h3>
          <div className="grid grid-cols-2 gap-3 mb-4">
            <button 
              onClick={() => setDeliveryType('domicilio')}
              className={`flex flex-col items-center p-4 rounded-xl border-2 transition-all ${deliveryType === 'domicilio' ? 'border-gray-400 bg-gray-100/60' : 'border-gray-100 bg-gray-50'}`}
              style={deliveryType === 'domicilio' ? { borderColor: primaryColor, backgroundColor: `${primaryColor}20` } : undefined}
            >
              <Bike className={`w-6 h-6 mb-1 ${deliveryType === 'domicilio' ? 'text-black' : 'text-gray-400'}`} />
              <span className="text-[10px] font-bold uppercase tracking-wider text-center">
                {t('deliveryOptionLabel', settings?.uiText?.deliveryOptionLabel || 'A Domicilio')}
              </span>
            </button>
            <button 
              onClick={() => setDeliveryType('sucursal')}
              className={`flex flex-col items-center p-4 rounded-xl border-2 transition-all ${deliveryType === 'sucursal' ? 'border-gray-400 bg-gray-100/60' : 'border-gray-100 bg-gray-50'}`}
              style={deliveryType === 'sucursal' ? { borderColor: primaryColor, backgroundColor: `${primaryColor}20` } : undefined}
            >
              <Store className={`w-6 h-6 mb-1 ${deliveryType === 'sucursal' ? 'text-black' : 'text-gray-400'}`} />
              <span className="text-[10px] font-bold uppercase tracking-wider text-center">
                {t('pickupOptionLabel', settings?.uiText?.pickupOptionLabel || 'Paso por él')}
              </span>
            </button>
          </div>
          
          <div className="space-y-4">
            <input 
              type="text" 
              placeholder={t('namePlaceholder', 'Tu nombre')}
              className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl font-medium text-sm"
              value={customerInfo.name}
              onChange={(e) => setCustomerInfo({...customerInfo, name: e.target.value})}
            />
            {deliveryType === 'domicilio' && (
              <input 
                type="text" 
                placeholder={settings?.locationText ? t('addressPlaceholderWithLocation', `Dirección de entrega en ${settings.locationText}`) : t('addressPlaceholder', 'Dirección de entrega')}
                className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl animate-in slide-in-from-top-2 font-medium text-sm"
                value={customerInfo.address}
                onChange={(e) => setCustomerInfo({...customerInfo, address: e.target.value})}
              />
            )}
          </div>
        </section>

        {/* Delivery fee section */}
        {deliveryType === 'domicilio' && (
          <section className="bg-white p-5 rounded-2xl border-2 border-black/5 shadow-sm">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <Bike className="w-5 h-5" style={{ color: secondaryColor }} />
              {t('deliveryFeeTitle', 'Envío')}
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm font-bold">
                <span className="text-gray-600 italic">{t('subtotal', 'Subtotal')}</span>
                <span className="font-black">{formatMoney(cartTotal, currency)}</span>
              </div>
              <div className="flex justify-between text-sm font-bold">
                <span className="text-gray-600 italic">{t('distance', 'Distancia')}</span>
                <span className="font-black">{deliveryDistanceKm.toFixed(1)} km</span>
              </div>
              <div className="flex justify-between text-sm font-bold">
                <span className="text-gray-600 italic">{t('deliveryFee', 'Envío')}</span>
                <span className="font-black">{formatMoney(deliveryFee, currency)}</span>
              </div>
              <div className="flex justify-between pt-2 border-t-2 border-black font-black text-xl text-black uppercase italic text-right">
                <span>{t('total', 'Total')}</span>
                <span>{formatMoney(finalTotal, currency)}</span>
              </div>
            </div>
          </section>
        )}

        <section className="bg-white p-5 rounded-2xl border-2 border-black/5 shadow-sm">
          <h3 className="font-bold mb-4 flex items-center gap-2">
            <CreditCard className="w-5 h-5" style={{ color: secondaryColor }} />
            {t('paymentTitle', settings?.uiText?.paymentTitle || 'Pago')}
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
            <button
              type="button"
              onClick={() => setPaymentMethod('efectivo')}
              className={`flex flex-col items-center p-3 rounded-xl border-2 transition-all ${paymentMethod === 'efectivo' ? 'border-amber-600 bg-amber-50 text-amber-700' : 'border-gray-100 bg-gray-50'}`}
            >
              <Banknote className="w-5 h-5 mb-1" />
              <span className="text-[8px] font-bold uppercase">{t('cashPayment', 'Efectivo')}</span>
            </button>
            <button
              type="button"
              onClick={() => setPaymentMethod('tarjeta')}
              className={`flex flex-col items-center p-3 rounded-xl border-2 transition-all ${paymentMethod === 'tarjeta' ? 'border-gray-400 bg-gray-100/60' : 'border-gray-100 bg-gray-50'}`}
              style={paymentMethod === 'tarjeta' ? { borderColor: primaryColor, backgroundColor: `${primaryColor}20` } : undefined}
            >
              <CreditCard className="w-5 h-5 mb-1" />
              <span className="text-[8px] font-bold uppercase">{t('cardPayment', 'Tarjeta')}</span>
            </button>
            <button
              type="button"
              onClick={() => setPaymentMethod('telefono')}
              className={`flex flex-col items-center p-3 rounded-xl border-2 transition-all ${paymentMethod === 'telefono' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-100 bg-gray-50'}`}
            >
              <Smartphone className="w-5 h-5 mb-1" />
              <span className="text-[8px] font-bold uppercase">{t('phonePayment', 'Teléfono')}</span>
            </button>
            <button
              type="button"
              onClick={() => setPaymentMethod('transferencia')}
              className={`flex flex-col items-center p-3 rounded-xl border-2 transition-all ${paymentMethod === 'transferencia' ? 'border-purple-600 bg-purple-50 text-purple-700' : 'border-gray-100 bg-gray-50'}`}
            >
              <Upload className="w-5 h-5 mb-1" />
              <span className="text-[8px] font-bold uppercase">{t('transferPayment', 'Transfer')}</span>
            </button>
          </div>

          {paymentMethod === 'tarjeta' && (
            <div className="mt-4 animate-in slide-in-from-top-2">
              <div className="flex flex-col items-center p-6 bg-white rounded-2xl border-2 border-dashed border-gray-300">
                <CreditCard className="w-12 h-12 text-gray-600 mb-3" style={{ color: primaryColor }} />
                <p className="text-sm font-bold text-gray-700 mb-1">{t('cardInstructions', 'Paga con tarjeta de crédito o débito')}</p>
                <p className="text-xs text-gray-500 text-center">{t('cardSubtext', 'El cobro se confirma al entregar el pedido')}</p>
              </div>
            </div>
          )}

          {paymentMethod === 'telefono' && (
            <div className="mt-4 animate-in slide-in-from-top-2">
              <div className="flex flex-col items-center p-6 bg-white rounded-2xl border-2 border-blue-200">
                <Smartphone className="w-12 h-12 text-blue-500 mb-3" />
                <p className="text-sm font-bold text-gray-700 mb-1">{t('phoneInstructions', 'Paga con la app de tu teléfono')}</p>
                <p className="text-xs text-gray-500 text-center">{t('phoneSubtext', 'Mercado Pago, CoDi, Apple Pay, Google Pay u otra billetera')}</p>
              </div>
            </div>
          )}

          {paymentMethod === 'efectivo' && (
            <div className="mt-4 animate-in slide-in-from-top-2">
              <label className="text-[10px] font-black uppercase text-gray-400 mb-2 block ml-1 italic">{t('cashPaymentQuestion', '¿Con cuánto pagas?')}</label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-gray-400">$</span>
                  <input
                    type="number"
                    placeholder={t('cashPaymentPlaceholder', 'Ej. 500')}
                    className={`w-full pl-7 pr-3 py-3 bg-gray-50 border border-gray-100 rounded-xl font-bold ${parseFloat(payWithAmount || '0') < finalTotal ? 'border-red-500' : ''}`}
                    value={payWithAmount}
                    onChange={(e) => setPayWithAmount(e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}

          {paymentMethod === 'transferencia' && (
            <div className="mt-4 animate-in slide-in-from-top-2">
              <label className="text-[10px] font-black uppercase text-gray-400 mb-2 block ml-1 italic">{t('uploadTransferLabel', 'Sube foto de tu transferencia')}</label>
              <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="transfer-upload"
                />
                <label
                  htmlFor="transfer-upload"
                  className={`flex flex-col items-center justify-center w-full p-8 border-2 border-dashed rounded-2xl cursor-pointer transition-all ${transferFile ? 'border-green-500 bg-green-50' : 'border-gray-300 hover:border-blue-500 hover:bg-blue-50'}`}
                >
                  {transferFile ? (
                    <>
                      <CheckCircle2 className="w-8 h-8 text-green-500 mb-2" />
                      <span className="text-xs font-bold text-green-700">{t('imageUploaded', '¡Imagen cargada!')}</span>
                    </>
                  ) : (
                    <>
                      <ImageIcon className="w-8 h-8 text-gray-300 mb-2" />
                      <span className="text-xs font-bold text-gray-500">{t('uploadTransferPlaceholder', 'Haz clic para subir captura')}</span>
                    </>
                  )}
                </label>
              </div>
            </div>
          )}
        </section>

        <button
          onClick={() => placeOrder(paymentMethod)}
          disabled={!customerInfo.name || (deliveryType === 'domicilio' && !customerInfo.address) || cart.length === 0 || (paymentMethod === 'transferencia' && !transferFile) || (paymentMethod === 'efectivo' && parseFloat(payWithAmount || '0') < finalTotal)}
          className="w-full text-black py-5 rounded-2xl font-black text-xl shadow-xl disabled:opacity-50 transition-all active:scale-95 border-b-4 uppercase italic"
          style={{ backgroundColor: primaryColor, borderBottomColor: secondaryColor }}
        >
          {t('confirmOrderPrefix', settings?.uiText?.confirmOrderPrefix || 'CONFIRMAR PEDIDO')} {formatMoney(finalTotal, currency)}
        </button>
        
        {isUnlockOrder && !disclaimerAccepted && (
          <button
            onClick={() => setShowDisclaimerModal(true)}
            className="w-full mt-3 py-3 bg-amber-100 border-2 border-amber-400 text-amber-800 rounded-xl font-black uppercase text-sm animate-[pulse_2s_ease-in-out_infinite]"
          >
            ⚠️ Ver Aviso de Desbloqueo
          </button>
        )}
      </div>
      
      {showDisclaimerModal && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-4 max-w-lg w-full max-h-[85vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-black uppercase italic text-center flex-1">Aviso Importante</h3>
              <button onClick={() => setShowDisclaimerModal(false)} className="text-gray-400">✕</button>
            </div>
            <div className="text-xs text-gray-600 mb-4 leading-relaxed max-h-64 overflow-y-auto whitespace-pre-line">
              {settings?.disclaimer_text || 'AVISO IMPORTANTE Y DISCLAIMER COMPLETO\n\nEste producto está destinado exclusivamente a adultos mayores de 18 años.\n\n1. RESPONSABILIDAD DEL CONSUMIDOR\nEl consumidor es responsable de conocer su tolerancia personal antes de consumir cualquier producto. Comenzar con dosis pequeñas y esperar el efecto antes de tomar más.\n\n2. EFECTOS PSICOLÓGICOS\n- Alucinaciones y alteraciones de la percepción\n- Cambios en el estado de ánimo\n- Sensaciones intensificadas de amor y conexión\n- Ansiedad, paranoia o pánico en algunos usuarios\n- Depresión o pensamientos negativos\n\n3. EFECTOS FÍSICOS\n- Aumento del ritmo cardíaco\n- Boca seca (cottonmouth)\n- Ojos rojos\n- Presión arterial elevada o baja\n- Náusea y vómitos\n- Mareos y desorientación\n- Dolores de cabeza\n\n4. INTERACCIONES Y CONTRAINDICACIONES\n- NO consumir si está embarazada o amamantando\n- NO operar vehículos o maquinaria pesada\n- NO mezclar con alcohol\n- NO combinar con medicamentos sin consultar a un médico\n- Consultar a un médico si tiene condiciones cardíacas, mentales o de salud general\n\n5. RIESGO DE ADICCIÓN\nEl uso excesivo puede llevar a dependencia psicológica y tolerancia. Usar con moderación.\n\n6. CALIDAD Y ALMACENAMIENTO\nLos productos deben almacenarse en lugar fresco, seco y oscuro. Mantener fuera del alcance de niños y mascotas.\n\n7. LEGALIDAD\nEl usuario es responsable de conocer las leyes locales respecto a la tenencia y consumo de estos productos.\n\n7.A. GOMITAS Y EDIBLES\nPueden tardar 1-2 horas en hacer efecto. El efecto puede durar 4-8 horas. Comenzar con 1/4 o 1/2 porción.\n\n7.B. CHOCOLATE Y CONCENTRADOS\nEfecto más rápido que edibles. Usar con precaución.\n\n7.C. HONGOS (MAGIC MUSHROOMS)\nAlucinógenos naturales. Efectos fuertes sobre la percepción. Usar en entorno seguro.\n\n7.D. LSD Y MICRODOSIS\nPotente alucinógeno. Efectos prolongados (8-12 horas). Preparar espacio seguro.\n\n7.E. MDMA Y ESTIMULANTES\nRiesgo de deshidratación. Hidratarse pero no en exceso. No mezclar con otras sustancias.\n\n7.F. PRODUCTOS DE CANNABIS\nEfecto sedante o eufórico según cepa. No conducir. May causa hambre (munchies).\n\n7.G. PREROLLS Y CONCENTRADOS\nPara usuarios con experiencia. Efecto inmediato al fumar/vapear.\n\n\nAL CONSUMIR, USTED EXPRESAMENTE LIBERA A ESTA EMPRESA DE CUALQUIER RESPONSABILIDAD POR DAÑOS FÍSICOS, PSICOLÓGICOS O LEGALES RESULTANTES DEL USO DE ESTOS PRODUCTOS.'}
            </div>
            <button
              onClick={() => {
                acceptDisclaimer(customerInfo?.name);
                setShowDisclaimerModal(false);
              }}
              className="w-full py-3 bg-green-600 text-white rounded-xl font-black uppercase italic"
            >
              Acepto y Entiendo
            </button>
          </div>
        </div>
      )}
      
      {isUnlockOrder && disclaimerAccepted && (
        <div className="fixed inset-0 bg-black/80 z-[9999] flex items-center justify-center p-6" onClick={() => { setCart([]); setActiveScreen('menu'); }}>
          <div className="bg-white rounded-2xl p-6 max-w-md w-full text-center" onClick={(e) => e.stopPropagation()}>
            <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-black uppercase italic mb-2">¡Desbloqueado!</h3>
            <p className="text-sm text-gray-600 mb-6">Has desbloqueado el menu completo.</p>
            <button
              onClick={() => { setCart([]); unlock(); setActiveScreen('menu'); }}
              className="w-full py-3 bg-black text-white rounded-xl font-black uppercase italic animate-pulse"
            >
              Volver al Menu
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export const TrackingView = ({
  currentOrder,
  setActiveScreen,
  primaryColor = '#f59e0b',
  currency = 'MXN',
  uiText,
}: {
  currentOrder: Order | null;
  setActiveScreen: (screen: CustomerScreen) => void;
  primaryColor?: string;
  currency?: string;
  uiText?: ResolvedUiSettings['uiText'];
}) => {
  const { t } = useTranslations();
  if (!currentOrder) return null;

  const getStatusText = () => {
    switch (currentOrder.status) {
      case 'recibido':
        return t('statusReceived', 'Pedido Recibido');
      case 'preparando':
        return t('statusPreparing', 'Cocinando al Carbón');
      case 'listo':
        return t('statusReady', '¡Listo para Disfrutar!');
      case 'en_camino':
        return t('statusOnWay', 'Volando a tu Mesa');
      case 'entregado':
        return t('statusDelivered', '¡Buen Provecho!');
      default:
        return '';
    }
  };

  return (
    <div className="animate-in fade-in zoom-in-95 duration-300">
      <div className="text-center mb-8">
        <div className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4 border-4" style={{ backgroundColor: `${primaryColor}20`, borderColor: primaryColor }}>
           {currentOrder.status === 'recibido' && <Clock className="w-10 h-10 text-black" />}
           {currentOrder.status === 'preparando' && <ChefHat className="w-10 h-10 text-black animate-bounce" />}
           {currentOrder.status === 'listo' && <CheckCircle2 className="w-10 h-10 text-green-600" />}
           {(currentOrder.status === 'en_camino' || currentOrder.status === 'entregado') && <Bike className="w-10 h-10 text-black" />}
        </div>
        <h2 className="text-2xl font-black text-gray-900 uppercase italic">
          {getStatusText()}
        </h2>
        <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mt-1">Ticket: #{currentOrder.id}</p>
      </div>

      <div className="bg-white p-5 rounded-3xl border-2 border-gray-100 shadow-sm mb-6">
        <h3 className="font-black text-gray-800 text-xs uppercase tracking-widest mb-3 border-b-2 border-gray-50 pb-2">{t('yourOrder', 'Tu Orden')}</h3>
        <div className="space-y-2">
          {currentOrder.items.map((item: any) => (
            <div key={item.id} className="flex justify-between text-sm font-bold">
              <span className="text-gray-600 italic">{item.quantity}x {item.name}</span>
              <span className="font-black">${item.price * item.quantity}</span>
            </div>
          ))}
          {currentOrder.deliveryFee !== undefined && (
            <div className="flex justify-between font-black text-sm text-gray-600 italic">
              <span>{t('deliveryFee', 'Envío')}</span>
              <span>{formatMoney(currentOrder.deliveryFee, currency)}</span>
            </div>
          )}
          <div className="flex justify-between pt-2 border-t-2 border-black font-black text-xl text-black uppercase italic text-right">
            <span>{t('total', 'Total')}</span>
            <span>{formatMoney(currentOrder.total + (currentOrder.deliveryFee ?? 0), currency)}</span>
          </div>
        </div>
      </div>

      <button onClick={() => setActiveScreen('landing')} className="w-full mt-6 py-4 text-gray-400 text-[10px] font-black uppercase tracking-widest hover:text-black transition-colors">
        {t('newOrderButton', uiText?.newOrderButton || 'Nuevo Pedido')}
      </button>
    </div>
  );
};