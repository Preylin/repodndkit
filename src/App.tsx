import Dashboard from "./PracticeZustand/components/mainVentanaMobible";
import { EditorJerarquico } from "./PracticeZustand/components/otherexample";
import { AdministradorSesiones } from "./PracticeZustand/components/panel";
import { ColumnVirtualTable } from "./tanstacktable/columVirtual/ColumnVirtualizedTable";
import { FuzzyTable } from "./tanstacktable/fuzzyTable";
import { RowVirtualTable } from "./tanstacktable/infinityScroll/RowVirtualTable";
import { VirtualizedTableRows } from "./tanstacktable/rowVirtual/VirtualizedRows";
import { ShowMain } from "./ui/panel/principal";
import { ShowMain1 } from "./ui/panel/secundario";


export function App(){

  return(
    <div className="border border-red-500">
      <RowVirtualTable />
     
      
    </div>
  )
}

