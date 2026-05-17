export type OperationsViewMode = "catalog" | "promos" | "imports";

interface OperationsModuleProps {
  viewMode: OperationsViewMode;
}

export function OperationsModule({ viewMode }: OperationsModuleProps) {
  return (
    <section style={{ border: "1px solid #e5e7eb", borderRadius: 12, padding: 12 }}>
      <h2 style={{ marginTop: 0 }}>⚙ Operations — {viewMode}</h2>
      <p style={{ color: "#6b7280" }}>
        {viewMode === "catalog" && "Menu catalog management — coming in Phase D."}
        {viewMode === "promos" && "Promotions & events management — coming in Phase E."}
        {viewMode === "imports" && "File import tools — coming in Phase F."}
      </p>
    </section>
  );
}
