import { useState } from "react";

import { Button } from "../../button";
import { FlexContainer } from "../../flex";
import { FloatingWindow, FloatingWindows } from "../../floating-windows";
import { FullscreenPortal } from "../../fullscreen-portal";
import { StablePortal } from "../index";

import { StablePortalDraftExample } from "./StablePortalDraftExample";
import styles from "./StablePortalTransferExample.module.scss";

/** Один subtree меняет только DOM-host; закрытие поверхности возвращает его в исходную область. */
export function StablePortalTransferExample() {
	const [placement, setPlacement] = useState<"cell" | "floating" | "fullscreen" | "parked">("cell");
	const [origin, setOrigin] = useState<"cell" | "floating">("cell");
	const [cell, setCell] = useState<HTMLElement | null>(null);
	const [floating, setFloating] = useState<HTMLElement | null>(null);
	const [fullscreen, setFullscreen] = useState<HTMLElement | null>(null);
	const target = placement === "cell" ? cell : placement === "floating" ? floating : placement === "fullscreen" ? fullscreen : null;
	return (
		<FlexContainer column gap="md" className="paddingMd">
			<p>Введите черновик и прокрутите содержимое. Перенос сохраняет один редактор, его состояние и прокрутку.</p>
			<FlexContainer gap="sm" wrap>
				<Button type="button" onClick={() => setPlacement("cell")}>
					Вернуть в ячейку
				</Button>
				<Button type="button" onClick={() => setPlacement("floating")}>
					Плавающее окно
				</Button>
				<Button
					type="button"
					onClick={() => {
						setOrigin(placement === "floating" ? "floating" : "cell");
						setPlacement("fullscreen");
					}}>
					Полный экран
				</Button>
				<Button type="button" onClick={() => setPlacement("parked")}>
					Временно скрыть
				</Button>
			</FlexContainer>
			<FlexContainer column ref={setCell} className="bgSurface radiusMd" style={{ height: "18rem" }}>
				{placement !== "cell" && <p className="paddingMd">Содержимое находится в другой области. Верните его кнопкой выше.</p>}
			</FlexContainer>
			<FloatingWindows style={{ height: "22rem" }}>
				{placement === "floating" && (
					<FloatingWindow
						id="stable-content"
						title="Один черновик"
						width="28rem"
						height="20rem"
						contentClassName={styles.windowContent}
						onClose={() => setPlacement("cell")}>
						<FlexContainer column ref={setFloating} style={{ height: "100%" }} />
					</FloatingWindow>
				)}
			</FloatingWindows>
			<FullscreenPortal
				open={placement === "fullscreen"}
				title="Один черновик"
				description="Перенос без пересоздания"
				onOpenChange={(open) => {
					if (!open) setPlacement(origin);
				}}>
				<Button type="button" onClick={() => setPlacement(origin)}>
					Вернуться
				</Button>
				<FlexContainer column ref={setFullscreen} style={{ flex: 1, minHeight: 0 }} />
			</FullscreenPortal>
			<StablePortal target={target}>
				<StablePortalDraftExample />
			</StablePortal>
		</FlexContainer>
	);
}
