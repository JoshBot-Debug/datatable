import { useEffect, useState } from "react";
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

const formatField = (value: string) => value.replace(/([a-z])([A-Z])/g, '$1 $2').replace("_", " ").toLowerCase()


export const useDebounce = <Result>(callback: (result: Result) => void, timeout: number = 500) => {
    const [value, setValue] = useState<Result | null>(null);

    useEffect(() => {
        if (!value) return;
        const timer = setTimeout(() => { callback(value); }, timeout);
        return () => { clearTimeout(timer); };
    }, [value]);

    return setValue;
};