import * as react_jsx_runtime from 'react/jsx-runtime';
import styleInject from '/home/josh/Projects/@jjmyers/datatable/node_modules/style-inject/dist/style-inject.es.js';
import * as react from 'react';

var css_248z = ".myers-datatable .table-container {\n  display: table;\n}\n.myers-datatable .table-row {\n  display: table-row;\n  position: relative;\n}\n.myers-datatable .table-cell {\n  display: table-cell;\n}\n.myers-datatable .table-header-row {\n  z-index: 1;\n}\n.myers-datatable .spinner {\n  border: 4px solid #f3f3f3; /* Light grey */\n  border-top: 4px solid #7e7e7e; /* Blue */\n  border-radius: 50%;\n  width: 15px;\n  height: 15px;\n  animation: spin 1s linear infinite;\n  margin-left: 5px;\n}\n.myers-datatable .spinner-loading-text {\n  margin-left: 10px;\n}\n@keyframes spin {\n  0% {\n    transform: rotate(0deg);\n  }\n  100% {\n    transform: rotate(360deg);\n  }\n}\n.myers-datatable .spinner-container {\n  position: absolute;\n  background-color: white;\n  top: 0;\n  left: 0;\n  height: 100%;\n  width: 100%;\n  display: flex;\n  align-items: center;\n}";
styleInject(css_248z);

declare namespace Datatable {

  type PartialKeys<T, K extends keyof T> = Partial<Pick<T, K>> & Omit<T, K>;

  type Include<T, U> = T extends U ? T : never

  type Datatype = "string" | "boolean" | "date" | "datetime" | "image" | "link" | "email" | "phone" | "name" | "paragraph" | "number";

  type Filters = { [F in Datatype]?: React.ReactNode };

  type Column<Data extends Record<string, any>> = {
    field: keyof Data;
    columnName: string;
    sortable: boolean;
    filterable: boolean;
    omit: boolean;
    renderCell?: (value: any, column: Column<Data>, row: Data) => React.ReactNode;
    setOptions?: string[];
    multiFilter?: boolean;
    width?: number;
  } & ({
    datatype: Include<Datatype, "string" | "link" | "email" | "phone" | "name" | "paragraph" | "image">;
    filterOperations?: UseOperationFilter.TextFilterOperations[];
  } | {
    datatype: Include<Datatype, "date" | "datetime" | "number">;
    filterOperations?: UseOperationFilter.RangeFilterOperations[];
  } | {
    datatype: Include<Datatype, "boolean">;
    filterOperations?: UseOperationFilter.BooleanFilterOperations[];
  })

  type RowOptionMenuProps<Data extends Record<string, any> = Record<string, any>> = { row: Data; rowIndex: number; }

  type AppsPanelProps = { OmitColumns: React.ReactNode; }

  type ColumnConfig<Data> = PartialKeys<Column<Data>, "datatype" | "sortable" | "columnName" | "omit" | "filterable">[];

  interface Config<Data extends Record<string, any>> {

    data?: Data[];
    columns: Datatable.ColumnConfig<Data>;

    /**
     * The total number of records in the database. (before pagination is applied)
     */
    count?: number;

    /**
     * If serverSide is true, you need to handle the filters here and update data.
     */
    onFilter?: (filter: Filter<Data>) => void;

    initialSortOrder?: Filter<Data>["sortOrder"];
    initialPage?: Filter<Data>["page"];
    initialOperationFilter?: Filter<Data>["operationFilter"];
    initialSetFilter?: Filter<Data>["setFilter"];

    /**
     * Default is true
     */
    serverSide?: boolean;
  }


  interface RichDatatableProps<Data extends Record<string, any>> {
    data?: Data[];
    isFetching?: boolean;
    columns: Datatable.ColumnConfig<Data>;
    setFilter: Datatable.UseSetFilter.HookReturn<Data>;
    operationFilter: Datatable.UseOperationFilter.HookReturn<string>;
    sortable: Datatable.UseSortable.HookReturn<Data>;
    pagination: Datatable.UsePagination.HookReturn;
    selectable: Datatable.UseSelectable.HookReturn<Data>;
    RowOptionMenu?: React.FC<RowOptionMenuProps<Data>>;
    AppsPanel?: React.FC<AppsPanelProps>;
    isSelectable?: (row: Data) => boolean;
    NoData?: React.ReactNode;
    onRowClick?: (row: Data, e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
    showOptionsOnRowClick?: boolean;
    autoWidth: Record<keyof Data, { hasAutoSize: boolean, value: boolean }>;
    toggleAutoWidth: (autoWidth?: boolean, field?: string) => void
  }

