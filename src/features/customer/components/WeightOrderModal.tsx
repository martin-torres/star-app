import React from 'react';
import { X, Weight, DollarSign } from 'lucide-react';
import type { MenuItem } from '../../../core/types';

interface WeightOrderModalProps {
  isOpen: boolean;
  item: MenuItem;
  onClose: () => void;
  onConfirm: (weightInGrams: number, price: number) => void;
  primaryColor?: string;
  secondaryColor?: string;
}

export const WeightOrderModal = ({
  isOpen,
  item,
  onClose,
  onConfirm,
}: WeightOrderModalProps) => {
  const [inputMode, setInputMode] = React.useState<'grams' | 'price'>('grams');
  const [inputValue, setInputValue] = React.useState('');
  const [calculatedWeight, setCalculatedWeight] = React.useState<number | null>(null);
  const [calculatedPrice, setCalculatedPrice] = React.useState<number | null>(null);
  const [error, setError] = React.useState<string>('');

  const weightPricePerKg = item.weightPricePerKg || 580;
  const pricePerKg = weightPricePerKg;
  const pricePerGram = pricePerKg / 1000;

  // Calculate price from weight
  const calculatePriceFromWeight = (grams: number): number => {
    return Math.round(grams * pricePerGram * 100) / 100;
  };

  // Calculate weight from price
  const calculateWeightFromPrice = (price: number): number => {
    return Math.round((price / pricePerKg) * 1000);
  };

  const handleInputChange = (value: string) => {
    setInputValue(value);
    setError('');
    
    if (!value || value.trim() === '') {
      setCalculatedWeight(null);
      setCalculatedPrice(null);
      return;
    }

    const numValue = parseFloat(value);
    if (isNaN(numValue)) {
      setError('Please enter a valid number');
      return;
    }

    if (numValue < 0) {
      setError('Please enter a positive number');
      return;
    }

    if (inputMode === 'grams') {
      const price = calculatePriceFromWeight(numValue);
      setCalculatedPrice(price);
      setCalculatedWeight(numValue);
    } else {
      const weight = calculateWeightFromPrice(numValue);
      setCalculatedWeight(weight);
      setCalculatedPrice(numValue);
    }
  };

  const handleConfirm = () => {
    if (inputValue && inputValue.trim() !== '' && !error) {
      const numValue = parseFloat(inputValue);
      if (inputMode === 'grams') {
        const price = calculatePriceFromWeight(numValue);
        if (price > 0) {
          onConfirm(numValue, price);
        }
      } else {
        const weight = calculateWeightFromPrice(numValue);
        if (weight > 0) {
          onConfirm(weight, numValue);
        }
      }
    }
  };

  // Handle preset button click - triggers calculation without changing mode
  const handlePresetClick = (grams: number) => {
    setInputValue(grams.toString());
    // Trigger calculation by calling handleInputChange
    handleInputChange(grams.toString());
  };

  // Presets change based on input mode
  const quickPresets = inputMode === 'grams'
    ? [
        { label: '1/4 kg', value: 250 },
        { label: '1/2 kg', value: 500 },
        { label: '3/4 kg', value: 750 },
        { label: '1 kg', value: 1000 },
      ]
    : [
        { label: '100 MXN', value: 100 },
        { label: '200 MXN', value: 200 },
        { label: '300 MXN', value: 300 },
        { label: '400 MXN', value: 400 },
      ];

  // Only render modal when isOpen and item exist
  if (!isOpen || !item) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-white z-10 border-b border-gray-100 px-5 py-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-black uppercase italic text-gray-900">
              {item.name}
            </h3>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
          <p className="text-sm text-gray-500 mt-1 italic">
            Precio: {pricePerKg} MXN/kg
          </p>
        </div>

        {/* Content */}
        <div className="p-5 space-y-6">
          {/* Input Mode Toggle */}
          <div className="flex gap-2 bg-gray-100 p-1 rounded-xl">
            <button
              onClick={() => setInputMode('grams')}
              className={`flex-1 py-2.5 rounded-lg text-sm font-bold uppercase transition-all ${
                inputMode === 'grams'
                  ? 'bg-white shadow text-black'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center justify-center gap-1">
                <Weight className="w-4 h-4" />
                Gramos
              </div>
            </button>
            <button
              onClick={() => setInputMode('price')}
              className={`flex-1 py-2.5 rounded-lg text-sm font-bold uppercase transition-all ${
                inputMode === 'price'
                  ? 'bg-white shadow text-black'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center justify-center gap-1">
                <DollarSign className="w-4 h-4" />
                Pesos
              </div>
            </button>
          </div>

          {/* Quick Presets - MOVED TO TOP */}
          <div>
            <label className="text-xs font-black uppercase text-gray-400 mb-3 block">
              Presets rápidos
            </label>
            <div className="grid grid-cols-2 gap-2">
              {quickPresets.map((preset) => (
                <button
                  key={preset.value}
                  onClick={() => handlePresetClick(preset.value)}
                  className="py-3 bg-gray-50 hover:bg-gray-200 border-2 border-gray-100 rounded-xl text-sm font-bold transition-all"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Input Field */}
          <div>
            <label className="text-xs font-black uppercase text-gray-400 mb-2 block">
              {inputMode === 'grams' ? 'Ingresa cantidad en gramos' : 'Ingresa el monto'}
            </label>
            <div className="relative">
              <input
                type="number"
                placeholder={inputMode === 'grams' ? 'Ej. 250' : 'Ej. 100'}
                className="w-full pl-4 pr-12 py-4 bg-gray-50 border-2 border-gray-100 rounded-xl font-black text-2xl focus:border-black focus:outline-none transition-colors"
                value={inputValue}
                onChange={(e) => handleInputChange(e.target.value)}
                autoFocus
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">
                {inputMode === 'grams' ? 'g' : 'MXN'}
              </span>
            </div>
            {error && (
              <p className="text-red-500 text-sm font-bold mt-2">{error}</p>
            )}
          </div>

          {/* Live Calculation - NOW CLICKABLE */}
          {calculatedWeight !== null && calculatedPrice !== null && (
            <div 
              className="bg-black text-white rounded-xl p-4 space-y-3 cursor-pointer hover:bg-gray-900 transition-colors"
              onClick={handleConfirm}
            >
              <div className="flex items-center gap-2">
                <Weight className="w-5 h-5 text-green-400" />
                <span className="text-sm font-bold uppercase text-gray-300">
                  {calculatedWeight}g
                </span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-white/10">
                <span className="text-sm font-bold uppercase text-gray-300">
                  Agregar
                </span>
                <span className="text-2xl font-black">
                  ${calculatedPrice}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};