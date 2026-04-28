import { create } from 'zustand';
import { persist, createJSONStorage, type StateStorage } from 'zustand/middleware';
import { get, set, del } from 'idb-keyval';

// Adaptador para IndexedDB
const idbStorage: StateStorage = {
  getItem: async (name) => (await get(name)) || null,
  setItem: async (name, value) => await set(name, value),
  removeItem: async (name) => await del(name),
};


// Tipado jerárquico (para tus 6 niveles de JSONB en Postgres)
export interface EstructuraProyecto {
  id: string;
  nombre: string;
  descripcion: string;
  hijos?: EstructuraProyecto[]; // Recursividad
  metadata?: Record<string, any>;
}

export type TipoDocumento = 'COT' | 'LG' | 'INV';


interface ProyectoState {
  // El estado principal se llama 'estructura' para coincidir con tu componente
  estructura: EstructuraProyecto[];
  
  // Función para actualizar toda la estructura o una parte
  actualizar: (nuevaEstructura: EstructuraProyecto[]) => void;
  
  // Función para añadir una sección base rápidamente
  addSeccion: (nueva: EstructuraProyecto) => void;
  
  // Función para borrar de IndexedDB y resetear memoria
  limpiarYDestruir: (userName: string, tipo: TipoDocumento, fecha: string, uuid: string) => Promise<void>;
}


export const createProyectoStore = (fecha: string, tipo: TipoDocumento, userName: string, uuid: string) => {
  return create<ProyectoState>()(
    persist(
      (set) => ({
        tipo: tipo,
        estructura: [],
        actualizar: (nuevaEstructura) => 
          set({ estructura: nuevaEstructura }),

        addSeccion: (nueva) => 
          set((state) => ({ 
            estructura: [...state.estructura, nueva] 
          })),

        limpiarYDestruir: async (u,t,f, id) => {
          await del(`${f}-${t}-${u}-${id}`); // Ej: COT-550e84...
          set({ estructura: [] });    // Limpia el estado en RAM
        },
      }),
      {
       name: `${fecha}-${tipo}-${userName}-${uuid}`, // LLAVE PERSONALIZADA
        storage: createJSONStorage(() => idbStorage),
      }
    )
  );
};