  interface Filter<Data extends Record<string, any>> {
    sortOrder: UseSortable.SortOrder<Data>;
    page: UsePagination.Page;
    operationFilter: UseOperationFilter.OperationFilter<Data, UseOperationFilter.TextFilterOperations | UseOperationFilter.RangeFilterOperations | UseOperationFilter.BooleanFilterOperations>;
    setFilter: UseSetFilter.SetFilter<Data>;
  }


  interface TableHeaderProps<Data> extends React.PropsWithChildren {
    column: Column<Data>;
    onClick?: (column: Column<Data>) => void;
    className?: string;
    autoWidth?: Record<keyof Data, { hasAutoSize: boolean, value: boolean }>;
  }

  type DatatableFilterProps<Operation> = { multiFilter?: boolean; setOptions?: string[]; datatype: string; field: string; filterOperations?: Operation[] };

  interface DatatableProps<Data extends Record<string, any>> {
    columns: Datatable.Column<Data>[];
    data: Data[];
    isFetching?: boolean;
    onColumnClick?: (column: Datatable.Column<Data>) => void;

    RowOptionMenu?: React.FC<RowOptionMenuProps<Data>>
    AppsPanel?: React.ReactNode;

    renderFilter?: (column: Datatable.Column<Data>, FilterMenu: React.FC<{ hasFilter: boolean; } & React.PropsWithChildren>) => React.ReactElement;
    renderSort?: (column: Datatable.Column<Data>) => React.ReactElement;
    Footer?: React.ReactNode;

    hideSelect?: boolean;
    SelectHeader?: React.FC;
    SelectCell?: React.FC<{ index: number; row: Data }>;
    NoData?: React.ReactNode;
    onRowClick?: (row: Data, e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
    showOptionsOnRowClick?: boolean;
    autoWidth?: Record<keyof Data, { hasAutoSize: boolean, value: boolean }>;
    toggleAutoWidth: (autoWidth?: boolean, field?: string) => void;
  }



  namespace UseSortable {

    interface Config<Data extends Record<string, any>> {
      initialSortOrder?: SortOrder<Data>;
      onChange: (sortOrder: SortOrder<Data>) => void;
    }

    interface HookReturn<Data extends Record<string, any>> {
      sortOrder: SortOrder<Data>;
      Sort: (props: SortProps<Data>) => JSX.Element | null;
      onSort: (column: DatatableColumn<Data>) => void
    }

    interface SortProps<Data> {
      column: Column<Data>;
      sortDirection?: SortDirection;
      orderIndex?: number;
      isMultiSort: boolean;
    }

    type SortDirection = "asc" | "desc"

