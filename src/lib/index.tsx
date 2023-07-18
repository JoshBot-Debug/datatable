import { useCallback, useEffect, useState } from "react";
import { Datatable } from "./Datatable";
import useSortable from "./features/useSortable";
import { getColumnDefaults } from "./helpers";
import usePagination from "./features/usePagination";
import useSelectable from "./features/useSelectable";
import OmitColumn from "./features/OmitColumn";
import { TextFilter } from "./features/filters/TextFilter";

// TODO if not other return other than a component, convert the hook to a component
export function useDatatable<Data extends Record<string, any>, FieldNames extends keyof Data>(config: UseDatatable.Config<Data, FieldNames>) {

  const {
    data = [],
    isFetching,
    count,
    onFilter,
    initialSortOrder,
    initialPage,
    isSelectable,
    RowOptionMenu,
  } = config;

  const [filter, setFilter] = useState<UseDatatable.Filter>({
    sortOrder: initialSortOrder,
    page: initialPage,
  });

  const [columns, setColumns] = useState(getColumnDefaults<any>(config.columns as Partial<UseDatatable.Column<string>>[]));

  const sortable = useSortable({ initialSortOrder, onChange: sortOrder => onFilter && setFilter(prev => ({ ...prev, sortOrder })) });
  const pagination = usePagination({ initialPage, count: count, numberOfRows: data.length, onChange: page => onFilter && setFilter(prev => ({ ...prev, page })) });
  const selectable = useSelectable({ isSelectable: isSelectable as any, numberOfRows: data.length, onChange: select => onFilter && setFilter(prev => ({ ...prev, select })) });

  useEffect(() => { onFilter && onFilter(filter); }, [filter]);

  const TextFilterComponent = useCallback((props: { field: string; filterOperations?: string[] }) => (
    <TextFilter
      onChange={console.log}
      field={props.field}
      filterOperations={props.filterOperations}
    />
  ), [])

  return (
    <Datatable
      data={data}
      isFetching={isFetching}
      columns={columns}
      sortable={sortable}
      pagination={pagination}
      selectable={selectable}
      RowOptionMenu={RowOptionMenu}
      TextFilter={TextFilterComponent}
      AppsPanel={(
        <>
          <OmitColumn columns={columns} setColumns={setColumns} />
        </>
      )}
    />
  )
}