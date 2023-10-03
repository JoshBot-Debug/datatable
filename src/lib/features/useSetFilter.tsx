import { useId, useState } from "react";
import { Datatable } from "../types";

export default function useSetFilter<Data extends Record<string, any>>(config: Datatable.UseSetFilter.Config<Data>): Datatable.UseSetFilter.HookReturn<Data> {

  const {
    onChange,
    initialSetFilter,
    defaultSetFilter,
  } = config;

  const [setFilter, updateFilter] = useState<Datatable.UseSetFilter.SetFilter<Data>>(initialSetFilter);

  const onSetFilter: Datatable.UseSetFilter.HookReturn<Data>["onSetFilter"] = (filter) => {
    const next = { ...setFilter };
    for (const key in filter) next[key] = filter[key];
    updateFilter(next);
    onChange(next);
  }

  const reset = (filter?: Datatable.UseSetFilter.SetFilter<Data>, useDefaultFilter?: boolean) => {
    const resetValue = useDefaultFilter ? defaultSetFilter : filter ?? initialSetFilter;
    updateFilter(resetValue);
    return resetValue;
  }

  return {
    SetFilter,
    setFilter,
    onSetFilter,
    reset,
  }
}


function SetFilter<Data extends Record<string, any>>(config: Datatable.UseSetFilter.SetFilterProps<Data>) {

  const {
    field,
    onChange,
    options,
    defaultValue
  } = config;

  const id = useId();

  const [selected, setSelected] = useState(defaultValue ?? options);

  const onSelect = (select: string) => {
    const next = [...selected];
    const selectedIndex = selected.findIndex(s => s === select);
    if (selectedIndex === -1) {
      const include = [...selected, select];
      setSelected(include)
      onChange({ [field]: { include, isAll: include.length === options.length } } as any);
      return;
    }
    next.splice(selectedIndex, 1);
    setSelected(next);
    onChange({ [field]: { include: next, isAll: next.length === options.length } } as any);
  }

  const onToggleSelectAll = () => {
    const next = selected.length === options.length ? [] : options;
    setSelected(next);
    onChange({ [field]: { include: next, isAll: next.length === options.length } } as any);
  }

  return (
    <div
      className="set-filter-container"
      onClick={e => e.stopPropagation()}
    >
      <div className="set-filter-list-item-container">
        <input
          type="checkbox"
          id={`set-filter-list-item-${id}-all`}
          checked={selected.length === options.length}
          onChange={onToggleSelectAll}
        />
        <label
          htmlFor={`set-filter-list-item-${id}-all`}
          className="set-filter-label"
        >(Select All)</label>
      </div>
      {
        options.map((option, i) => (
          <div
            key={`filters-${option}-${i}`}
            className="set-filter-list-item-container"
          >
            <input
              id={`set-filter-list-item-${id}-${i}-${option}`}
              type="checkbox"
              checked={selected.includes(option)}
              onChange={e => onSelect(option)}
            />
            <label
              htmlFor={`set-filter-list-item-${id}-${i}-${option}`}
              className="set-filter-label"
            >{option}</label>
          </div>
        ))
      }
    </div>
  )

}