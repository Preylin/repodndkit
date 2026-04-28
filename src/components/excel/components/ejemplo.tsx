import React from "react";
import { createTableStore } from "../store/baseStore"; // Asegúrate que la ruta sea correcta
import { BaseExcelTable } from "./BaseExcelTable";

// Definimos la interfaz del objeto
interface Producto {
  codigo: string;
  nombre: string;
  stock: string; // Tip: En Excel/Inputs suele ser mejor manejar string inicialmente para evitar problemas con campos vacíos
  notas?: string;
}

// 1. Creamos el hook fuera del componente para que persista
const useProductoStore = createTableStore<Producto>();

const misColumnas: { id: keyof Producto; header: string }[] = [
  { id: "codigo", header: "Código SKU" },
  { id: "nombre", header: "Nombre Producto" },
  { id: "stock", header: "Existencias" },
  { id: "notas", header: "Notas" },
];

// Definimos el objeto por defecto para filas nuevas
const DEFAULT_PRODUCTO: Producto = {
  codigo: "",
  nombre: "",
  stock: "",
  notas: "",
};

function ExampleTable() {
  const { addRows, updateCell, bulkUpdate, data, setData } = useProductoStore();
  const MIN_ROWS = 5;
  const DEFAULT_VAL = { codigo: "", nombre: "", stock: "", notas: "" };

  // Inicialización con el mínimo de filas
  React.useEffect(() => {
    if (data.length < MIN_ROWS) {
      const missing = MIN_ROWS - data.length;
      setData([
        ...data,
        ...Array.from({ length: missing }, () => ({ ...DEFAULT_VAL })),
      ]);
    }
  }, []);

  // Función para eliminar la última fila (Disminuir)
  const handleRemoveRow = () => {
    if (data.length > MIN_ROWS) {
      setData(data.slice(0, -1));
    }
  };

  return (
    <div className="p-6 space-y-4">
      <div className="flex justify-between items-center bg-white p-4 rounded-t-lg border-b">
        <div>
          <h2 className="font-bold text-lg">Hoja de Inventario</h2>
          <p className="text-xs text-gray-400">
            Las filas se añaden solas al escribir en la última.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleRemoveRow}
            className="px-3 py-1.5 border border-red-200 text-red-600 rounded hover:bg-red-50 text-sm transition-colors"
            title="Eliminar última fila"
          >
            Eliminar Fila -
          </button>
          <button
            onClick={() => addRows(5, DEFAULT_VAL)}
            className="px-3 py-1.5 bg-gray-800 text-white rounded hover:bg-black text-sm transition-colors"
          >
            Añadir 5 Filas +
          </button>
        </div>
      </div>

      <div className="bg-white shadow-xl rounded-b-lg overflow-hidden">
        <BaseExcelTable<Producto>
          data={data}
          columnsConfig={misColumnas}
          updateCell={updateCell}
          bulkUpdate={bulkUpdate}
          addRows={(count) => addRows(count, DEFAULT_PRODUCTO)}
          defaultRow={DEFAULT_PRODUCTO} // <--- Nueva Prop para manejar el pegado
        />
      </div>

      <div className="text-[10px] text-gray-400 text-right uppercase tracking-widest">
        Total filas: {data.length}
      </div>
    </div>
  );
}
export default ExampleTable;
