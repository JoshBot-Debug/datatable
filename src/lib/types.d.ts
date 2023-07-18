type PartialKeys<T, K extends keyof T> = Partial<Pick<T, K>> & Omit<T, K>;

namespace UseDatatable {

    type Datatype = "string" | "boolean" | "date" | "datetime" | "image" | "link" | "email" | "phone" | "name" | "paragraph" | "number";

    type Filters = { [F in Datatype]?: React.ReactNode };

    type TextFilterOperations = "Equal" | "Not equal" | "Contains" | "Starts with" | "Ends with" | "Is blank"

    type Column<FieldNames extends string> = {
        field: FieldNames;
        columnName: string;
        sortable: boolean;
        omit: boolean;
        renderCell?: (value: any, column: Column<FieldNames>) => React.ReactNode;
    } & ({
        datatype: Exclude<Datatype, "boolean" | "date" | "datetime" | "image" | "number">;
        filterOperations?: TextFilterOperations[];
    } | {
        datatype: Exclude<Datatype, "string" | "link" | "email" | "phone" | "name" | "paragraph">;
        filterOperations?: string[];
    })

    interface Config<Data, FieldNames> {

        data?: Data[];
        isFetching?: boolean;

        /**
         * The total number of rows in the database.
         */
        count: number;

        isSelectable?: (row: Record<FieldNames, any>) => boolean;

        columns: PartialKeys<Column<FieldNames>, "datatype" | "sortable" | "columnName" | "omit">[];

        onFilter?: (filter: Filter) => void;

        initialSortOrder?: UseSortable.Config<FieldNames>["initialSortOrder"];
        initialPage?: UsePagination.Config["initialPage"];

        RowOptionMenu?: React.FC<{ row: Record<FieldNames, any>; rowIndex: number; }>
    }

    interface Filter {
        sortOrder?: UseSortable.SortOrder;
        page?: UsePagination.Page;
    }


    interface TableHeaderProps<FieldNames extends string> extends React.PropsWithChildren {
        column: Column<FieldNames>;
        onClick?: (column: Column<FieldNames>) => void;
        className?: string;
    }

    interface DatatableProps<FieldNames extends string> {
        columns: UseDatatable.Column<FieldNames>[];
        data: Record<FieldNames, any>[];
        isFetching?: boolean;

        tableClassName?: string;
        thClassName?: string;

        sortable?: UseDatatable.UseSortable.HookReturn<FieldNames>;
        pagination?: UseDatatable.UsePagination.HookReturn;
        selectable?: UseDatatable.UseSelectable.HookReturn<FieldNames>;

        RowOptionMenu?: React.FC<{ row: Record<FieldNames, any>; rowIndex: number; }>;
        AppsPanel?: React.ReactNode;

        TextFilter?: React.FC<{ field: string; filterOperations?: string[] }>;
    }

    interface TextFilterProps {
        field: string;
        onChange: () => void;
        filterOperations?: string[]
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