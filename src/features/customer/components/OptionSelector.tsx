import type { ItemOption } from '../../../core/types';

interface OptionSelectorProps {
  options: ItemOption[];
  onSelect: (option: ItemOption) => void;
  onClose: () => void;
  primaryColor?: string;
}

export const OptionSelector = ({
  options,
  onSelect,
  onClose,
  primaryColor = '#7c3aed',
}: OptionSelectorProps) => {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-lg bg-white rounded-t-3xl animate-in slide-in-from-bottom duration-300 max-h-[85vh] flex flex-col">
        <div className="p-6 border-b border-gray-100">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-xl font-black uppercase italic text-gray-900">
              Selecciona tu opción
            </h3>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200"
            >
              ✕
            </button>
          </div>
          <p className="text-sm text-gray-500 font-medium">
            Toca una opción para agregar al carrito
          </p>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {options.map((option) => (
            <button
              key={option.id}
              onClick={() => onSelect(option)}
              className="w-full p-4 rounded-2xl border-2 border-gray-200 hover:border-gray-900 transition-all text-left group active:scale-[0.98]"
              style={{
                borderColor: 'transparent',
                backgroundColor: '#f9fafb',
              }}
            >
              <div className="flex justify-between items-center">
                <div className="flex-1">
                  <p className="font-black text-lg text-gray-900 uppercase italic">
                    {option.label}
                  </p>
                  {(option.dosage || option.weight || option.unit) && (
                    <p className="text-sm font-bold text-gray-500 mt-1">
                      {option.dosage && `${option.dosage}`}
                      {option.weight && ` • ${option.weight}`}
                      {option.unit && ` • ${option.unit}`}
                    </p>
                  )}
                </div>
                <div
                  className="px-4 py-2 rounded-xl font-black text-lg"
                  style={{ backgroundColor: primaryColor, color: 'white' }}
                >
                  ${option.price}
                </div>
              </div>
            </button>
          ))}
        </div>

        <div className="p-4 border-t border-gray-100">
          <button
            onClick={onClose}
            className="w-full py-4 rounded-2xl font-black uppercase text-sm bg-gray-100 text-gray-600 hover:bg-gray-200"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};

export default OptionSelector;