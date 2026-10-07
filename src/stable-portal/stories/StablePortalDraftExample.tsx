import { useState } from "react";

import { Button } from "../../button";
import { FlexContainer } from "../../flex";
import { InputText } from "../../input";

/** Черновик и счётчик принадлежат переносимому содержимому и не поднимаются в host. */
export function StablePortalDraftExample() {
	const [draft, setDraft] = useState("");
	const [count, setCount] = useState(0);
	return (
		<FlexContainer column gap="md" className="paddingMd bgCanvas radiusMd" style={{ flex: 1, minHeight: 0, overflow: "auto" }}>
			<InputText label="Локальный черновик" value={draft} onChange={setDraft} />
			<Button type="button" onClick={() => setCount(count + 1)}>
				Изменить локальное состояние: {count}
			</Button>
			{Array.from({ length: 12 }, (_, index) => (
				<p key={index}>Строка {index + 1}. Прокрутите содержимое перед переносом в другую область.</p>
			))}
		</FlexContainer>
	);
}
