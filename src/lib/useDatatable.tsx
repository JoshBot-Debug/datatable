import { useEffect, useState } from "react";
import { BaseDatatable } from "./BaseDatatable";
import useSortable from "./features/useSortable";
import { getColumnDefaults } from "./helpers";
import usePagination from "./features/usePagination";
import useSelectable from "./features/useSelectable";
import OmitColumn from "./features/OmitColumn";
import { OperationFilter } from "./features/OperationFilter";
import { Datatable } from "./types";
import SetFilter from "./features/SetFilter";
import useSetFilter from "./features/useSetFilter";
import useOperationFilter from "./features/useOperationFilter";


export default function useDatatable<FieldNames>(config: Datatable.Config<FieldNames>) {

  const {
    count,
    numberOfRows,
    onFilter,
    initialSortOrder,
    initialPage = {
      currentPage: 1,
      rowsPerPage: [50, 100, 200, 500],
      currentRowsPerPage: 50,
    },
    initialOperationFilter,
    initialSetFilter,
  } = config;

  const [filter, updateFilter] = useState<Datatable.Filter<FieldNames>>({
    sortOrder: initialSortOrder,
    page: initialPage,
    operationFilter: initialOperationFilter,
    setFilter: initialSetFilter
  });

  const sortable = useSortable({ initialSortOrder, onChange: sortOrder => onFilter && updateFilter(prev => ({ ...prev, sortOrder })) });
  const pagination = usePagination({ initialPage, count: count, numberOfRows, onChange: page => onFilter && updateFilter(prev => ({ ...prev, page })) });
  const selectable = useSelectable({ numberOfRows, onChange: select => onFilter && updateFilter(prev => ({ ...prev, select })) });
  const setFilter = useSetFilter({ initialSetFilter, onChange: setFilter => onFilter && updateFilter(prev => ({ ...prev, setFilter })) });
  const operationFilter = useOperationFilter({ initialOperationFilter, onChange: operationFilter => onFilter && updateFilter(prev => ({ ...prev, operationFilter })) });

  useEffect(() => { onFilter && onFilter(filter); }, [filter]);

  return {
    sortable,
    pagination,
    selectable,
    setFilter,
    operationFilter,
    updateFilter,
    Datatable: RichDatatable
  }
}


const text = ["Contains", "Equal", "Not equal", "Starts with", "Ends with", "Is blank"];
const number = ["Equal", "Not equal", "Is blank", "Greater than", "Greater than or equal", "Less than", "Less than or equal"];
const date = ["Equal", "Not equal", "Is blank", "Greater than", "Greater than or equal", "Less than", "Less than or equal"];
const boolean = ["Is true", "Is false", "Is blank"];


const columnOperations: { [K in Datatable.Datatype]: { operation: any[], inputType: Datatable.FilterComponentProps<any>["inputType"]; } } = {
  boolean: { inputType: undefined, operation: boolean },
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


function RichDatatable<Data extends Record<string, any>, FieldNames extends string>(props: Datatable.RichDatatableProps<Data, FieldNames>) {

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
    isSelectable
  } = props;

  const [columns, setColumns] = useState(getColumnDefaults<any>(props.columns as Partial<Datatable.Column<string>>[]));

  const renderFilter = (column: Datatable.Column<FieldNames>, FilterMenu: React.FC<{ hasFilter: boolean; } & React.PropsWithChildren>) => {
    const hasSetOptions = !!column.setOptions;
    const hasFilterOptions = !!column.filterOperations;
    return (
      <FilterMenu hasFilter={!!operationFilter.operationFilter[column.field]}>
        {
          ((!hasSetOptions || hasFilterOptions) || column.multiFilter) && (
            <OperationFilter
              field={column.field}
              inputType={columnOperations[column.datatype].inputType}
              filterOperations={column.filterOperations}
              allowedOperations={columnOperations[column.datatype].operation}
              onChange={operationFilter.onSetOperationFilter}
              defaultValue={operationFilter.operationFilter[column.field]}
              {...props}
            />
          )
        }
        {
          hasSetOptions && (
            <>
              <span className="divider" />
              <SetFilter
                field={column.field}
                onChange={setFilter.onSetFilter}
                options={column.setOptions ?? []}
                defaultValue={setFilter.setFilter[column.field] ?? []}
              />
            </>
          )
        }
      </FilterMenu>
    )
  }

  const renderSort = (column: Datatable.Column<FieldNames>) => {
    return (
      <sortable.Sort
        key={column.field}
        column={column}
        sortDirection={sortable.sortOrder[column.field]?.sortDirection}
        orderIndex={sortable.sortOrder[column.field]?.orderIndex}
        isMultiSort={Object.keys(sortable.sortOrder).length > 1}
      />
    )
  }

  const SelectHeader = () => (
    <selectable.Header
      selectAll={selectable.selectAll}
      isAllSelected={selectable.isAllSelected}
    />
  )

  const SelectCell = ({ row, index }: { index: number; row: Record<FieldNames, any>; }) => {
    const enabled = !isSelectable ? true : isSelectable(row);
    useEffect(() => { selectable.onDisableRow(!enabled, index); }, [enabled])
    return (
      <selectable.Row
        index={index}
        disabled={!enabled}
        checked={selectable.selectedRows.includes(index)}
        onChange={selectable.onSelectRow}
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
      onColumnClick={sortable.onSort}
      RowOptionMenu={RowOptionMenu}
      hideSelect={!isSelectable}
      SelectHeader={SelectHeader}
      SelectCell={SelectCell}
      Footer={
        !pagination?.Pagination
          ? null
          : (
            <pagination.Pagination
              currentPage={pagination.page.currentPage}
              count={pagination.count}
              rowsPerPage={pagination.page.rowsPerPage}
              currentRowsPerPage={pagination.page.currentRowsPerPage}
              numberOfRows={pagination.numberOfRows}
              firstPage={pagination.firstPage}
              lastPage={pagination.lastPage}
              nextPage={pagination.nextPage}
              previousPage={pagination.previousPage}
              goToPage={pagination.goToPage}
              onChangeRowsPerPage={pagination.onChangeRowsPerPage}
            />
          )
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

