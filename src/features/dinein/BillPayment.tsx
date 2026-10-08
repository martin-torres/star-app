import React from 'react';
import { CreditCard, Users, Receipt, Check, ArrowLeft, Banknote, Smartphone } from 'lucide-react';
import type { PaymentMethod } from '../../core/types';

interface BillItem {
  name: string;
  price: number;
  quantity: number;
  id?: string;
}

interface Payment {
  userId: string;
  userName: string;
  amount: number;
  paidAt: number;
  items?: string[];
  paymentMethod?: PaymentMethod;
}

interface BillData {
  items: BillItem[];
  subtotal: number;
  tax: number;
  tip: number;
  total: number;
  payments: Payment[];
}

interface BillPaymentProps {
  bill: BillData;
  primaryColor?: string;
  secondaryColor?: string;
  onPaymentComplete: (
    paidAmount: number,
    paidItems: string[],
    paymentMethod: PaymentMethod,
  ) => void;
}

const PAY_OPTIONS: Array<{ id: PaymentMethod; label: string; hint: string; Icon: typeof CreditCard }> = [
  { id: 'efectivo', label: 'Efectivo', hint: 'Paga en caja', Icon: Banknote },
  { id: 'tarjeta', label: 'Tarjeta', hint: 'Crédito o débito', Icon: CreditCard },
  { id: 'telefono', label: 'Teléfono', hint: 'App / billetera', Icon: Smartphone },
];

