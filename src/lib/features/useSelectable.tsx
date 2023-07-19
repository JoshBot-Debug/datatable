import { useEffect, useState } from "react";
import { Datatable } from "../types";

export default function useSelectable<FieldNames extends string>(config: Datatable.UseSelectable.Config<FieldNames>) {

  const {
    isSelectable: _isSelectable,
    numberOfRows,
    onChange,
  } = config;

  const [isAllSelected, setIsAllSelected] = useState(false);
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const [disabledRows, setDisabledRows] = useState<number[]>([]);

  const selectAll = (select: boolean) => {
    setIsAllSelected(select);
    const selected = select ? new Array(numberOfRows).fill(0).flatMap((_, i) => disabledRows.includes(i) ? [] : i) : []
    setSelectedRows(selected)
  }

  const isSelectable = (row: Record<FieldNames, any>) => !_isSelectable ? false : _isSelectable(row)

  const onSelectRow = (checked: boolean, rowIndex: number) => {
    setSelectedRows(prev => {
      if (checked) return [...prev, rowIndex]
      return prev.filter(ri => ri !== rowIndex)
    });
    if (isAllSelected) setIsAllSelected(false);
  }

  // TODO possibly remove the need for this function
  const disableRow = (rowIndex: number) => {
    setDisabledRows(prev => {
      if (prev.includes(rowIndex)) return prev
      return [...prev, rowIndex]
    })
  }

  useEffect(() => { onChange({ isAllSelected, selectedRows }); }, [isAllSelected, selectedRows])

  return {
    Header,
    Row,
    show: !!_isSelectable,
    selectAll,
    isSelectable,
    selectedRows,
    onSelectRow,
    isAllSelected,
    disableRow,
  }
}


function Header(props: Datatable.UseSelectable.HeaderProps) {

  const {
    selectAll,
    isAllSelected,
  } = props;

  return (
    <input
      type="checkbox"
      checked={isAllSelected}
      onChange={e => selectAll(e.target.checked)}
    />
  )
}

function Row<FieldNames>(props: Datatable.UseSelectable.RowProps<FieldNames>) {

  const {
    row,
    index,
    isSelectable,
    checked,
    onChange,
    disableRow
  } = props;

  const enabled = isSelectable(row);

  useEffect(() => { if (!enabled) disableRow(index); }, [enabled])

  return (
    <input
      checked={checked}
      onChange={e => onChange(e.target.checked, index)}
      disabled={!enabled}
      type="checkbox"
    />
  )
}