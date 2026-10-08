export type ManagerModuleRoute =
  | "floor-plan"
  | "operations"
  | "analytics";

export interface ManagerNavItem {
  route: ManagerModuleRoute;
  label: string;
  icon: string;
}
