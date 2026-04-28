import React, { useEffect, useState } from 'react';
import { keys, del, get } from 'idb-keyval';

// Definimos la estructura del contenido guardado por Zustand
interface ZustandStorageStructure {
  state: {
    estructura?: any[];
    secciones?: any[];
    [key: string]: any;
  };
  version: number;
}

interface RegistroRecuperado {
fecha: string,
  tipo: string; // COT, LG
  userName: string
  uuid: string;
  key: string;
  count: number; // Cantidad de ítems/secciones detectadas
}


export const AdministradorSesiones: React.FC = () => {
  const [sesiones, setSesiones] = useState<RegistroRecuperado[]>([]);
  const [loading, setLoading] = useState(true);

  const escanearRegistros = async () => {
    setLoading(true);
    try {
      const allKeys = await keys();
      
      // Filtrado dinámico: buscamos llaves que sigan tu patrón fecha-tipo-user-uuid
      const sessionKeys = allKeys.filter(k => 
        typeof k === 'string' && k.split('-').length >= 4
      );

      const detalles = await Promise.all(
        sessionKeys.map(async (k) => {
          const keyStr = k as string;
          // Desestructuramos la nueva jerarquía de la llave
          const [fecha, tipo, userName, uuid] = keyStr.split('-');
          
          const contenido = await get<ZustandStorageStructure>(keyStr);
          const items = contenido?.state?.estructura || contenido?.state?.secciones || [];

          return {
            fecha, 
            tipo,
            userName, 
            uuid, 
            key: keyStr, 
            count: items.length
          };
        })
      );

      // Opcional: Ordenar por fecha descendente
      setSesiones(detalles.sort((a, b) => b.fecha.localeCompare(a.fecha)));
    } catch (error) {
      console.error("Error al leer IndexedDB:", error);
    } finally {
      setLoading(false);
    }
  };

  const eliminarRegistro = async (key: string) => {
    if (window.confirm(`¿Deseas eliminar permanentemente el borrador ${key}?`)) {
      await del(key);
      await escanearRegistros();
    }
  };

  const recuperarSesion = (s: RegistroRecuperado) => {
    // Aquí rediriges según el tipo de documento
    const ruta = s.tipo === 'COT' ? 'cotizaciones' : 'liquidaciones';
    window.location.href = `/${ruta}/editar/${s.uuid}`;
  };

  useEffect(() => {
    escanearRegistros();
  }, []);

  return (
    <div className="p-6 bg-[#0f172a] rounded-xl border border-slate-700 shadow-2xl text-white w-full max-w-2xl">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-yellow-500">Panel de Recuperación</h2>
          <p className="text-xs text-slate-400">Registros locales por usuario y fecha</p>
        </div>
        <button onClick={escanearRegistros} className="bg-slate-700 px-4 py-2 rounded-md text-xs hover:bg-slate-600 transition-colors">
          🔄 Actualizar
        </button>
      </div>

      {loading ? (
        <div className="py-10 text-center text-slate-500">Escaneando...</div>
      ) : sesiones.length === 0 ? (
        <div className="py-10 text-center border-2 border-dashed border-slate-800 rounded-lg text-slate-500 italic">
          No hay borradores pendientes.
        </div>
      ) : (
        <div className="grid gap-3">
          {sesiones.map((s) => (
            <div key={s.key} className="p-4 bg-slate-800/50 rounded-lg border border-slate-700 flex justify-between items-center hover:border-slate-500 transition-colors">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded flex flex-col items-center justify-center font-bold text-[10px] ${
                  s.tipo === 'COT' ? 'bg-blue-900/50 text-blue-400' : 'bg-purple-900/50 text-purple-400'
                }`}>
                  <span>{s.tipo}</span>
                  <span className="opacity-50 text-[8px]">{s.fecha}</span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-bold text-slate-200">{s.userName}</p>
                    <span className="text-[10px] bg-slate-700 px-1.5 rounded text-slate-400">{s.uuid.split('-')[0]}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 font-semibold uppercase">
                    {s.count} ítems registrados
                  </p>
                </div>
              </div>
              
              <div className="flex gap-2">
                <button 
                  onClick={() => recuperarSesion(s)}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-bold"
                >
                  Recuperar
                </button>
                <button 
                  onClick={() => eliminarRegistro(s.key)}
                  className="p-1.5 bg-red-900/20 text-red-500 rounded hover:bg-red-900/40"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
