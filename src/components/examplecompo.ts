import { Inventario } from "./genericos";

// El contrato: cualquier cosa que sea un EstiloCombate DEBE tener un método atacar
interface EstiloCombate {
  atacar(): void;
}

class Espada implements EstiloCombate {
  atacar() { console.log("Corte veloz con espada ⚔️"); }
}

class Magia implements EstiloCombate {
  atacar() { console.log("Explosión arcana 🔥"); }
}

class Personaje {
    public nombre: string;
    private estilo: EstiloCombate;
  
  // Ahora aceptamos CUALQUIER cosa que cumpla con el contrato
  constructor(nommbre: string, estilo: EstiloCombate) {
    this.nombre = nommbre;
    this.estilo = estilo;
  }

  setEstilo(nuevoEstilo: EstiloCombate) {
    this.estilo = nuevoEstilo;
  }

  combatir() {
    this.estilo.atacar();
  }
}

const heroe = new Personaje("Arturo", new Espada());
heroe.combatir(); // Ataca con espada

// ¡El héroe encuentra un báculo mágico!
heroe.setEstilo(new Magia());
heroe.combatir();

const nuevo = Inventario