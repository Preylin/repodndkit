//caso de uso de genericos

interface Producto {
    nombre: string;
    precio: number;
  }
  

export class Inventario <T extends Producto> {
  private items: T[] = [];

  agregar(item: T) {
    this.items.push(item);
  }

  obtener() {
    return this.items;
  }
}