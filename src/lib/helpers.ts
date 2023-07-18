

export const getColumnDefaults = <FieldNames extends string>(rows: Partial<UseDatatable.Column<FieldNames>>[]): UseDatatable.Column<FieldNames>[] => (
    rows.map(r => ({
        field: r.field as FieldNames ?? "",
        columnName: r.columnName ?? formatField(r.field ?? ""),
        sortable: r.sortable ?? true,
        datatype: r.datatype ?? "string",
        omit: r.omit ?? false,
        ...r
    })) as UseDatatable.Column<FieldNames>[]
)

const formatField = (value: string) => value.replace(/([a-z])([A-Z])/g, '$1 $2').replace("_", " ").toLowerCase()