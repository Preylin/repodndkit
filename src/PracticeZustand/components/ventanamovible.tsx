import React, { useState } from "react";
import { Rnd } from "react-rnd";
import { createPortal } from "react-dom";

interface FloatingWindowProps {
  initialX: number;
  initialY: number;
  onClose: () => void;
}



const FloatingWindow: React.FC<FloatingWindowProps> = ({
  initialX,
  initialY,
  onClose,
}) => {
  // Estado para manejar que la ventana activa esté siempre encima
  const [zIndex, setZIndex] = useState(100);

  return createPortal(
    <Rnd
      default={{
        x: initialX,
        y: initialY,
        width: 450,
        height: 400,
      }}
      minWidth={320}
      minHeight={250}
      bounds="window"
      dragHandleClassName="window-drag-handle"
      onDragStart={() => setZIndex((prev) => prev + 1)}
      className="flex flex-col shadow-2xl rounded-xl border border-slate-200 bg-white overflow-hidden"
      style={{ zIndex }}
    >
      {/* HEADER / DRAG HANDLE */}
      <div className="window-drag-handle flex items-center justify-between px-4 py-3 bg-slate-900 text-white cursor-move select-none">
        <div className="flex items-center gap-2">
          <div className="flex flex-row gap-1 items-center">
            <div className="w-2.5 h-2.5 bg-teal-500 rounded-full shadow-[0_0_8px_rgba(20,184,166,0.6)]"></div>
            <div className="w-2.5 h-2.5 bg-amber-500 rounded-full shadow-[0_0_8px_rgba(245,158,11,0.6) "></div>
            <div className="w-2.5 h-2.5 bg-rose-500 rounded-full shadow-[0_0_8px_rgba(244,63,94,0.6)]"></div>
          </div>

          <span className="text-xs font-bold tracking-tight uppercase">
            Herramientas Avanzadas
          </span>
        </div>
        <button
          onClick={onClose}
          className="hover:bg-red-500 rounded-lg p-1 transition-colors duration-200"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      {/* CONTENIDO (Scrollable) */}
      <div className="flex-1 p-5 overflow-y-auto bg-white space-y-4">
        <div>
          <label className="text-[11px] font-semibold text-slate-500 uppercase ml-1">
            Buscador
          </label>
          <input
            type="text"
            placeholder="Filtrar datos..."
            className="w-full mt-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all"
          />
        </div>

        <div className="rounded-xl border border-slate-100 overflow-hidden shadow-sm">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-100">
              <tr>
                <th className="px-4 py-2 font-semibold">Métrica</th>
                <th className="px-4 py-2 font-semibold">Valor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-slate-600">
              <tr className="hover:bg-slate-50/50 transition-colors">
                <td className="px-4 py-2">Uso de CPU</td>
                <td className="px-4 py-2 font-mono text-blue-600">12.4%</td>
              </tr>
              <tr className="hover:bg-slate-50/50 transition-colors">
                <td className="px-4 py-2">Memoria</td>
                <td className="px-4 py-2 font-mono text-blue-600">256MB</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* FOOTER */}
      <div className="px-4 py-2 bg-slate-50 border-t border-slate-100 flex justify-between items-center text-[10px] text-slate-400 italic">
        <span>ID Sesión: #A92-K9</span>
        <span className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>{" "}
          Conectado
        </span>
      </div>
    </Rnd>,
    document.body,
  );
};

export default FloatingWindow;
