import { useState } from "react";
import { Datatable } from "../types";

export default function useOperationFilter(config: Datatable.UseOperationFilter.Config): Datatable.UseOperationFilter.HookReturn {

	const { onChange, initialOperationFilter } = config;

	const [operationFilter, setFilter] = useState<Datatable.UseOperationFilter.OperationFilter<Datatable.UseOperationFilter.BooleanFilterOperations | Datatable.UseOperationFilter.RangeFilterOperations | Datatable.UseOperationFilter.TextFilterOperations>>(initialOperationFilter ?? {});

	const onSetOperationFilter = (filter: Datatable.UseOperationFilter.OperationFilter<Datatable.UseOperationFilter.BooleanFilterOperations | Datatable.UseOperationFilter.RangeFilterOperations | Datatable.UseOperationFilter.TextFilterOperations>) => {
		const next = { ...operationFilter };
		for (const key in filter) {
			const current = { ...filter[key] };
			if (shouldRemoveKey(current.value, current.operation)) { delete next[key]; continue; }
			if (current.and && shouldRemoveKey(current.and.value, current.and.operation)) delete current.and;
			if (current.or && shouldRemoveKey(current.or.value, current.or.operation)) delete current.and;
			next[key] = current
		}
		setFilter(next);
		onChange(next);
	}

	return {
		operationFilter,
		onSetOperationFilter,
	}
}

function shouldRemoveKey(value: any, operation: any) {
	return String(value).length === 0 && !["Is blank", "Is true", "Is false"].includes(operation)
}