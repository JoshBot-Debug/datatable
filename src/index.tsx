import React, { useState } from "react";
import { createRoot } from 'react-dom/client';

import { useDatatable, type Datatable } from "./lib";
import "./lib/styles/elegance.css"
import { Data, status } from "./data";
import data from "./data.json";

// import { useDatatable, Datatable } from "@jjmyers/datatable";
// import "@jjmyers/datatable/build/styles/default.css" // OR elegance.css

const responseData = data as Data[];

function App() {

  const [isFetching, setIsFetching] = useState(false);

  const onSaveChanges = (dirtyRows: Data[]) => new Promise((resolve) => {
    console.log({ dirtyRows })
    setTimeout(() => resolve(true), 3000)
  })
  
  const { Datatable, ...controller } = useDatatable<Data>({
    data: responseData,
    count: responseData.length,
    serverSide: false,
    onSaveChanges: onSaveChanges,
    initialSortOrder: {
      id: { orderIndex: 1, sortDirection: "desc" }
    },
    columns: [
      { field: "id", width: 85, datatype: "number" },
      { field: "status", setOptions: status, multiFilter: true },
      { field: "fullName", columnName: "full name and long col name" },
      { field: "firstName" },
      { field: "middleName" },
      { field: "lastName" },
      { field: "email", width: 250, datatype: "email" },
      { field: "phone", datatype: "phone" },
      { field: "isActive", datatype: "boolean" },
      { field: "profileImage", datatype: "image", omit: true },
      { field: "website", width: 250, datatype: "link" },
      { field: "loginTime", datatype: "time" },
      { field: "dateOfBirth", width: 180, datatype: "date" },
      { field: "about", width: 500, datatype: "paragraph" },
      { field: "createdAt", width: 250, datatype: "datetime" },
    ],
  })

  const AppsPanel = ({ OmitColumns }: Datatable.AppsPanelProps) => (
    <>
      <button className="elegance-button" onClick={() => controller.reset(true)} style={{ padding: 8 }}>Reset Filters</button>
      <button className="elegance-button" onClick={() => controller.reset()} style={{ padding: 8 }}>Clear Filters</button>
      {OmitColumns}
    </>
  )

  const RowOptionMenu = ({ row, rowIndex }: Datatable.RowOptionMenuProps<Data>) => (<>
    <button className="elegance-button" onClick={() => controller.reset()} style={{ padding: 8 }}>Fetching On</button>
    <button className="elegance-button" onClick={() => setIsFetching(true)} style={{ padding: 8 }}>Fetching On</button>
    <button className="elegance-button" onClick={() => setIsFetching(false)} style={{ padding: 8 }}>Fetching Off</button>
  </>);

  return (
    <Datatable
      isFetching={isFetching}
      RowOptionMenu={RowOptionMenu}
      AppsPanel={AppsPanel}
      isSelectable={row => row.isActive}
      showOptionsOnRowClick
      columnNameFontSize={16}
      {...controller}
    />
  )
}

const node = document.getElementById("root");
const root = createRoot(node!);
root.render(<App />);