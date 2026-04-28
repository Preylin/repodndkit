import { create } from "zustand";

interface TableState<T> {
  data: T[];
  setData: (data: T[]) => void;
  updateCell: (rowIndex: number, columnId: keyof T, value: any) => void;
  bulkUpdate: (updates: { rowIndex: number; columnId: keyof T; value: any }[], defaultRow: T) => void;
  addRows: (count: number, defaultRow: T) => void;
}

export const createTableStore = <T extends Record<string, any>>() =>
  create<TableState<T>>((set) => ({
    data: [],
    setData: (data) => set({ data }),
    updateCell: (rowIndex, columnId, value) =>
      set((state) => {
        const newData = [...state.data];
        if (newData[rowIndex]) {
          newData[rowIndex] = { ...newData[rowIndex], [columnId]: value };
        }
        return { data: newData };
      }),
    bulkUpdate: (updates, defaultRow) =>
      set((state) => {
        let newData = [...state.data];
        const maxRowIndex = Math.max(...updates.map((u) => u.rowIndex));

        // Expandir si es necesario
        if (maxRowIndex >= newData.length) {
          const rowsToAdd = maxRowIndex - newData.length + 1;
          const newEmptyRows = Array.from({ length: rowsToAdd }, () => ({ ...defaultRow }));
          newData = [...newData, ...newEmptyRows];
        }

        updates.forEach(({ rowIndex, columnId, value }) => {
          if (columnId) { // Evitar errores si el pegado excede columnas
            newData[rowIndex] = { ...newData[rowIndex], [columnId]: value };
          }
        });

        return { data: newData };
      }),
    addRows: (count, defaultRow) =>
      set((state) => ({
        data: [...state.data, ...Array.from({ length: count }, () => ({ ...defaultRow }))],
      })),
  }));