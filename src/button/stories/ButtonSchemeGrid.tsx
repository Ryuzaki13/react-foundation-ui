import { Button, type ButtonProps } from "../Button";

const schemeExamples = [
	["neutral", "outline", "Нейтральная"],
	["neutral", "ghost", "Ghost"],
	["accent", "solid", "Акцентная с заливкой"],
	["accent", "outline", "Акцентная с контуром"],
	["info", "solid", "Информация с заливкой"],
	["success", "solid", "Успех с заливкой"],
	["warning", "solid", "Предупреждение с заливкой"],
	["error", "solid", "Ошибка с заливкой"],
	["info", "outline", "Информация с контуром"],
	["success", "outline", "Успех с контуром"],
	["warning", "outline", "Предупреждение с контуром"],
	["error", "outline", "Ошибка с контуром"]
] as const satisfies ReadonlyArray<readonly [NonNullable<ButtonProps["tone"]>, NonNullable<ButtonProps["appearance"]>, string]>;

/**
 * Один каталог явных схем сохраняет состав и порядок примеров для обычных
 * и отключённых кнопок; каждая схема задаётся только через tone и appearance.
 */
export function ButtonSchemeGrid({ disabled = false }: { disabled?: boolean }) {
	return (
		<div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))" }}>
			{schemeExamples.map(([tone, appearance, label]) => (
				<Button key={`${tone}-${appearance}`} tone={tone} appearance={appearance} disabled={disabled}>
					{label}
				</Button>
			))}
		</div>
	);
}
