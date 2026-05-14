import React from "react";

interface TableColumn<T> {
  key: string;
  header: string;
  render: (item: T) => React.ReactNode;
  className?: string;
}

interface LuminousTableProps<T> {
  columns: TableColumn<T>[];
  data: T[];
  keyExtractor: (item: T) => string | number;
  onRowClick?: (item: T) => void;
  className?: string;
  emptyState?: React.ReactNode;
}

export function LuminousTable<T>({
  columns,
  data,
  keyExtractor,
  onRowClick,
  className = "",
  emptyState,
}: LuminousTableProps<T>) {
  if (data.length === 0 && emptyState) {
    return <>{emptyState}</>;
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {data.map((item) => (
        <div
          key={keyExtractor(item)}
          onClick={() => onRowClick?.(item)}
          className={`
            flex items-center gap-4 p-4
            bg-[var(--sase-panel)]
            backdrop-blur-[24px]
            rounded-2xl
            border border-[rgba(167,139,250,0.06)]
            shadow-[0_8px_30px_rgba(0,0,0,0.2)]
            transition-all duration-300
            ${onRowClick ? "cursor-pointer hover:bg-[rgba(20,24,38,0.85)] hover:border-[rgba(167,139,250,0.15)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.25)] active:scale-[0.99]" : ""}
          `}
        >
          {columns.map((col) => (
            <div key={col.key} className={col.className || "flex-1 min-w-0"}>
              {col.render(item)}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

export default LuminousTable;
