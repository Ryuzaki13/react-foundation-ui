import { type ReactNode } from "react";

import { Move, X } from "lucide-react";

import { Button } from "../button";
import { FlexContainer } from "../flex";
import { UI_APPEARANCE_GHOST } from "../uiSchemeConstants";

import styles from "./FloatingWindows.module.scss";
import { type FloatingWindowMoveResult } from "./model/floatingWindowMoveTypes";

type FloatingWindowHeaderProps = Readonly<{
	title: string;
	titleId: string;
	instructionId: string;
	actions?: ReactNode;
	onClose?: () => void;
	move: FloatingWindowMoveResult;
}>;

/** Handle — самостоятельная кнопка: действия и закрытие не становятся вложенными interactive controls. */
export function FloatingWindowHeader({ title, titleId, instructionId, actions, onClose, move }: FloatingWindowHeaderProps) {
	return (
		<FlexContainer row align="center" gap="xs" className={styles.header}>
			<Button
				appearance={UI_APPEARANCE_GHOST}
				icon={<Move size={16} />}
				className={styles.handle}
				aria-label={`Переместить окно «${title}»`}
				aria-describedby={instructionId}
				aria-pressed={move.moving}
				data-floating-window-action="move"
				{...move.handleProps}>
				<span id={titleId}>{title}</span>
			</Button>
			{actions}
			{onClose && (
				<Button
					icon={<X size={16} />}
					appearance={UI_APPEARANCE_GHOST}
					aria-label={`Закрыть окно «${title}»`}
					data-floating-window-action="close"
					onClick={onClose}
				/>
			)}
		</FlexContainer>
	);
}
