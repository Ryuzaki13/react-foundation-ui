import { useState } from "react";

import { Button } from "../../button";
import { FlexContainer } from "../../flex";
import { InputText } from "../../input";
import { FloatingWindow, FloatingWindows } from "../index";

/** Большие запрошенные размеры проверяют ограничение реальным размером контейнера. */
export function NarrowFloatingWindowsExample() {
	const [compact, setCompact] = useState(false);
	const [value, setValue] = useState("");

	return (
		<FlexContainer column gap="md">
			<p>Окно запрашивает 42 × 36 rem. Контейнер сужает его, а длинное содержимое прокручивается внутри.</p>
			<Button type="button" data-floating-windows-example-action="resize-host" onClick={() => setCompact((current) => !current)}>
				{compact ? "Увеличить область" : "Уменьшить область"}
			</Button>
			<FloatingWindows
				style={{
					width: "100%",
					maxWidth: compact ? "17rem" : "24rem",
					height: compact ? "18rem" : "27rem",
					background: "var(--surface-2)"
				}}>
				<FloatingWindow
					id="narrow-content"
					title="Длинное содержимое в узкой области"
					width="42rem"
					height="36rem"
					defaultPosition={{ x: 200, y: 160 }}>
					<FlexContainer column gap="md">
						<InputText label="Поле в начале" value={value} onChange={setValue} data-floating-windows-example-field="narrow" />
						{Array.from({ length: 12 }, (_, index) => (
							<p key={index}>
								Раздел {index + 1}. Содержимое панели остаётся доступным при уменьшении области. Прокрутка текста не
								запускает перемещение окна.
							</p>
						))}
						<Button type="button" data-floating-windows-example-action="clear-narrow" onClick={() => setValue("")}>
							Очистить поле в начале
						</Button>
					</FlexContainer>
				</FloatingWindow>
			</FloatingWindows>
		</FlexContainer>
	);
}
