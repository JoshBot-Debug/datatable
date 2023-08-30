import React, { useState } from "react";
import { createRoot } from 'react-dom/client';

import { useDatatable, type Datatable } from "./lib";
import "./lib/styles/elegance.css"
import { Data, status } from "./data";
import data from "./data.json";

// import { useDatatable, Datatable } from "@jjmyers/datatable";
// import "@jjmyers/datatable/build/styles/default.css" // OR elegance.css

function App() {

  const [responseData, setResponseData] = useState(data as Data[]);

  const [savedFilters, setSavedFilters] = useState<Datatable.InitialFilters<Data>>();
  const [isFetching, setIsFetching] = useState(false);

  const onSaveChanges = (dirtyRows: Data[]) => new Promise((resolve) => {
    setResponseData(prev => {
      const next = [...prev];
      for (let i = 0; i < dirtyRows.length; i++) {
        const editedRow = dirtyRows[i];
        const index = next.findIndex(r => r.id === editedRow.id);
        if (index > 0) next[index] = { ...next[index], ...editedRow }
      }
      return next;
    })
    resolve(true)
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
      { field: "id", width: 85, datatype: "number", editable: false },
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
      <button className="elegance-button" onClick={() => setSavedFilters(controller.getFilters())} style={{ padding: 8 }}>Save Filters</button>
      <button className={`elegance-button ${!savedFilters ? 'elegance-button-disabled' : ''}`} disabled={!savedFilters} onClick={() => savedFilters && controller.setFilters(savedFilters)} style={{ padding: 8 }}>Apply Saved Filters</button>
      {OmitColumns}
    </>
  )

  const RowOptionMenu = ({ row, rowIndex }: Datatable.RowOptionMenuProps<Data>) => (
    <>
      <button className="elegance-button" onClick={() => setIsFetching(true)} style={{ padding: 8 }}>Fetching On</button>
      <button className="elegance-button" onClick={() => setIsFetching(false)} style={{ padding: 8 }}>Fetching Off</button>
    </>
  );

  return (
    <Datatable
      isFetching={isFetching}
      RowOptionMenu={RowOptionMenu}
      AppsPanel={AppsPanel}
      isSelectable={row => row.isActive}
      columnNameFontSize={16}
      {...controller}
    />
  )
}

const node = document.getElementById("root");
const root = createRoot(node!);
root.render(<App />);