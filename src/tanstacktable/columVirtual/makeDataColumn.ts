import { faker } from '@faker-js/faker';
import { type ColumnDef } from '@tanstack/react-table'; // ◄ Importación clave

export type Person = Record<string, string>;

// makeColumns sigue igual, retorna la estructura básica
export const makeColumns = (num: number) =>
  [...Array(num)].map((_, i) => ({
    accessorKey: i.toString(),
    header: 'Column ' + i.toString(),
    size: Math.floor(Math.random() * 150) + 100,
  }));

// 🌟 SOLUCIÓN: Cambiamos 'CustomColumn[]' por 'ColumnDef<Person>[]'
export const makeData = (num: number, columns: ColumnDef<Person>[]): Person[] =>
  [...Array(num)].map(() =>
    Object.fromEntries(
      columns.map((col) => {
        // TanStack Table permite 'accessorKey' o 'id'. 
        // Usamos un fallback por seguridad tipográfica.
        const key = ('accessorKey' in col ? col.accessorKey : col.id) ?? '';
        return [key, faker.person.firstName()];
      })
    )
  );