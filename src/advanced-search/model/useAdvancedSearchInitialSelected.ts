import { odataQueryFn } from "@ryuzaki13/react-foundation-api/odata";
import { createFilterEqual, unwrapODataQueryResult } from "@ryuzaki13/react-foundation-lib/odata-service";
import { useQuery } from "@tanstack/react-query";

import { SearchConfig } from "./types";

/**
 * Хук для поиска клиентов с поддержкой бесконечной прокрутки через OData
 */
export function useAdvancedSearchInitialSelected<T extends Record<string, string>>(
	config: SearchConfig<T>,
	initialSelectedKeys: string[] = []
) {
	const query = useQuery({
		queryKey: ["searchSelected", config.odata.service, config.odata.target, initialSelectedKeys],
		queryFn: async ({ client, signal }) => {
			if (initialSelectedKeys.length === 0) {
				return { data: [] as T[], totalCount: undefined };
			}

			// Получаем ключи колонок для select параметра
			const columnKeys = config.columns.map((col) => col.key);

			// Выполняем OData запрос
			return await odataQueryFn<T>({
				odata: { service: config.odata.service, target: config.odata.target },
				options: {
					select: columnKeys,
					expression: {
						filters: initialSelectedKeys.map((key) => createFilterEqual(config.leadingKey, key))
					}
				}
			})({ client, signal });
		},
		enabled: initialSelectedKeys.length > 0
	});

	return unwrapODataQueryResult(query);
}
