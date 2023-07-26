import { Datatable } from "./types";

export const getColumnDefaults = <FieldNames extends string>(rows: Partial<Datatable.Column<FieldNames>>[]): Datatable.Column<FieldNames>[] => (
    rows.map(r => ({
        field: r.field as FieldNames ?? "",
        columnName: r.columnName ?? formatField(r.field ?? ""),
        sortable: r.sortable ?? true,
        datatype: r.datatype ?? "string",
        omit: r.omit ?? false,
        filterable: r.filterable ?? true,
        ...r
    })) as Datatable.Column<FieldNames>[]
)

const formatField = (value: string) => value.replace(/([a-z])([A-Z])/g, '$1 $2').replaceAll("_", " ").toLowerCase()