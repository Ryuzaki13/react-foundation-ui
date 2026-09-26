import { FlexContainer } from "../../flex";
import { GridContainer } from "../../grid";
import { FloatingWindow, FloatingWindows } from "../index";

/** Одинаковый ID допустим в разных host: координаты и порядок принадлежат каждому контейнеру. */
export function IndependentFloatingWindowsExample() {
	return (
		<FlexContainer column gap="md">
			<p>Обе области содержат окно с ID shared-window. Перемещение в одной области не меняет другую.</p>
			<GridContainer gap="md" templateColumns="repeat(auto-fit, minmax(min(100%, 22rem), 1fr))">
				<FlexContainer as="section" column gap="sm" aria-label="Первая область" data-floating-windows-example-host="first">
					<h3>Первая область</h3>
					<FloatingWindows style={{ height: "22rem", background: "var(--surface-2)" }}>
						<FloatingWindow
							id="shared-window"
							title="Окно первой области"
							width="17rem"
							height="12rem"
							defaultPosition={{ x: 16, y: 16 }}>
							<p>Фокус и порядок наложения ограничены этим контейнером.</p>
						</FloatingWindow>
					</FloatingWindows>
				</FlexContainer>
				<FlexContainer as="section" column gap="sm" aria-label="Вторая область" data-floating-windows-example-host="second">
					<h3>Вторая область</h3>
					<FloatingWindows style={{ height: "22rem", background: "var(--surface-2)" }}>
						<FloatingWindow
							id="shared-window"
							title="Окно второй области"
							width="17rem"
							height="12rem"
							defaultPosition={{ x: 40, y: 64 }}>
							<p>Общий module-level реестр для этих окон не нужен.</p>
						</FloatingWindow>
					</FloatingWindows>
				</FlexContainer>
			</GridContainer>
		</FlexContainer>
	);
}
