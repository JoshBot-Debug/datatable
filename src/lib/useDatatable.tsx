import React, { useEffect, useState } from "react";
import { BaseDatatable } from "./BaseDatatable";
import useSortable from "./features/useSortable";
import { getColumnDefaults } from "./helpers";
import usePagination from "./features/usePagination";
import useSelectable from "./features/useSelectable";
import OmitColumn from "./features/OmitColumn";
import { type Datatable } from "./types";
import useSetFilter from "./features/useSetFilter";
import useOperationFilter from "./features/useOperationFilter";
import { useClientSide } from "./features/useClientSIde";
import useEditableCell from "./features/useEditableCell";

const defaultPage: Datatable.UsePagination.Page = {
  currentPage: 1,
  rowsPerPage: [50, 100, 200],
  currentRowsPerPage: 50,
}

export default function useDatatable<Data extends Record<string, any>>(config: Datatable.Config<Data>) {

  const {
    columns,
    onFilter,
    initialSortOrder,
    initialPage = defaultPage,
    initialOperationFilter,
    onSubmitChanges,
    submitError,
    validateChanges,
    uniqueRowIdentifier,
  } = config;

  const defaultSetFilter = getInitialSetFilter(columns);
  const initialSetFilter = config.initialSetFilter ?? defaultSetFilter;

  const initialFilters = {
    sortOrder: initialSortOrder ?? {},
    page: initialPage ?? {},
    operationFilter: initialOperationFilter ?? {},
    setFilter: initialSetFilter ?? {}
  }

  const [filter, updateFilter] = useState<Datatable.Filter<Data>>(initialFilters);

  const { data, count, numberOfRows } = useClientSide<Data>(filter, config.data, config.count, config.serverSide);

  const sortable = useSortable<Data>({ initialSortOrder, onChange: sortOrder => updateFilter(prev => ({ ...prev, sortOrder })) });
  const pagination = usePagination({ initialPage, count, numberOfRows, defaultPage, onChange: page => updateFilter(prev => ({ ...prev, page })) });
  const selectable = useSelectable({ numberOfRows, onChange: select => updateFilter(prev => ({ ...prev, select })) });
  const setFilter = useSetFilter<Data>({ initialSetFilter, defaultSetFilter, onChange: setFilter => updateFilter(prev => ({ ...prev, setFilter })) });
  const operationFilter = useOperationFilter<Data, Datatable.AllOperations>({ initialOperationFilter, onChange: operationFilter => updateFilter(prev => ({ ...prev, operationFilter })) });
  const editableCells = useEditableCell<Data>({ onSubmitChanges, uniqueRowIdentifier, submitError, validateChanges });

  useEffect(() => { onFilter && onFilter(filter); }, [filter]);

  /**
   * If useInitialFilters is true, the datatable filters will be reset to the initialFilters.
   * If useInitialFilters is false, all filters will be cleared.
   * @param useInitialFilters reset and use initial filter?
   * @default useInitialFilters false
   */
  const reset = (useInitialFilters?: boolean) => {
    selectable.reset();
    const resetValue = {
      sortOrder: sortable.reset(useInitialFilters ? undefined : {}),
      page: pagination.reset(undefined, !useInitialFilters),
      operationFilter: operationFilter.reset(useInitialFilters ? undefined : {}),
      setFilter: setFilter.reset(undefined, !useInitialFilters)
    }
    updateFilter(resetValue);
  }

  const getFilters = (): Datatable.InitialFilters<Data> => ({
    initialSortOrder: sortable.sortOrder,
    initialOperationFilter: operationFilter.operationFilter,
    initialSetFilter: setFilter.setFilter,
    initialPage: pagination.page
  })

  const setFilters = (initialFilters: Datatable.InitialFilters<Data>) => {
    selectable.reset();
    const resetValue = {
      sortOrder: sortable.reset(initialFilters.initialSortOrder),
      page: pagination.reset(initialFilters.initialPage),
      operationFilter: operationFilter.reset(initialFilters.initialOperationFilter),
      setFilter: setFilter.reset(initialFilters.initialSetFilter)
    }
    updateFilter(resetValue)
  }

  return {
    data,
    columns,
    sortable,
    pagination,
    selectable,
    setFilter,
    operationFilter,
    editableCells,
    updateFilter,
    Datatable: RichDatatable,
    reset,
    getFilters,
    setFilters,
  }
}


function getInitialSetFilter<Data extends Record<string, any>>(columns: Datatable.ColumnConfig<Data>): Datatable.UseSetFilter.SetFilter<Data> {
  return columns.reduce((r, c) => c.setOptions ? { ...r, [(c.field as string)]: c.setOptions } : r, {})
}


