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