import React, { useState } from "react";
import { useDatatable } from "./lib";
import { data } from "./data";
import "./lib/styles/default.css"
import { createRoot } from 'react-dom/client';

function App() {

  const [isFetching, setIsFetching] = useState(false);

  const Datatable = useDatatable({
    data: data.slice(0, 20),
    count: data.length,
    isFetching: isFetching,
    columns: [
      { field: "emp_id", datatype: "number", },
      { field: "name", datatype: "name", filterOperations: [""] },
      { field: "email", datatype: "email", filterOperations: [] },
      { field: "dob", datatype: "date" },
      { field: "image", datatype: "image" },
      { field: "phone", datatype: "phone" },
      { field: "is_active", datatype: "boolean" },
      { field: "bio", datatype: "paragraph" },
    ],
    onFilter: filter => console.log(filter),
    isSelectable: (row) => row.is_active,
    RowOptionMenu: ({row, rowIndex}) => (
      <>
        <button onClick={() => setIsFetching(p => !p)} style={{padding: 8}}>Toggle Fetching</button>
      </>
    )
  });

  return Datatable
}

const node = document.getElementById("root");
const root = createRoot(node!);
root.render(<App />);