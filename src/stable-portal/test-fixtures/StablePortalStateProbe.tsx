import { useEffect, useState } from "react";

import { createPortal } from "react-dom";

export type StablePortalStateProbeProps = Readonly<{
	onSubscribe: () => void;
	onUnsubscribe: () => void;
	nestedTarget?: HTMLElement;
}>;

/** State/subscription/вложенный portal намеренно принадлежат subtree, а не тестовому host. */
export function StablePortalStateProbe({ onSubscribe, onUnsubscribe, nestedTarget }: StablePortalStateProbeProps) {
	const [value, setValue] = useState(0);
	useEffect(() => {
		onSubscribe();
		return onUnsubscribe;
	}, [onSubscribe, onUnsubscribe]);
	return (
		<>
			<button type="button" data-testid="increment" onClick={() => setValue(value + 1)}>
				{value}
			</button>
			<input data-testid="draft" defaultValue="Черновик" />
			<div data-testid="scroll" style={{ height: 40, overflow: "auto" }}>
				<div style={{ height: 400 }}>Прокручиваемое содержимое</div>
			</div>
			<div data-testid="editable" contentEditable suppressContentEditableWarning>
				Текст редактора
			</div>
			{nestedTarget &&
				createPortal(
					<button type="button" data-testid="nested-action">
						Вложенная поверхность
					</button>,
					nestedTarget
				)}
		</>
	);
}
