import React, { useState, type JSX } from "react";

type NavigationItem = "item1" | "item2" | "item3";

export function ShowMain() {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const [selectedItem, setSelectedItem] = useState<NavigationItem>("item1");

  const renderContent = (): JSX.Element => {
    switch (selectedItem) {
      case "item2": return <Item2 />;
      case "item3": return <Item3 />;
      default: return <Item1 />;
    }
  };

  return (
    <div className="flex flex-col w-full h-dvh overflow-hidden">
      <header className="bg-slate-900 w-full h-12 flex items-center px-4 shrink-0 shadow-md z-50">
        <div className="text-white font-bold tracking-tight">MI APP TYPESCRIPT</div>
      </header>

      <main className="relative flex flex-row w-full h-full overflow-hidden">
        {/* Zona sensible al hover */}
        <div
          className="absolute left-0 top-0 w-3 h-full z-30"
          onMouseEnter={() => setIsHovered(true)}
        />

        {/* SIDEBAR */}
        <aside
          onMouseLeave={() => setIsHovered(false)}
          className={`
            h-full bg-white border-r border-gray-200 transition-all duration-300 ease-in-out z-40
            ${isOpen ? "relative w-64 translate-x-0" : "absolute w-64 -translate-x-full"}
            ${!isOpen && isHovered ? "translate-x-0 shadow-2xl" : ""}
          `}
        >
          {/* Pasamos isOpen y la función para cerrar al Sidebar */}
          <ShowSidebar 
            onSelect={setSelectedItem} 
            isOpen={isOpen} 
            toggleMenu={() => setIsOpen(!isOpen)} 
          />
        </aside>

        {/* CUERPO PRINCIPAL */}
        <section className="flex-1 px-2 py-2 overflow-auto relative bg-mist-50">
          {renderContent()}
        </section>
      </main>
    </div>
  );
}

interface ShowSidebarProps {
  onSelect: (id: NavigationItem) => void;
  isOpen: boolean;
  toggleMenu: () => void;
}

function ShowSidebar({ onSelect, isOpen, toggleMenu }: ShowSidebarProps) {
  const menuItems: { id: NavigationItem; label: string; icon: string }[] = [
    { id: "item1", label: "Colores", icon: "🎨" },
    { id: "item2", label: "Objetos", icon: "📦" },
    { id: "item3", label: "Materiales", icon: "🏗️" },
  ];

  return (
    <nav className="p-4">
      <div className="flex flex-row items-center justify-between mb-6 px-2">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
          Navegación
        </p>
        

          <button 
            onClick={toggleMenu}
            className="text-gray-500 hover:text-red-500 transition-colors text-sm font-bold p-1 border border-gray-200 rounded"
          >
            {isOpen ? "Cerrar" : "Fijar"}
          </button>
      </div>

      <ul className="space-y-2">
        {menuItems.map((item) => (
          <li key={item.id}>
            <button
              onClick={() => onSelect(item.id)}
              className="w-full text-left px-4 py-3 hover:bg-indigo-50 hover:text-indigo-600 rounded-xl transition-all flex items-center gap-3 text-gray-600 font-medium"
            >
              <span>{item.icon}</span>
              {item.label}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}

// Componentes de contenido tipados como React.FC (Functional Components)
const Item1: React.FC = () => (
  <div className="p-6 bg-blue-50 border border-blue-100 rounded-2xl w-full">
    <h2 className="text-2xl font-bold text-blue-700">Paleta de Colores</h2>
    <p className="mt-2 text-blue-600/80">Visualizando la configuración cromática del sistema.</p>
    <h2 className="text-2xl font-bold text-blue-700">Paleta de Colores</h2>
    <p className="mt-2 text-blue-600/80">Visualizando la configuración cromática del sistema.</p>
  </div>
);

const Item2: React.FC = () => (
  <div className="p-6 bg-green-50 border border-green-100 rounded-2xl w-full h-full">
    <h2 className="text-2xl font-bold text-green-700">Inventario de Objetos</h2>
    <p className="mt-2 text-green-600/80">Listado completo de activos registrados.</p>
  </div>
);

const Item3: React.FC = () => (
  <div className="p-6 bg-orange-50 border border-orange-100 rounded-2xl w-full h-full">
    <h2 className="text-2xl font-bold text-orange-700">Gestión de Materiales</h2>
    <p className="mt-2 text-orange-600/80">Propiedades físicas y recursos disponibles.</p>
  </div>
);
