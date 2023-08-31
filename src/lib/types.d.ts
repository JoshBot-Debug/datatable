
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

    /**
     * @default true
     */
    editable?: boolean;
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

  interface Config<Data extends Record<string, any>> extends InitialFilters<Data> {

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

    /**
     * Default is true
     */
    serverSide?: boolean;


    onSubmitChanges?: (dirtyRows: Data[]) => Promise<any>;
    submitError?: string;

    /**
     * An object that contains a validation function called on all keys of data.
     * Return an error message from the function if there is an error, null otherwise
     */
    validateChanges?: { [K in keyof Data]?: (value: string) => string | null };

    /**
     * When using onSaveChanges, you must specify a unique field to identify a row.
     * @default "id"
     */
    uniqueRowIdentifier?: string;
  }

  interface InitialFilters<Data extends Record<string, any>> {
    initialSortOrder?: Filter<Data>["sortOrder"];
    initialPage?: Filter<Data>["page"];
    initialOperationFilter?: Filter<Data>["operationFilter"];
    initialSetFilter?: Filter<Data>["setFilter"];
  }

  namespace EditableCells {

    type HookReturn<Data extends Record<string, any>> = {
      isEditable: boolean;
      EditableCell: (props: { error?: string; inputType?: string; value: string; onChange: (value: any) => void; setOptions?: string[]; }) => React.ReactElement;
      onChange: (row: Data, field: string | number | symbol, value: any) => void;
      onEdit: (row: Data, field: string | number | symbol, cancelEdit: boolean) => void;
      isDirty: (row?: Data, field?: string | number | symbol) => boolean;
      dirtyValue: (row: Data, field: string | number | symbol) => string | undefined;
      save: () => Promise<void>;
      cancel: () => void;
      isSaving: boolean;
      submitError?: string;
      validationErrors?: { [K in keyof Data]?: string }
    }

    interface Config<Data extends Record<string, any>> {
      submitError?: string;
      onSubmitChanges?: (dirtyRows: Data[]) => Promise<any>;
      uniqueRowIdentifier?: string;
      validateChanges?: { [K in keyof Data]?: (value: string) => string | null };
    }

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
    editableCells: Datatable.EditableCells.HookReturn<Data>;
    RowOptionMenu?: React.FC<RowOptionMenuProps<Data>>;
    AppsPanel?: React.FC<AppsPanelProps>;
    isSelectable?: (row: Data) => boolean;
    NoData?: React.ReactNode;
    onRowClick?: (row: Data, e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
    showOptionsOnRowClick?: boolean;

    /**
     * If specified, this will be the minimum column width.
     * The prop "columnNameFontSize" will be ignored.
     */
    minColumnSize?: number;

    /**
     * Is specified, the column width will be autocalculated based on the number of characters and the fontsize of the column name.
     * If the prop "minColumnSize" is set, this prop will be ignored.
     * The column size may not fit the column name, this will not ensure that the column name will be visible. If you want the column name to be visible,
     * on the column, set the "width" prop.
     */
    columnNameFontSize?: number;
  }

  type AllOperations = UseOperationFilter.TextFilterOperations | UseOperationFilter.RangeFilterOperations | UseOperationFilter.BooleanFilterOperations;

  interface Filter<Data extends Record<string, any>> {
    sortOrder: UseSortable.SortOrder<Data>;
    page: UsePagination.Page;
    operationFilter: UseOperationFilter.OperationFilter<Data, AllOperations>;
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

    minColumnSize?: number;
    columnNameFontSize?: number;
    renderCell?: (column: Datatable.Column<Data>, row: Data, Cell: React.ReactNode) => React.ReactNode;
    renderHeaderPanel?: () => React.ReactNode;
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
      reset: (filter?: SortOrder<Data>) => SortOrder<Data>;
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
      defaultPage: Page;
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
      reset: (filter?: Page, useDefaultPage?: boolean) => Page;
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
      reset: () => boolean;
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
      initialSetFilter?: UseSetFilter.SetFilter<Data>;
      defaultSetFilter: UseSetFilter.SetFilter<Data>;
    }

    type SetFilter<Data extends Record<string, any>> = { [K in keyof Data]?: string[] };

    interface HookReturn<Data extends Record<string, any>> {
      SetFilter: (props: SetFilterProps) => JSX.Element | null;
      setFilter: SetFilter<Data>;
      onSetFilter: (filter: SetFilter<Data>) => void;
      reset: (filter?: SetFilter<Data>, useDefaultFilter?: boolean) => Datatable.UseSetFilter.SetFilter<Data>;
    }


    interface SetFilterProps {
      field: string;
      options: string[];
      onChange: (result: SetFilter) => void;
      defaultValue?: string[]
    }

  }

  namespace UseOperationFilter {

    interface Config<Data extends Record<string, any>, Operation> {
      onChange: (setFilter: SetFilter) => void;
      initialOperationFilter?: OperationFilter<Data, Operation>;
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
      reset: (filter?: OperationFilter<Data, Operation>) => OperationFilter<Data, Operation>;
    }

    type BooleanFilterOperations = "Is true" | "Is false" | "Is blank" | "Not blank";

    type RangeFilterOperations = "Equal" | "Not equal" | "Greater than or equal" | "Less than or equal" | "Greater than" | "Less than" | "Is blank" | "Not blank";

    type TextFilterOperations = "Equal" | "Not equal" | "Contains" | "Starts with" | "Ends with" | "Is blank" | "Not blank";

    interface OperationProps<Data extends Record<string, any>, Operation> {
      inputType?: "text" | "date" | "datetime-local" | "number" | "time";
      field: keyof Data;
      datatype: Datatype;
      onChange: (result: UseOperationFilter.OperationFilter<Data, Operation>) => void;
      filterOperations?: Operation[];
      currentValue?: UseOperationFilter.OperationValue<Operation>
      allowedOperations: Operation[];
    }

  }
}