    type SortOrder<Data extends Record<string, any>> = {
      [K in keyof Data]?: {
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
      page: Page;
      count: number;
      numberOfRows: number;
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

    interface Config {
      numberOfRows: number;
      onChange: (selectable: { isAllSelected: boolean; selectedRows: number[] }) => void;
    }

    interface HookReturn {
      Header: (props: HeaderProps) => JSX.Element | null;
      Row: (props: RowProps) => JSX.Element | null;
      selectAll: (select: boolean) => void;
      selectedRows: number[];
      onSelectRow: (checked: boolean, rowIndex: number) => void;
      isAllSelected: boolean;
      onDisableRow: (disabled: boolean, rowIndex: number) => void;
    }

    interface HeaderProps {
      selectAll: (select: boolean) => void;
      isAllSelected: boolean;
    }

    interface RowProps {
      index: number;
      disabled: boolean;
      checked: boolean;
      onChange: (checked: boolean, rowIndex: number) => void;
    }

  }


  namespace UseSetFilter {

    interface Config<Data extends Record<string, any>> {
      onChange: (setFilter: SetFilter<Data>) => void;
      initialSetFilter?: SetFilter<Data>;
    }

    type SetFilter<Data extends Record<string, any>> = { [K in keyof Data]?: string[] };

    interface HookReturn<Data extends Record<string, any>> {
      SetFilter: (props: SetFilterProps) => JSX.Element | null;
      setFilter: SetFilter<Data>;
      onSetFilter: (filter: SetFilter<Data>) => void;
    }


    interface SetFilterProps {
      field: string;
      options: string[];
      onChange: (result: SetFilter) => void;
      defaultValue?: string[]
    }

  }

  namespace UseOperationFilter {

    interface Config {
      onChange: (setFilter: SetFilter) => void;
      initialOperationFilter?: OperationFilter;
    }

    type OperationValue<Operation> = {
      operation: Operation;
      value?: string;
      and?: OperationValue<Operation>
      or?: OperationValue<Operation>
    }

    type OperationFilter<Data extends Record<string, any>, Operation> = {
      [key: keyof Data]: OperationValue<Operation>
    };

    interface HookReturn<Data extends Record<string, any>, Operation> {
      OperationFilter: (props: OperationProps<Data, Operation>) => JSX.Element | null;
      operationFilter: OperationFilter<Data, Operation>;
      onSetOperationFilter: (filter: OperationFilter<Data, Operation>) => void;
    }

    type BooleanFilterOperations = "Is true" | "Is false" | "Is blank";

    type RangeFilterOperations = "Equal" | "Not equal" | "Greater than or equal" | "Less than or equal" | "Greater than" | "Less than" | "Is blank";

    type TextFilterOperations = "Equal" | "Not equal" | "Contains" | "Starts with" | "Ends with" | "Is blank";

    interface OperationProps<Data extends Record<string, any>, Operation> {
      inputType?: "text" | "date" | "datetime-local" | "number";
      field: keyof Data;
      onChange: (result: UseOperationFilter.OperationFilter<Data, Operation>) => void;
      filterOperations?: Operation[];
      currentValue?: UseOperationFilter.OperationValue<Operation>
      allowedOperations: Operation[];
    }

  }
}

declare function BaseDatatable<Data extends Record<string, any>>(props: Datatable.DatatableProps<Data>): react_jsx_runtime.JSX.Element;

declare function useDatatable<Data extends Record<string, any>>(config: Datatable.Config<Data>): {
    data: Data[];
    columns: Datatable.ColumnConfig<Data>;
    sortable: Datatable.UseSortable.HookReturn<Data>;
    pagination: Datatable.UsePagination.HookReturn;
    selectable: Datatable.UseSelectable.HookReturn;
    setFilter: Datatable.UseSetFilter.HookReturn<Data>;
    operationFilter: Datatable.UseOperationFilter.HookReturn<Data, string>;
    autoWidth: Record<keyof Data, {
        hasAutoSize: boolean;
        value: boolean;
    }>;
    toggleAutoWidth: (autoWidth?: boolean, field?: string) => void;
    updateFilter: react.Dispatch<react.SetStateAction<Datatable.Filter<Data>>>;
    Datatable: typeof RichDatatable;
};
declare function RichDatatable<Data extends Record<string, any>>(props: Datatable.RichDatatableProps<Data>): react_jsx_runtime.JSX.Element;

interface Props<Data extends Record<string, any>> {
    columns: Datatable.Column<Data>[];
    setColumns: (callback: (columns: Datatable.Column<Data>[]) => Datatable.Column<Data>[]) => void;
}
declare function OmitColumn<Data extends Record<string, any>>(config: Props<Data>): react_jsx_runtime.JSX.Element;

declare function usePagination(config: Datatable.UsePagination.Config): Datatable.UsePagination.HookReturn;

declare function useSelectable(config: Datatable.UseSelectable.Config): Datatable.UseSelectable.HookReturn;

declare function useSortable<Data extends Record<string, any>>(config: Datatable.UseSortable.Config<Data>): Datatable.UseSortable.HookReturn<Data>;

declare function useClientSide<Data extends Record<string, any>>(filter: Datatable.Filter<Data>, data?: Data[], count?: number, serverSide?: boolean): {
    data: Data[];
    count: number;
    numberOfRows: number;
};

export { BaseDatatable, Datatable, OmitColumn, useClientSide, useDatatable, usePagination, useSelectable, useSortable };
