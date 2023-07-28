import React, { useState } from "react";
import useDatatable from "./lib/useDatatable";
import { data } from "./data";
import "./lib/styles/default.css"
import { createRoot } from 'react-dom/client';
import { Datatable } from "./lib";

function App() {

  const [isFetching, setIsFetching] = useState(false);

  const { Datatable, ...controller } = useDatatable({
    columns: [
      { field: "emp_id", datatype: "number", sortable: false },
      { field: "name", datatype: "string", multiFilter: true, setOptions: ["Tom", "Jerry", "Jack", "John", "Warner", "Penny", "Sammy"] },
      { field: "email", datatype: "email", },
      { field: "dob", datatype: "date" },
      { field: "image", datatype: "image" },
      { field: "phone", datatype: "phone" },
      { field: "is_active", datatype: "boolean" },
      { field: "bio", datatype: "paragraph" },
    ],
    count: data.length,
    numberOfRows: data.length,
    onFilter: console.log,
  })

  const AppsPanel = ({ OmitColumns }: Datatable.AppsPanelProps) => (
    <>
      <button onClick={() => controller.selectable.selectAll(true)} style={{ padding: 8 }}>Check All</button>
      <button onClick={() => controller.selectable.selectAll(false)} style={{ padding: 8 }}>Uncheck All</button>
      <button onClick={() => controller.updateFilter(prev => ({ ...prev, ["custom"]: "Hello!" }))} style={{ padding: 8 }}>Custom filter option</button>
      <button onClick={() => setIsFetching(p => !p)} style={{ padding: 8 }}>Bulk update</button>
      <button onClick={() => controller.pagination.lastPage()} style={{ padding: 8 }}>Last page</button>
      {OmitColumns}
    </>
  )

  const RowOptionMenu = ({ row, rowIndex }: Datatable.RowOptionMenuProps) => (<>
    <div onClick={() => setIsFetching(p => !p)} style={{ padding: 8 }}>Toggle Fetching</div>
  </>);


  return (
    <div style={{  gap: 20, display: "flex", flexDirection: "column" }}>
      <Datatable
        data={data.slice(0, 10)}
        isFetching={isFetching}
        RowOptionMenu={RowOptionMenu}
        AppsPanel={AppsPanel}
        isSelectable={row => row.is_active}
        showOptionsOnRowClick
        {...controller}
      />
    </div>
  )
}

const node = document.getElementById("root");
const root = createRoot(node!);
root.render(<App />);