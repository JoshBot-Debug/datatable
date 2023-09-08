## @jjmyers/datatable

### The styling of the datatable can be customized.
### Check out the [DEMO WEBSITE](https://joshbot-debug.github.io/datatable)

A datatable equiped with every commonly used filter. The demo has an array of 10,000 records. Not all features are active here.
If you find a bug or want a feature, raise an issue on GitHub.

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
- Editable cells


## Example usage

### To import styles you need to add this to the top

You can copy the contents of this css file and customize it
to suit your theme
```ts
import "@jjmyers/datatable/build/styles/default.css"
```

```tsx

import { useDatatable, type Datatable } from "@jjmyers/datatable";
import "@jjmyers/datatable/build/styles/default.css" // OR elegance.css

const status = ["online", "offline", "available", "unavailable", "dnd"]

type Data = {
  id: number;
  status: string;
  fullName: string;
  // ...more fields
}


function MyListOfData() {

  const [isFetching, setIsFetching] = useState(false);

  const onSaveChanges = (dirtyRows: Data[]) => new Promise((resolve) => {
    console.log({ dirtyRows })
    setTimeout(() => resolve(true), 3000)
  })

  const { Datatable, ...controller } = useDatatable<Data>({
    data: data,         // An array of objects
    count: data.length, // This is the total number of records in the database
    serverSide: false,  // If this is false, data manipulation will be handled client sided. DEFAULT: true
    onFilter: console.log, // If serverSide is true, you need to handle the filters here and update data.
    onSaveChanges: onSaveChanges,
    initialSortOrder: {
      id: { orderIndex: 1, sortDirection: "desc" }
    },
    columns: [
      // There are more props
      // You'll have to check them yourself
      { field: "id", width: 85, datatype: "number", editable: false },
      { field: "status", setOptions: status, multiFilter: true },
      { field: "fullName", width: 250 },
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
      { field: "customField" },
    ],
  })
  
  // Just an example of how you can add buttons here and manipulate the datatable if needed.
  const AppsPanel = ({ OmitColumns }: Datatable.AppsPanelProps) => (
    <>
      <button className="elegance-button" onClick={() => controller.reset(true)} style={{ padding: 8 }}>Reset Filters</button>
      <button className="elegance-button" onClick={() => controller.reset()} style={{ padding: 8 }}>Clear Filters</button>
      {OmitColumns}
    </>
  )

  // Just an exmple of adding options to rows
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

      // If this is not passed, select option will go, otherwise it uses this fn to determine if a row is selectable
      isSelectable={row => row.is_active}

      // Sometimes we want the row options to show when you click on a row, mostly when you have many columns and have to scroll to click options.
      showOptionsOnRowClick

      // To auto-size the column
      columnNameFontSize={16}
      {...controller}
    />
  )

}

```