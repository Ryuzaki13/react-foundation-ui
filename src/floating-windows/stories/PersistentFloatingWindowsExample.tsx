import { useState } from "react";

import { Button } from "../../button";
import { FlexContainer } from "../../flex";
import { FloatingWindow, FloatingWindows } from "../index";

/** Явный сброс затрагивает только ключ этого примера и пересоздаёт его локальную область. */
export function PersistentFloatingWindowsExample() {
	const [generation, setGeneration] = useState(0);
	const [storageMessage, setStorageMessage] = useState("");
	const storageKey = "foundation-ui-storybook:floating-windows:positions";

	return (
		<FlexContainer column gap="md">
			<p>Переместите окно и пересоздайте область: координаты восстановятся из localStorage.</p>
			<FlexContainer wrap gap="sm">
				<Button
					type="button"
					data-floating-windows-example-action="remount-persisted-host"
					onClick={() => setGeneration((current) => current + 1)}>
					Пересоздать область
				</Button>
				<Button
					type="button"
					data-floating-windows-example-action="reset-persisted-positions"
					onClick={() => {
						try {
							window.localStorage.removeItem(storageKey);
							setStorageMessage("Сохранённые координаты этого примера удалены.");
							setGeneration((current) => current + 1);
						} catch {
							setStorageMessage("Браузер не разрешил очистить сохранённые координаты.");
						}
					}}>
					Сбросить координаты примера
				</Button>
			</FlexContainer>
			<p role="status">{storageMessage || "Сохраняются только координаты; состав окон задаёт приложение."}</p>
			<FloatingWindows
				key={generation}
				storageKey={storageKey}
				onStorageError={() => setStorageMessage("Сохранение недоступно; окна продолжают работать в текущей области.")}
				style={{ height: "min(70dvh, 30rem)", background: "var(--surface-2)" }}>
				<FloatingWindow
					id="persisted-notes"
					title="Сохранённое положение"
					width="23rem"
					height="14rem"
					defaultPosition={{ x: 24, y: 24 }}>
					<p>После восстановления положение ограничивается текущими размерами контейнера.</p>
				</FloatingWindow>
			</FloatingWindows>
		</FlexContainer>
	);
}
