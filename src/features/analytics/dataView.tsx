import { useState } from 'react';
import {
  BarChart3,
  Info,
  Banknote,
  Timer,
  Bike,
  TrendingUp,
  Calendar,
  ChevronDown,
  Target,
  Clock,
} from 'lucide-react';
import type { OrderStatus } from '../../core/types';

export const DataView = ({
  orders,
  loading,
  error,
  onRefreshAnalytics,
  currency = 'MXN',
  uiText,
  primaryColor = '#f59e0b',
  secondaryColor = '#ea580c',
}: any) => {
  const [expandedSection, setExpandedSection] = useState<'items' | 'times' | 'calendar' | null>('items');
  const [timeView, setTimeView] = useState<'daily' | 'weekly' | 'monthly'>('weekly');

  // Add loading state at top
  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4 animate-pulse" />
          <p className="text-gray-400 font-black uppercase text-xs tracking-widest">
            Cargando datos históricos...
          </p>
        </div>
      </div>
    );
  }
  
  // Add error state
  if (error) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="w-full max-w-md bg-white border-2 border-red-200 p-8 rounded-3xl text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Info className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-xl font-black uppercase italic text-gray-900 mb-3">Error</h2>
          <p className="text-sm text-gray-600 mb-8">{error}</p>
          <button
            onClick={onRefreshAnalytics}
            className="px-4 py-2 bg-gray-900 text-white rounded-lg text-xs font-black uppercase"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  // Filter orders based on timeView (daily/weekly/monthly)
  const filteredOrders = orders.filter((o: any) => {
    const orderTimestamp = o.timestamp;
    const now = new Date();
    
    if (timeView === 'daily') {
      // Today's orders (client local time)
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      return orderTimestamp >= today.getTime() && orderTimestamp < tomorrow.getTime();
    } else if (timeView === 'weekly') {
      // Current week (client local time)
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - now.getDay());
      weekStart.setHours(0, 0, 0, 0);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 7);
      return orderTimestamp >= weekStart.getTime() && orderTimestamp < weekEnd.getTime();
    } else if (timeView === 'monthly') {
      // Current month (client local time)
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);
      return orderTimestamp >= monthStart.getTime() && orderTimestamp < monthEnd.getTime();
    }
    return true;
  });

  const totalSales = filteredOrders.reduce((acc: number, o: any) => acc + o.total, 0);
  const totalDeliveryRevenue = filteredOrders.reduce((acc: number, o: any) => acc + (o.deliveryFee ?? 0), 0);
  
  const itemStats = filteredOrders.reduce((acc: any, o: any) => {
    o.items.forEach((item: any) => {
      if (!acc[item.name]) acc[item.name] = { count: 0, revenue: 0, image: item.image };
      acc[item.name].count += item.quantity;
      acc[item.name].revenue += (item.price * item.quantity);
    });
    return acc;
  }, {});

  const bestSellers = Object.entries(itemStats)
    .sort(([, a]: any, [, b]: any) => b.revenue - a.revenue)
    .map(([name, data]: any) => ({ name, ...data }));

  const calculateAvgTime = (from: OrderStatus | 'ordered', to: OrderStatus) => {
    const validOrders = filteredOrders.filter((o: any) => {
      const start = from === 'ordered' ? o.timestamp : o.statusTimestamps[from];
      const end = o.statusTimestamps[to];
      return start && end;
    });
    if (validOrders.length === 0) return 0;
    const totalMs = validOrders.reduce((acc: number, o: any) => {
      const start = from === 'ordered' ? o.timestamp : o.statusTimestamps[from];
      const end = o.statusTimestamps[to];
      return acc + (end - start);
    }, 0);
    return (totalMs / validOrders.length / 60000).toFixed(1);
  };

  const formatSales = (val: number) => {
    if (val >= 1000) return `${(val/1000).toFixed(1)}k`;
    return val.toString();
  }

  const formatMoney = (value: number) =>
    new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(value);

  const getSalesForDay = (dayNum: number) => {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), dayNum).getTime();
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), dayNum + 1).getTime();
    
    return filteredOrders
      .filter((o: any) => o.timestamp >= startOfDay && o.timestamp < endOfDay)
      .reduce((sum: number, o: any) => sum + o.total, 0);
  };

  const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-black italic uppercase">{uiText?.dataTitle || 'Analytics'}</h2>
        <button
          onClick={onRefreshAnalytics}
          className="px-3 py-1 rounded-full text-[8px] font-black uppercase transition-all bg-gray-100 hover:bg-gray-200"
        >
          🔄 {uiText?.dataRefreshLabel || 'Actualizar'}
        </button>
      </div>
      <div className="flex gap-1 bg-white p-1 rounded-full border border-gray-200">
         {['daily', 'weekly', 'monthly'].map(t => (
           <button
             key={t}
             onClick={() => setTimeView(t as any)}
             className={`px-3 py-1 rounded-full text-[8px] font-black uppercase transition-all ${timeView === t ? 'bg-black text-white' : 'text-gray-400'}`}
           >
             {t}
           </button>
         ))}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-black text-white p-5 rounded-3xl shadow-xl">
           <Banknote className="w-6 h-6 mb-2" style={{ color: primaryColor }} />
           <p className="text-[10px] font-black uppercase text-gray-400">Total {timeView}</p>
           <h4 className="text-3xl font-black italic">{formatMoney(totalSales)}</h4>
        </div>
        <div className="bg-white p-5 rounded-3xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
           <Timer className="w-6 h-6 text-blue-600 mb-2" />
           <p className="text-[10px] font-black uppercase text-gray-400">Avg Cocinado</p>
           <h4 className="text-3xl font-black italic">{calculateAvgTime('preparando', 'listo')}m</h4>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-5 rounded-3xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
           <Bike className="w-6 h-6 mb-2" style={{ color: secondaryColor }} />
           <p className="text-[10px] font-black uppercase text-gray-400">Envío Total</p>
           <h4 className="text-3xl font-black italic">{formatMoney(totalDeliveryRevenue)}</h4>
        </div>
        <div className="bg-white p-5 rounded-3xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
           <TrendingUp className="w-6 h-6 text-green-600 mb-2" />
           <p className="text-[10px] font-black uppercase text-gray-400">Ventas Totales</p>
           <h4 className="text-3xl font-black italic">{formatMoney(totalSales + totalDeliveryRevenue)}</h4>
        </div>
      </div>

      <div className="space-y-3">
        {/* MONTHLY CALENDAR VIEW - NOW POWERED BY REAL DATA */}
        <div className="bg-white border-2 border-black rounded-3xl overflow-hidden shadow-sm">
          <button onClick={() => setExpandedSection(expandedSection === 'calendar' ? null : 'calendar')} className="w-full p-5 flex items-center justify-between bg-gray-50">
            <div className="flex items-center gap-3"><Calendar className="w-5 h-5 text-purple-600" /><span className="font-black uppercase italic">Calendario Mensual</span></div>
            <ChevronDown className={`w-5 h-5 transition-transform ${expandedSection === 'calendar' ? 'rotate-180' : ''}`} />
          </button>
          {expandedSection === 'calendar' && (
            <div className="p-4 animate-in slide-in-from-top-2">
              <div className="grid grid-cols-7 gap-1 text-[8px] font-black uppercase text-center text-gray-400 mb-2">
                <span>Dom</span><span>Lun</span><span>Mar</span><span>Mie</span><span>Jue</span><span>Vie</span><span>Sab</span>
              </div>
              <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const daySales = getSalesForDay(i + 1);
                  return (
                    <div key={i} className="aspect-square bg-gray-50 rounded-lg flex flex-col items-center justify-center border border-gray-100 p-1 relative group hover:border-black transition-all">
                      <span className="text-[8px] absolute top-1 left-1 font-bold text-gray-400">{i + 1}</span>
                      <Target className={`w-2 h-2 mb-1 ${daySales > 0 ? 'text-gray-800' : 'text-gray-200'}`} style={daySales > 0 ? { color: primaryColor } : undefined} />
                      <span className="text-[8px] font-black italic">${formatSales(daySales)}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* BEST SELLERS */}
        <div className="bg-white border-2 border-black rounded-3xl overflow-hidden shadow-sm">
          <button onClick={() => setExpandedSection(expandedSection === 'items' ? null : 'items')} className="w-full p-5 flex items-center justify-between bg-gray-50">
            <div className="flex items-center gap-3"><TrendingUp className="w-5 h-5 text-green-600" /><span className="font-black uppercase italic">Top Ventas</span></div>
            <ChevronDown className={`w-5 h-5 transition-transform ${expandedSection === 'items' ? 'rotate-180' : ''}`} />
          </button>
          {expandedSection === 'items' && (
            <div className="p-4 space-y-3 border-t border-gray-100 animate-in slide-in-from-top-2">
              {bestSellers.length === 0 ? <p className="text-[10px] text-gray-400 font-bold uppercase text-center py-4">Sin datos de ventas aún</p> :
               bestSellers.map((item: any, i) => (
                <div key={i} className="flex items-center gap-4 bg-gray-50 p-2 rounded-2xl">
                   <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0"><img src={item.image} className="w-full h-full object-cover" alt="" /></div>
                   <div className="flex-1 min-w-0">
                      <h5 className="font-bold text-sm truncate uppercase italic">{item.name}</h5>
                      <p className="text-[10px] font-black text-gray-400 uppercase">{item.count} vendidos</p>
                   </div>
                   <div className="text-right">
                      <p className="font-black text-sm">{formatMoney(item.revenue)}</p>
                      <p className="text-[8px] font-black text-green-600 uppercase">#{i+1}</p>
                   </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* DETAILED TIME LOGS */}
        <div className="bg-white border-2 border-black rounded-3xl overflow-hidden shadow-sm">
          <button onClick={() => setExpandedSection(expandedSection === 'times' ? null : 'times')} className="w-full p-5 flex items-center justify-between bg-gray-50">
            <div className="flex items-center gap-3"><Clock className="w-5 h-5 text-blue-600" /><span className="font-black uppercase italic">Tiempos del Proceso</span></div>
            <ChevronDown className={`w-5 h-5 transition-transform ${expandedSection === 'times' ? 'rotate-180' : ''}`} />
          </button>
          {expandedSection === 'times' && (
            <div className="p-4 space-y-4 animate-in slide-in-from-top-2 font-mono">
               <div className="flex justify-between items-center text-xs"><span>Order Hit → Accepted:</span><span className="font-black text-blue-600">{calculateAvgTime('ordered', 'preparando')} min</span></div>
               <div className="flex justify-between items-center text-xs"><span>Prep → Ready:</span><span className="font-black text-orange-600">{calculateAvgTime('preparando', 'listo')} min</span></div>
               <div className="flex justify-between items-center text-xs"><span>Ready → Delivered:</span><span className="font-black text-green-600">{calculateAvgTime('listo', 'entregado')} min</span></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
