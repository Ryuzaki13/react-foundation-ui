import { useState } from "react";

import { Button } from "../../button";
import { FlexContainer } from "../../flex";
import { InputText } from "../../input";
import { Text } from "../../text";

import { type GridListDemoItem } from "./gridListDemoSource";

type GridListDemoCardProps = {
	readonly item: GridListDemoItem;
	readonly selected: boolean;
	readonly onSelect: (id: string) => void;
};

/** Локальная заметка показывает сохранение React identity карточки при смене числа колонок. */
export function GridListDemoCard({ item, selected, onSelect }: GridListDemoCardProps) {
	const [note, setNote] = useState("");
	return (
		<FlexContainer column gap="sm" className="paddingSm border" data-grid-demo-item={item.id}>
			<Button
				appearance={selected ? "solid" : "ghost"}
				aria-pressed={selected}
				onClick={() => onSelect(item.id)}
				data-grid-demo-action="select">
				{item.label}
			</Button>
			<Text size="sm" color="secondary">
				{item.category}
			</Text>
			{item.paragraphs.map((paragraph, index) => (
				<Text as="p" key={index} size="sm" color="muted">
					{paragraph}
				</Text>
			))}
			<InputText label="Локальная заметка" value={note} onChange={setNote} data-grid-demo-action="note" />
		</FlexContainer>
	);
}
