
export declare namespace Datatable {

    type PartialKeys<T, K extends keyof T> = Partial<Pick<T, K>> & Omit<T, K>;

    type Include<T, U> = T extends U ? T : never

    type Datatype = "string" | "boolean" | "date" | "datetime" | "image" | "link" | "email" | "phone" | "name" | "paragraph" | "number" | "set";

    type Filters = { [F in Datatype]?: React.ReactNode };

    type BooleanFilterOperations = "Is true" | "Is false" | "Is blank";

    type RangeFilterOperations = "Equal" | "Not equal" | "Greater than or equal" | "Less than or equal" | "Greater than" | "Less than" | "Is blank";

    type TextFilterOperations = "Equal" | "Not equal" | "Contains" | "Starts with" | "Ends with" | "Is blank";

    type OperationFilter<Operation> = { field: string; operation: Operation; value: string; };
    type SetFilter = { field: string; selected: string[]; };

    type Column<FieldNames extends string> = {
        field: FieldNames;
        columnName: string;
        sortable: boolean;
        filterable: boolean;
        omit: boolean;
        renderCell?: (value: any, column: Column<FieldNames>) => React.ReactNode;
        setOptions?: string[];
        multiFilter?: boolean;
    } & ({
        datatype: Include<Datatype, "string" | "link" | "email" | "phone" | "name" | "paragraph" | "image">;
        filterOperations?: TextFilterOperations[];
    } | {
        datatype: Include<Datatype, "date" | "datetime" | "number">;
        filterOperations?: RangeFilterOperations[];
    } | {
        datatype: Include<Datatype, "boolean">;
        filterOperations?: BooleanFilterOperations[];
    })

    type RowOptionMenuProps = { row: Record<FieldNames, any>; rowIndex: number; }

    type AppsPanelProps = { DefaultComponents: React.ReactNode; }

    type ColumnConfig<FieldNames> = PartialKeys<Column<FieldNames>, "datatype" | "sortable" | "columnName" | "omit" | "filterable">[];

    interface Config<Data, FieldNames> {

        data?: Data[];
        isFetching?: boolean;

        /**
         * The total number of rows in the database.
         */
        count: number;

        isSelectable?: (row: Record<FieldNames, any>) => boolean;

        columns: ColumnConfig;

        onFilter?: (filter: Filter<FieldNames>) => void;

        initialSortOrder?: Filter<FieldNames>["sortOrder"];
        initialPage?: Filter<FieldNames>["page"];
        initialFilter?: Filter<FieldNames>["filter"];

        RowOptionMenu?: React.FC<RowOptionMenuProps>
        AppsPanel?: React.FC<AppsPanelProps>
    }

    interface Filter<FieldNames> {
        sortOrder?: UseSortable.SortOrder<FieldNames>;
        page?: UsePagination.Page;
        filter?: OperationFilter<TextFilterOperations | RangeFilterOperations>[];
        setFilter?: SetFilter[];
    }


    interface TableHeaderProps<FieldNames extends string> extends React.PropsWithChildren {
        column: Column<FieldNames>;
        onClick?: (column: Column<FieldNames>) => void;
        className?: string;
    }

    type DatatableFilterProps<Operation> = { multiFilter?: boolean; setOptions?: string[]; datatype: string; field: string; filterOperations?: Operation[] };

    interface DatatableProps<FieldNames extends string> {
        columns: Datatable.Column<FieldNames>[];
        data: Record<FieldNames, any>[];
        isFetching?: boolean;

        tableClassName?: string;
        thClassName?: string;

        sortable?: Datatable.UseSortable.HookReturn<FieldNames>;
        pagination?: Datatable.UsePagination.HookReturn;
        selectable?: Datatable.UseSelectable.HookReturn<FieldNames>;

        RowOptionMenu?: React.FC<{ row: Record<FieldNames, any>; rowIndex: number; }>;
        AppsPanel?: React.ReactNode;

