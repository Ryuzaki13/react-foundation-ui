import { Text } from "../../text";
import { type GridListGrouping } from "../index";

import { type GridListDemoItem } from "./gridListDemoSource";

/** Стабильный grouping не заставляет пересобирать все группы при обновлении footer видимости. */
export const gridListDemoGrouping = {
	getKey: (item) => item.category,
	render: (key, items) => (
		<Text as="h3" size="md" className="paddingSm" data-grid-demo-group={key}>
			{key}: {items.length}
		</Text>
	)
} satisfies GridListGrouping<GridListDemoItem>;
