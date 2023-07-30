## @jjmyers/datatable

### Check out the [DEMO WEBSITE](https://joshbot-debug.github.io/datatable)

A server sided datatable equiped with every commonly used filter.

## Quick Features
- Sorting
- Multi Sorting
- Number filter
- Text filter
- Boolean filter
- Set filter
- Pagination
- Toggleable columns
- A Seperate controller from component, to allow customization.
- Added client sided data manipulation


## Example usage

### To import styles you need to add this to the top

You can copy the contents of this css file and customize it
to suit your theme
```ts
import "@jjmyers/datatable/build/styles/default.css"
```

```tsx

import { useDatatable, Datatable } from "@jjmyers/datatable";
import "@jjmyers/datatable/build/styles/default.css"

function MyListOfData() {

  const [isFetching, setIsFetching] = useState(false);

  const { Datatable, ...controller } = useDatatable({
    data: data,         // An array of objects
    count: data.length, // This is the total number of records in the database
    serverSide: false,  // If this is false, data manipulation will be handled client sided.
    onFilter: console.log, // If serverSide is true, you need to handle the filters here and update data.
    columns: [
      { field: "emp_id", datatype: "number", sortable: false },
      { field: "name", datatype: "string", multiFilter: true },
      { field: "email", datatype: "email", },
      { field: "dob", datatype: "date" },
      { field: "image", datatype: "image" },
      { field: "phone", datatype: "phone" },
      { field: "is_active", datatype: "boolean"},
      { field: "bio", datatype: "paragraph" },
    ],
  })
  
  // Just an example of how you can add buttons here and manipulate the datatable if needed.
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

  // Just an exmple of adding options to rows
  const RowOptionMenu = ({ row, rowIndex }: Datatable.RowOptionMenuProps) => (<>
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

```