abstract class Libro {
  public readonly id: number;
  public titulo: string;
  protected precio: number;

  constructor(id: number, titulo: string, precio: number) {
    this.id = id;
    this.titulo = titulo;
    this.precio = precio;
  }

  // Método abstracto: NO tiene cuerpo. 
  // Obligamos a cada tipo de libro a definir cómo se "abre".
  abstract abrir(): void;

  obtenerPrecio(): string {
    return `$${this.precio}`;
  }
}

export class LibroFisico extends Libro {
  abrir() {
    console.log("Pasando las páginas de papel... 📖");
  }
}

export class LibroDigital extends Libro {
  abrir() {
    console.log("Cargando el archivo PDF en la pantalla... 📱");
  }
}


interface Imprimible {
  imprimir(): void;
}

export class LibroImprimible extends Libro implements Imprimible {
  abrir() {
    console.log("Abriendo libro para impresión... 🖨️");
  }

  imprimir() {
    console.log("Imprimiendo el libro...");
  }
}