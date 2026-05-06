import React from 'react';
import { CheckCircle2 } from 'lucide-react';

interface PaymentCompleteScreenProps {
  tableNumber?: number;
  primaryColor?: string;
  onDone: () => void;
}

export const PaymentCompleteScreen: React.FC<PaymentCompleteScreenProps> = ({
  tableNumber,
  primaryColor = '#f59e0b',
  onDone,
}) => {
  React.useEffect(() => {
    const timer = setTimeout(() => {
      onDone();
    }, 5000);
    return () => clearTimeout(timer);
  }, [onDone]);

  return (
    <div className="animate-in fade-in zoom-in-95 duration-500 flex items-center justify-center min-h-[60vh]">
      <div className="text-center space-y-6 max-w-sm">
        <div
          className="w-24 h-24 rounded-full flex items-center justify-center mx-auto"
          style={{ backgroundColor: primaryColor + '15' }}
        >
          <CheckCircle2 className="w-16 h-16" style={{ color: primaryColor }} />
        </div>
        <h2 className="text-3xl font-black text-gray-900 italic">¡Pago Completado!</h2>
        <p className="text-gray-600">
          {tableNumber
            ? `Gracias por visitarnos, Mesa #${tableNumber}. ¡Vuelve pronto!`
            : 'Gracias por tu visita. ¡Vuelve pronto!'}
        </p>
        <div className="w-16 h-1 rounded-full mx-auto" style={{ backgroundColor: primaryColor }} />
        <p className="text-sm text-gray-400">Redirigiendo al inicio...</p>
      </div>
    </div>
  );
};