        TextFilter?: React.FC<DatatableFilterProps<TextFilterOperations>>;
        DateFilter?: React.FC<DatatableFilterProps<RangeFilterOperations>>;
        NumberFilter?: React.FC<DatatableFilterProps<RangeFilterOperations>>;
        BooleanFilter?: React.FC<DatatableFilterProps<BooleanFilterOperations>>;
    }

    interface FilterComponentProps<Operation> {
        inputType?: "text" | "date" | "datetime" | "number";
        field: string;
        onChange: (result: OperationFilter<Operation>) => void;
        filterOperations?: Operation[];
        defaultValue?: { operation: any; value: string; }
        allowedOperations: Operation[];
    }

    interface SetFilterComponentProps {
        field: string;
        options: string[];
        onChange: (result: { field: string; selected: string[]; }) => void;
        defaultValue?: { selected: string[]; };
    }


    namespace UseSortable {

        interface Config<FieldNames extends string> {
            initialSortOrder?: SortOrder<FieldNames>;
            onChange: (sortOrder: SortOrder<FieldNames>) => void;
        }

        interface HookReturn<FieldNames extends string> {
            sortOrder: SortOrder<FieldNames>;
            Sort: (props: SortProps<FieldNames>) => JSX.Element | null;
            onSort: (column: Column<FieldNames>) => void
        }

        interface SortProps<FieldNames extends string> {
            column: Column<FieldNames>;
            sortDirection?: SortDirection;
            orderIndex?: number;
            isMultiSort: boolean;
        }

        type SortDirection = "asc" | "desc"

        type SortOrder<FieldNames extends string> = {
            [K in FieldNames]?: {
                sortDirection: SortDirection;
                orderIndex: number;
            }
        }
    }


    namespace UsePagination {

        interface Config {
            initialPage?: Page;
            numberOfRows: number;
            count: number;
            onChange: (page: Page) => void;
        }

        interface HookReturn {
            page: Page;
            count: number;
            numberOfRows: number;
            Pagination: (props: PageProps) => JSX.Element | null;

            goToPage: (page: number) => void;
            nextPage: () => void;
            previousPage: () => void;
            lastPage: () => void;
            firstPage: () => void;
            onChangeRowsPerPage: (rowsPerPage: number) => void;
        }


        interface PageProps {
            currentPage: number;
            count: number;
            numberOfRows: number;
            rowsPerPage: number[];
            currentRowsPerPage: number;
            goToPage: (page: number) => void;
            nextPage: () => void;
            previousPage: () => void;
            lastPage: () => void;
            firstPage: () => void;
            onChangeRowsPerPage: (rowsPerPage: number) => void;
        }


        interface Page {
            currentPage: number;
            rowsPerPage: number[];
            currentRowsPerPage: number;
        }

    }


    namespace UseSelectable {

        interface Config<FieldNames> {
            isSelectable?: (row: Record<FieldNames, any>) => boolean;
            numberOfRows: number;
            onChange: (selectable: { isAllSelected: boolean; selectedRows: number[] }) => void;
        }

        interface HookReturn<FieldNames> {
            show: boolean;
            Header: React.FC<HeaderProps>;
            Row: React.FC<RowProps<FieldNames>>;
            selectAll: (select: boolean) => void;
            isSelectable: (row: Record<FieldNames, any>) => boolean;
            selectedRows: number[];
            onSelectRow: (checked: boolean, rowIndex: number) => void;
            isAllSelected: boolean;
            disableRow: (rowIndex: number) => void;
        }

        interface HeaderProps {
            selectAll: (select: boolean) => void;
            isAllSelected: boolean;
        }

        interface RowProps<FieldNames> {
            row: Record<FieldNames, any>;
            index: number;
            isSelectable: (row: Record<FieldNames, any>) => boolean;
            checked: boolean;
            onChange: (checked: boolean, rowIndex: number) => void;
            disableRow: (rowIndex: number) => void;
        }

    }
}