import { useId, useState } from "react";
import { Datatable } from "../types";


export default function SetFilter(config: Datatable.SetFilterComponentProps) {

  const {
    field,
    onChange,
    options,
    defaultValue
  } = config;

  const id = useId();

  const [selected, setSelected] = useState(defaultValue?.selected ?? []);

  const onSelect = (select: string) => {
    const next = [...selected];
    const selectedIndex = selected.findIndex(s => s === select);
    if (selectedIndex === -1) {
      setSelected([...selected, select])
      onChange({ field, selected: [...selected, select] });
      return;
    }
    next.splice(selectedIndex, 1);
    setSelected(next);
    onChange({ field, selected: next });
  }

  const onToggleSelectAll = () => {
    const next = selected.length === options.length ? [] : options;
    setSelected(next);
    onChange({ field, selected: next });
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