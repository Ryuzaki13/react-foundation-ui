import { List } from "../index";

import { type ListTestItem } from "./listTestItemTypes";

type ListTestContentProps = Readonly<{
	items: readonly ListTestItem[];
	resetKey?: string | number | null;
	preserveScrollAnchor?: boolean;
	isLoading?: boolean;
}>;

/** Общая композиция fixture, а не замена движка: renderer оставляет устойчивые identity-метки строк. */
export function ListTestContent({ items, resetKey, preserveScrollAnchor, isLoading }: ListTestContentProps) {
	return (
		<List.VirtualizedContent
			items={items}
			getKey={(item) => item.id}
			render={(item) => <span data-list-test-item={item.id}>{item.label}</span>}
			aria-label="changing-source"
			resetKey={resetKey}
			preserveScrollAnchor={preserveScrollAnchor}
			isLoading={isLoading}
			emptyContent={<span data-list-test-empty />}
		/>
	);
}
