import { useState } from "react";

import { Text } from "../../text";
import { GridList } from "../index";

import { GridListDemoCard } from "./GridListDemoCard";
import { createGridListDemoItems } from "./gridListDemoSource";

type GridListStateExampleProps = {
	readonly state: "empty" | "loading" | "background";
};

/** Штатные empty/loading состояния не требуют фиктивной пагинации или предварительной сборки рядов. */
export function GridListStateExample({ state }: GridListStateExampleProps) {
	const [items] = useState(() => createGridListDemoItems(9));
	const [selectedId, setSelectedId] = useState<string | null>(null);
	return (
		<div style={{ height: "24rem" }}>
			<GridList>
				<GridList.Content
					items={state === "background" ? items : []}
					getKey={(item) => item.id}
					render={(item) => <GridListDemoCard item={item} selected={item.id === selectedId} onSelect={setSelectedId} />}
					minItemWidth="16rem"
					isLoading={state !== "empty"}
					emptyContent={<Text as="p">В наборе пока нет материалов.</Text>}
					aria-label="Состояние сетки"
				/>
			</GridList>
		</div>
	);
}
