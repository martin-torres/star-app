import React from 'react';
import { UtensilsCrossed, Plus, Clock } from 'lucide-react';

interface OrderItem {
  id?: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  category?: string;
}

interface DiningScreenProps {
  tableNumber: number;
  currentOrders: OrderItem[];
  primaryColor?: string;
  secondaryColor?: string;
  onContinueOrdering: () => void;
  onRequestBill: () => void;
}

export const DiningScreen: React.FC<DiningScreenProps> = ({
  tableNumber,
  currentOrders,
  primaryColor = '#f59e0b',
  secondaryColor = '#ea580c',
  onContinueOrdering,
  onRequestBill,
}) => {
  const total = currentOrders.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const formatMoney = (value: number) =>
    new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(value);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 pb-36">
      <div className="max-w-lg mx-auto space-y-6">
        <div className="text-center space-y-3">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center mx-auto shadow-lg"
            style={{ backgroundColor: primaryColor + '15' }}
          >
            <UtensilsCrossed className="w-10 h-10" style={{ color: primaryColor }} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-gray-900 italic">
              Mesa #{tableNumber}
            </h2>
            <p className="text-gray-600 font-medium">¡Disfruta tu comida!</p>
          </div>
        </div>

        {currentOrders.length === 0 ? (
          <div className="bg-white rounded-3xl shadow-sm border p-8 text-center">
            <p className="text-gray-500 font-medium">Aún no has ordenado nada</p>
            <button
              onClick={onContinueOrdering}
              className="mt-4 px-6 py-3 rounded-xl text-white font-bold transition-all"
              style={{ backgroundColor: primaryColor }}
            >
              <Plus className="w-5 h-5 inline mr-1" />
              Ordenar Ahora
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-3xl shadow-sm border overflow-hidden">
            <div className="p-4 border-b bg-gray-50">
              <h3 className="font-bold text-gray-900 flex items-center gap-2">
                <Clock className="w-4 h-4" style={{ color: primaryColor }} />
                Tu Orden
              </h3>
            </div>
            <div className="p-4 space-y-3">
              {currentOrders.map((item, index) => (
                <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    {item.image && (
                      <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0">
                        <img src={item.image} className="w-full h-full object-cover" alt={item.name} />
                      </div>
                    )}
                    <div>
                      <p className="font-bold text-gray-900 text-sm">
                        {item.quantity}x {item.name}
                      </p>
                      {item.category && (
                        <p className="text-xs text-gray-500">{item.category}</p>
                      )}
                    </div>
                  </div>
                  <p className="font-bold text-gray-900">
                    {formatMoney(item.price * item.quantity)}
                  </p>
                </div>
              ))}

              <div className="border-t pt-3 flex justify-between items-center">
                <span className="font-bold text-gray-700">Total</span>
                <span className="font-black text-xl" style={{ color: secondaryColor }}>
                  {formatMoney(total)}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Fixed bottom buttons */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t shadow-2xl">
          <div className="max-w-lg mx-auto space-y-2">
            <button
              onClick={onContinueOrdering}
              className="w-full py-3 rounded-2xl font-bold transition-all border-2"
              style={{
                borderColor: primaryColor,
                color: primaryColor,
                backgroundColor: primaryColor + '08',
              }}
            >
              <Plus className="w-5 h-5 inline mr-2" />
              Seguir Ordenando
            </button>
            {currentOrders.length > 0 && (
              <button
                onClick={onRequestBill}
                className="w-full text-white py-4 rounded-2xl font-bold text-lg transition-all hover:brightness-90 shadow-lg"
                style={{ backgroundColor: primaryColor }}
              >
                Solicitar Cuenta
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
