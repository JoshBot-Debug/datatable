import { useCallback, useEffect, useState } from "react";
import { BaseDatatable } from "./BaseDatatable";
import useSortable from "./features/useSortable";
import { getColumnDefaults } from "./helpers";
import usePagination from "./features/usePagination";
import useSelectable from "./features/useSelectable";
import OmitColumn from "./features/OmitColumn";
import { OperationFilter } from "./features/OperationFilter";
import { Datatable } from "./types";
import SetFilter from "./features/SetFilter";
import { useMountLog } from "../helper";


export default function useDatatable<Data extends Record<string, any>, FieldNames extends keyof Data>(config: Datatable.Config<Data, FieldNames>) {

  const {
    data = [],
    isFetching,
    count,
    onFilter,
    initialSortOrder,
    initialPage,
    initialFilter,
    isSelectable,
    RowOptionMenu,
    AppsPanel,
  } = config;


  const [filter, setFilter] = useState<Datatable.Filter<FieldNames>>({
    sortOrder: initialSortOrder,
    page: initialPage,
    filter: initialFilter
  });

  const [columns, setColumns] = useState(getColumnDefaults<any>(config.columns as Partial<Datatable.Column<string>>[]));


  const sortable = useSortable({ initialSortOrder, onChange: sortOrder => onFilter && setFilter(prev => ({ ...prev, sortOrder })) });
  const pagination = usePagination({ initialPage, count: count, numberOfRows: data.length, onChange: page => onFilter && setFilter(prev => ({ ...prev, page })) });
  const selectable = useSelectable({ isSelectable: isSelectable as any, numberOfRows: data.length, onChange: select => onFilter && setFilter(prev => ({ ...prev, select })) });


  useMountLog("useDatatable")

  useEffect(() => { onFilter && onFilter(filter); }, [filter]);


  const onOperationFilter = (operationFilter: Datatable.OperationFilter<any>) => {
    if (!onFilter) return;
    setFilter(prev => {
      const next = { ...prev }
      if (!next.filter) return { ...next, filter: [operationFilter] };
      const currentIndex = next.filter.findIndex(v => v.field === operationFilter.field);
      if (currentIndex === -1) return { ...next, filter: [...next.filter, operationFilter] }
      next.filter[currentIndex] = operationFilter;
      return next
    })
  }

  const getFilterDefault = (field: string) => (filter.filter ?? []).find(f => f.field === field)


  const onSetFilter = (filter: Datatable.SetFilter) => {
    if (!onFilter) return;
    setFilter(prev => {
      const next = { ...prev }
      if (!next.setFilter) return { ...next, setFilter: [filter] };
      const currentIndex = next.setFilter.findIndex(v => v.field === filter.field);
      if (currentIndex === -1) return { ...next, setFilter: [...next.setFilter, filter] }
      next.setFilter[currentIndex] = filter;
      return next
    })
  }

  const SetFilterComponent = useCallback((props: Datatable.DatatableFilterProps<any>) => (
    <SetFilter
      field={props.field}
      onChange={onSetFilter}
      options={props.setOptions ?? []}
    />
  ), [])

  const showOperationFilter = (props: Datatable.DatatableFilterProps<any>) => ((props.filterOperations && props.setOptions) || (!props.setOptions) || (props.multiFilter))

  const TextFilter = useCallback((props: Datatable.DatatableFilterProps<any>) => (
    <>
      {
        showOperationFilter(props) && (
          <OperationFilter
            inputType="text"
            allowedOperations={["Contains", "Equal", "Not equal", "Starts with", "Ends with", "Is blank"] as Datatable.TextFilterOperations[]}
            onChange={onOperationFilter}
            defaultValue={getFilterDefault(props.field)}
            {...props}
          />
        )
      }
      {
        props.setOptions && (
          <>
            <span className="divider" />
            <SetFilterComponent field={props.field} datatype={props.datatype} setOptions={props.setOptions} />
          </>
        )
      }
    </>
  ), [])

  const NumberFilter = useCallback((props: Datatable.DatatableFilterProps<any>) => (
    <>
      {
        showOperationFilter(props) && (
          <OperationFilter
            inputType="number"
            allowedOperations={["Equal", "Not equal", "Is blank", "Greater than", "Greater than or equal", "Less than", "Less than or equal"] as Datatable.RangeFilterOperations[]}
            onChange={onOperationFilter}
            defaultValue={getFilterDefault(props.field)}
            {...props}
          />
        )
      }
      {
        props.setOptions && (
          <>
            <span className="divider" />
            <SetFilterComponent field={props.field} datatype={props.datatype} setOptions={props.setOptions} />
          </>
        )
      }
    </>
  ), [])

  const DateFilter = useCallback((props: Datatable.DatatableFilterProps<any>) => (
    <>
      {
        showOperationFilter(props) && (
          <OperationFilter
            inputType={props.datatype === "date" ? "date" : "datetime"}
            allowedOperations={["Equal", "Not equal", "Is blank", "Greater than", "Greater than or equal", "Less than", "Less than or equal"] as Datatable.RangeFilterOperations[]}
            onChange={onOperationFilter}
            defaultValue={getFilterDefault(props.field)}
            {...props}
          />
        )
      }
      {
        props.setOptions && (
          <>
            <span className="divider" />
            <SetFilterComponent field={props.field} datatype={props.datatype} setOptions={props.setOptions} />
          </>
        )
      }
    </>
  ), [])

  const BooleanFilter = useCallback((props: Datatable.DatatableFilterProps<any>) => (
    <OperationFilter
      allowedOperations={["Is true", "Is false", "Is blank"] as Datatable.BooleanFilterOperations[]}
      onChange={onOperationFilter}
      defaultValue={getFilterDefault(props.field)}
      {...props}
    />
  ), [])

  return {
    sortable,
    pagination,
    selectable,
    setFilter,
    Datatable: <BaseDatatable
      data={data}
      isFetching={isFetching}
      columns={columns}
      sortable={sortable}
      pagination={pagination}
      selectable={selectable}
      RowOptionMenu={RowOptionMenu}
      TextFilter={TextFilter}
      NumberFilter={NumberFilter}
      DateFilter={DateFilter}
      BooleanFilter={BooleanFilter}
      AppsPanel={
        <>
          {!AppsPanel && <OmitColumn columns={columns} setColumns={setColumns} />}
          {!!AppsPanel && (<AppsPanel DefaultComponents={<OmitColumn columns={columns} setColumns={setColumns} />} />)}
        </>
      }
    />
  }
}