import type { ManagerModuleRoute, ManagerNavItem } from "./managerTypes";
import { managerTokens } from "../../../shared/ui/managerTokens";

const NAV_ITEMS: ManagerNavItem[] = [
  { route: "floor-plan", label: "Floor", icon: "◫" },
  { route: "operations", label: "Ops", icon: "⚙" },
  { route: "analytics", label: "Analytics", icon: "◷" },
];

interface ManagerNavRailProps {
  route: ManagerModuleRoute;
  onSelect(route: ManagerModuleRoute): void;
  collapsed: boolean;
  onToggleCollapse(): void;
}

export function ManagerNavRail({ route, onSelect, collapsed, onToggleCollapse }: ManagerNavRailProps) {
  return (
    <aside
      style={{
        border: managerTokens.panelBorder,
        borderRadius: managerTokens.panelRadius,
        padding: 8,
        display: "grid",
        gap: 8,
        alignContent: "start",
        height: "100%",
        boxSizing: "border-box",
      }}
    >
      <button
        title={collapsed ? "Expand" : "Collapse"}
        onClick={onToggleCollapse}
        style={{ border: "1px solid #d1d5db", borderRadius: 8, width: 34, height: 34, fontSize: 16, lineHeight: 1, justifySelf: "center" }}
      >
        ☰
      </button>

      {NAV_ITEMS.map((item) => (
        <button
          key={item.route}
          onClick={() => onSelect(item.route)}
          title={item.label}
          style={{
            border: "1px solid #d1d5db",
            borderRadius: 8,
            background: route === item.route ? "#111827" : "#ffffff",
            color: route === item.route ? "#ffffff" : "#111827",
            display: "grid",
            gridTemplateColumns: collapsed ? "1fr" : "28px 1fr",
            gap: collapsed ? 0 : 8,
            alignItems: "center",
            justifyItems: "center",
            padding: collapsed ? "8px 6px" : "8px 10px",
            fontSize: 13,
          }}
        >
          <span style={{ fontSize: 16, lineHeight: 1 }}>{item.icon}</span>
          {!collapsed && <span>{item.label}</span>}
        </button>
      ))}
    </aside>
  );
}
