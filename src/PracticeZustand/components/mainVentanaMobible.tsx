import React, { useState } from 'react';
import FloatingWindow from './ventanamovible';

const Dashboard = () => {
  const [windowState, setWindowState] = useState<{ isOpen: boolean; x: number; y: number } | null>(null);

  const openToolWindow = (e: React.MouseEvent<HTMLButtonElement>) => {
    // 1. Obtener coordenadas del botón
    const rect = e.currentTarget.getBoundingClientRect();
    const windowWidth = 450; // El ancho que definimos en el hijo
    
    // 2. Calcular X (Evitar que se salga por la derecha)
    let initialX = rect.left;
    if (initialX + windowWidth > window.innerWidth) {
      initialX = window.innerWidth - windowWidth - 20; // Margen de 20px
    }

    // 3. Calcular Y (Debajo del botón)
    const initialY = rect.bottom + 12;

    setWindowState({
      isOpen: true,
      x: initialX,
      y: initialY
    });
  };

  return (
    <div className="min-h-screen bg-slate-100 p-10 font-sans">
      <header className="mb-10">
        <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Consola de Control</h1>
        <p className="text-slate-500 mt-1">Gestiona tus procesos en tiempo real.</p>
      </header>

      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 inline-block">
        <p className="text-sm text-slate-600 mb-4 font-medium italic">
          Haz clic en el botón para desplegar la ventana de utilidades:
        </p>
        
        {/* BOTÓN DISPARADOR */}
        <button
          onClick={openToolWindow}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-xl shadow-lg hover:shadow-blue-200 transition-all active:scale-95 flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M3 5a2 2 0 012-2h10a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V5zm11 1H6v8l4-2 4 2V6z" clipRule="evenodd" />
          </svg>
          Abrir Herramientas
        </button>
      </div>

      {/* RENDERIZADO DE LA VENTANA */}
      {windowState?.isOpen && (
        <FloatingWindow 
          initialX={windowState.x} 
          initialY={windowState.y} 
          onClose={() => setWindowState(null)} 
        />
      )}
    </div>
  );
};

export default Dashboard;