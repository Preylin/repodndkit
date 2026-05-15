import React, {
  useEffect,
  useState,
  useRef,
  useCallback,
} from "react";
import {
  type ColumnDef,
  type ColumnFiltersState,
  type FilterFn,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel, // Solo si vas a filtrar sobre lo ya cargado
  type SortingState,
  useReactTable,
  type Column,
} from "@tanstack/react-table";
import { useVirtualizer } from "@tanstack/react-virtual";
import { rankItem } from "@tanstack/match-sorter-utils";

// Asumiendo que estos tipos vienen de tu archivo de datos

const fuzzyFilter: FilterFn<any> = (row, columnId, value, addMeta) => {
  const itemRank = rankItem(row.getValue(columnId), value);
  addMeta({ itemRank });
  return itemRank.passed;
};

interface Props<T> {
  isLoading: boolean;
  isFetching: boolean;
  columns: ColumnDef<T>[];
  fetchNextPage: () => void;
  flatData: T[];
  totalDBRowCount: number;
}

export function TableBaseRowVirtual<T>({
  isLoading,
  isFetching,
  columns,
  fetchNextPage,
  flatData,
  totalDBRowCount,
}: Props<T>) {
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const totalFetched = flatData.length;

  const fetchMoreOnBottomReached = useCallback(
    (containerRefElement?: HTMLDivElement | null) => {
      if (containerRefElement) {
        const { scrollHeight, scrollTop, clientHeight } = containerRefElement;
        if (
          scrollHeight - scrollTop - clientHeight < 400 &&
          !isFetching &&
          totalFetched < totalDBRowCount
        ) {
          fetchNextPage();
        }
      }
    },
    [fetchNextPage, isFetching, totalFetched, totalDBRowCount],
  );

  const table = useReactTable({
    data: flatData,
    columns,
    state: { sorting, columnFilters, globalFilter },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: "fuzzy",
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    manualSorting: false,
    manualFiltering: false,
    filterFns: { fuzzy: fuzzyFilter },
  });

  const { rows } = table.getRowModel();

  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    estimateSize: () => 35,
    getScrollElement: () => tableContainerRef.current,
    overscan: 10,
  });

  if (isLoading) return <div>Cargando...</div>;

  return (
    <div className="flex flex-col gap-4 p-4 h-screen bg-gray-50">
      {/* HEADER SEPARADO DEL SCROLL */}
      <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <DebouncedInput
          value={globalFilter ?? ""}
          onChange={(value) => setGlobalFilter(String(value))}
          className="p-2 border rounded-md w-72"
          placeholder="🔍 Buscar en todas las columnas..."
        />
        <div className="text-sm font-medium text-gray-600">
          Mostrando {totalFetched} de {totalDBRowCount} registros
        </div>
      </div>

      {/* CONTENEDOR DE TABLA */}
      <div
        ref={tableContainerRef}
        className="grow overflow-auto border border-gray-200 rounded-lg bg-white relative"
        onScroll={(e) => fetchMoreOnBottomReached(e.currentTarget)}
      >
        <table className="grid w-full">
          <thead className="grid sticky top-0 z-20 bg-gray-100 border-b">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="flex w-full">
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="p-2 text-left text-xs font-bold uppercase tracking-wider text-gray-500 border-r last:border-0"
                    style={{ flex: `1 0 ${header.getSize()}px` }}
                  >
                    <div
                      className={
                        header.column.getCanSort()
                          ? "cursor-pointer select-none flex items-center gap-1"
                          : ""
                      }
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                      {{ asc: " 🔼", desc: " 🔽" }[
                        header.column.getIsSorted() as string
                      ] ?? null}
                    </div>
                    {/* Filtro por columna (Funcionalidad extra) */}
                    {header.column.getCanFilter() ? (
                      <div className="mt-1">
                        <Filter column={header.column} />
                      </div>
                    ) : null}
                  </th>
                ))}
              </tr>
            ))}
          </thead>

          <tbody
            className="grid relative"
            style={{ height: `${rowVirtualizer.getTotalSize()}px` }}
          >
            {rowVirtualizer.getVirtualItems().map((virtualRow) => {
              const row = rows[virtualRow.index];
              return (
                <tr
                  key={row.id}
                  className="flex w-full absolute hover:bg-blue-50 transition-colors border-b border-mist-200"
                  style={{ transform: `translateY(${virtualRow.start}px)`, height: `${virtualRow.size}px`, width: "100%"}}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      className="p-2 flex items-center truncate text-sm text-gray-700 h-full"
                      style={{ flex: `1 0 ${cell.column.getSize()}px` }}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {isFetching && (
        <div className="text-center p-2 text-blue-600 font-bold animate-pulse">
          Cargando más datos...
        </div>
      )}
    </div>
  );
}

// Componente de Filtro por columna
function Filter({ column }: { column: Column<any, unknown> }) {
  const columnFilterValue = column.getFilterValue();
  return (
    <DebouncedInput
      type="text"
      value={(columnFilterValue ?? "") as string}
      onChange={(value) => column.setFilterValue(value)}
      placeholder={`Buscar...`}
      className="w-full p-2 border shadow rounded h-8"
    />
  );
}

// Debounced Input (tu componente actual está bien, solo lo estilizamos)
function DebouncedInput({
  value: initialValue,
  onChange,
  debounce = 500,
  ...props
}: {
  value: string | number;
  onChange: (value: string | number) => void;
  debounce?: number;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange">) {
  const [value, setValue] = useState(initialValue);
  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);
  useEffect(() => {
    const timeout = setTimeout(() => onChange(value), debounce);
    return () => clearTimeout(timeout);
  }, [value]);

  return (
    <input
      {...props}
      value={value}
      onChange={(e) => setValue(e.target.value)}
    />
  );
}
