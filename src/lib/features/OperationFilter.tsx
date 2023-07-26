import { useId, useState } from "react";
import { Datatable } from "../types";

export function OperationFilter<Operation extends string>(props: Datatable.FilterComponentProps<Operation>) {

  const {
    inputType,
    field,
    defaultValue,
    allowedOperations,
    onChange,
  } = props;

  const filterOperations = !props.filterOperations ? allowedOperations : props.filterOperations.length === 0 ? allowedOperations : props.filterOperations;

  const id = useId();

  const [value, setValue] = useState<Datatable.UseOperationFilter.OperationValue<Operation>>(defaultValue ?? { operation: filterOperations[0], value: "" });

  const onFormChange = (e: React.ChangeEvent<HTMLFormElement>) => {
    const formData = new FormData(e.currentTarget);
    const firstOperation = formData.get("first-operation") as any
    const firstValue = formData.get("first-value") as any
    const andOr = formData.get("and-or") as any
    const secondOperation = formData.get("second-operation") as any
    const secondValue = formData.get("second-value") as any
    const next: Datatable.UseOperationFilter.OperationValue<Operation> = {
      operation: firstOperation,
      value: firstValue,
      [andOr]: {
        operation: secondOperation,
        value: secondValue,
      }
    }
    setValue(next);
    onChange({ [field]: next })
  }

  const onClear = () => {
    setValue({ operation: filterOperations[0], value: "", and: undefined, or: undefined });
    onChange({ [field]: { operation: filterOperations[0], value: "", and: undefined, or: undefined } })
  }

  const isOr = !!value.or;

  const showJoinOperation = (() => {
    if (value.value.length > 0) return true;
    if (value.or && value.or.value?.length > 0) return true;
    if (value.and && value.and.value?.length > 0) return true;
    return false
  })()

  const doNothing = () => { }

  return (
    <div
      className="operation-filter-container"
      onClick={e => e.stopPropagation()}
    >
      <form
        className="operation-filter-wrap"
        onChange={onFormChange}
        onSubmit={e => e.preventDefault()}
      >
        <select
          className="operation-filter-input"
          name="first-operation"
          value={value.operation}
          onChange={doNothing}
        >
          {filterOperations.map(op => <option key={`operation-filter-${op}`} value={op}>{op}</option>)}
        </select>
        <input
          className={`operation-filter-input ${!inputType ? 'hide' : ''}`}
          type={inputType}
          value={value.value ?? ""}
          onChange={doNothing}
          placeholder="Filter..."
          name="first-value"
          autoFocus
        />

        <div className={`operation-filter-wrap ${showJoinOperation ? '' : 'hide'}`}>
          <div className="operation-and-or-container">
            <div className="operation-and-or-option">
              <input type="radio" id={`AND-${id}`} name="and-or" value="and" checked={!isOr} onChange={doNothing} />
              <label htmlFor="AND" className="operation-and-or-option-label">AND</label>
            </div>
            <div className="operation-and-or-option">
              <input type="radio" id={`OR-${id}`} name="and-or" value="or" checked={isOr} onChange={doNothing} />
              <label htmlFor="OR" className="operation-and-or-option-label">OR</label>
            </div>
          </div>

          <select
            className="operation-filter-input"
            name="second-operation"
            value={!isOr ? value.and?.operation : value.or?.operation}
            onChange={doNothing}
          >
            {filterOperations.map(op => <option key={`operation-filter-${op}`} value={op}>{op}</option>)}
          </select>
          <input
            className={`operation-filter-input ${!inputType ? 'hide' : ''}`}
            type={inputType}
            name="second-value"
            placeholder="Filter..."
            value={!isOr ? value.and?.value ?? "" : value.or?.value ?? ""}
            onChange={doNothing}
            autoFocus
          />
        </div>
      </form>

      <button
        className="operation-filter-button"
        onClick={onClear}
      >Clear</button>
    </div>
  )
}