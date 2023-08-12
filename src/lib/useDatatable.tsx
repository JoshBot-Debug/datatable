import { useEffect, useState } from "react";
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

export default function useDatatable<Data extends Record<string, any>>(config: Datatable.Config<Data>) {

  const {
    columns,
    onFilter,
    initialSortOrder,
    initialPage = {
      currentPage: 1,
      rowsPerPage: [50, 100, 200],
      currentRowsPerPage: 50,
    },
    initialOperationFilter,
  } = config;

  const initialSetFilter = config.initialSetFilter ?? getInitialSetFilter(columns);

  const initialFilters = {
    sortOrder: initialSortOrder ?? {},
    page: initialPage ?? {},
    operationFilter: initialOperationFilter ?? {},
    setFilter: initialSetFilter ?? {}
  }

  const [filter, updateFilter] = useState<Datatable.Filter<Data>>(initialFilters);

  const { data, count, numberOfRows } = useClientSide<Data>(filter, config.data, config.count, config.serverSide);

  const sortable = useSortable<Data>({ initialSortOrder, onChange: sortOrder => updateFilter(prev => ({ ...prev, sortOrder })) });
  const pagination = usePagination({ initialPage, count, numberOfRows, onChange: page => updateFilter(prev => ({ ...prev, page })) });
  const selectable = useSelectable({ numberOfRows, onChange: select => updateFilter(prev => ({ ...prev, select })) });
  const setFilter = useSetFilter<Data>({ initialSetFilter, onChange: setFilter => updateFilter(prev => ({ ...prev, setFilter })) });
  const operationFilter = useOperationFilter<Data, string>({ initialOperationFilter, onChange: operationFilter => updateFilter(prev => ({ ...prev, operationFilter })) });

  useEffect(() => { onFilter && onFilter(filter); }, [filter]);

  const reset = (useInitialFilters: boolean = true) => {
    sortable.reset();
    pagination.reset();
    selectable.reset();
    setFilter.reset();
    operationFilter.reset();
    updateFilter(
      useInitialFilters
        ? initialFilters
        : {
          sortOrder: {},
          page: {},
          operationFilter: {},
          setFilter: {}
        } as any
    );
  }

  return {
    data,
    columns,
    sortable,
    pagination,
    selectable,
    setFilter,
    operationFilter,
    updateFilter,
    Datatable: RichDatatable,
    reset,
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
  } = props;

  const { Pagination, ...paginationController } = pagination;
  const { Header, Row, ...selectableController } = selectable;
  const { OperationFilter, ...operationFilterController } = operationFilter;
  const { SetFilter, ...setFilterController } = setFilter;
  const { Sort, ...sortableController } = sortable;

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

