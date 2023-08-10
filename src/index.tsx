import React, { useEffect, useState } from "react";
import { createRoot } from 'react-dom/client';
import { data } from "./data";

import { useDatatable, type Datatable } from "./lib";
import "./lib/styles/default.css"

// import { useDatatable, Datatable } from "@jjmyers/datatable";
// import "@jjmyers/datatable/build/styles/default.css"

function App() {

  const [isFetching, setIsFetching] = useState(false);

  const { Datatable, ...controller } = useDatatable({
    data: data,
    count: data.length,
    serverSide: false,
    onFilter: console.log,
    columns: [
      { field: "emp_id", width: 100, datatype: "number", sortable: false },
      { field: "name", width: 100, datatype: "string", multiFilter: true },
      { field: "email", datatype: "email", },
      { field: "dob", datatype: "date" },
      { field: "image", datatype: "image" },
      { field: "phone", columnName: "Phone And a really long header", datatype: "phone" },
      { field: "is_active", datatype: "boolean" },
      { field: "bio", width: 500, datatype: "paragraph" },
    ],
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

  const RowOptionMenu = ({ row, rowIndex }: Datatable.RowOptionMenuProps<typeof data[number]>) => (<>
    <div onClick={() => setIsFetching(p => !p)} style={{ padding: 8 }}>Row Option 1</div>
    <div onClick={() => setIsFetching(p => !p)} style={{ padding: 8 }}>Row Option 2</div>
    <div onClick={() => setIsFetching(p => !p)} style={{ padding: 8 }}>Row Option 3</div>
    <div onClick={() => setIsFetching(p => !p)} style={{ padding: 8 }}>Row Option 4</div>
  </>);

  return (
    <Datatable
      isFetching={isFetching}
      RowOptionMenu={RowOptionMenu}
      AppsPanel={AppsPanel}
      isSelectable={row => row.is_active}
      showOptionsOnRowClick
      {...controller}
    />
  )
}

const node = document.getElementById("root");
const root = createRoot(node!);
root.render(<App />);