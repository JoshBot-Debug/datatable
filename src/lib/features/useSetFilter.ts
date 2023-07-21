import { useState } from "react";
import { Datatable } from "../types";

export default function useSetFilter<FieldNames>(config: Datatable.UseSetFilter.Config<FieldNames>): Datatable.UseSetFilter.HookReturn<FieldNames> {

  const { onChange, initialSetFilter } = config;

  const [setFilter, updateFilter] = useState<Datatable.UseSetFilter.SetFilter<FieldNames>>(initialSetFilter ?? {});

  const onSetFilter = (filter: Datatable.UseSetFilter.SetFilter<FieldNames>) => {
    const next = { ...setFilter };
    for (const key in filter) {
      const selected = filter[key];
      if (selected && selected.length > 0) {
        next[key] = filter[key];
        continue;
      }
      delete next[key];
    }
    updateFilter(next);
    onChange(next);
  }

  return {
    setFilter,
    onSetFilter,
  }
}