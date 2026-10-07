import { useState } from "react";

import { Popover } from "../../popover";
import { StablePortal } from "../../stable-portal";
import { FullscreenPortal } from "../FullscreenPortal";

type FullscreenStablePortalProbeProps = Readonly<{
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onPopupChange?: (open: boolean) => void;
	onHostEscape?: () => void;
}>;

/** Проверяет реальные portal/focus owners: перенос не создаёт новый редактор или keyboard boundary. */
export function FullscreenStablePortalProbe({ open, onOpenChange, onPopupChange, onHostEscape }: FullscreenStablePortalProbeProps) {
	const [cell, setCell] = useState<HTMLElement | null>(null);
	const [fullscreen, setFullscreen] = useState<HTMLElement | null>(null);
	return (
		<>
			<section ref={setCell} data-testid="cell" />
			<FullscreenPortal
				open={open}
				title="Поверхность"
				description="Перенос содержимого"
				escapeKey={false}
				onOpenChange={onOpenChange}>
				<div ref={setFullscreen} data-testid="fullscreen-target" />
			</FullscreenPortal>
			<StablePortal target={open ? fullscreen : cell}>
				<div
					onKeyDown={(event) => {
						if (event.key !== "Escape" || event.defaultPrevented) return;
						event.preventDefault();
						onHostEscape?.();
					}}>
					<input data-testid="draft" defaultValue="Черновик" />
					<Popover onOpenChange={onPopupChange}>
						<Popover.Trigger>
							<button type="button" data-testid="popup-trigger">
								Открыть popup
							</button>
						</Popover.Trigger>
						<Popover.Content role="dialog" aria-label="Команды">
							<button type="button" data-testid="popup-action">
								Команда
							</button>
						</Popover.Content>
					</Popover>
				</div>
			</StablePortal>
		</>
	);
}
