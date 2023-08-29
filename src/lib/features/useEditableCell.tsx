import { Datatable } from "../types"


export default function useEditableCell<Data>(onSaveChanges?: (dirtyRows: Data[]) => Promise<any>): Datatable.EditableCells.HookReturn {

  return {
    isEditable: !!onSaveChanges,
    EditableCell
  }
}

function EditableCell() {

  return <></>
}
