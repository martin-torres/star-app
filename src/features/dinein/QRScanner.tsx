import React from 'react';
import { QrCode, Camera } from 'lucide-react';

interface QRScannerProps {
  restaurantName?: string;
  primaryColor?: string;
  onScan: (restaurantId: string) => void;
  error?: string | null;
}

export const QRScanner: React.FC<QRScannerProps> = ({
  primaryColor = '#f59e0b',
  onScan,
  error,
}) => {
  const [inputValue, setInputValue] = React.useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      onScan(inputValue.trim());
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-6">
        <div className="w-full max-w-md">
          <div className="flex flex-col items-center space-y-6">
            <div
              className="w-32 h-32 rounded-3xl flex items-center justify-center animate-pulse"
              style={{ backgroundColor: primaryColor + '20' }}
            >
              <QrCode className="w-20 h-20" style={{ color: primaryColor }} />
            </div>

            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold text-gray-900">
                Escanea el código QR
              </h2>
              <p className="text-gray-600">
                Apunta tu cámara al código QR de la mesa para comenzar
              </p>
            </div>

            <div className="w-full h-px bg-gray-200" />

            <form onSubmit={handleSubmit} className="w-full space-y-3">
              <p className="text-center text-sm text-gray-500">
                O ingresa el ID del restaurante:
              </p>
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="ID del restaurante"
                className="w-full px-4 py-3 border-2 rounded-xl text-center text-lg tracking-wider"
                style={{ borderColor: primaryColor + '40' }}
              />
              <button
                type="submit"
                className="w-full text-white py-3 rounded-xl font-bold transition-colors"
                style={{ backgroundColor: primaryColor }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.filter = 'brightness(0.9)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.filter = 'none';
                }}
              >
                <Camera className="w-5 h-5 inline mr-2" />
                Escanear / Entrar
              </button>
            </form>

            {error && (
              <div className="w-full p-4 bg-red-50 border-2 border-red-200 rounded-xl">
                <p className="text-red-700 text-sm text-center">{error}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
