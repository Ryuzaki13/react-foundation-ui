import { Text } from "../../text";
import { List } from "../index";

type VirtualizedListStateExampleProps = Readonly<{
	loading?: boolean;
	withItems?: boolean;
}>;

export function VirtualizedListStateExample({ loading, withItems }: VirtualizedListStateExampleProps) {
	return (
		<div style={{ height: "16rem" }}>
			<List.VirtualizedContent
				items={withItems ? [{ id: "existing", label: "Доступная строка во время фонового чтения" }] : []}
				getKey={(item) => item.id}
				render={(item) => (
					<Text as="p" data-list-demo-item={item.id}>
						{item.label}
					</Text>
				)}
				isLoading={loading}
				emptyContent={<Text as="p">В наборе пока нет записей.</Text>}
				aria-label="Состояние списка"
			/>
		</div>
	);
}
