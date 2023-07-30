import { useEffect, useState } from "react";
import { Datatable } from "../types";



export function useClientSide<Data extends Record<string, any>, FieldNames>(data: Data[], filter: Datatable.Filter<FieldNames>, count?: number, serverSide?: boolean) {

  const [recordsCount, setRecordsCount] = useState(0);
  const [records, setRecords] = useState<Record<string, any>[]>([]);

  useEffect(() => {
    if (serverSide) return;
    const {
      page,
      operationFilter,
      setFilter,
      sortOrder
    } = filter;

    const withSetFilter = applySetFilter(data, setFilter);
    const withOperationFilter = applyOperationFilter(withSetFilter, operationFilter);
    const withSortOrder = applySortOrder(withOperationFilter, sortOrder);
    const withPage = applyPage(withSortOrder, page);
    
    setRecordsCount(withSortOrder.length);
    setRecords(withPage);
  }, [serverSide, filter])

  if (serverSide) {
    return {
      data: data,
      count: count ?? -1,
      numberOfRows: data.length,
    }
  }

  return {
    data: records,
    count: recordsCount,
    numberOfRows: records.length,
  }
}

function applyPage(data: Record<string, any>[], page?: Datatable.UsePagination.Page) {
  if (!page) return data;
  const { currentPage, currentRowsPerPage } = page;
  const startIndex = (currentPage - 1) * currentRowsPerPage;
  const endIndex = startIndex + currentRowsPerPage;
  return data.slice(startIndex, endIndex);
}

function applySortOrder<FieldNames extends string>(data: Record<string, any>[], sortOrder?: Datatable.UseSortable.SortOrder<FieldNames>) {
  if (!sortOrder) return data;

  return data.sort((a, b) => {
    for (const key in sortOrder) {
      const sortConfig = sortOrder[key];
      const sortDirection = sortConfig?.sortDirection === "desc" ? -1 : 1;

      if (a[key] < b[key]) {
        return sortDirection * -1;
      }
      if (a[key] > b[key]) {
        return sortDirection * 1;
      }
    }
    return 0;
  });
}

function applySetFilter<FieldNames extends string>(data: Record<string, any>[], setFilter?: Datatable.UseSetFilter.SetFilter<FieldNames>) {
  if (!setFilter) return data;
  return data.filter(item => {
    for (const key in setFilter) {
      if (setFilter.hasOwnProperty(key)) {
        const filterValues = setFilter[key];
        if (!filterValues?.includes(item[key])) return false;
      }
    }
    return true;
  });
}

function applyOperationFilter(data: Record<string, any>[], operationFilter?: Datatable.UseOperationFilter.OperationFilter<any>) {
  if (!operationFilter) return data;
  return data.filter(row => checkCondition(row, operationFilter));
}

function checkCondition(row: any, filter: any) {
  for (const key in filter) {
    const { operation, value, and, or } = filter[key];
    const rowValue = row[key];
    if (!applyOperation(rowValue, operation, value)) {
      if (or && checkCondition(row, { [key]: or })) return true;
      return false;
    }
    if (and && !checkCondition(row, { [key]: and })) return false;
  }
  return true;
}

function applyOperation(itemValue: any, operation: string, filterValue?: string) {
  if (filterValue === undefined) return false;

  const [iValue, fValue] = convertToType(itemValue, filterValue);

  if (operation === "Is blank") {
    return iValue === undefined || iValue === null || iValue === "";
  }

  if (operation === "Equal") {
    return iValue === fValue;
  }

  if (operation === "Not equal") {
    return iValue !== fValue;
  }

  if (operation === "Greater than or equal") {
    return iValue >= fValue;
  }

  if (operation === "Less than or equal") {
    return iValue <= fValue;
  }

  if (operation === "Greater than") {
    return iValue > fValue;
  }

  if (operation === "Less than") {
    return iValue < fValue;
  }

  if (operation === "Contains") {
    return iValue.includes(fValue);
  }

  if (operation === "Starts with") {
    return iValue.startsWith(fValue);
  }

  if (operation === "Ends with") {
    return iValue.endsWith(fValue);
  }

  if (operation === "Is true") {
    return iValue === true;
  }

  if (operation === "Is false") {
    return iValue === false;
  }

  return true;
}

function convertToType(value1: any, value2: any) {
  const typeOfValue1 = typeof value1;

  if (typeOfValue1 === "number") {
    value2 = Number(value2);
  } else if (typeOfValue1 === "boolean") {
    if (value2 === "true" || value2 === "false") {
      value2 = value2 === "true";
    } else {
      value2 = Boolean(value2);
    }
  } else if (typeOfValue1 === "string") {
    const value1Date = Date.parse(value1);
    const value2Date = Date.parse(value2);
    if (!isNaN(value1Date) && !isNaN(value2Date)) {
      value1 = new Date(value1Date);
      value2 = new Date(value2Date);
    }
  }

  return [value1, value2];
}