const text = ["Contains", "Equal", "Not equal", "Starts with", "Ends with", "Is blank", "Not blank"];
const number = ["Equal", "Not equal", "Is blank", "Not blank", "Greater than", "Greater than or equal", "Less than", "Less than or equal"];
const date = ["Equal", "Not equal", "Is blank", "Not blank", "Greater than", "Greater than or equal", "Less than", "Less than or equal"];
const boolean = ["Is true", "Is false", "Is blank", "Not blank"];


const columnOperations: { [K in Datatable.Datatype]: { operation: any[], inputType: Datatable.UseOperationFilter.OperationProps<any, any>["inputType"]; } } = {
  boolean: { inputType: undefined, operation: boolean },
  time: { inputType: "time", operation: date },
  date: { inputType: "date", operation: date },
  datetime: { inputType: "datetime-local", operation: date },
  email: { inputType: "text", operation: text },
  image: { inputType: "text", operation: text },
  link: { inputType: "text", operation: text },
  name: { inputType: "text", operation: text },
  number: { inputType: "number", operation: number },
  paragraph: { inputType: "text", operation: text },
  phone: { inputType: "text", operation: text },
  string: { inputType: "text", operation: text },
}

const editRows: { [K in Datatable.Datatype]: string } = {
  boolean: "boolean",
  time: "time",
  date: "date",
  datetime: "datetime-local",
  email: "text",
  image: "text",
  link: "text",
  name: "text",
  number: "number",
  paragraph: "textarea",
  phone: "text",
  string: "text",
}


