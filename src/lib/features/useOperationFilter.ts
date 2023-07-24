import { useState } from "react";
import { Datatable } from "../types";

export default function useOperationFilter(config: Datatable.UseOperationFilter.Config): Datatable.UseOperationFilter.HookReturn {

  const { onChange, initialOperationFilter } = config;

  const [operationFilter, setFilter] = useState<Datatable.UseOperationFilter.OperationFilter<Datatable.UseOperationFilter.BooleanFilterOperations | Datatable.UseOperationFilter.RangeFilterOperations | Datatable.UseOperationFilter.TextFilterOperations>>(initialOperationFilter ?? {});

  const onSetOperationFilter = (filter: Datatable.UseOperationFilter.OperationFilter<Datatable.UseOperationFilter.BooleanFilterOperations | Datatable.UseOperationFilter.RangeFilterOperations | Datatable.UseOperationFilter.TextFilterOperations>) => {
    const next = { ...operationFilter };
    for (const key in filter) {
      const { operation, value } = filter[key];
      if (String(value).length === 0 && !["Is blank", "Is true", "Is false"].includes(operation)) {
        delete next[key];
        continue;
      }
      next[key] = { operation, value }
    }
    setFilter(next);
    onChange(next);
  }

  return {
    operationFilter,
    onSetOperationFilter,
  }
}