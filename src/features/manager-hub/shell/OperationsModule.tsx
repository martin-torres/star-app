import { MenuModule } from "../../menu/ui/MenuModule";
import { PricingModule } from "../../pricing/ui/PricingModule";
import { PromotionsModule } from "../../promotions/ui/PromotionsModule";
import { ImportsModule } from "../../imports/ui/ImportsModule";

export type OperationsViewMode = "catalog" | "pricing" | "promos" | "imports";

interface OperationsModuleProps {
  viewMode: OperationsViewMode;
  restaurantId: string;
}

export function OperationsModule({ viewMode, restaurantId }: OperationsModuleProps) {
  if (!restaurantId) {
    return (
      <section style={{ border: "1px solid #e5e7eb", borderRadius: 12, padding: 12 }}>
        <h2 style={{ marginTop: 0 }}>⚙ Operations</h2>
        <p style={{ color: "#6b7280" }}>No restaurant selected. Add ?restaurant_id=... to the URL and reload.</p>
      </section>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10, minHeight: 0, overflow: "auto" }}>
      {viewMode === "catalog" && <MenuModule restaurantId={restaurantId} />}
      {viewMode === "pricing" && <PricingModule restaurantId={restaurantId} />}
      {viewMode === "promos" && <PromotionsModule restaurantId={restaurantId} />}
      {viewMode === "imports" && <ImportsModule restaurantId={restaurantId} />}
    </div>
  );
}