function RichDatatable<Data extends Record<string, any>>(props: Datatable.RichDatatableProps<Data>) {

  const {
    data = [],
    isFetching,
    setFilter,
    sortable,
    selectable,
    pagination,
    operationFilter,
    RowOptionMenu,
    AppsPanel,
    isSelectable,
    NoData,
    onRowClick,
    showOptionsOnRowClick,
    minColumnSize,
    columnNameFontSize,
    editableCells
  } = props;

  const { Pagination, ...paginationController } = pagination;
  const { Header, Row, ...selectableController } = selectable;
  const { OperationFilter, ...operationFilterController } = operationFilter;
  const { SetFilter, ...setFilterController } = setFilter;
  const { Sort, ...sortableController } = sortable;
  const { EditableCell, ...editableCellsController } = editableCells;

  const [columns, setColumns] = useState(getColumnDefaults(props.columns as Partial<Datatable.Column<Data>>[]));

  const renderFilter = (column: Datatable.Column<Data>, FilterMenu: React.FC<{ hasFilter: boolean; } & React.PropsWithChildren>) => {
    const hasSetOptions = !!column.setOptions;
    const hasFilterOptions = !!column.filterOperations;
    const hasSetFilter = !!(column.setOptions && setFilter.setFilter[column.field]?.length !== column.setOptions.length);
    const hasOperationFilter = !!operationFilterController.operationFilter[column.field];
    return (
      <FilterMenu hasFilter={hasOperationFilter || hasSetFilter}>
        {
          ((!hasSetOptions || hasFilterOptions) || column.multiFilter) && (
            <OperationFilter
              field={column.field}
              datatype={column.datatype}
              inputType={columnOperations[column.datatype].inputType}
              filterOperations={column.filterOperations}
              allowedOperations={columnOperations[column.datatype].operation}
              onChange={operationFilterController.onSetOperationFilter}
              currentValue={operationFilterController.operationFilter[column.field]}
              {...props}
            />
          )
        }
        {
          hasSetOptions && (
            <>
              <span className="divider" />
              <SetFilter
                field={String(column.field)}
                onChange={setFilterController.onSetFilter}
                options={column.setOptions ?? []}
                defaultValue={setFilterController.setFilter[column.field] ?? []}
              />
            </>
          )
        }
      </FilterMenu>
    )
  }

  const renderSort = (column: Datatable.Column<Data>) => {
    return (
      <Sort
        key={String(column.field)}
        column={column}
        sortDirection={sortableController.sortOrder[column.field]?.sortDirection}
        orderIndex={sortableController.sortOrder[column.field]?.orderIndex}
        isMultiSort={Object.keys(sortableController.sortOrder).length > 1}
      />
    )
  }

  const renderCell: Datatable.DatatableProps<Data>["renderCell"] = (column, row, Cell) => {
    if (!editableCellsController.isEditable) return <>{Cell}</>;
    const isDirty = editableCellsController.isDirty(row, column.field);
    const value = editableCellsController.dirtyValue(row, column.field);
    if (column.editable === false) return Cell;
    return (
      <Hover className="edit-row-cell">
        {isHover => (
          <>
            {
              isDirty
                ? (
                  <EditableCell
                    value={value === undefined ? row[column.field as any] : value}
                    onChange={value => editableCellsController.onChange(row, column.field, value)}
                    inputType={editRows[column.datatype]}
                    setOptions={column.setOptions}
                    error={!editableCellsController.validationErrors ? undefined : editableCellsController.validationErrors[column.field]}
                  />
                )
                : Cell
            }
            <button
              type="button"
              className={`edit-row-button ${isHover ? 'edit-row-button-hover' : ''}`}
              onClick={e => { e.stopPropagation(); editableCellsController.onEdit(row, column.field, isDirty); }}
            >
              {isDirty ? <IoCloseOutline /> : <IoPencil />}
            </button>
          </>
        )}
      </Hover>
    )
  }

  const renderHeaderPanel = () => {
    const isDirty = editableCellsController.isDirty();
    if (!isDirty || !editableCellsController.isEditable) return null;
    return (
      <div className="table-header-panel">
        <div className="table-header-panel-row">
          <button disabled={editableCellsController.isSaving} className={`table-header-panel-button ${editableCellsController.isSaving ? "table-header-panel-button-disabled" : ""}`} type="button" onClick={editableCellsController.save}><IoCheckmarkOutline />Save</button>|
          <button disabled={editableCellsController.isSaving} className={`table-header-panel-button ${editableCellsController.isSaving ? "table-header-panel-button-disabled" : ""}`} type="button" onClick={editableCellsController.cancel}><IoCloseOutline />Cancel</button>
          {editableCellsController.submitError && <span title={editableCellsController.submitError} className="save-error-message">{editableCellsController.submitError}</span>}
        </div>
      </div>
    )
  }

  const SelectHeader = () => (
    <Header
      selectAll={selectableController.selectAll}
      isAllSelected={selectableController.isAllSelected}
    />
  )

  const SelectCell = ({ row, index }: { index: number; row: Data; }) => {
    const enabled = !isSelectable ? true : isSelectable(row);
    useEffect(() => { selectable.onDisableRow(!enabled, index); }, [enabled])
    return (
      <Row
        index={index}
        disabled={!enabled}
        checked={selectableController.selectedRows.includes(index)}
        onChange={selectableController.onSelectRow}
      />
    )
  }

  return (
    <BaseDatatable
      data={data}
      isFetching={isFetching}
      columns={columns}
      renderFilter={renderFilter}
      renderSort={renderSort}
      onColumnClick={col => col.sortable && sortable.onSort(col)}
      RowOptionMenu={RowOptionMenu}
      hideSelect={!isSelectable}
      SelectHeader={SelectHeader}
      SelectCell={SelectCell}
      NoData={NoData}
      onRowClick={onRowClick}
      showOptionsOnRowClick={showOptionsOnRowClick}
      minColumnSize={minColumnSize}
      columnNameFontSize={columnNameFontSize}
      renderCell={renderCell}
      renderHeaderPanel={renderHeaderPanel}
      Footer={
        !Pagination
          ? null
          : <Pagination {...paginationController} />
      }
      AppsPanel={
        <>
          {!AppsPanel && <OmitColumn columns={columns} setColumns={setColumns} />}
          {!!AppsPanel && (<AppsPanel OmitColumns={<OmitColumn columns={columns} setColumns={setColumns} />} />)}
        </>
      }
    />
  )
}


function Hover(props: { className?: string; children: (isHover: boolean) => React.ReactNode }) {

  const [isHover, setIsHover] = useState(false);

  return (
    <span
      className={props.className}
      onMouseOver={() => setIsHover(true)}
      onMouseLeave={() => setIsHover(false)}
    >
      {props.children(isHover)}
    </span>
  )
}

function IoPencil() {

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 512 512"
      className="header-svg io-pencil"
    >
      <path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="44" d="M358.62 129.28L86.49 402.08 70 442l39.92-16.49 272.8-272.13-24.1-24.1zM413.07 74.84l-11.79 11.78 24.1 24.1 11.79-11.79a16.51 16.51 0 000-23.34l-.75-.75a16.51 16.51 0 00-23.35 0z" />
    </svg>
  )
}

function IoCloseOutline() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 512 512"
      className="header-svg io-close-outline"
    >
      <path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="32" d="M368 368L144 144M368 144L144 368" />
    </svg>
  )
}

function IoCheckmarkOutline() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 512 512"
      className="header-svg io-checkmark-outline"
    >
      <path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="32" d="M416 128L192 384l-96-96" />
    </svg>
  )
}