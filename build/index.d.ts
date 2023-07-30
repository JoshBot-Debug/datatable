import * as react_jsx_runtime from 'react/jsx-runtime';
import styleInject from '/home/josh/Projects/@jjmyers/datatable/node_modules/style-inject/dist/style-inject.es.js';
import * as react from 'react';

var css_248z = ".myers-datatable .table-container {\n  display: table;\n  border-collapse: collapse;\n}\n.myers-datatable .table-row {\n  display: table-row;\n  position: relative;\n}\n.myers-datatable .table-cell {\n  display: table-cell;\n}\n.myers-datatable .table-header {\n  z-index: 1;\n}\n.myers-datatable .spinner {\n  border: 4px solid #f3f3f3; /* Light grey */\n  border-top: 4px solid #7e7e7e; /* Blue */\n  border-radius: 50%;\n  width: 15px;\n  height: 15px;\n  animation: spin 1s linear infinite;\n  margin-left: 5px;\n}\n.myers-datatable .spinner-loading-text {\n  margin-left: 10px;\n}\n@keyframes spin {\n  0% {\n    transform: rotate(0deg);\n  }\n  100% {\n    transform: rotate(360deg);\n  }\n}\n.myers-datatable .spinner-container {\n  position: absolute;\n  background-color: white;\n  top: 0;\n  left: 0;\n  height: 100%;\n  width: 100%;\n  display: flex;\n  align-items: center;\n}";
styleInject(css_248z);

declare namespace Datatable {

  type PartialKeys<T, K extends keyof T> = Partial<Pick<T, K>> & Omit<T, K>;

  type Include<T, U> = T extends U ? T : never

  type Datatype = "string" | "boolean" | "date" | "datetime" | "image" | "link" | "email" | "phone" | "name" | "paragraph" | "number";

  type Filters = { [F in Datatype]?: React.ReactNode };

