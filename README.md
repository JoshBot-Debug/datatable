## React Datatable

#### The styling of the datatable can be customized using CSS.
#### Check out the [DEMO WEBSITE](https://joshbot-debug.github.io/datatable)

A datatable equiped with every commonly used filter. The demo has an array of 1,000 records. Not all features are active here.
If you find a bug or want a feature, raise an issue on GitHub.

## ☕ Support My Work
Hey there! 👋 If my npm libraries have made your coding journey easier or sparked creativity, consider supporting my work with a virtual coffee. Your generosity keeps the code flowing and inspires more innovations! ☕🚀

[!["Buy Me A Coffee"](https://www.buymeacoffee.com/assets/img/custom_images/orange_img.png)](https://www.buymeacoffee.com/joshuajosephmyers)


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
- Cell validation on edit

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
    validateChanges: {
      lastName: (value, field, dirtyRow, columns, originalRow) => {
        if (!value) return null;
        if (value.length > 3) return "Max 3 characters"
        if (value === dirtyRow.middleName || value === originalRow?.middleName) return "Middle name and lastname cannot be the same"
        return null
      },
      // A special field in validateChanges, used to perform validation on all fields, regardless wheather they were edited or not.
      // If any field in the row is edited, all fields in that row will go through this validator.
      // A good place to check for required fields if the data comes in empty and on edit you need to make sure the fields were filled.
      __allRows__: (value, field, dirtyRow, columns, originalRow) => {
        if (!value && field === "firstName") return "First name is required"
        if(value && field === "firstName" && value.length < 2)  return "Minimum 2 characters is required"
        // Check all other fields...
        return null
      },
    },
    initialSortOrder: {
      id: { orderIndex: 1, sortDirection: "desc" }
    },
    columns: [
      // There are more props
      // You'll have to check them yourself
      { field: "id", width: 85, datatype: "number", editable: false },
      { field: "status", editable: val => val !== "dnd" setOptions: status, multiFilter: true },
      { field: "fullName", editable: false, width: 250 },
      { field: "firstName" },
      { field: "middleName" },
      { field: "lastName" },
      { field: "email", width: 250, datatype: "email", sortable: false, filterable: false },
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