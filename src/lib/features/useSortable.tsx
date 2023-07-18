import { useEffect, useState } from "react";


export default function useSortable<
  FieldNames extends string
>(
  config: UseDatatable.UseSortable.Config<FieldNames>
): UseDatatable.UseSortable.HookReturn<FieldNames> {

  const {
    onChange,
    initialSortOrder = {} as UseDatatable.UseSortable.SortOrder<FieldNames>,
  } = config;

  const [isMultiSort, setIsMultiSort] = useState(false);

  const [sortOrder, setSortOrder] = useState<UseDatatable.UseSortable.SortOrder<FieldNames>>(initialSortOrder);

  const onSingleSort = (column: UseDatatable.Column<FieldNames>) => {

    const nextSortOrder = {
      [column.field]: {
        sortDirection: sortOrder[column.field]?.sortDirection === "asc" ? "desc" : "asc",
        orderIndex: 1
      }
    } as UseDatatable.UseSortable.SortOrder<FieldNames>;

    setSortOrder(nextSortOrder);
    onChange(nextSortOrder);
  }

  const onMultiSort = (column: UseDatatable.Column<FieldNames>) => {
    const nextSortOrder: UseDatatable.UseSortable.SortOrder<FieldNames> = {
      ...sortOrder,
    };

    const lastOrderIndex = Object.entries(nextSortOrder).reduce((index: number, [field, current]: any) => {
      if (field === column.field) return index
      if (current.orderIndex > index) return index;
      return current.orderIndex + 1
    }, 1)

    nextSortOrder[column.field] = {
      sortDirection: sortOrder[column.field]?.sortDirection === "asc" ? "desc" : "asc",
      orderIndex: lastOrderIndex
    }

    setSortOrder(nextSortOrder);
    onChange(nextSortOrder);
  }

  /**
   * Handle shift key press
   */
  useEffect(() => {
    const checkShiftKey = (ev: KeyboardEvent) => setIsMultiSort(ev.shiftKey);
    window.addEventListener("keyup", checkShiftKey);
    window.addEventListener("keydown", checkShiftKey);
    return () => {
      window.removeEventListener("keyup", checkShiftKey);
      window.removeEventListener("keydown", checkShiftKey);
    }
  }, [])

  useEffect(() => { onChange(sortOrder); }, [])

  return {
    sortOrder,
    Sort,
    onSort: isMultiSort ? onMultiSort : onSingleSort
  }
}


const Sort = <FieldNames extends string,>(props: UseDatatable.UseSortable.SortProps<FieldNames>) => {

  const {
    column,
    sortDirection,
    orderIndex,
    isMultiSort
  } = props;

  if (!column.sortable) return null;

  return (
    <div className="sortable-caret-container">
      {orderIndex === undefined ? null : isMultiSort && orderIndex}
      {
        orderIndex && (
          <>
            {
              sortDirection === "asc"
                ? <IoCaretUp />
                : <IoCaretDown />
            }
          </>
        )
      }
    </div>
  )
}

const IoCaretDown = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 512 512"
    className="sortable-caret"
  >
    <path d="M98 190.06l139.78 163.12a24 24 0 0036.44 0L414 190.06c13.34-15.57 2.28-39.62-18.22-39.62h-279.6c-20.5 0-31.56 24.05-18.18 39.62z" />
  </svg>
)

const IoCaretUp = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 512 512"
    className="sortable-caret"
  >
    <path d="M414 321.94L274.22 158.82a24 24 0 00-36.44 0L98 321.94c-13.34 15.57-2.28 39.62 18.22 39.62h279.6c20.5 0 31.56-24.05 18.18-39.62z" />
  </svg>
)
