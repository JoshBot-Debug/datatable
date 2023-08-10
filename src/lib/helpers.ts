import { useLayoutEffect, useRef, useState } from "react";
import { Datatable } from "./types";

export const getColumnDefaults = <Data extends Record<string, any>>(rows: Partial<Datatable.Column<Data>>[]): Datatable.Column<Data>[] => (
  rows.map(r => ({
    field: r.field ?? "",
    columnName: r.columnName ?? formatField(String(r.field) ?? ""),
    sortable: r.sortable ?? true,
    datatype: r.datatype ?? "string",
    omit: r.omit ?? false,
    filterable: r.filterable ?? true,
    ...r
  })) as Datatable.Column<Data>[]
)

const formatField = (value: string) => value.replace(/([a-z])([A-Z])/g, '$1 $2').replaceAll("_", " ").toLowerCase()


interface ResizerProps<Data extends Record<string, any>> {
  columns: Datatable.Column<Data>[];
  extraWidth: number;
  isFetching?: boolean;
}

export function useResizer<Data extends Record<string, any>>(config: ResizerProps<Data>) {

  const {
    columns,
    isFetching,
    extraWidth,
  } = config;

  const containerRef = useRef<HTMLDivElement>(null);

  const [containerWidth, setContainerWidth] = useState<number>(0);

  const totalFixedWidth = columns.reduce((r, c) => (c.width ? ({ width: r.width + c.width, columns: r.columns + 1 }) : r), { width: 0, columns: 0 });

  useLayoutEffect(() => {
    if (!containerRef.current) return;
    const element = containerRef.current;
    setContainerWidth(element.clientWidth);
    const handleResize = () => setContainerWidth(prev => prev > 0 && isFetching ? prev : element.clientWidth);
    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(element);
    return () => { resizeObserver.disconnect(); };
  }, [containerRef.current, isFetching])

  const getWidth = <Data extends Record<string, any>,>(column: Datatable.Column<Data>) => {
    if (column.width) return column.width;
    const calcWidth = ((containerWidth - (extraWidth + totalFixedWidth.width)) / (columns.length - totalFixedWidth.columns));
    return Math.max(calcWidth, 150)
  }

  return { containerRef, getWidth }
}