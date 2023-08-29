import { useState } from "react"
import { Datatable } from "../types"


export default function useEditableCell<Data extends Record<string, any>>(onSaveChanges?: (dirtyRows: Data[]) => Promise<any>, uniqueRowIdentifier: string = "id"): Datatable.EditableCells.HookReturn<Data> {

  const [isSaving, setIsSaving] = useState(false);
  const [dirtyRows, setDirtyRows] = useState<Record<string, any>>({});

  const getUid = (row: Data) => {
    const uid = row[uniqueRowIdentifier];
    if (!uid) throw new Error("Field 'id' was not found in a row, all rows must contain an 'id' or you must specify the 'uniqueRowIdentifier' prop. This error came while trying to edit a row.");
    return uid
  }

  const onEdit: Datatable.EditableCells.HookReturn<Data>["onEdit"] = (row, field, cancelEdit) => {
    const uid = getUid(row);
    setDirtyRows(prev => {
      const next = { ...prev };
      if (cancelEdit) {
        delete next[uid];
        return next;
      }
      const currentRow = next[uid];
      next[uid] = {
        ...currentRow ? currentRow : {},
        [field]: row[field as any],
        [uniqueRowIdentifier]: uid
      }
      return next
    })
  }

  const isDirty: Datatable.EditableCells.HookReturn<Data>["isDirty"] = (row, field) => {
    if (!row || !field) return Object.entries(dirtyRows).length > 0;
    const uid = getUid(row);
    if (dirtyRows[uid] === undefined || dirtyRows[uid][field] === undefined) return false
    return true
  }

  const onChange: Datatable.EditableCells.HookReturn<Data>["onChange"] = (row, field, value) => {
    const uid = getUid(row);
    setDirtyRows(prev => {
      const next = { ...prev };
      const currentRow = next[uid];
      next[uid] = {
        ...currentRow ? currentRow : {},
        [field]: value
      }
      return next
    })
  }

  const dirtyValue: Datatable.EditableCells.HookReturn<Data>["dirtyValue"] = (row, field) => {
    const uid = getUid(row);
    if (dirtyRows[uid] === undefined || dirtyRows[uid][field] === undefined) return undefined
    return dirtyRows[uid][field]
  }

  const save: Datatable.EditableCells.HookReturn<Data>["save"] = async () => {
    if (!onSaveChanges) return;
    setIsSaving(true);
    try {
      await onSaveChanges(Object.values(dirtyRows));
      cancel();
    }
    catch (e) { throw e; }
    finally { setIsSaving(false); }
  }

  const cancel: Datatable.EditableCells.HookReturn<Data>["cancel"] = () => {
    setDirtyRows({});
    setIsSaving(false);
  }

  return {
    isEditable: !!onSaveChanges,
    isSaving,
    EditableCell,
    onEdit,
    isDirty,
    onChange,
    dirtyValue,
    save,
    cancel,
  }
}

const EditableCell: Datatable.EditableCells.HookReturn<any>["EditableCell"] = (props) => {

  const {
    inputType,
    value,
    onChange,
    setOptions
  } = props;

  if (setOptions) {
    return (
      <select
        className="editable-cell-input"
        value={value}
        onChange={e => onChange(e.target.value)}
        onClick={e => e.stopPropagation()}
      >
        {setOptions.map(op => <option key={`editable-cell-${op}`} value={op}>{op}</option>)}
      </select>
    )
  }

  if (inputType === "boolean") {
    return (
      <input
        type="checkbox"
        className={`editable-cell-input-checkbox`}
        checked={!!value}
        onChange={e => onChange(e.target.checked)}
        onClick={e => e.stopPropagation()}
      />
    )
  }

  if (inputType === "textarea") {
    return (
      <textarea
        className={`editable-cell-input`}
        value={value}
        onChange={e => onChange(e.target.value)}
        onClick={e => e.stopPropagation()}
      />
    )
  }

  return (
    <input
      className={`editable-cell-input`}
      type={inputType}
      value={value}
      onChange={e => onChange(e.target.value)}
      onClick={e => e.stopPropagation()}
    />
  )
}
