import { useId } from "react";
import { Datatable } from "../types";
import { useMountLog } from "../../helper";

interface Props<FieldNames extends string> {
  columns: Datatable.Column<FieldNames>[];
  setColumns: (callback: (columns: Datatable.Column<FieldNames>[]) => Datatable.Column<FieldNames>[]) => void;
}

export default function OmitColumn<FieldNames extends string>(config: Props<FieldNames>) {

  const {
    columns,
    setColumns
  } = config;

  useMountLog("OmitColumn")

  const id = useId();

  const isAllOmitted = !!columns.find(c => c.omit)

  const onToggle = (column: Datatable.Column<FieldNames>) => {
    setColumns(prev => {
      const next = [...prev];
      for (let i = 0; i < next.length; i++) {
        if (next[i].field !== column.field) continue;
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
              key={`columns-${column.field}`}
              className="omit-column-list-item-container"
            >
              <input
                id={`omit-column-list-item-${id}-${column.field}`}
                type="checkbox"
                checked={!column.omit}
                onChange={e => onToggle(column)}
              />
              <label
                htmlFor={`omit-column-list-item-${id}-${column.field}`}
                className="omit-column-label"
              >{column.columnName}</label>
            </div>
          ))
        }
      </div>
    </div>
  )

}