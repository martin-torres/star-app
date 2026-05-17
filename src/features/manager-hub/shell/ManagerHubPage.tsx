import { useEffect, useMemo, useState } from "react";
import type { FloorPropType, TableType } from "../floor-editor/domain/layoutTypes";
import { initialEditorStore, type FloorEditorStore } from "../floor-editor/state/editorStore";
import { ManagerNavRail } from "./ManagerNavRail";
import { ModuleHost } from "./ModuleHost";
import { loadFloorPlanStore, saveFloorPlanStore } from "./floorPlanPersistence";
import type { ManagerModuleRoute } from "./managerTypes";
import { switchManagerModule } from "./moduleSwitchController";
import type { TableStatus, TableStatusInput } from "../floorplan/domain/statusTypes";

export function ManagerHubPage() {
  const [route, setRoute] = useState<ManagerModuleRoute>("floor-plan");
  const [railCollapsed, setRailCollapsed] = useState(false);
  const [floorStore, setFloorStore] = useState<FloorEditorStore>(() => loadFloorPlanStore() ?? initialEditorStore);
  const [addTableType, setAddTableType] = useState<TableType>("rectangle");
  const [addPropType, setAddPropType] = useState<FloorPropType>("kitchen_area");
  const [rightCollapsed, setRightCollapsed] = useState(false);

  useEffect(() => {
    if (floorStore.selectedObjectId && rightCollapsed) setRightCollapsed(false);
  }, [floorStore.selectedObjectId, rightCollapsed]);

  useEffect(() => {
    saveFloorPlanStore(floorStore);
  }, [floorStore]);

  const autosave = useMemo(
    () => ({
      async saveFloorPlan(nextStore: FloorEditorStore) {
        saveFloorPlanStore(nextStore);
      },
    }),
    [],
  );

  // Demo status map so tables show visual colors in the editor.
  // In production this will be wired to a realtime status service.
  const tableStatusMap = useMemo((): Record<string, TableStatusInput> => {
    const demoStatuses: TableStatus[] = [
      "new_order",
      "order_accepted",
      "ready_pickup",
      "customer_request",
      "delivering",
      "cleaning",
      "occupied_idle",
    ];
    const map: Record<string, TableStatusInput> = {};
    floorStore.tables.forEach((table, index) => {
      const statusIndex = index % demoStatuses.length;
      map[table.tableId] = {
        tableId: table.tableId,
        isReserved: true,
        isOccupied: index % 3 !== 0,
        statusList: [demoStatuses[statusIndex]],
      };
    });
    return map;
  }, [floorStore.tables]);

  async function handleSelect(next: ManagerModuleRoute) {
    const resolved = await switchManagerModule(route, next, floorStore, autosave);
    setRoute(resolved);
  }

  return (
    <main
      style={{
        fontFamily: "ui-sans-serif, system-ui",
        padding: 10,
        margin: "0 auto",
        width: "100%",
        maxWidth: 1320,
        height: "100vh",
        boxSizing: "border-box",
        display: "grid",
        gridTemplateRows: "auto 1fr",
        gap: 8,
        overflow: "hidden",
      }}
    >
      <h1 style={{ margin: 0, fontSize: 22 }}>Manager Control Hub</h1>
      <div style={{ display: "grid", gridTemplateColumns: `${railCollapsed ? "64px" : "180px"} 1fr`, gap: 10, minHeight: 0 }}>
        <ManagerNavRail route={route} onSelect={handleSelect} collapsed={railCollapsed} onToggleCollapse={() => setRailCollapsed((p) => !p)} />
        <ModuleHost
          route={route}
          floorStore={floorStore}
          onFloorStoreChange={setFloorStore}
          addTableType={addTableType}
          addPropType={addPropType}
          onAddTableTypeChange={setAddTableType}
          onAddPropTypeChange={setAddPropType}
          leftCollapsed={false}
          rightCollapsed={rightCollapsed}
          onToggleLeft={() => {}}
          onToggleRight={() => setRightCollapsed((prev) => !prev)}
          tableStatusMap={tableStatusMap}
        />
      </div>
    </main>
  );
}
