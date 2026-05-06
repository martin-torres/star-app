import { useState, useEffect } from 'react';
import { Plus, Trash2, Save, X } from 'lucide-react';

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

interface TablesPageProps {
  tables: Table[];
  onSave: (table: Omit<Table, 'id'> & { id?: string }) => Promise<boolean>;
  onDelete: (id: string) => Promise<void>;
  primaryColor?: string;
}

const LOCATIONS = [
  { value: 'patio', label: 'Patio' },
  { value: 'window', label: 'Ventana' },
  { value: 'balcony', label: 'Balcón' },
  { value: 'middle', label: 'Comedor' },
  { value: 'bar', label: 'Barra' },
  { value: 'private', label: 'Privado' },
  { value: 'outdoor', label: 'Exterior' },
];

export const TablesPage = ({ tables, onSave, onDelete, primaryColor = '#f59e0b' }: TablesPageProps) => {
  const [editingTable, setEditingTable] = useState<Partial<Table> | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showQrModal, setShowQrModal] = useState<string | null>(null);

  const defaultTable: Partial<Table> = {
    table_number: tables.length + 1,
    seats: 2,
    is_available: true,
    location: 'middle',
    x: 10 + (tables.length % 5) * 15,
    y: 10 + Math.floor(tables.length / 5) * 20,
  };

  const handleNew = () => {
    setEditingTable(defaultTable);
    setShowForm(true);
  };

  const handleEdit = (table: Table) => {
    setEditingTable(table);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('¿Eliminar esta mesa?')) {
      await onDelete(id);
    }
  };

  const handleSave = async () => {
    if (!editingTable?.table_number || !editingTable?.seats) return;
    const success = await onSave(editingTable as any);
    if (success) {
      setShowForm(false);
      setEditingTable(null);
    }
  };

  const generateQrUrl = (tableId: string) => {
    const baseUrl = window.location.origin;
    return `${baseUrl}?restaurant_id=${tableId}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Mesas</h1>
          <p className="text-gray-600">Administra las mesas del restaurante</p>
        </div>
        <button
          onClick={handleNew}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-white font-medium bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="w-5 h-5" />
          Nueva Mesa
        </button>
      </div>

      {/* Table Grid */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <div className="relative w-full h-64 bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg border-2 border-slate-200 mb-4">
          <div className="absolute inset-3 border-2 border-dashed border-slate-300 rounded-lg flex items-center justify-center">
            <span className="text-slate-300 text-sm font-medium">Plano del Restaurante</span>
          </div>
          {tables.map((table) => (
            <button
              key={table.id}
              onClick={() => handleEdit(table)}
              className={`absolute w-14 h-14 rounded-xl flex flex-col items-center justify-center transition-all hover:scale-110 cursor-pointer ${
                table.is_available
                  ? 'bg-white border-2 border-green-500 text-gray-900 hover:border-green-600'
                  : 'bg-red-100 border-2 border-red-400 text-red-600 opacity-70'
              }`}
              style={{
                left: `${table.x || 10}%`,
                top: `${table.y || 10}%`,
              }}
            >
              <span className="font-bold text-xs">#{table.table_number}</span>
              <span className="text-[9px]">{table.seats}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Table List */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="p-4 border-b bg-gray-50">
          <h2 className="font-bold text-gray-900">Lista de Mesas</h2>
        </div>
        <div className="divide-y">
          {tables.map((table) => (
            <div key={table.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${
                  table.is_available ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                  #{table.table_number}
                </div>
                <div>
                  <p className="font-medium text-gray-900">
                    Mesa {table.table_number}
                    {table.display_name && <span className="text-gray-500 font-normal"> - {table.display_name}</span>}
                  </p>
                  <p className="text-sm text-gray-500">
                    {table.seats} asientos
                    {table.location && ` • ${LOCATIONS.find(l => l.value === table.location)?.label || table.location}`}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-1 rounded text-xs font-bold ${
                  table.is_available ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                  {table.is_available ? 'Disponible' : 'Ocupada'}
                </span>
                <button
                  onClick={() => setShowQrModal(table.id)}
                  className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                  title="Ver QR URL"
                >
                  QR
                </button>
                <button
                  onClick={() => handleEdit(table)}
                  className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                >
                  Editar
                </button>
                <button
                  onClick={() => handleDelete(table.id)}
                  className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
          {tables.length === 0 && (
            <div className="p-8 text-center text-gray-500">
              No hay mesas configuradas. Crea la primera mesa para empezar.
            </div>
          )}
        </div>
      </div>

      {/* Table Form Modal */}
      {showForm && editingTable && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">
                {editingTable.id ? 'Editar Mesa' : 'Nueva Mesa'}
              </h2>
              <button onClick={() => { setShowForm(false); setEditingTable(null); }}>
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Número</label>
                  <input
                    type="number"
                    value={editingTable.table_number || ''}
                    onChange={(e) => setEditingTable({ ...editingTable, table_number: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border rounded-lg"
                    min={1}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Asientos</label>
                  <input
                    type="number"
                    value={editingTable.seats || ''}
                    onChange={(e) => setEditingTable({ ...editingTable, seats: parseInt(e.target.value) || 1 })}
                    className="w-full px-3 py-2 border rounded-lg"
                    min={1}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre visible (opcional)</label>
                <input
                  type="text"
                  value={editingTable.display_name || ''}
                  onChange={(e) => setEditingTable({ ...editingTable, display_name: e.target.value })}
                  placeholder="Ej: Mesa familiar"
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ubicación</label>
                <select
                  value={editingTable.location || 'middle'}
                  onChange={(e) => setEditingTable({ ...editingTable, location: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  {LOCATIONS.map((loc) => (
                    <option key={loc.value} value={loc.value}>{loc.label}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Posición X (%)</label>
                  <input
                    type="number"
                    value={editingTable.x || 10}
                    onChange={(e) => setEditingTable({ ...editingTable, x: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border rounded-lg"
                    min={0}
                    max={90}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Posición Y (%)</label>
                  <input
                    type="number"
                    value={editingTable.y || 10}
                    onChange={(e) => setEditingTable({ ...editingTable, y: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border rounded-lg"
                    min={0}
                    max={90}
                  />
                </div>
              </div>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={editingTable.is_available !== false}
                  onChange={(e) => setEditingTable({ ...editingTable, is_available: e.target.checked })}
                  className="w-4 h-4"
                />
                <span className="text-sm font-medium text-gray-700">Disponible</span>
              </label>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleSave}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-white font-bold"
                  style={{ backgroundColor: primaryColor }}
                >
                  <Save className="w-5 h-5" />
                  Guardar
                </button>
                <button
                  onClick={() => { setShowForm(false); setEditingTable(null); }}
                  className="flex-1 py-3 rounded-xl font-bold bg-gray-100 text-gray-700 hover:bg-gray-200"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* QR URL Modal */}
      {showQrModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">QR URL de Mesa</h2>
              <button onClick={() => setShowQrModal(null)}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-gray-600 mb-2">
              Esta URL puede usarse para generar códigos QR para la mesa:
            </p>
            <div className="bg-gray-50 p-3 rounded-lg text-sm font-mono break-all">
              {generateQrUrl(showQrModal)}
            </div>
            <button
              onClick={() => {
                navigator.clipboard?.writeText(generateQrUrl(showQrModal));
                alert('URL copiada al portapapeles');
              }}
              className="mt-4 w-full py-3 rounded-xl text-white font-bold"
              style={{ backgroundColor: primaryColor }}
            >
              Copiar URL
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
