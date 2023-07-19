import React, { useCallback, useState } from "react";
import useDatatable from "./lib/useDatatable";
import { data } from "./data";
import "./lib/styles/default.css"
import { createRoot } from 'react-dom/client';
import { Datatable } from "./lib";

function App() {

  const [isFetching, setIsFetching] = useState(false);

  const AppsPanel = useCallback(({ DefaultComponents }: Datatable.AppsPanelProps) => (
    <>
      <button onClick={() => selectable.selectAll(true)} style={{ padding: 8 }}>Check All</button>
      <button onClick={() => selectable.selectAll(false)} style={{ padding: 8 }}>Uncheck All</button>
      <button onClick={() => setFilter(prev => ({ ...prev, ["custom"]: "Hello!" }))} style={{ padding: 8 }}>Custom filter option</button>
      <button onClick={() => setIsFetching(p => !p)} style={{ padding: 8 }}>Bulk update</button>
      {DefaultComponents}
    </>
  ), [])

  const RowOptionMenu = useCallback(({ row, rowIndex }: Datatable.RowOptionMenuProps) => (
    <>
      <button onClick={() => setIsFetching(p => !p)} style={{ padding: 8 }}>Toggle Fetching</button>
    </>
  ), []);

  const columns: Datatable.ColumnConfig<string> = [
    { field: "emp_id", datatype: "number" },
    { field: "name", datatype: "string", filterOperations: ["Ends with"], setOptions: ["Tom", "Jerry", "Jack", "John", "Warner", "Penny", "Sammy"] },
    { field: "email", datatype: "email", },
    { field: "dob", datatype: "date" },
    { field: "image", datatype: "image" },
    { field: "phone", datatype: "phone" },
    { field: "is_active", datatype: "boolean" },
    { field: "bio", datatype: "paragraph" },
  ]

  const { Datatable, selectable, setFilter } = useDatatable({
    data: data.slice(0, 100),
    count: data.length,
    isFetching,
    columns,
    onFilter: filter => console.log(filter),
    isSelectable: (row) => row.is_active,
    RowOptionMenu,
    AppsPanel,
  })

  return Datatable
}

const node = document.getElementById("root");
const root = createRoot(node!);
root.render(<App />);