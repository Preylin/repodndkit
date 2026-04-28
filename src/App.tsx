import Dashboard from "./PracticeZustand/components/mainVentanaMobible";
import { EditorJerarquico } from "./PracticeZustand/components/otherexample";
import { AdministradorSesiones } from "./PracticeZustand/components/panel";


export function App(){

  return(
    <div className="grid grid-cols-2">
      <Dashboard />
      <AdministradorSesiones /> 
      <EditorJerarquico tipo={"LG"} />
      <Dashboard />
      <EditorJerarquico tipo={"COT"} />
      
    </div>
  )
}

