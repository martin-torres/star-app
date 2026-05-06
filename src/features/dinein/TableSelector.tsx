import React from 'react';
import { Check, Clock, ArrowLeft } from 'lucide-react';

interface Table {
  id: string;
  table_number: number;
  display_name?: string;
  seats: number;
  location?: string;
  is_available: boolean;
  x?: number;
  y?: number;
}

interface TableSelectorProps {
  tables: Table[];
  primaryColor?: string;
  secondaryColor?: string;
  onSelectTable: (tableId: string | null) => void;
}

export const TableSelector: React.FC<TableSelectorProps> = ({
  tables,
  primaryColor = '#f59e0b',
  secondaryColor = '#ea580c',
  onSelectTable,
}) => {
  const [selectedTable, setSelectedTable] = React.useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] = React.useState<string>('all');

  const locations = [
    { id: 'all', label: 'Todas', icon: '🍽️' },
    { id: 'patio', label: 'Patio', icon: '🌿' },
    { id: 'window', label: 'Ventana', icon: '🪟' },
    { id: 'balcony', label: 'Balcón', icon: '🏰' },
    { id: 'middle', label: 'Comedor', icon: '🍽️' },
    { id: 'bar', label: 'Barra', icon: '🍺' },
    { id: 'private', label: 'Privado', icon: '🚪' },
    { id: 'outdoor', label: 'Exterior', icon: '🌳' },
  ];

  const filteredTables = selectedLocation === 'all'
    ? tables
    : tables.filter(t => t.location === selectedLocation);

  const handleTableClick = (table: Table) => {
    if (table.is_available) {
      setSelectedTable(table.id);
    }
  };

  const handleConfirm = () => {
    onSelectTable(selectedTable);
  };

  const handleNextAvailable = () => {
    const nextTable = tables.find(t => t.is_available);
    if (nextTable) {
      onSelectTable(nextTable.id);
    }
  };

  if (tables.length === 0) {
    return (
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex flex-col items-center justify-center min-h-[40vh] p-6">
          <p className="text-gray-500 font-medium">No hay mesas configuradas</p>
          <p className="text-xs text-gray-400 mt-1">
            El administrador debe agregar mesas en la configuración
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 pb-32">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Selecciona tu Mesa</h2>
          <p className="text-gray-600">Elige la mesa donde te gustaría sentarte</p>
        </div>

        {/* Location Filter */}
        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar -mx-6 px-6">
          {locations.map((loc) => {
            const hasTables = loc.id === 'all' || tables.some(t => t.location === loc.id);
            if (!hasTables) return null;
            return (
              <button
                key={loc.id}
                onClick={() => setSelectedLocation(loc.id)}
                className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-bold transition-all whitespace-nowrap ${
                  selectedLocation === loc.id
                    ? 'text-white shadow-sm'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                style={selectedLocation === loc.id ? { backgroundColor: primaryColor } : {}}
              >
                <span className="mr-1">{loc.icon}</span>
                {loc.label}
              </button>
            );
          })}
        </div>

        {/* Visual Table Layout */}
        <div className="bg-white rounded-3xl shadow-sm border p-6">
          <div className="relative w-full h-80 bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl border-2 border-slate-200">
            {/* Restaurant structure outline */}
            <div className="absolute inset-4 border-2 border-dashed border-slate-300 rounded-xl flex items-center justify-center">
              <span className="text-slate-300 text-sm font-medium">Salón</span>
            </div>

            {filteredTables.map((table) => (
              <button
                key={table.id}
                onClick={() => handleTableClick(table)}
                disabled={!table.is_available}
                className={`absolute w-16 h-16 rounded-xl flex flex-col items-center justify-center transition-all transform hover:scale-110 ${
                  table.is_available
                    ? selectedTable === table.id
                      ? 'text-white shadow-lg scale-110'
                      : 'border-2 text-gray-900 hover:border-green-600'
                    : 'bg-red-100 border-2 border-red-400 text-red-600 cursor-not-allowed opacity-60'
                }`}
                style={{
                  left: `${table.x || 10 + Math.random() * 70}%`,
                  top: `${table.y || 10 + Math.random() * 60}%`,
                  backgroundColor: !table.is_available ? undefined :
                    selectedTable === table.id ? primaryColor : 'white',
                  borderColor: !table.is_available ? undefined :
                    selectedTable === table.id ? primaryColor : '#22c55e',
                }}
              >
                {selectedTable === table.id && (
                  <Check className="w-5 h-5 mb-0.5" />
                )}
                <span className="font-bold text-xs">#{table.table_number}</span>
                <span className="text-[9px]">{table.seats} as.</span>
              </button>
            ))}

            {/* Legend */}
            <div className="absolute bottom-3 left-3 right-3 flex flex-wrap gap-3 bg-white/90 backdrop-blur p-2 rounded-lg text-[10px]">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded" style={{ backgroundColor: '#22c55e' }} />
                <span>Disponible</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded bg-red-400" />
                <span>Ocupada</span>
              </div>
            </div>
          </div>
        </div>

        {/* Table List */}
        <div className="space-y-2">
          {filteredTables.map((table) => (
            <button
              key={table.id}
              onClick={() => handleTableClick(table)}
              disabled={!table.is_available}
              className={`w-full p-4 rounded-2xl border-2 transition-all text-left ${
                table.is_available
                  ? selectedTable === table.id
                    ? 'shadow-sm'
                    : 'bg-white hover:border-green-400'
                  : 'bg-red-50 border-red-200 cursor-not-allowed opacity-60'
              }`}
              style={selectedTable === table.id ? { borderColor: primaryColor, backgroundColor: primaryColor + '08' } : { borderColor: 'transparent' }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-gray-900">
                    Mesa #{table.table_number}
                    {table.display_name && <span className="text-gray-500 font-normal"> - {table.display_name}</span>}
                  </p>
                  <p className="text-sm text-gray-600">
                    {table.seats} asientos
                    {table.location && ` • ${table.location}`}
                  </p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold ${
                    table.is_available
                      ? 'bg-green-100 text-green-700'
                      : 'bg-red-100 text-red-700'
                  }`}
                >
                  {table.is_available ? 'Disponible' : 'Ocupada'}
                </span>
              </div>
            </button>
          ))}
        </div>

        {/* Fixed bottom buttons */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t shadow-2xl">
          <div className="max-w-lg mx-auto space-y-2">
            <button
              onClick={handleConfirm}
              disabled={!selectedTable}
              className="w-full text-white py-4 rounded-2xl font-bold text-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              style={{ backgroundColor: primaryColor }}
            >
              Confirmar Mesa
            </button>
            <button
              onClick={handleNextAvailable}
              className="w-full py-3 rounded-xl font-bold transition-all border-2"
              style={{
                borderColor: secondaryColor,
                color: secondaryColor,
              }}
            >
              Siguiente Mesa Disponible
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