export const BillPayment: React.FC<BillPaymentProps> = ({
  bill,
  primaryColor = '#f59e0b',
  secondaryColor = '#ea580c',
  onPaymentComplete,
}) => {
  const [splitMode, setSplitMode] = React.useState<'full' | 'even' | 'items' | null>(null);
  const [tipPercentage, setTipPercentage] = React.useState(15);
  const [numberOfPeople, setNumberOfPeople] = React.useState(2);
  const [selectedItems, setSelectedItems] = React.useState<Set<number>>(new Set());
  const [paymentMethod, setPaymentMethod] = React.useState<PaymentMethod>('efectivo');

  const itemInstances: Array<{ itemIndex: number; instanceIndex: number; name: string; price: number }> = [];
  bill.items.forEach((item, idx) => {
    for (let i = 0; i < item.quantity; i++) {
      itemInstances.push({
        itemIndex: idx,
        instanceIndex: i,
        name: item.name,
        price: item.price,
      });
    }
  });

  const subtotal = itemInstances.reduce((sum, inst) => sum + inst.price, 0);
  const serviceCharge = subtotal * 0.08999;
  const fullTipAmount = subtotal * (tipPercentage / 100);
  const totalWithTip = subtotal + serviceCharge + fullTipAmount;
  const alreadyPaid = bill.payments.reduce((sum, p) => sum + p.amount, 0);
  const remaining = totalWithTip - alreadyPaid;

  let yourAmount = remaining;
  if (splitMode === 'even') {
    yourAmount = remaining / numberOfPeople;
  } else if (splitMode === 'items') {
    const selectedSubtotal = Array.from(selectedItems).reduce(
      (sum, idx) => sum + itemInstances[idx].price, 0
    );
    const proportion = subtotal > 0 ? selectedSubtotal / subtotal : 0;
    yourAmount = selectedSubtotal + serviceCharge * proportion + fullTipAmount * proportion;
  }

  const formatMoney = (value: number) =>
    new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(value);

  const toggleItem = (instanceIdx: number) => {
    setSelectedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(instanceIdx)) newSet.delete(instanceIdx);
      else newSet.add(instanceIdx);
      return newSet;
    });
  };

  const handlePay = () => {
    if (!splitMode) return;
    const paidKeys = splitMode === 'items'
      ? Array.from(selectedItems).map(i => String(i))
      : itemInstances.map((_, i) => String(i));
    onPaymentComplete(yourAmount, paidKeys, paymentMethod);
  };

  const canPay =
    splitMode !== null &&
    !(splitMode === 'items' && selectedItems.size === 0);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 pb-36">
      <div className="max-w-lg mx-auto space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Tu Cuenta</h2>
          <p className="text-gray-600">Revisa y paga tu consumo</p>
        </div>

        {splitMode === null ? (
          <>
            <div className="bg-white rounded-3xl shadow-sm border p-6">
              <div className="space-y-3">
                {bill.items.map((item, index) => (
                  <div key={index} className="flex justify-between">
                    <span className="text-gray-700 font-medium">
                      {item.quantity}x {item.name}
                    </span>
                    <span className="text-gray-900 font-bold">
                      {formatMoney(item.price * item.quantity)}
                    </span>
                  </div>
                ))}

                <div className="border-t pt-3 space-y-2">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span>{formatMoney(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Servicio (9%)</span>
                    <span>{formatMoney(serviceCharge)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Propina ({tipPercentage}%)</span>
                    <span>{formatMoney(fullTipAmount)}</span>
                  </div>
                  <div className="flex justify-between text-gray-900 pt-2 border-t font-bold text-lg">
                    <span>Total</span>
                    <span style={{ color: secondaryColor }}>{formatMoney(totalWithTip)}</span>
                  </div>
                </div>

                {alreadyPaid > 0 && (
                  <div className="bg-green-50 border border-green-200 rounded-xl p-3 space-y-1">
                    <div className="flex justify-between text-green-700">
                      <span>Pagado</span>
                      <span>{formatMoney(alreadyPaid)}</span>
                    </div>
                    <div className="flex justify-between text-green-900 font-bold">
                      <span>Restante</span>
                      <span>{formatMoney(remaining)}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-3xl shadow-sm border p-6">
              <label className="font-bold text-gray-900 mb-3 block">
                Propina: {tipPercentage}%
              </label>
              <div className="flex gap-2">
                {[10, 15, 18, 20, 25, 30].map(pct => (
                  <button
                    key={pct}
                    type="button"
                    onClick={() => setTipPercentage(pct)}
                    className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all ${
                      tipPercentage === pct
                        ? 'text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                    style={tipPercentage === pct ? { backgroundColor: primaryColor } : {}}
                  >
                    {pct}%
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-3xl shadow-sm border p-6">
              <h3 className="font-bold text-gray-900 mb-4">Dividir Cuenta</h3>
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => setSplitMode('full')}
                  className="w-full p-4 rounded-2xl border-2 text-left flex items-center gap-3 transition-all hover:border-blue-400"
                  style={{ borderColor: 'transparent' }}
                >
                  <CreditCard className="w-5 h-5" style={{ color: primaryColor }} />
                  <div>
                    <p className="font-bold text-gray-900">Pagar Monto Completo</p>
                    <p className="text-sm text-gray-600">{formatMoney(remaining)}</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setSplitMode('even')}
                  className="w-full p-4 rounded-2xl border-2 text-left flex items-center gap-3 transition-all hover:border-blue-400"
                  style={{ borderColor: 'transparent' }}
                >
                  <Users className="w-5 h-5" style={{ color: primaryColor }} />
                  <div>
                    <p className="font-bold text-gray-900">Dividir Equitativamente</p>
                    <p className="text-sm text-gray-600">Entre {numberOfPeople} personas</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setSplitMode('items')}
                  className="w-full p-4 rounded-2xl border-2 text-left flex items-center gap-3 transition-all hover:border-blue-400"
                  style={{ borderColor: 'transparent' }}
                >
                  <Receipt className="w-5 h-5" style={{ color: primaryColor }} />
                  <div>
                    <p className="font-bold text-gray-900">Dividir por Artículos</p>
                    <p className="text-sm text-gray-600">Selecciona lo que consumiste</p>
                  </div>
                </button>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setSplitMode(null)}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h3 className="font-bold text-gray-900">
                {splitMode === 'full' ? 'Pagar Completo' :
                 splitMode === 'even' ? 'Dividir Equitativamente' :
                 'Dividir por Artículos'}
              </h3>
            </div>

            {splitMode === 'even' && (
              <div className="bg-white rounded-3xl shadow-sm border p-6">
                <label className="font-bold text-gray-900 mb-3 block">
                  Número de personas: {numberOfPeople}
                </label>
                <div className="flex gap-2">
                  {[2, 3, 4, 5, 6, 7, 8].map(n => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setNumberOfPeople(n)}
                      className={`w-12 h-12 rounded-xl font-bold transition-all ${
                        numberOfPeople === n
                          ? 'text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                      style={numberOfPeople === n ? { backgroundColor: primaryColor } : {}}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {splitMode === 'items' && (
              <div className="bg-white rounded-3xl shadow-sm border p-6">
                <h3 className="font-bold text-gray-900 mb-4">Selecciona tus artículos</h3>
                <div className="space-y-2">
                  {itemInstances.map((inst, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => toggleItem(idx)}
                      className={`w-full p-3 rounded-xl border-2 transition-all text-left flex items-center justify-between ${
                        selectedItems.has(idx)
                          ? 'shadow-sm'
                          : 'border-gray-200 hover:border-blue-400'
                      }`}
                      style={selectedItems.has(idx) ? { borderColor: primaryColor, backgroundColor: primaryColor + '08' } : {}}
                    >
                      <div className="flex items-center gap-2">
                        {selectedItems.has(idx) && (
                          <Check className="w-4 h-4" style={{ color: primaryColor }} />
                        )}
                        <span className="text-gray-900 font-medium">{inst.name}</span>
                      </div>
                      <span className="text-gray-700 font-bold">{formatMoney(inst.price)}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-white rounded-3xl shadow-sm border p-6">
              <h3 className="font-bold text-gray-900 mb-3">Método de pago</h3>
              <div className="grid grid-cols-3 gap-2">
                {PAY_OPTIONS.map(({ id, label, hint, Icon }) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setPaymentMethod(id)}
                    className={`flex flex-col items-center p-3 rounded-xl border-2 transition-all ${
                      paymentMethod === id ? 'shadow-sm' : 'border-gray-100 bg-gray-50'
                    }`}
                    style={
                      paymentMethod === id
                        ? { borderColor: primaryColor, backgroundColor: primaryColor + '12' }
                        : undefined
                    }
                  >
                    <Icon className="w-5 h-5 mb-1" style={{ color: primaryColor }} />
                    <span className="text-[10px] font-bold uppercase">{label}</span>
                    <span className="text-[9px] text-gray-500 text-center leading-tight mt-0.5">{hint}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-3xl shadow-sm border p-6">
              <div className="space-y-2">
                <div className="flex justify-between text-gray-600">
                  <span>Tu subtotal</span>
                  <span>{formatMoney(
                    splitMode === 'items'
                      ? Array.from(selectedItems).reduce((s, i) => s + itemInstances[i].price, 0)
                      : splitMode === 'even' ? subtotal / numberOfPeople : subtotal
                  )}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Servicio</span>
                  <span>{formatMoney(splitMode === 'even' ? serviceCharge / numberOfPeople : serviceCharge)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Propina</span>
                  <span>{formatMoney(splitMode === 'even' ? fullTipAmount / numberOfPeople : fullTipAmount)}</span>
                </div>
              </div>
            </div>

            <div
              className="rounded-3xl p-6 text-white shadow-xl"
              style={{ backgroundColor: primaryColor }}
            >
              <p className="opacity-90 text-sm">Tu total a pagar</p>
              <p className="text-3xl font-black">{formatMoney(yourAmount)}</p>
            </div>
          </>
        )}

        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t shadow-2xl">
          <div className="max-w-lg mx-auto">
            <button
              type="button"
              onClick={handlePay}
              disabled={!canPay}
              className="w-full text-white py-4 rounded-2xl font-bold text-lg transition-all hover:brightness-90 shadow-lg disabled:opacity-30 disabled:cursor-not-allowed"
              style={{ backgroundColor: primaryColor }}
            >
              <CreditCard className="w-5 h-5 inline mr-2" />
              {splitMode ? `Pagar ${formatMoney(yourAmount)}` : 'Elige cómo dividir'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