  type Column<FieldNames extends string> = {
    field: FieldNames;
    columnName: string;
    sortable: boolean;
    filterable: boolean;
    omit: boolean;
    renderCell?: (value: any, column: Column<FieldNames>, row: Record<FieldNames, any>) => React.ReactNode;
    setOptions?: string[];
    multiFilter?: boolean;
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

  type RowOptionMenuProps = { row: Record<FieldNames, any>; rowIndex: number; }

  type AppsPanelProps = { OmitColumns: React.ReactNode; }

  type ColumnConfig<FieldNames> = PartialKeys<Column<FieldNames>, "datatype" | "sortable" | "columnName" | "omit" | "filterable">[];

  interface Config<FieldNames> {

    data: Data[];
    columns: Datatable.ColumnConfig<FieldNames>;

    /**
     * The total number of records in the database.
     */
    count: number;

    /**
     * If serverSide is true, you need to handle the filters here and update data.
     */
    onFilter?: (filter: Filter<FieldNames>) => void;

    initialSortOrder?: Filter<FieldNames>["sortOrder"];
    initialPage?: Filter<FieldNames>["page"];
    initialOperationFilter?: Filter<FieldNames>["operationFilter"];
    initialSetFilter?: Filter<FieldNames>["setFilter"];

    /**
     * Default is true
     */
    serverSide?: boolean;
  }


  interface RichDatatableProps<Data extends Record<string, any>, FieldNames> {
    data?: Data[];
    isFetching?: boolean;
    columns: Datatable.ColumnConfig<FieldNames>;
    setFilter: Datatable.UseSetFilter.HookReturn<FieldNames>;
    operationFilter: Datatable.UseOperationFilter.HookReturn<string>;
    sortable: Datatable.UseSortable.HookReturn<FieldNames>;
    pagination: Datatable.UsePagination.HookReturn;
    selectable: Datatable.UseSelectable.HookReturn<FieldNames>;
    RowOptionMenu?: React.FC<RowOptionMenuProps>;
    AppsPanel?: React.FC<AppsPanelProps>;
    isSelectable?: (row: Record<FieldNames, any>) => boolean;
    NoData?: React.ReactNode;
    onRowClick?: (row: Record<FieldNames, any>, e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
    showOptionsOnRowClick?: boolean;
  }

  interface Filter<FieldNames> {
    sortOrder?: UseSortable.SortOrder<FieldNames>;
    page?: UsePagination.Page;
    operationFilter?: UseOperationFilter.OperationFilter<TextFilterOperations | RangeFilterOperations | BooleanFilterOperations>;
    setFilter?: UseSetFilter.SetFilter<FieldNames>;
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
    onColumnClick?: (column: Datatable.Column<FieldNames>) => void;

    RowOptionMenu?: React.FC<RowOptionMenuProps>
    AppsPanel?: React.ReactNode;

    renderFilter?: (column: Datatable.Column<FieldNames>, FilterMenu: React.FC<{ hasFilter: boolean; } & React.PropsWithChildren>) => React.ReactElement;
    renderSort?: (column: Datatable.Column<FieldNames>) => React.ReactElement;
    Footer?: React.ReactNode;

    hideSelect?: boolean;
    SelectHeader?: React.FC;
    SelectCell?: React.FC<{ index: number; row: Record<FieldNames, any> }>;
    NoData?: React.ReactNode;
    onRowClick?: (row: Record<FieldNames, any>, e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
    showOptionsOnRowClick?: boolean;
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

    interface Config<FieldNames> {
      numberOfRows: number;
      onChange: (selectable: { isAllSelected: boolean; selectedRows: number[] }) => void;
    }

    interface HookReturn<FieldNames> {
      Header: (props: HeaderProps) => JSX.Element | null;
      Row: (props: RowProps<FieldNames>) => JSX.Element | null;
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

    interface RowProps<FieldNames> {
      index: number;
      disabled: boolean;
      checked: boolean;
      onChange: (checked: boolean, rowIndex: number) => void;
    }

  }


  namespace UseSetFilter {

    interface Config<FieldNames> {
      onChange: (setFilter: SetFilter<FieldNames>) => void;
      initialSetFilter?: SetFilter<FieldNames>;
    }

    type SetFilter<FieldNames> = { [F in FieldNames]?: string[] };

    interface HookReturn<FieldNames> {
      SetFilter: (props: SetFilterProps) => JSX.Element | null;
      setFilter: SetFilter<FieldNames>;
      onSetFilter: (filter: SetFilter<FieldNames>) => void;
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

    type OperationFilter<Operation> = {
      [field: string]: OperationValue<Operation>
    };

    interface HookReturn<Operation> {
      OperationFilter: (props: OperationProps<Operation>) => JSX.Element | null;
      operationFilter: OperationFilter<Operation>;
      onSetOperationFilter: (filter: OperationFilter<Operation>) => void;
    }

    type BooleanFilterOperations = "Is true" | "Is false" | "Is blank";

    type RangeFilterOperations = "Equal" | "Not equal" | "Greater than or equal" | "Less than or equal" | "Greater than" | "Less than" | "Is blank";

    type TextFilterOperations = "Equal" | "Not equal" | "Contains" | "Starts with" | "Ends with" | "Is blank";

    interface OperationProps<Operation> {
      inputType?: "text" | "date" | "datetime-local" | "number";
      field: string;
      onChange: (result: UseOperationFilter.OperationFilter<Operation>) => void;
      filterOperations?: Operation[];
      currentValue?: UseOperationFilter.OperationValue<Operation>
      allowedOperations: Operation[];
    }

  }
}

declare function BaseDatatable<FieldNames extends string>(props: Datatable.DatatableProps<FieldNames>): react_jsx_runtime.JSX.Element;

declare function useDatatable<FieldNames>(config: Datatable.Config<FieldNames>): {
    data: Data[];
    columns: Datatable.ColumnConfig<FieldNames>;
    sortable: Datatable.UseSortable.HookReturn<string>;
    pagination: Datatable.UsePagination.HookReturn;
    selectable: Datatable.UseSelectable.HookReturn<string>;
    setFilter: Datatable.UseSetFilter.HookReturn<FieldNames>;
    operationFilter: Datatable.UseOperationFilter.HookReturn<string>;
    updateFilter: react.Dispatch<react.SetStateAction<Datatable.Filter<FieldNames>>>;
    Datatable: typeof RichDatatable;
};
declare function RichDatatable<Data extends Record<string, any>, FieldNames extends string>(props: Datatable.RichDatatableProps<Data, FieldNames>): react_jsx_runtime.JSX.Element;

interface Props<FieldNames extends string> {
    columns: Datatable.Column<FieldNames>[];
    setColumns: (callback: (columns: Datatable.Column<FieldNames>[]) => Datatable.Column<FieldNames>[]) => void;
}
declare function OmitColumn<FieldNames extends string>(config: Props<FieldNames>): react_jsx_runtime.JSX.Element;

declare function usePagination(config: Datatable.UsePagination.Config): Datatable.UsePagination.HookReturn;

declare function useSelectable<FieldNames extends string>(config: Datatable.UseSelectable.Config<FieldNames>): Datatable.UseSelectable.HookReturn<FieldNames>;

declare function useSortable<FieldNames extends string>(config: Datatable.UseSortable.Config<FieldNames>): Datatable.UseSortable.HookReturn<FieldNames>;

export { BaseDatatable, Datatable, OmitColumn, useDatatable, usePagination, useSelectable, useSortable };
