import { useEffect, useState } from "react";
import { Datatable } from "../types";


export function useClientSide<Data extends Record<string, any>>(filter: Datatable.Filter<Data>, data: Data[] = [], count: number = -1, serverSide: boolean = true) {

  const [recordsCount, setRecordsCount] = useState(0);
  const [records, setRecords] = useState<Data[]>([]);

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
      count: count,
      numberOfRows: data.length,
    }
  }

  return {
    data: records,
    count: recordsCount,
    numberOfRows: records.length,
  }
}

function applyPage<Data extends Record<string, any>>(data: Data[], page?: Datatable.UsePagination.Page) {
  if (!page) return data;
  const { currentPage, currentRowsPerPage } = page;
  const startIndex = (currentPage - 1) * currentRowsPerPage;
  const endIndex = startIndex + currentRowsPerPage;
  return data.slice(startIndex, endIndex);
}

function applySortOrder<Data extends Record<string, any>>(data: Data[], sortOrder?: Datatable.UseSortable.SortOrder<Data>) {
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

function applySetFilter<Data extends Record<string, any>>(data: Data[], setFilter?: Datatable.UseSetFilter.SetFilter<Data>) {
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

function applyOperationFilter<Data extends Record<string, any>>(data: Data[], operationFilter?: Datatable.UseOperationFilter.OperationFilter<Data, any>) {
  if (!operationFilter) return data;
  return data.filter(row => checkCondition(row, operationFilter));
}

function checkCondition(row: any, filter: any) {
  for (const key in filter) {
    const { operation, value, and, or, datatype } = filter[key] as Datatable.UseOperationFilter.OperationValue<any>;
    const rowValue = row[key];
    if (!applyOperation(datatype, rowValue, operation, value)) {
      if (or && checkCondition(row, { [key]: or })) return true;
      return false;
    }
    if (and && !checkCondition(row, { [key]: and })) return false;
  }
  return true;
}

function applyOperation(datatype: Datatable.Datatype, itemValue: any, operation: string, filterValue?: string) {
  if (filterValue === undefined) return false;

  const [iValue, fValue] = convertToType(itemValue, filterValue, datatype);

  if (operation === "Not blank") {
    return !(iValue === undefined || iValue === null || iValue === "");
  }

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
    return String(iValue).includes(String(fValue));
  }

  if (operation === "Starts with") {
    return String(iValue).startsWith(String(fValue));
  }

  if (operation === "Ends with") {
    return String(iValue).endsWith(String(fValue));
  }

  if (operation === "Is true") {
    return iValue === true;
  }

  if (operation === "Is false") {
    return iValue === false;
  }

  return true;
}

function convertToType(itemValue: any, filterValue: any, datatype: Datatable.Datatype) {
  const typeOfValue1 = typeof itemValue;

  if (typeOfValue1 === "number") {
    filterValue = Number(filterValue);
  } else if (typeOfValue1 === "boolean") {
    if (filterValue === "true" || filterValue === "false") {
      filterValue = filterValue === "true";
    } else {
      filterValue = Boolean(filterValue);
    }
  } else if (typeOfValue1 === "string") {
    const value1Num = Number(itemValue);
    const value2Num = Number(filterValue);

    if (!isNaN(value1Num) && !isNaN(value2Num)) {
      itemValue = value1Num;
      filterValue = value2Num;
    }

    const value1Date = Date.parse(itemValue);
    const value2Date = Date.parse(filterValue);
    if (!isNaN(value1Date) && !isNaN(value2Date)) {
      itemValue = new Date(value1Date);
      filterValue = new Date(value2Date);
    }
  }

  // Add :00 to time values because html input type "time" does not add seconds.
  // this is done to make equals work
  if (datatype === "time") filterValue = `${filterValue}:00`

  return [itemValue, filterValue];
}