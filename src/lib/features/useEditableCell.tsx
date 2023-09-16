import { useState } from "react"
import { Datatable } from "../types"


export default function useEditableCell<Data extends Record<string, any>>(config: Datatable.EditableCells.Config<Data>): Datatable.EditableCells.HookReturn<Data> {

  const {
    uniqueRowIdentifier = "id",
    onSubmitChanges,
    submitError,
    validateChanges,
  } = config;

  const [validationErrors, setValidationErrors] = useState<Record<string, any>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [dirtyRows, setDirtyRows] = useState<Record<string, any>>({});

  const getUid = (row: Data) => {
    const uid = row[uniqueRowIdentifier];
    if (!uid) throw new Error("Field 'id' was not found in a row, all rows must contain an 'id' or you must specify the 'uniqueRowIdentifier' prop. This error came while trying to edit a row.");
    return uid
  }

  const onEdit: Datatable.EditableCells.HookReturn<Data>["onEdit"] = (row, field, cancelEdit) => {
    const uid = getUid(row);
    const next = JSON.parse(JSON.stringify(dirtyRows));
    const nextValidatorErrors = JSON.parse(JSON.stringify(validationErrors));
    if (cancelEdit) {
      if (nextValidatorErrors[uid]) {
        delete nextValidatorErrors[uid][field];
        if (Object.keys(nextValidatorErrors[uid]).length === 1) delete nextValidatorErrors[uid];
      }
      if (next[uid]) {
        delete next[uid][field];
        if (Object.keys(next[uid]).length === 1) delete next[uid];
      }
      setValidationErrors(nextValidatorErrors);
      setDirtyRows(next);
      return;
    }
    const currentRow = next[uid];
    next[uid] = {
      ...currentRow ? currentRow : {},
      [field]: row[field as any],
      [uniqueRowIdentifier]: uid
    }
    setDirtyRows(next)
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
    if (dirtyRows[uid] === undefined || dirtyRows[uid][field] === undefined) return undefined;
    return dirtyRows[uid][field];
  }

  const save: Datatable.EditableCells.HookReturn<Data>["save"] = async (columns, data) => {
    if (!onSubmitChanges) return;
    setValidationErrors({});

    let hasError = false;

    if (validateChanges) {
      const rows = Object.values(dirtyRows);
      const nextValidatorErrors = JSON.parse(JSON.stringify(validationErrors));
      const allFieldsValidator = validateChanges.__allRows__;

      for (let i = 0; i < rows.length; i++) {
        const row: Data = rows[i];
        const uid = getUid(row);
        const originalRow = data.find(d => d[uniqueRowIdentifier] === uid);

        for (const field in row) {
          if (!Object.prototype.hasOwnProperty.call(row, field)) continue;
          const validate = validateChanges[field];
          const errors: any = {
            fieldValidatorError: null,
            allFieldValidatorError: null,
          }
          if (validate) errors.fieldValidatorError = validate(row[field], field, dirtyRows[uid], columns, originalRow);
          if (allFieldsValidator) errors.allFieldValidatorError = allFieldsValidator(row[field], field, dirtyRows[uid], columns, originalRow);
          if (errors.fieldValidatorError || errors.allFieldValidatorError) {
            if (!nextValidatorErrors[uid]) nextValidatorErrors[uid] = {};
            nextValidatorErrors[uid][field] = {
              value: row[field],
              error: (errors.fieldValidatorError && errors.allFieldValidatorError)
                ? `${errors.fieldValidatorError} \n${errors.allFieldValidatorError}`
                : errors.fieldValidatorError
                  ? errors.fieldValidatorError
                  : errors.allFieldValidatorError
            };
            hasError = true;
          }
        }

        for (const field in originalRow) {
          if (!Object.prototype.hasOwnProperty.call(originalRow, field)) continue;
          if (allFieldsValidator && (!nextValidatorErrors[uid] || !nextValidatorErrors[uid][field])) {
            const error = allFieldsValidator(originalRow[field], field, dirtyRows[uid], columns, originalRow);
            if (error) {
              if (!nextValidatorErrors[uid]) nextValidatorErrors[uid] = {};
              nextValidatorErrors[uid][field] = { error, value: originalRow[field] };
              hasError = true;
            }
          }
        }
      }

      if (hasError) {
        setValidationErrors(nextValidatorErrors);
        const errorRows = Object.entries(nextValidatorErrors);
        setDirtyRows(prev => {
          const next = { ...prev };
          for (let i = 0; i < errorRows.length; i++) {
            const [uid, row] = errorRows[i] as any;
            for (const field in row) {
              if (!Object.prototype.hasOwnProperty.call(row, field)) continue;
              if (next[uid][field]) continue;
              next[uid][field] = row[field].value;
            }
          }
          return next
        })
        return;
      }
    }

    setIsSaving(true);
    try {
      await onSubmitChanges(Object.values(dirtyRows));
      cancel();
    }
    catch (e) { throw e; }
    finally { setIsSaving(false); }
  }

  const cancel: Datatable.EditableCells.HookReturn<Data>["cancel"] = () => {
    setDirtyRows({});
    setValidationErrors({});
    setIsSaving(false);
  }

  const getValidationError: Datatable.EditableCells.HookReturn<Data>["getValidationError"] = (row, field) => {
    const uid = getUid(row);
    if (validationErrors[uid] && validationErrors[uid][field]) return validationErrors[uid][field].error;
    return null;
  }

  return {
    isEditable: !!onSubmitChanges,
    submitError,
    isSaving,
    getValidationError,
    EditableCell,
    onEdit,
    isDirty,
    onChange,
    dirtyValue,
    save,
    cancel,
  }
}

const EditableCell: Datatable.EditableCells.HookReturn<any>["EditableCell"] = (props) => (
  <div className="editable-cell-input-wrapper">
    <Inputs {...props} />
    {props.error && <span title={props.error} className="editable-cell-error-message">{props.error}</span>}
  </div>
)


const Inputs: Datatable.EditableCells.HookReturn<any>["EditableCell"] = (props) => {

  const {
    inputType,
    onChange,
    setOptions
  } = props;

  const value = (props.value === undefined || props.value === null) ? "" : props.value

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

  if (inputType === "date") {
    const date = new Date(value);
    const formattedDate = date.toISOString().split("T")[0];
    return (
      <input
        className={`editable-cell-input`}
        type={inputType}
        value={formattedDate}
        onChange={e => onChange(e.target.value)}
        onClick={e => e.stopPropagation()}
        step={1}
      />
    )
  }

  if (inputType === "datetime-local") {
    const parsedDatetime = new Date(value);
    const offsetMinutes = parsedDatetime.getTimezoneOffset();
    const adjustedDatetime = new Date(parsedDatetime.getTime() - parsedDatetime.getMilliseconds());
    const formattedDatetime = new Date(adjustedDatetime.getTime() - offsetMinutes * 60000).toISOString().replace(/\.\d{3}Z$/, "");
    return (
      <input
        className={`editable-cell-input`}
        type={inputType}
        value={formattedDatetime}
        onChange={e => onChange(e.target.value)}
        onClick={e => e.stopPropagation()}
        step={1}
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
      step={1}
    />
  )
}