import React, { useState, useCallback, useEffect } from 'react';
import { useReactTable, getCoreRowModel, flexRender, type ColumnDef } from '@tanstack/react-table';
import { BaseCell } from './BaseCell';

interface BaseExcelTableProps<T> {
  data: T[];
  columnsConfig: { id: keyof T; header: string }[];
  updateCell: (rowIndex: number, columnId: keyof T, value: any) => void;
  bulkUpdate: (updates: { rowIndex: number; columnId: keyof T; value: any }[], defaultRow: T) => void;
  addRows: (count: number) => void;
  defaultRow: T; // Ahora es obligatorio para que el store funcione
}

export function BaseExcelTable<T extends Record<string, any>>({
  data, columnsConfig, updateCell, bulkUpdate, addRows, defaultRow
}: BaseExcelTableProps<T>) {
  const [activeCell, setActiveCell] = useState<{ r: number; c: number } | null>(null);
  const [selectionEnd, setSelectionEnd] = useState<{ r: number; c: number } | null>(null);
  const [isSelecting, setIsSelecting] = useState(false);

  const getRange = () => {
    if (!activeCell || !selectionEnd) return null;
    return {
      minR: Math.min(activeCell.r, selectionEnd.r),
      maxR: Math.max(activeCell.r, selectionEnd.r),
      minC: Math.min(activeCell.c, selectionEnd.c),
      maxC: Math.max(activeCell.c, selectionEnd.c),
    };
  };

  const handlePaste = useCallback((e: ClipboardEvent) => {
    if (!activeCell) return;
    const pasteData = e.clipboardData?.getData('text/plain');
    if (!pasteData) return;

    const rows = pasteData.split(/\r?\n/).filter(row => row.length > 0 || row.includes('\t'));
    const updates: any[] = [];

    rows.forEach((row, rIdx) => {
      const cols = row.split('\t');
      cols.forEach((val, cIdx) => {
        const targetCol = columnsConfig[activeCell.c + cIdx];
        if (targetCol) {
          updates.push({
            rowIndex: activeCell.r + rIdx,
            columnId: targetCol.id,
            value: val,
          });
        }
      });
    });

    bulkUpdate(updates, defaultRow);
  }, [activeCell, columnsConfig, bulkUpdate, defaultRow]);

  // Auto-añadir fila al escribir en la última
  useEffect(() => {
    const lastRow = data[data.length - 1];
    if (!lastRow) return;
    const isLastRowDirty = Object.values(lastRow).some(val => val !== "" && val !== 0 && val !== null);
    if (isLastRowDirty) addRows(1);
  }, [data, addRows]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!activeCell || document.activeElement?.tagName === 'INPUT') return;
      
      const range = getRange();

      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (!range) return;
        const updates: any[] = [];
        for (let r = range.minR; r <= range.maxR; r++) {
          for (let c = range.minC; c <= range.maxC; c++) {
            updates.push({ rowIndex: r, columnId: columnsConfig[c].id, value: '' });
          }
        }
        bulkUpdate(updates, defaultRow);
      }

      const move = (dr: number, dc: number) => {
        e.preventDefault();
        const nextR = Math.min(Math.max(activeCell.r + dr, 0), data.length - 1);
        const nextC = Math.min(Math.max(activeCell.c + dc, 0), columnsConfig.length - 1);
        setActiveCell({ r: nextR, c: nextC });
        setSelectionEnd({ r: nextR, c: nextC });
      };

      if (e.key === 'ArrowUp') move(-1, 0);
      if (e.key === 'ArrowDown') move(1, 0);
      if (e.key === 'ArrowLeft') move(0, -1);
      if (e.key === 'ArrowRight') move(0, 1);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('paste', handlePaste);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('paste', handlePaste);
    };
  }, [activeCell, selectionEnd, data.length, columnsConfig, bulkUpdate, defaultRow, handlePaste]);

  const isInsideSelection = (r: number, c: number) => {
    const range = getRange();
    if (!range) return false;
    return r >= range.minR && r <= range.maxR && c >= range.minC && c <= range.maxC;
  };

  const columns = React.useMemo<ColumnDef<T, any>[]>(() => 
    columnsConfig.map((col, colIndex) => ({
      id: col.id as string,
      accessorKey: col.id as string,
      header: col.header,
      cell: (info) => (
        <BaseCell
          initialValue={info.getValue()}
          rowIndex={info.row.index}
          columnId={col.id as keyof T}
          colIndex={colIndex}
          isActive={activeCell?.r === info.row.index && activeCell?.c === colIndex}
          isInsideSelection={isInsideSelection(info.row.index, colIndex)}
          onUpdate={updateCell}
          onMouseDown={(r, c) => { setIsSelecting(true); setActiveCell({ r, c }); setSelectionEnd({ r, c }); }}
          onMouseEnter={(r, c) => { if (isSelecting) setSelectionEnd({ r, c }); }}
        />
      ),
    })), [columnsConfig, data, activeCell, selectionEnd, isSelecting, updateCell]
  );

  const table = useReactTable({ data, columns, getCoreRowModel: getCoreRowModel() });

  return (
    <div 
      className="border border-gray-300 rounded overflow-auto bg-[#f3f3f3] p-1"
      onMouseUp={() => setIsSelecting(false)}
    >
      <table className="border-collapse bg-white shadow-sm min-w-full">
        <thead className="sticky top-0 z-30">
          {table.getHeaderGroups().map(hg => (
            <tr key={hg.id}>
              <th className="w-10 bg-gray-100 border border-gray-300 text-[10px] text-gray-400 font-normal italic uppercase px-1">#</th>
              {hg.headers.map(header => (
                <th key={header.id} className="border border-gray-300 bg-gray-50 px-3 py-1.5 text-left text-xs font-bold text-gray-600">
                  {flexRender(header.column.columnDef.header, header.getContext())}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row, i) => (
            <tr key={row.id}>
              <td className="bg-gray-50 border border-gray-300 text-center text-[11px] text-gray-400 select-none">{i + 1}</td>
              {row.getVisibleCells().map(cell => (
                <td key={cell.id} className="p-0 border-none">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}