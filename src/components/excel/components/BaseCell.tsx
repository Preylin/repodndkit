import { useEffect, useRef, useState } from 'react';

interface BaseCellProps<T> {
  initialValue: any;
  rowIndex: number;
  columnId: keyof T;
  isActive: boolean;
  isInsideSelection: boolean;
  onUpdate: (rowIndex: number, columnId: keyof T, value: any) => void;
  onMouseDown: (r: number, c: number) => void;
  onMouseEnter: (r: number, c: number) => void;
  colIndex: number;
}

export function BaseCell<T extends Record<string, any>>({
  initialValue, rowIndex, columnId, colIndex, isActive, isInsideSelection,
  onUpdate, onMouseDown, onMouseEnter
}: BaseCellProps<T>) {
  const [isEditing, setIsEditing] = useState(false);
  const [localValue, setLocalValue] = useState(initialValue || '');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => setLocalValue(initialValue || ''), [initialValue]);

  useEffect(() => {
    if (isActive && isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isActive, isEditing]);

  const handleBlur = () => {
    setIsEditing(false);
    onUpdate(rowIndex, columnId, localValue);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleBlur();
    }
  };

  return (
    <div
      onMouseDown={() => onMouseDown(rowIndex, colIndex)}
      onMouseEnter={() => onMouseEnter(rowIndex, colIndex)}
      onDoubleClick={() => setIsEditing(true)}
      className={`relative w-full h-8 flex items-center px-2 text-sm border-r border-b cursor-cell select-none transition-all ${
        isActive ? 'ring-2 ring-blue-500 z-20 bg-white shadow-md' : 
        isInsideSelection ? 'bg-blue-100/60' : 'bg-white'
      }`}
    >
      {isActive && isEditing ? (
        <input
          ref={inputRef}
          className="absolute inset-0 w-full h-full px-2 outline-none border-none"
          value={localValue}
          onChange={(e) => setLocalValue(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
        />
      ) : (
        <span className="truncate w-full">{localValue}</span>
      )}
    </div>
  );
}