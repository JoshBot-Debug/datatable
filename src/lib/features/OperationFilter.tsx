import { useState } from "react";
import { useDebounce } from "../helpers";
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

  const [operation, setOperation] = useState<Operation>(defaultValue?.operation ?? filterOperations[0]);
  const [value, setValue] = useState<string>(defaultValue?.value ?? "");

  const debounce = useDebounce(onChange);

  const onSelectChange = (selectValue: Operation) => {
    setOperation(selectValue);
    debounce({ [field]: { operation: selectValue, value } })
  }

  const onInputChange = (inputValue: string) => {
    setValue(inputValue);
    debounce({ [field]: { operation, value: inputValue } })
  }

  return (
    <div
      className="operation-filter-container"
      onClick={e => e.stopPropagation()}
    >
      <select
        className="operation-filter-input"
        value={operation}
        onChange={(e) => onSelectChange(e.target.value as Operation)}
      >
        {filterOperations.map(op => <option key={`operation-filter-${op}`} value={op}>{op}</option>)}
      </select>
      <input
        className={`operation-filter-input ${!inputType ? 'hide' : ''}`}
        type={inputType}
        value={value}
        onChange={e => onInputChange(e.target.value)}
        placeholder="Filter..."
        autoFocus
      />
      <button
        className="operation-filter-button"
        onClick={() => onInputChange("")}
      >Clear</button>
    </div>
  )
}
