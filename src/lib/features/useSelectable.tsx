import { useEffect, useState } from "react";
import { Datatable } from "../types";

export default function useSelectable(config: Datatable.UseSelectable.Config): Datatable.UseSelectable.HookReturn {

  const {
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

  const onSelectRow = (checked: boolean, rowIndex: number) => {
    setSelectedRows(prev => {
      if (checked) return [...prev, rowIndex]
      return prev.filter(ri => ri !== rowIndex)
    });
    if (isAllSelected) setIsAllSelected(false);
  }

  const onDisableRow = (disabled: boolean, rowIndex: number) => {
    setDisabledRows(prev => {
      const ri = prev.findIndex(v => v === rowIndex);
      const next = [...prev];
      if (ri > -1 && !disabled) {
        next.splice(ri, 1);
        return next;
      }
      if (ri === -1 && disabled) {
        next.push(rowIndex);
        return next;
      }
      return prev;
    })
  }

  useEffect(() => { onChange({ isAllSelected, selectedRows }); }, [isAllSelected, selectedRows])

  const reset = () => selectAll(false);

  return {
    Header,
    Row,
    selectAll,
    selectedRows,
    onSelectRow,
    isAllSelected,
    onDisableRow,
    reset,
  }
}


function Header(props: Datatable.UseSelectable.HeaderProps) {

  const {
    selectAll,
    isAllSelected,
  } = props;

  return (
    <input
      className="select-header-checkbox"
      type="checkbox"
      checked={isAllSelected}
      onChange={e => selectAll(e.target.checked)}
    />
  )
}

function Row(props: Datatable.UseSelectable.RowProps) {

  const {
    index,
    disabled,
    checked,
    onChange,
  } = props;

  return (
    <input
      checked={checked}
      onClick={e => e.stopPropagation()}
      onChange={e => onChange(e.target.checked, index)}
      disabled={disabled}
      type="checkbox"
    />
  )
}