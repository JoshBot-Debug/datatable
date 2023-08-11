
export declare namespace Datatable {

  type PartialKeys<T, K extends keyof T> = Partial<Pick<T, K>> & Omit<T, K>;

  type Include<T, U> = T extends U ? T : never

  type Datatype = "string" | "boolean" | "date" | "datetime" | "image" | "link" | "email" | "phone" | "name" | "paragraph" | "number" | "time";

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
    datatype: Include<Datatype, "date" | "datetime" | "number" | "time">;
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
    operationFilter: Datatable.UseOperationFilter.HookReturn<Data, any>;
    sortable: Datatable.UseSortable.HookReturn<Data>;
    pagination: Datatable.UsePagination.HookReturn;
    selectable: Datatable.UseSelectable.HookReturn;
    RowOptionMenu?: React.FC<RowOptionMenuProps<Data>>;
    AppsPanel?: React.FC<AppsPanelProps>;
    isSelectable?: (row: Data) => boolean;
    NoData?: React.ReactNode;
    onRowClick?: (row: Data, e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
    showOptionsOnRowClick?: boolean;
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
    width?: number;
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
  }



  namespace UseSortable {

    interface Config<Data extends Record<string, any>> {
      initialSortOrder?: SortOrder<Data>;
      onChange: (sortOrder: SortOrder<Data>) => void;
    }

    interface HookReturn<Data extends Record<string, any>> {
      sortOrder: SortOrder<Data>;
      Sort: (props: SortProps<Data>) => JSX.Element | null;
      onSort: (column: DatatableColumn<Data>) => void;
      reset: () => void;
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
      reset: () => void;
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
      reset: () => void;
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
      reset: () => void;
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
      [K in keyof Data]?: OperationValue<Operation>
    };

    interface HookReturn<Data extends Record<string, any>, Operation> {
      OperationFilter: (props: OperationProps<Data, Operation>) => JSX.Element | null;
      operationFilter: OperationFilter<Data, Operation>;
      onSetOperationFilter: (filter: OperationFilter<Data, Operation>) => void;
      reset: () => void;
    }

    type BooleanFilterOperations = "Is true" | "Is false" | "Is blank" | "Not blank";

    type RangeFilterOperations = "Equal" | "Not equal" | "Greater than or equal" | "Less than or equal" | "Greater than" | "Less than" | "Is blank" | "Not blank";

    type TextFilterOperations = "Equal" | "Not equal" | "Contains" | "Starts with" | "Ends with" | "Is blank" | "Not blank";

    interface OperationProps<Data extends Record<string, any>, Operation> {
      inputType?: "text" | "date" | "datetime-local" | "number" | "time";
      field: keyof Data;
      onChange: (result: UseOperationFilter.OperationFilter<Data, Operation>) => void;
      filterOperations?: Operation[];
      currentValue?: UseOperationFilter.OperationValue<Operation>
      allowedOperations: Operation[];
    }

  }
}