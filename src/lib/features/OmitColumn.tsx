import { useId } from "react";
import { Datatable } from "../types";

interface Props<Data extends Record<string, any>> {
  columns: Datatable.Column<Data>[];
  setColumns: (callback: (columns: Datatable.Column<Data>[]) => Datatable.Column<Data>[]) => void;
}

export default function OmitColumn<Data extends Record<string, any>>(config: Props<Data>) {

  const {
    columns,
    setColumns
  } = config;

  const id = useId();

  const isAllOmitted = !!columns.find(c => c.omit)

  const onToggle = (column: Datatable.Column<Data>) => {
    setColumns(prev => {
      const next = [...prev];
      for (let i = 0; i < next.length; i++) {
        if (next[i].field !== String(column.field)) continue;
        next[i] = { ...column, omit: !column.omit }
      }
      return next
    })
  }

  const onToggleOmitAll = () => setColumns(prev => prev.map(c => ({ ...c, omit: !isAllOmitted })));

  return (
    <div className="omit-column-container">
      <span className="omit-column-title">Columns</span>
      <div className="omit-column-list">
        <div className="omit-column-list-item-container">
          <input
            type="checkbox"
            id={`omit-column-list-item-${id}-all`}
            checked={!isAllOmitted}
            onChange={onToggleOmitAll}
          />
          <label
            htmlFor={`omit-column-list-item-${id}-all`}
            className="omit-column-label"
          >(Select All)</label>
        </div>
        {
          columns.map(column => (
            <div
              key={`columns-${String(column.field)}`}
              className="omit-column-list-item-container"
            >
              <input
                id={`omit-column-list-item-${id}-${String(column.field)}`}
                type="checkbox"
                checked={!column.omit}
                onChange={e => onToggle(column)}
              />
              <label
                htmlFor={`omit-column-list-item-${id}-${String(column.field)}`}
                className="omit-column-label"
              >{column.columnName}</label>
            </div>
          ))
        }
      </div>
    </div>
  )

}