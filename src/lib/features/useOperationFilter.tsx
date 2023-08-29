import { useId, useState } from "react";
import { Datatable } from "../types";

export default function useOperationFilter<Data extends Record<string, any>, Operation extends string>(config: Datatable.UseOperationFilter.Config<Data, Operation>): Datatable.UseOperationFilter.HookReturn<Data, Operation> {

  const {
    onChange,
    initialOperationFilter
  } = config;

  const [operationFilter, setFilter] = useState(initialOperationFilter ?? {});

  const onSetOperationFilter = (filter: Datatable.UseOperationFilter.OperationFilter<Data, Operation>) => {
    const next: any = { ...operationFilter };
    for (const key in filter) {
      const current = { ...(filter as any)[key] };
      if (!current.operation) { delete next[key]; continue; }
      if (shouldRemoveKey(current.value, current.operation)) { delete next[key]; continue; }
      if (current.and && shouldRemoveKey(current.and.value, current.and.operation)) delete current.and;
      if (current.or && shouldRemoveKey(current.or.value, current.or.operation)) delete current.or;
      next[key] = current
    }
    setFilter(next);
    onChange(next);
  }

  const reset = (useInitialFilters?: boolean) => {
    const resetValue = useInitialFilters ? initialOperationFilter ?? {} as Datatable.UseOperationFilter.OperationFilter<Data, Operation> : {} as Datatable.UseOperationFilter.OperationFilter<Data, Operation>;
    setFilter(resetValue);
    return resetValue;
  }

  return {
    OperationFilter,
    operationFilter,
    onSetOperationFilter,
    reset,
  }
}

function allowEmptyValue(value: string) {
  return ["Is blank", "Not blank", "Is true", "Is false"].includes(value)
}

function shouldRemoveKey(value: any, operation: any) {
  return String(value).length === 0 && !allowEmptyValue(operation)
}


function OperationFilter<Data extends Record<string, any>, Operation extends string>(props: Datatable.UseOperationFilter.OperationProps<Data, Operation>) {

  const {
    field,
    datatype,
    inputType,
    currentValue,
    allowedOperations,
    onChange,
  } = props;

  const filterOperations = !props.filterOperations ? allowedOperations : props.filterOperations.length === 0 ? allowedOperations : props.filterOperations;

  const id = useId();

  const [value, setValue] = useState<Datatable.UseOperationFilter.OperationValue<Operation> | undefined>(currentValue);

  const onFormChange = (e: React.ChangeEvent<HTMLFormElement>) => {
    const formData = new FormData(e.currentTarget);
    const firstOperation = formData.get("first-operation") as any
    const firstValue = formData.get("first-value") as any
    const andOr = formData.get("and-or") as "and" | "or"
    const secondOperation = formData.get("second-operation") as any
    const secondValue = formData.get("second-value") as any
    const isSingle = allowEmptyValue(firstOperation);
    const next: Datatable.UseOperationFilter.OperationValue<Operation> = { operation: firstOperation, value: firstValue }
    if (!isSingle) next[andOr] = { operation: secondOperation, value: secondValue }
    setValue(next);
    onChange({ [field]: next } as any)
  }

  const onClear = () => {
    setValue(undefined);
    onChange({ [field]: {} } as any)
  }

  const isOr = !!value?.or;

  const showJoinOperation = (() => {
    if (!!value?.value) return true
    if (value?.or && !!value.or.value) return true;
    if (value?.and && !!value.and.value) return true;
    return false
  })()

  const doNothing = () => { }

  const hideFirstInput = allowEmptyValue(value?.operation ?? "") || !inputType;
  const hideSecondInput = allowEmptyValue(value?.and ? value.and.operation : value?.or?.operation ?? "") || !inputType;

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
          value={value?.operation}
          onChange={doNothing}
        >
          {filterOperations.map(op => <option key={`operation-filter-${op}`} value={op}>{op}</option>)}
        </select>
        <input
          className={`operation-filter-input ${hideFirstInput ? 'hide' : ''}`}
          type={inputType}
          value={value?.value ?? ""}
          onChange={doNothing}
          placeholder="Filter..."
          name="first-value"
          step={1}
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
            value={!isOr ? value?.and?.operation : value.or?.operation}
            onChange={doNothing}
          >
            {filterOperations.map(op => <option key={`operation-filter-${op}`} value={op}>{op}</option>)}
          </select>
          <input
            className={`operation-filter-input ${hideSecondInput ? 'hide' : ''}`}
            type={inputType}
            name="second-value"
            placeholder="Filter..."
            value={!isOr ? value?.and?.value ?? "" : value.or?.value ?? ""}
            onChange={doNothing}
            step={1}
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