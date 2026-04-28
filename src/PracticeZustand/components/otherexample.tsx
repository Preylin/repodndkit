import React, { useMemo, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { v4 as uuidv4 } from "uuid";
import {
  createProyectoStore,
  type EstructuraProyecto,
  type TipoDocumento,
} from "../store/store1";

interface Props {
  tipo: TipoDocumento; // "COT" | "LG" | "INV"
}

export const EditorJerarquico: React.FC<Props> = ({ tipo }) => {
  const fecha = new Date().toLocaleDateString();
  const userName = "Preylin";

  // 1. Gestión de UUID: Intentamos recuperar de la URL o SessionStorage
  const workId = useMemo(() => {
    // Si vienes del Administrador de Sesiones, el ID ya debería estar en la URL o sesión
    const saved = sessionStorage.getItem(`active_id_${tipo}`);
    if (saved) return saved;

    const newId = uuidv4();
    sessionStorage.setItem(`active_id_${tipo}`, newId);
    return newId;
  }, [tipo]);

  // 2. Instancia del Store con el prefijo dinámico (Ej: COT-uuid)
  const useStore = useMemo(
    () => createProyectoStore(fecha, tipo, userName, workId),
    [tipo, workId],
  );
  const { estructura, actualizar, limpiarYDestruir } = useStore();

  const [nombre, setNombre] = useState("");

  // 3. Mutación para PostgreSQL
  const mutation = useMutation({
    mutationFn: async (datos: EstructuraProyecto[]) => {
      const res = await fetch("https://api.innovat.pe/v1/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tipo: tipo,
          uuid: workId,
          data: datos,
        }),
      });
      if (!res.ok) throw new Error("Error en servidor");
      return res.json();
    },
    onSuccess: async () => {
      // Limpiamos usando el prefijo correcto
      await limpiarYDestruir(userName, tipo, fecha, workId);
      sessionStorage.removeItem(`active_id_${tipo}`);
      alert(`${tipo} guardado exitosamente y caché local limpia.`);
    },
  });

  const handleAgregar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre) return;

    const nuevoNodo: EstructuraProyecto = {
      id: crypto.randomUUID(),
      nombre: nombre,
      descripcion: `Entrada creada para ${tipo}`,
      hijos: [],
    };

    actualizar([...estructura, nuevoNodo]);
    setNombre("");
  };

  return (
    <div className="p-8 bg-gray-900 min-h-screen text-gray-100">
      <div className="max-w-2xl mx-auto">
        <header className="mb-8 border-b border-gray-800 pb-4">
          <div className="flex items-center gap-3">
            <span
              className={`px-3 py-1 rounded text-xs font-black ${
                tipo === "COT" ? "bg-blue-600" : "bg-purple-600"
              }`}
            >
              {tipo === "COT" ? "COTIZACIÓN" : "LIQUIDACIÓN"}
            </span>
            <h1 className="text-2xl font-bold text-blue-400">Innovat ERP</h1>
          </div>
          <p className="text-[10px] font-mono text-gray-500 mt-2">
            UUID de Sesión: {workId}
          </p>
        </header>

        {/* INPUTS DE DATOS */}
        <form onSubmit={handleAgregar} className="flex gap-2 mb-8">
          <input
            className="flex-1 bg-gray-800 border border-gray-700 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none placeholder:text-gray-600"
            placeholder={`Nombre de la sección para ${tipo}...`}
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
          />
          <button className="bg-blue-600 hover:bg-blue-500 px-6 py-2 rounded-lg font-bold transition-all active:scale-95">
            Agregar
          </button>
        </form>

        {/* LISTADO DESDE INDEXEDDB */}
        <div className="space-y-3 mb-8">
          <h3 className="text-xs text-gray-500 uppercase tracking-widest font-semibold">
            Borrador local ({tipo})
          </h3>

          {estructura.length === 0 ? (
            <div className="p-10 border-2 border-dashed border-gray-800 rounded-xl text-center text-gray-600 italic">
              No hay datos locales para esta sesión.
            </div>
          ) : (
            estructura.map((item) => (
              <div
                key={item.id}
                className="bg-gray-800/50 p-4 rounded-xl border border-gray-700 flex justify-between items-center group hover:border-gray-500 transition-colors"
              >
                <span>{item.nombre}</span>
                <span className="text-[10px] text-gray-600 group-hover:text-gray-400">
                  ID: {item.id.split("-")[0]}
                </span>
              </div>
            ))
          )}
        </div>

        {/* SINCRONIZACIÓN FINAL */}
        <button
          onClick={() => mutation.mutate(estructura)}
          disabled={mutation.isPending || estructura.length === 0}
          className={`w-full py-4 rounded-xl font-black text-lg transition-all ${
            mutation.isPending
              ? "bg-gray-800 text-gray-600 cursor-not-allowed"
              : "bg-green-600 hover:bg-green-500 text-white shadow-lg shadow-green-900/20 active:scale-[0.98]"
          }`}
        >
          {mutation.isPending
            ? "SINCRO EN CURSO..."
            : `GUARDAR ${tipo} EN POSTGRES`}
        </button>
      </div>
    </div>
  );
};
