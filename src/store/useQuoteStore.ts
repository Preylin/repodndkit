// src/store/useQuoteStore.ts
import { create } from "zustand";
import { v4 as uuidv4 } from "uuid";
import { arrayMove } from "@dnd-kit/helpers";
import { persist, createJSONStorage } from "zustand/middleware";

export interface Modelo {
  id: string;
  content: string;
  parentId: string | null;
  nivel: 1 | 2 | 3 | "bloque";
  tipoBloque?: "header" | "text";
}

interface QuoteState {
  items: Modelo[];
  moveItem: (activeId: string, overId: string) => void;
  addTemplateToQuote: (
    tipo: 1 | 2 | 3 | "header" | "text",
    overId: string | null,
  ) => void;
  removeItem: (id: string) => void;
  updateItemContent: (id: string, newContent: string) => void;
}

export const useQuoteStore = create<QuoteState>()(
  persist(
    (set) => ({
      items: [],

      moveItem: (activeId, overId) =>
        set((state) => {
          const activeIdx = state.items.findIndex((i) => i.id === activeId);
          const overIdx = state.items.findIndex((i) => i.id === overId);

          if (activeIdx === -1 || overIdx === -1) return state;

          const activeItem = state.items[activeIdx];
          const overItem = state.items[overIdx];

          // REGLA 1: Reordenar entre hermanos (mismo nivel y mismo padre)
          if (
            activeItem.nivel === overItem.nivel &&
            activeItem.parentId === overItem.parentId
          ) {
            return { items: arrayMove(state.items, activeIdx, overIdx) };
          }

          // REGLA 2: Mover bloques o niveles a nuevos padres
          const isBloque = activeItem.nivel === "bloque";

          const isValidMove =
            // Bloques pueden entrar en cualquier nivel (1, 2 o 3)
            (isBloque && typeof overItem.nivel === "number") ||
            // Reglas de niveles clásicas
            (activeItem.nivel === 2 && overItem.nivel === 1) ||
            (activeItem.nivel === 3 && overItem.nivel === 2);

          if (isValidMove) {
            const newItems = [...state.items];
            newItems[activeIdx] = { ...activeItem, parentId: overId };
            return { items: arrayMove(newItems, activeIdx, overIdx) };
          }

          return state;
        }),

      addTemplateToQuote: (tipo, overId) =>
        set((state) => {
          const newId = uuidv4();
          const overItem = state.items.find((i) => i.id === overId);

          // CASO 1: Es un Nivel (1, 2 o 3)
          if (typeof tipo === "number") {
            if (tipo === 1) {
              return {
                items: [
                  ...state.items,
                  {
                    id: newId,
                    content: "Nueva Sección",
                    nivel: 1,
                    parentId: null,
                  },
                ],
              };
            }

            const canCreateNivel =
              (tipo === 2 && overItem?.nivel === 1) ||
              (tipo === 3 && overItem?.nivel === 2);
            if (canCreateNivel) {
              return {
                items: [
                  ...state.items,
                  {
                    id: newId,
                    content: tipo === 2 ? "Nuevo Grupo" : "Nuevo Artículo",
                    nivel: tipo,
                    parentId: overId,
                  },
                ],
              };
            }
          }

          // CASO 2: Es un Bloque (header o text)
          if (tipo === "header" || tipo === "text") {
            // Los bloques requieren caer dentro de un contenedor (nivel 1, 2 o 3)
            if (overItem && typeof overItem.nivel === "number") {
              // Opcional: Solo un header por contenedor
              if (tipo === "header") {
                const hasHeader = state.items.some(
                  (i) => i.parentId === overId && i.tipoBloque === "header",
                );
                if (hasHeader) return state;
              }

              const newItem: Modelo = {
                id: newId,
                content: tipo === "header" ? "Título" : "Texto",
                nivel: "bloque",
                parentId: overId,
                tipoBloque: tipo,
              };
              return { items: [...state.items, newItem] };
            }
          }

          return state;
        }),

      removeItem: (id) =>
        set((state) => {
          const getChildIds = (parentId: string): string[] => {
            const children = state.items.filter(
              (item) => item.parentId === parentId,
            );
            return children.reduce(
              (acc, child) => [...acc, child.id, ...getChildIds(child.id)],
              [] as string[],
            );
          };
          const idsToDelete = [id, ...getChildIds(id)];
          return {
            items: state.items.filter((item) => !idsToDelete.includes(item.id)),
          };
        }),

      updateItemContent: (id, newContent) =>
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id ? { ...item, content: newContent } : item,
          ),
        })),
    }),
    {
      name: "quote-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        items: state.items,
      }),
    },
  ),
);
