import React from "react";
import { Check } from "lucide-react";
import { FloorPlanLegend, FloorPlanView, type FloorPlan } from "../floorplan";

/**
 * Customer table picker.
 *
 * This is deliberately a thin wrapper: the map itself is the SAME
 * `FloorPlanView` the manager edits and the live boards render, fed by the same
 * `FloorPlan`. It must never build its own layout (the old version placed tables
 * with `Math.random()` percentages, which is why the customer saw a different
 * restaurant than the manager drew).
 */

interface TableSelectorProps {
  plan: FloorPlan;
  primaryColor?: string;
  secondaryColor?: string;
  onSelectTable: (tableId: string | null) => void;
}

const LOCATION_META: Record<string, { label: string; icon: string }> = {
  patio: { label: "Patio", icon: "🌿" },
  window: { label: "Ventana", icon: "🪟" },
  balcony: { label: "Balcón", icon: "🏰" },
  middle: { label: "Comedor", icon: "🍽️" },
  bar: { label: "Barra", icon: "🍺" },
  private: { label: "Privado", icon: "🚪" },
  outdoor: { label: "Exterior", icon: "🌳" },
};

export const TableSelector: React.FC<TableSelectorProps> = ({
  plan,
  primaryColor = "#f59e0b",
  secondaryColor = "#ea580c",
  onSelectTable,
}) => {
  const [selectedTable, setSelectedTable] = React.useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] = React.useState<string>("all");

  const presentLocations = React.useMemo(() => {
    const found = new Set<string>();
    plan.tables.forEach((table) => {
      if (table.location) found.add(table.location);
    });
    return Array.from(found);
  }, [plan.tables]);

  const visiblePlan = React.useMemo(() => {
    if (selectedLocation === "all") return plan;
    return { ...plan, tables: plan.tables.filter((t) => t.location === selectedLocation) };
  }, [plan, selectedLocation]);

  const handleNextAvailable = () => {
    const next = visiblePlan.tables.find((t) => t.isAvailable);
    if (next) onSelectTable(next.id);
  };

  if (plan.tables.length === 0) {
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

  const selected = selectedTable ? plan.tables.find((t) => t.id === selectedTable) : null;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 pb-32">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Selecciona tu Mesa</h2>
          <p className="text-gray-600">Elige la mesa donde te gustaría sentarte</p>
        </div>

        {presentLocations.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar -mx-6 px-6">
            {[{ id: "all", label: "Todas", icon: "🍽️" }, ...presentLocations.map((id) => ({ id, ...(LOCATION_META[id] ?? { label: id, icon: "🍽️" }) }))].map(
              (loc) => (
                <button
                  key={loc.id}
                  onClick={() => setSelectedLocation(loc.id)}
                  className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-bold transition-all whitespace-nowrap ${
                    selectedLocation === loc.id ? "text-white shadow-sm" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                  style={selectedLocation === loc.id ? { backgroundColor: primaryColor } : {}}
                >
                  <span className="mr-1">{loc.icon}</span>
                  {loc.label}
                </button>
              ),
            )}
          </div>
        )}

        {/* The floor plan — identical formation to the manager editor */}
        <div className="bg-white rounded-3xl shadow-sm border p-4">
          <FloorPlanView
            plan={visiblePlan}
            mode="select"
            selectedTableId={selectedTable}
            onSelectTable={setSelectedTable}
            accentColor={primaryColor}
          />
          <div className="mt-3 pt-3 border-t border-gray-100">
            <FloorPlanLegend variant="availability" />
          </div>
        </div>

        {/* Accessible list, same data as the map */}
        <div className="space-y-2">
          {visiblePlan.tables.map((table) => {
            const isSelected = selectedTable === table.id;
            return (
              <button
                key={table.id}
                onClick={() => table.isAvailable && setSelectedTable(table.id)}
                disabled={!table.isAvailable}
                className={`w-full p-4 rounded-2xl border-2 transition-all text-left ${
                  table.isAvailable
                    ? isSelected
                      ? "shadow-sm"
                      : "bg-white hover:border-green-400"
                    : "bg-red-50 border-red-200 cursor-not-allowed opacity-60"
                }`}
                style={isSelected ? { borderColor: primaryColor, backgroundColor: primaryColor + "08" } : { borderColor: "transparent" }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-gray-900">
                      Mesa #{table.tableNumber}
                      {table.label && table.label !== `Mesa ${table.tableNumber}` && (
                        <span className="text-gray-500 font-normal"> - {table.label}</span>
                      )}
                    </p>
                    <p className="text-sm text-gray-600">
                      {table.seats} asientos
                      {table.location && ` • ${LOCATION_META[table.location]?.label ?? table.location}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {isSelected && <Check className="w-4 h-4" style={{ color: primaryColor }} />}
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold ${
                        table.isAvailable ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                      }`}
                    >
                      {table.isAvailable ? "Disponible" : "Ocupada"}
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Fixed bottom buttons */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t shadow-2xl">
          <div className="max-w-lg mx-auto space-y-2">
            <button
              onClick={() => onSelectTable(selectedTable)}
              disabled={!selectedTable}
              className="w-full text-white py-4 rounded-2xl font-bold text-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              style={{ backgroundColor: primaryColor }}
            >
              {selected ? `Confirmar Mesa #${selected.tableNumber}` : "Confirmar Mesa"}
            </button>
            <button
              onClick={handleNextAvailable}
              className="w-full py-3 rounded-xl font-bold transition-all border-2"
              style={{ borderColor: secondaryColor, color: secondaryColor }}
            >
              Siguiente Mesa Disponible
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
