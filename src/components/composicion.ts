
// Definimos comportamientos independientes
class EntregaFisica {
  ejecutar() {
    console.log("Enviando por correo postal... 🚚");
  }
}

class EntregaDigital {
  ejecutar() {
    console.log("Enviando enlace de descarga al email... 📧");
  }
}

// La clase principal "compone" el objeto usando estos comportamientos
export class Producto {
    public titulo: string;
    private metodoEntrega: EntregaFisica | EntregaDigital; // Composición
  
  constructor(
    titulo: string,
    metodoEntrega: EntregaFisica | EntregaDigital,
  ) {
    this.titulo = titulo;
    this.metodoEntrega = metodoEntrega;
  }

  vender() {
    console.log(`Vendido: ${this.titulo}`);
    this.metodoEntrega.ejecutar();
  }
}