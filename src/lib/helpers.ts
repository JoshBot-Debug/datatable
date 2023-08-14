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
  minColumnSize?: number;
  columnNameFontSize?: number;
}

export function useResizer<Data extends Record<string, any>>(config: ResizerProps<Data>) {

  const {
    columns,
    isFetching,
    extraWidth,
    minColumnSize,
    columnNameFontSize,
  } = config;

  const containerRef = useRef<HTMLDivElement>(null);

  const [containerWidth, setContainerWidth] = useState<number>(0);

  const totalFixedWidth = columns.reduce((r, c) => ((c.width && !c.omit) ? ({ width: r.width + c.width, columns: r.columns + 1 }) : r), { width: 0, columns: 0 });

  const visibleColumns = columns.reduce((r, c) => c.omit ? r : r + 1, 0);

  const lastFixedWidthColumn = columns.reduceRight((result, current) => {
    if (result === null) return null;
    if (current.omit) return result;
    if (!current.width) return null;
    return result || current.field;
  }, false as false | null | (string | number | symbol));

  useLayoutEffect(() => {
    if (!containerRef.current) return;
    const element = containerRef.current;
    setContainerWidth(element.clientWidth);
    const handleResize = () => setContainerWidth(prev => prev > 0 && isFetching ? prev : element.clientWidth);
    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(element);
    return () => { resizeObserver.disconnect(); };
  }, [containerRef.current, isFetching, columns])

  const getWidth = <Data extends Record<string, any>,>(column: Datatable.Column<Data>) => {

    const baseSize = column.columnName.length * ((columnNameFontSize ?? 16) / 2); // Calculate base size

    // Calculate reduction using a quadratic function
    const reduction = Math.pow(column.columnName.length, 1.1) - column.columnName.length; // Adjust the exponent as needed

    // Calculate approximate size with reduction
    const approxSize = baseSize + 1 - (reduction < 3 ? 0 : reduction);

    // If there is a minColumnWidth, use it.
    // Approx size + 40 (col icon size) + 16 (col icon margin) + 16 (text span margin)
    const minAutoWidth = minColumnSize ? minColumnSize : columnNameFontSize ? approxSize + 40 + 16 + 16 : 150;

    // If this is the last column with a fixed width
    // and all other columns also have fixed widths,
    // make this last column stretch to the end, ignore it's fixed width.
    if (lastFixedWidthColumn === column.field && column.width) return Math.max(((containerWidth - (extraWidth + totalFixedWidth.width - column.width)) / Math.max((visibleColumns - totalFixedWidth.columns - 1), 1)), minAutoWidth);

    // If this col has a width, use it.
    if (column.width) return column.width;

    // Auto calculate the remaining space and set the width.
    return Math.max(((containerWidth - (extraWidth + totalFixedWidth.width)) / Math.max((visibleColumns - totalFixedWidth.columns), 1)), minAutoWidth);
  }

  return { containerRef, getWidth }
}