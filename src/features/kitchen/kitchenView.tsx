import { useState } from 'react';
import { ChefHat, Eye } from 'lucide-react';

export const KitchenView = ({
  orders,
  updateOrderStatus,
  kitchenLoading,
  currency = 'MXN',
  uiText,
  pickupLocationText = 'Recoger en Sucursal',
  primaryColor = '#f59e0b',
}: any) => {
  const [previewScreenshot, setPreviewScreenshot] = useState<{ url: string; orderId: string } | null>(null);
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);
  const formatMoney = (value: number) =>
    new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(value);
  
  if (kitchenLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <ChefHat className="w-16 h-16 text-gray-300 mx-auto mb-4 animate-bounce" />
          <p className="text-gray-400 font-black uppercase text-xs tracking-widest">
            Cargando órdenes...
          </p>
        </div>
      </div>
    );
  }
  
  const safeOrders = Array.isArray(orders) ? orders : [];
  const activeOrders = safeOrders.filter((o: any) => o.status !== 'entregado');
  
  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-4 shrink-0">
        <div><h2 className="text-3xl font-black text-gray-900 italic uppercase leading-none">{uiText?.kitchenTitle || 'Panel Cocina'}</h2><p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">{uiText?.kitchenInProgressLabel || 'Órdenes en proceso'}: {activeOrders.length}</p></div>
      </div>
      <div className="flex-1 -mx-6 px-6 overflow-x-auto pb-4 flex gap-6 snap-x no-scrollbar">
        {activeOrders.length === 0 ? (
          <div className="w-full text-center py-20 bg-white/50 rounded-3xl border-4 border-dashed border-gray-200 self-center">
            <ChefHat className="w-16 h-16 text-gray-200 mx-auto mb-4" />
            <p className="text-gray-400 font-black uppercase text-xs tracking-widest">{uiText?.kitchenEmptyLabel || 'Sin órdenes activas'}</p>
          </div>
        ) : (
          activeOrders.map((order: any) => {
            const transferImageUrl = order.transferScreenshot || null;
            
            return (
            <div key={order.id} className="snap-start flex-shrink-0 w-80 bg-white border-2 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex flex-col max-h-[calc(100vh-180px)] animate-in slide-in-from-right-8 duration-500">
              <div className="p-4 border-b-2 border-dashed border-black bg-gray-50 flex justify-between items-start">
                <div>
                  <span className="text-[10px] font-black uppercase bg-black text-white px-2 py-0.5 rounded">{order.status}</span>
                  <h3 className="text-base font-black mt-2 italic uppercase truncate leading-none">{order.customerName}</h3>
                  <p className="text-[10px] font-bold text-gray-400 uppercase mt-1">#{order.id}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black text-gray-400 uppercase">{new Date(order.timestamp).toLocaleTimeString()}</p>
                  {order.paymentMethod === 'efectivo' && (
                    <div className="text-left mt-1">
                      <p className="text-[9px] font-bold text-gray-500 uppercase">Efectivo</p>
                      <p className="text-[9px] font-black text-gray-700">{formatMoney(order.payWithAmount ?? 0)}</p>
                      <p className="text-[9px] font-bold text-green-700">Cambio: {formatMoney((order.payWithAmount ?? 0) - (order.total + (order.deliveryFee ?? 0)))}</p>
                    </div>
                  )}
                  {order.paymentMethod === 'transferencia' && transferImageUrl && (
                    <div
                      className="relative w-24 h-20 bg-gray-100 rounded-lg overflow-hidden cursor-pointer border-2 border-dashed border-gray-300 transition-all mt-2"
                      onMouseEnter={(e) => (e.currentTarget.style.borderColor = primaryColor)}
                      onMouseLeave={(e) => (e.currentTarget.style.borderColor = '')}
                      onClick={() => setPreviewScreenshot({ url: transferImageUrl, orderId: order.id })}
                    >
                      <img
                        src={transferImageUrl}
                        className="w-full h-full object-cover"
                        alt="Comprobante"
                      />
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <Eye className="w-6 h-6 text-white" />
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex-1 p-4 font-mono overflow-y-auto">
                <ul className="space-y-4">
                  {order.items.map((item: any, idx: number) => (
                    <li key={idx} className="flex justify-between items-start border-b border-gray-100 pb-2">
                      <div className="flex-1">
                        <span className="font-black text-xl leading-tight text-gray-900">
                          {item.quantity}x {item.name}
                          {item.weightInGrams && <span className="text-sm font-bold text-gray-600 ml-1">({item.weightInGrams}g)</span>}
                        </span>
                        {item.isBundle && item.bundleItems && (
                          <div className="mt-1 ml-4 space-y-0.5">
                            {item.bundleItems.map((bundleItem: any, bidx: number) => (
                              <p key={bidx} className="text-sm text-gray-600">
                                {bundleItem.quantity}x {bundleItem.name}
                              </p>
                            ))}
                          </div>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
                {/* Customer Address Display */}
                {order.customerAddress && (
                  <div 
                    className={`mt-2 p-3 rounded-lg cursor-pointer transition-colors border ${
                      copiedAddress === order.id 
                        ? 'bg-green-100 border-green-300' 
                        : 'bg-gray-100 border-gray-200 hover:bg-gray-200'
                    }`}
                    onClick={(event) => {
                      event.stopPropagation();
                      navigator.clipboard.writeText(order.customerAddress)
                        .then(() => {
                          setCopiedAddress(order.id);
                          setTimeout(() => setCopiedAddress(null), 1500);
                        })
                        .catch((err) => {
                          console.error('Failed to copy address:', err);
                          // Fallback: create temporary textarea
                          const textarea = document.createElement('textarea');
                          textarea.value = order.customerAddress;
                          document.body.appendChild(textarea);
                          textarea.select();
                          try {
                            document.execCommand('copy');
                            setCopiedAddress(order.id);
                            setTimeout(() => setCopiedAddress(null), 1500);
                          } catch (fallbackErr) {
                            console.error('Fallback copy failed:', fallbackErr);
                          }
                          document.body.removeChild(textarea);
                        });
                    }}
                    title="Click to copy address"
                  >
                    <p className="text-[9px] font-black uppercase text-gray-500 mb-1">📍 Dirección</p>
                    <p className="text-sm font-bold text-gray-800 leading-tight">{order.customerAddress}</p>
                    {copiedAddress === order.id && (
                      <p className="text-[8px] font-bold text-green-700 mt-1 animate-in fade-in duration-200">
                        ✓ Copiado al portapapeles
                      </p>
                    )}
                  </div>
                )}
              </div>
              <div className="p-4 bg-gray-50 border-t-2 border-black">
                {order.status === 'recibido' && <button onClick={() => updateOrderStatus(order.id, 'preparando')} className="w-full bg-black text-white py-4 rounded-xl font-black uppercase text-xs italic">{uiText?.kitchenAcceptLabel || 'Aceptar Comanda'}</button>}
                {order.status === 'preparando' && <button onClick={() => updateOrderStatus(order.id, 'listo')} className="w-full text-black py-4 rounded-xl font-black uppercase text-xs italic" style={{ backgroundColor: primaryColor }}>{uiText?.kitchenCookedLabel || 'Marcar Cocinado'}</button>}
                {order.status === 'listo' && <button onClick={() => updateOrderStatus(order.id, order.customerAddress === pickupLocationText ? 'entregado' : 'en_camino')} className={`w-full ${order.customerAddress === pickupLocationText ? 'bg-green-600' : 'bg-blue-500'} text-white py-4 rounded-xl font-black uppercase text-xs italic`}>{order.customerAddress === pickupLocationText ? (uiText?.kitchenDeliverCustomerLabel || 'Entregar Cliente') : (uiText?.kitchenSendRiderLabel || 'Enviar Moto')}</button>}
                {order.status === 'en_camino' && <button onClick={() => updateOrderStatus(order.id, 'entregado')} className="w-full bg-green-500 text-white py-4 rounded-xl font-black uppercase text-xs italic">{uiText?.kitchenConfirmDeliveryLabel || 'Confirmar Entrega'}</button>}
              </div>
            </div>
            );
          })
        )}
      </div>
      
      {/* Payment verification modal */}
      {previewScreenshot && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => {
            setPreviewScreenshot(null);
          }}
        >
          <div
            className="relative max-w-2xl w-full bg-white rounded-2xl overflow-hidden shadow-2xl"
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            <img
              src={previewScreenshot.url}
              className="w-full max-h-[80vh] object-contain"
              alt="Transfer proof"
            />
            <button
              onClick={() => {
                updateOrderStatus(previewScreenshot.orderId, 'preparando');
                setPreviewScreenshot(null);
              }}
              className="absolute bottom-4 left-1/2 -translate-x-1/2 w-full max-w-xs bg-black text-white py-4 rounded-xl font-black uppercase text-xs italic"
            >
              {uiText?.kitchenAcceptLabel || 'Aceptar Comanda'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
